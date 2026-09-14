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
    // The finer classification and the container it lands in. Null on entries
    // captured before sub-activity capture shipped — a human picks those.
    subActivityCode: e.sub_activity_code ?? null,
    activityId: e.activity_id ?? null,
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

// ---------------------------------------------------------------------------
// The container a field-log entry belongs to
// ---------------------------------------------------------------------------

/**
 * Find or create the activity container for one captured entry, and return its
 * id. THE ACTIVITY IS THE CONTAINER — an entry is evidence inside one, never a
 * container of its own.
 *
 * The grouping key is (property_id, sub_activity_id, performed_on): a fence
 * line photographed in six spots on one afternoon lands in one activity with
 * six photos, not six activities the report has to re-group by heuristic.
 *
 * Keyed on the CAPTURE date, not now(), so an entry that sat in the offline
 * queue for three days still joins the container for the day the work happened.
 *
 * Returns null when the annual-report tables aren't present, or when the entry
 * has no sub-activity — an unclassified capture gets no container rather than a
 * guessed one.
 */
export async function findOrCreateContainer(opts: {
  propertyId: string;
  subActivityCode: string;
  practiceCode: string;
  performedOn: string; // YYYY-MM-DD, the capture date
  name: string;
  legacyType: string;
}): Promise<string | null> {
  const { data: sub } = await fieldLogDb
    .from("sub_activities")
    .select("id")
    .eq("code", opts.subActivityCode)
    .maybeSingle();
  if (!sub?.id) return null;

  const { data: existing } = await fieldLogDb
    .from("activities")
    .select("id")
    .eq("property_id", opts.propertyId)
    .eq("sub_activity_id", sub.id)
    .eq("performed_on", opts.performedOn)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const taxYear = Number(opts.performedOn.slice(0, 4));
  const { data: period } = await fieldLogDb
    .from("report_periods")
    .upsert(
      { property_id: opts.propertyId, tax_year: taxYear, status: "draft" },
      { onConflict: "property_id,tax_year", ignoreDuplicates: false }
    )
    .select("id")
    .maybeSingle();

  const { data: created, error } = await fieldLogDb
    .from("activities")
    .insert({
      property_id: opts.propertyId,
      type: opts.legacyType,
      name: opts.name,
      description: "Captured in the field.",
      status: "in_progress",
      practice_code: opts.practiceCode,
      sub_activity_id: sub.id,
      performed_on: opts.performedOn,
      completed_date: opts.performedOn,
      due_date: opts.performedOn,
      field_values: {},
      required_evidence: [],
      locations: [],
      ...(period?.id ? { report_period_id: period.id } : {}),
    })
    .select("id")
    .single();

  if (error) {
    // A second capture racing us to the same (property, sub-activity, day)
    // will have created it; that container is just as good as ours.
    const { data: raced } = await fieldLogDb
      .from("activities")
      .select("id")
      .eq("property_id", opts.propertyId)
      .eq("sub_activity_id", sub.id)
      .eq("performed_on", opts.performedOn)
      .limit(1)
      .maybeSingle();
    return raced?.id ?? null;
  }

  return created?.id ?? null;
}
