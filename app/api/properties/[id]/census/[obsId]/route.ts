import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_METHODS = new Set([
  "spotlight", "aerial", "daylight_count", "photo_station", "harvest_record",
  "browse_utilization", "endangered_species", "nongame", "time_area_count",
  "roost_count", "songbird_transect", "quail_call_covey", "point_count",
  "game_camera", "track_survey", "direct_observation", "other",
]);

async function resolvePropertyId(idOrSlug: string, userId: string) {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const { data } = await supabase
    .from("properties")
    .select("id")
    .eq(isUUID ? "id" : "slug", idOrSlug)
    .eq("user_id", userId)
    .single();
  return data?.id as string | undefined;
}

function mapObservation(row: any, species: any[]) {
  return {
    id: row.id,
    propertyId: row.property_id,
    observedOn: row.observed_on,
    observedAtTime: row.observed_at_time,
    method: row.method,
    locationLabel: row.location_label,
    lat: row.lat,
    lng: row.lng,
    weather: row.weather,
    notes: row.notes,
    milesSurveyed: row.miles_surveyed,
    durationMinutes: row.duration_minutes,
    createdAt: row.created_at,
    species: species.map((s) => ({
      id: s.id,
      observationId: s.observation_id,
      category: s.category,
      species: s.species,
      countTotal: s.count_total,
      countBuck: s.count_buck,
      countDoe: s.count_doe,
      countFawn: s.count_fawn,
      countMale: s.count_male,
      countFemale: s.count_female,
      countJuvenile: s.count_juvenile,
      countUnknown: s.count_unknown,
      notes: s.notes,
    })),
  };
}

function numOrNull(v: unknown): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

async function loadObservation(obsId: string, propertyId: string) {
  const { data: obs } = await supabase
    .from("census_observations")
    .select("*")
    .eq("id", obsId)
    .eq("property_id", propertyId)
    .single();
  if (!obs) return null;
  const { data: species } = await supabase
    .from("census_species_counts")
    .select("*")
    .eq("observation_id", obsId);
  return { obs, species: species || [] };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; obsId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, obsId } = await params;
  const propertyId = await resolvePropertyId(id, userId);
  if (!propertyId) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  const loaded = await loadObservation(obsId, propertyId);
  if (!loaded) return NextResponse.json({ error: "Observation not found" }, { status: 404 });

  return NextResponse.json(mapObservation(loaded.obs, loaded.species));
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; obsId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, obsId } = await params;
  const propertyId = await resolvePropertyId(id, userId);
  if (!propertyId) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  const existing = await loadObservation(obsId, propertyId);
  if (!existing) return NextResponse.json({ error: "Observation not found" }, { status: 404 });

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    observedOn, observedAtTime, method, locationLabel, lat, lng,
    weather, notes, milesSurveyed, durationMinutes, species,
  } = body ?? {};

  if (!observedOn || typeof observedOn !== "string") {
    return NextResponse.json({ error: "observedOn (date) is required" }, { status: 400 });
  }
  if (!method || !VALID_METHODS.has(method)) {
    return NextResponse.json({ error: "Invalid method" }, { status: 400 });
  }

  const { error: updErr } = await supabase
    .from("census_observations")
    .update({
      observed_on: observedOn,
      observed_at_time: observedAtTime || null,
      method,
      location_label: locationLabel || null,
      lat: typeof lat === "number" ? lat : null,
      lng: typeof lng === "number" ? lng : null,
      weather: weather || null,
      notes: notes || null,
      miles_surveyed: typeof milesSurveyed === "number" ? milesSurveyed : null,
      duration_minutes: typeof durationMinutes === "number" ? durationMinutes : null,
    })
    .eq("id", obsId);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });

  // Replace species counts: delete + insert (simpler than diffing; small row counts)
  await supabase.from("census_species_counts").delete().eq("observation_id", obsId);

  const speciesRows: any[] = Array.isArray(species) ? species : [];
  const toInsert = speciesRows
    .filter((s) => s && typeof s.category === "string" && typeof s.species === "string")
    .map((s) => ({
      observation_id: obsId,
      category: s.category,
      species: s.species,
      count_total: numOrNull(s.countTotal),
      count_buck: numOrNull(s.countBuck),
      count_doe: numOrNull(s.countDoe),
      count_fawn: numOrNull(s.countFawn),
      count_male: numOrNull(s.countMale),
      count_female: numOrNull(s.countFemale),
      count_juvenile: numOrNull(s.countJuvenile),
      count_unknown: numOrNull(s.countUnknown),
      notes: s.notes || null,
    }));

  if (toInsert.length) {
    const { error: spErr } = await supabase
      .from("census_species_counts")
      .insert(toInsert);
    if (spErr) return NextResponse.json({ error: spErr.message }, { status: 400 });
  }

  const reloaded = await loadObservation(obsId, propertyId);
  return NextResponse.json(mapObservation(reloaded!.obs, reloaded!.species));
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; obsId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, obsId } = await params;
  const propertyId = await resolvePropertyId(id, userId);
  if (!propertyId) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  const { error } = await supabase
    .from("census_observations")
    .delete()
    .eq("id", obsId)
    .eq("property_id", propertyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
