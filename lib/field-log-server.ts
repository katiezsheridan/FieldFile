import { createClient } from "@supabase/supabase-js";
import type { PracticeCategory } from "@/lib/types";

// Server-only data access for field-log entries. The 'field-log' bucket is
// PRIVATE with no anon storage policies, so — unlike the census/documents flow —
// every read/write goes through the service-role client here (mirrors the
// Session 1 migration's stated design). This module is the one place the query
// lives so the API routes and, later, annual-report generation share it.
export const fieldLogDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const BUCKET = "field-log";
export const SIGNED_URL_TTL = 60 * 60; // 1 hour

// Resolve a UUID-or-slug route param to a property id the caller owns. Returns
// undefined when there's no such property for this user (caller answers 404).
export async function resolvePropertyId(idOrSlug: string, userId: string) {
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      idOrSlug
    );
  const { data } = await fieldLogDb
    .from("properties")
    .select("id")
    .eq(isUUID ? "id" : "slug", idOrSlug)
    .eq("user_id", userId)
    .single();
  return data?.id as string | undefined;
}

export function mapEntry(e: any, signedUrl: string | null = null) {
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

// Short-lived signed URL for a private-bucket object, or null if none/failed.
export async function signEntryPhoto(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data } = await fieldLogDb.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  return data?.signedUrl ?? null;
}

// Map a DB row to the API shape, signing its photo on the way out.
export async function mapEntryWithSignedUrl(e: any) {
  return mapEntry(e, await signEntryPhoto(e.photo_path));
}

export type FieldLogFilter = {
  // Inclusive bounds on captured_at. For a date-only range, pass an end-of-day
  // timestamp as `to`. Entries with a null captured_at fall outside any range.
  from?: string | null;
  to?: string | null;
  category?: PracticeCategory | null;
};

// THE field-log query: "entries for property X (optionally in date range Y,
// optionally one practice category)", newest first. Date/category filters are
// all optional, so the no-arg form is the full log. Pair with
// groupByPracticeCategory() for the report's "grouped by practice" view.
export function fetchFieldLogEntries(
  propertyId: string,
  userId: string,
  filter: FieldLogFilter = {}
) {
  let query = fieldLogDb
    .from("field_log_entries")
    .select("*")
    .eq("property_id", propertyId)
    .eq("user_id", userId);

  if (filter.category) query = query.eq("practice_category", filter.category);
  if (filter.from) query = query.gte("captured_at", filter.from);
  if (filter.to) query = query.lte("captured_at", filter.to);

  return query
    .order("captured_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
}

// Single entry by id, scoped to owner + property so a guessed id can't leak
// another user's row. maybeSingle() returns null (not an error) when absent.
export function fetchFieldLogEntry(
  propertyId: string,
  userId: string,
  entryId: string
) {
  return fieldLogDb
    .from("field_log_entries")
    .select("*")
    .eq("id", entryId)
    .eq("property_id", propertyId)
    .eq("user_id", userId)
    .maybeSingle();
}
