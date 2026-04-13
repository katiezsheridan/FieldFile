import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

async function assertObservationBelongs(obsId: string, propertyId: string) {
  const { data } = await supabase
    .from("census_observations")
    .select("id")
    .eq("id", obsId)
    .eq("property_id", propertyId)
    .single();
  return !!data;
}

function mapDoc(d: any) {
  return {
    id: d.id,
    observationId: d.observation_id,
    type: d.type,
    name: d.name,
    url: d.url,
    storagePath: d.storage_path,
    gpsLat: d.gps_lat,
    gpsLng: d.gps_lng,
    takenAt: d.taken_at,
    uploadedAt: d.uploaded_at,
  };
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
  if (!(await assertObservationBelongs(obsId, propertyId))) {
    return NextResponse.json({ error: "Observation not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("observation_id", obsId)
    .order("uploaded_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json((data || []).map(mapDoc));
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; obsId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, obsId } = await params;
  const propertyId = await resolvePropertyId(id, userId);
  if (!propertyId) return NextResponse.json({ error: "Property not found" }, { status: 404 });
  if (!(await assertObservationBelongs(obsId, propertyId))) {
    return NextResponse.json({ error: "Observation not found" }, { status: 404 });
  }

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, url, storagePath, type, gpsLat, gpsLng, takenAt } = body ?? {};
  if (!name || !url || !storagePath) {
    return NextResponse.json({ error: "name, url, and storagePath are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({
      observation_id: obsId,
      activity_id: null,
      type: type === "receipt" || type === "note" ? type : "photo",
      name,
      url,
      storage_path: storagePath,
      gps_lat: typeof gpsLat === "number" ? gpsLat : null,
      gps_lng: typeof gpsLng === "number" ? gpsLng : null,
      taken_at: takenAt || null,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Insert failed" }, { status: 400 });
  }
  return NextResponse.json(mapDoc(data), { status: 201 });
}
