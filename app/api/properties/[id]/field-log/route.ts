import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isPracticeCategory } from "@/lib/field-log";
import {
  fieldLogDb as supabase,
  BUCKET,
  SIGNED_URL_TTL,
  resolvePropertyId,
  mapEntry,
  mapEntryWithSignedUrl,
  fetchFieldLogEntries,
} from "@/lib/field-log-server";

const GPS_SOURCES = ["device_live", "photo_exif", "manual_pin"] as const;
const ENTRY_TYPES = ["photo_evidence", "pin_activity"] as const;

function toNum(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// GET /api/properties/[id]/field-log — list a property's entries, newest first,
// each with a short-lived signed thumbnail URL. Optional query params narrow the
// set for the log view and (later) report generation:
//   ?category=<practice>   one of the seven TPWD practices
//   ?from=<ISO>&to=<ISO>   inclusive captured_at bounds (reporting windows)
export async function GET(
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

  const { searchParams } = new URL(req.url);
  const categoryParam = searchParams.get("category");
  const { data, error } = await fetchFieldLogEntries(propertyId, userId, {
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    category: isPracticeCategory(categoryParam) ? categoryParam : null,
  });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  const entries = await Promise.all((data || []).map(mapEntryWithSignedUrl));
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
  if (!isPracticeCategory(payload.practiceCategory)) {
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
