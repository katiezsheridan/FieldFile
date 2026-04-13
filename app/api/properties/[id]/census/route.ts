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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const propertyId = await resolvePropertyId(id, userId);
  if (!propertyId) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  const { data: observations, error } = await supabase
    .from("census_observations")
    .select("*")
    .eq("property_id", propertyId)
    .order("observed_on", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const ids = (observations || []).map((o) => o.id);
  const { data: speciesRows } = ids.length
    ? await supabase.from("census_species_counts").select("*").in("observation_id", ids)
    : { data: [] as any[] };

  const bySpecies = new Map<string, any[]>();
  (speciesRows || []).forEach((s) => {
    const arr = bySpecies.get(s.observation_id) || [];
    arr.push(s);
    bySpecies.set(s.observation_id, arr);
  });

  return NextResponse.json(
    (observations || []).map((o) => mapObservation(o, bySpecies.get(o.id) || []))
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const propertyId = await resolvePropertyId(id, userId);
  if (!propertyId) return NextResponse.json({ error: "Property not found" }, { status: 404 });

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

  const { data: obs, error: obsErr } = await supabase
    .from("census_observations")
    .insert({
      property_id: propertyId,
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
    .select()
    .single();

  if (obsErr || !obs) {
    return NextResponse.json({ error: obsErr?.message || "Insert failed" }, { status: 400 });
  }

  const speciesRows: any[] = Array.isArray(species) ? species : [];
  const toInsert = speciesRows
    .filter((s) => s && typeof s.category === "string" && typeof s.species === "string")
    .map((s) => ({
      observation_id: obs.id,
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

  let insertedSpecies: any[] = [];
  if (toInsert.length) {
    const { data, error: spErr } = await supabase
      .from("census_species_counts")
      .insert(toInsert)
      .select();
    if (spErr) {
      // Roll back the observation so we don't leave a session with no species
      await supabase.from("census_observations").delete().eq("id", obs.id);
      return NextResponse.json({ error: spErr.message }, { status: 400 });
    }
    insertedSpecies = data || [];
  }

  return NextResponse.json(mapObservation(obs, insertedSpecies), { status: 201 });
}

function numOrNull(v: unknown): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}
