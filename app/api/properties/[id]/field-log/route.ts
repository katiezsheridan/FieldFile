import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Service-role client. The 'field-log' bucket is PRIVATE with no anon storage
// policies, so — unlike the census/documents flow — uploads and signed-URL
// reads MUST go through the server here. This matches the Session 1 migration's
// stated design (all field-log Storage access via the service-role key).
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "field-log";
const SIGNED_URL_TTL = 60 * 60; // 1 hour

const PRACTICE_CATEGORIES = [
  "habitat_control",
  "erosion_control",
  "predator_control",
  "supplemental_water",
  "supplemental_food",
  "supplemental_shelter",
  "census",
] as const;
const GPS_SOURCES = ["device_live", "photo_exif", "manual_pin"] as const;
const ENTRY_TYPES = ["photo_evidence", "pin_activity"] as const;

async function resolvePropertyId(idOrSlug: string, userId: string) {
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      idOrSlug
    );
  const { data } = await supabase
    .from("properties")
    .select("id")
    .eq(isUUID ? "id" : "slug", idOrSlug)
    .eq("user_id", userId)
    .single();
  return data?.id as string | undefined;
}

function mapEntry(e: any, signedUrl: string | null = null) {
  return {
    id: e.id,
    userId: e.user_id,
    propertyId: e.property_id,
    entryType: e.entry_type,
    practiceCategory: e.practice_category,
    note: e.note,
    latitude: e.latitude,
    longitude: e.longitude,
    gpsAccuracyMeters: e.gps_accuracy_meters,
    gpsSource: e.gps_source,
    capturedAt: e.captured_at,
    createdAt: e.created_at,
    photoPath: e.photo_path,
    photoUrl: signedUrl,
  };
}

function toNum(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// GET /api/properties/[id]/field-log — list a property's entries, newest first,
// each with a short-lived signed thumbnail URL. (Minimal; the full log/map view
// is Session 4.)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const propertyId = await resolvePropertyId(id, userId);
  if (!propertyId)
    return NextResponse.json({ error: "Property not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("field_log_entries")
    .select("*")
    .eq("property_id", propertyId)
    .eq("user_id", userId)
    .order("captured_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  const entries = await Promise.all(
    (data || []).map(async (e) => {
      let url: string | null = null;
      if (e.photo_path) {
        const { data: signed } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(e.photo_path, SIGNED_URL_TTL);
        url = signed?.signedUrl ?? null;
      }
      return mapEntry(e, url);
    })
  );
  return NextResponse.json(entries);
}

// POST /api/properties/[id]/field-log — create an entry.
//
// Accepts multipart/form-data: a JSON `payload` field plus an optional `photo`
// file. We insert the row first to get its id, upload to the conventional path
// {userId}/{propertyId}/{entryId}.jpg, then patch photo_path. A missing
// coordinate never blocks the save — provenance is recorded honestly via
// gps_source instead.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const propertyId = await resolvePropertyId(id, userId);
  if (!propertyId)
    return NextResponse.json({ error: "Property not found" }, { status: 404 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 }
    );
  }

  let payload: any;
  try {
    payload = JSON.parse((form.get("payload") as string) || "{}");
  } catch {
    return NextResponse.json({ error: "Invalid payload JSON" }, { status: 400 });
  }

  const entryType = ENTRY_TYPES.includes(payload.entryType)
    ? payload.entryType
    : "photo_evidence";
  if (!PRACTICE_CATEGORIES.includes(payload.practiceCategory)) {
    return NextResponse.json(
      { error: "A valid practice_category is required" },
      { status: 400 }
    );
  }
  const gpsSource =
    payload.gpsSource && GPS_SOURCES.includes(payload.gpsSource)
      ? payload.gpsSource
      : null;

  const photo = form.get("photo");
  const hasPhoto = photo instanceof File && photo.size > 0;
  if (entryType === "photo_evidence" && !hasPhoto) {
    return NextResponse.json(
      { error: "A photo is required for photo evidence" },
      { status: 400 }
    );
  }

  // Insert the row first so we can name the object after its id.
  const { data: inserted, error: insertErr } = await supabase
    .from("field_log_entries")
    .insert({
      user_id: userId,
      property_id: propertyId,
      entry_type: entryType,
      practice_category: payload.practiceCategory,
      note: payload.note || null,
      latitude: toNum(payload.latitude),
      longitude: toNum(payload.longitude),
      gps_accuracy_meters: toNum(payload.gpsAccuracyMeters),
      gps_source: gpsSource,
      captured_at: payload.capturedAt || new Date().toISOString(),
    })
    .select()
    .single();

  if (insertErr || !inserted) {
    return NextResponse.json(
      { error: insertErr?.message || "Insert failed" },
      { status: 400 }
    );
  }

  let row = inserted;

  if (hasPhoto) {
    const file = photo as File;
    const path = `${userId}/${propertyId}/${inserted.id}.jpg`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadErr) {
      // Don't leave an orphan row pointing at a photo that never landed.
      await supabase.from("field_log_entries").delete().eq("id", inserted.id);
      return NextResponse.json(
        { error: `Photo upload failed: ${uploadErr.message}` },
        { status: 400 }
      );
    }

    const { data: patched } = await supabase
      .from("field_log_entries")
      .update({ photo_path: path })
      .eq("id", inserted.id)
      .select()
      .single();
    if (patched) row = patched;
  }

  let signedUrl: string | null = null;
  if (row.photo_path) {
    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(row.photo_path, SIGNED_URL_TTL);
    signedUrl = signed?.signedUrl ?? null;
  }

  return NextResponse.json(mapEntry(row, signedUrl), { status: 201 });
}
