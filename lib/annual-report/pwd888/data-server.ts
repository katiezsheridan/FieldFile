/**
 * Fetch everything the PWD-888 needs for one property and tax year. Server
 * only — service-role client, so the caller must already have resolved the
 * property through `resolvePropertyId()` (which enforces ownership).
 *
 * This is the one place report inputs are read. Gap analysis
 * (gap-analysis-server.ts) and the assembler both go through it, so the
 * readiness card and the rendered form always see the same containers.
 */

import { createClient } from "@supabase/supabase-js";
import { getMethodLabel, getSpeciesLabel } from "@/lib/census-species";
import { isPracticeCode } from "@/lib/practices";
import type { CensusMethod, FieldValue, PracticeCode } from "@/lib/types";
import { censusToContainer } from "./census";
import type { AssemblyInput, ReportContainer, ReportEvidence } from "./types";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type DocRow = {
  id: string;
  activity_id: string | null;
  observation_id: string | null;
  type: string | null;
  storage_path: string | null;
  captured_at: string | null;
  taken_at: string | null;
  uploaded_at: string | null;
  captured_lat: number | null;
  captured_lng: number | null;
  gps_lat: number | null;
  gps_lng: number | null;
  caption: string | null;
  caption_source: string | null;
};

const DOC_COLUMNS =
  "id, activity_id, observation_id, type, storage_path, captured_at, taken_at, uploaded_at, captured_lat, captured_lng, gps_lat, gps_lng, caption, caption_source";

const docType = (t: string | null): ReportEvidence["docType"] =>
  t === "receipt" || t === "note" ? t : "photo";

function documentEvidence(d: DocRow, kind: ReportEvidence["kind"]): ReportEvidence {
  return {
    id: d.id,
    kind,
    docType: docType(d.type),
    capturedAt: d.captured_at ?? d.taken_at ?? d.uploaded_at,
    // An AI-proposed caption is not an assertion until someone confirms it.
    caption: d.caption_source === "ai_proposed" ? null : d.caption,
    lat: d.captured_lat ?? d.gps_lat,
    lng: d.captured_lng ?? d.gps_lng,
    storagePath: d.storage_path,
  };
}

const groupBy = <T, K>(rows: T[], key: (r: T) => K | null) => {
  const m = new Map<K, T[]>();
  for (const r of rows) {
    const k = key(r);
    if (k === null) continue;
    m.set(k, [...(m.get(k) ?? []), r]);
  }
  return m;
};

/**
 * Activity containers for the year, plus undated ones so they surface as gaps
 * (see gap-analysis-server.ts for why), each with its evidence.
 *
 * Evidence is `documents` on the activity plus field-log captures that carry a
 * photo. A pin-only capture is not evidence: Part V asks for "receipts, maps,
 * photos", and a dropped pin shows someone was somewhere, not what was done.
 */
async function activityContainers(
  propertyId: string,
  taxYear: number
): Promise<ReportContainer[]> {
  const { data: rows, error } = await db
    .from("activities")
    .select("id, name, practice_code, performed_on, field_values, sub_activities(code)")
    .eq("property_id", propertyId)
    .or(
      `and(performed_on.gte.${taxYear}-01-01,performed_on.lte.${taxYear}-12-31),performed_on.is.null`
    );
  if (error) throw error;
  const activities = rows ?? [];
  const ids = activities.map((a) => a.id);

  const [docs, captures] = ids.length
    ? await Promise.all([
        db.from("documents").select(DOC_COLUMNS).in("activity_id", ids),
        db
          .from("field_log_entries")
          .select("id, activity_id, photo_path, captured_at, latitude, longitude, note")
          .in("activity_id", ids)
          .not("photo_path", "is", null),
      ])
    : [{ data: [] as DocRow[] }, { data: [] }];

  // A failed evidence query must throw, not read as "no evidence" — the latter
  // quietly drops every practice below the floor.
  for (const r of [docs, captures]) if ("error" in r && r.error) throw r.error;
  const docsBy = groupBy((docs.data ?? []) as DocRow[], (d) => d.activity_id);
  const capsBy = groupBy(captures.data ?? [], (c) => c.activity_id as string | null);

  return activities.map((a) => {
    const joined = a.sub_activities as { code?: string } | null;
    const evidence: ReportEvidence[] = [
      ...(docsBy.get(a.id) ?? []).map((d) => documentEvidence(d, "document")),
      ...(capsBy.get(a.id) ?? []).map((c) => ({
        id: c.id,
        kind: "field_log" as const,
        docType: "photo" as const,
        capturedAt: c.captured_at,
        caption: c.note,
        lat: c.latitude,
        lng: c.longitude,
        storagePath: c.photo_path,
      })),
    ];
    return {
      id: a.id,
      source: "activity" as const,
      label: a.name ?? "Activity",
      practiceCode: isPracticeCode(a.practice_code) ? (a.practice_code as PracticeCode) : null,
      subActivityCode: joined?.code ?? null,
      performedOn: a.performed_on ?? null,
      fieldValues: (a.field_values ?? {}) as Record<string, FieldValue>,
      evidence,
    };
  });
}

type CountRow = {
  count_total: number | null;
  count_buck: number | null;
  count_doe: number | null;
  count_fawn: number | null;
  count_male: number | null;
  count_female: number | null;
  count_juvenile: number | null;
  count_unknown: number | null;
};

/** `count_total` when entered, else the sex/age breakdown summed. */
export function speciesTotal(c: CountRow): number {
  if (c.count_total && c.count_total > 0) return c.count_total;
  return [
    c.count_buck, c.count_doe, c.count_fawn, c.count_male,
    c.count_female, c.count_juvenile, c.count_unknown,
  ].reduce<number>((n, v) => n + (v ?? 0), 0);
}

/** Census observations dated in the tax year, as CE containers. */
async function censusContainers(
  propertyId: string,
  taxYear: number
): Promise<ReportContainer[]> {
  const { data: obs, error } = await db
    .from("census_observations")
    .select("id, observed_on, method, miles_surveyed")
    .eq("property_id", propertyId)
    .gte("observed_on", `${taxYear}-01-01`)
    .lte("observed_on", `${taxYear}-12-31`);
  if (error) throw error;
  if (!obs?.length) return [];
  const ids = obs.map((o) => o.id);

  const [countRes, photoRes] = await Promise.all([
    db
      .from("census_species_counts")
      .select(
        "observation_id, category, species, count_total, count_buck, count_doe, count_fawn, count_male, count_female, count_juvenile, count_unknown"
      )
      .in("observation_id", ids),
    db.from("documents").select(DOC_COLUMNS).in("observation_id", ids),
  ]);
  if (countRes.error) throw countRes.error;
  if (photoRes.error) throw photoRes.error;
  const counts = countRes.data;
  const photos = photoRes.data;
  const countsBy = groupBy(counts ?? [], (c) => c.observation_id as string | null);
  const photosBy = groupBy((photos ?? []) as DocRow[], (d) => d.observation_id);

  return obs.map((o) => {
    const rows = countsBy.get(o.id) ?? [];
    return censusToContainer({
      id: o.id,
      observedOn: o.observed_on,
      method: o.method as CensusMethod,
      methodLabel: getMethodLabel(o.method as CensusMethod),
      milesSurveyed: o.miles_surveyed ?? null,
      species: Array.from(new Set(rows.map((c) => getSpeciesLabel(c.category, c.species)))),
      counts: rows.map((c) => ({
        species: getSpeciesLabel(c.category, c.species),
        count: speciesTotal(c),
      })),
      photos: (photosBy.get(o.id) ?? []).map((d) => documentEvidence(d, "census_photo")),
    });
  });
}

/** Every container for the year: activities, then census observations. */
export async function fetchReportContainers(
  propertyId: string,
  taxYear: number
): Promise<ReportContainer[]> {
  const [activities, census] = await Promise.all([
    activityContainers(propertyId, taxYear),
    censusContainers(propertyId, taxYear),
  ]);
  return [...activities, ...census];
}

/**
 * Confirmed, period-level answers from the questionnaire. Only `answer` is
 * read — a `proposed_answer` nobody confirmed must never reach the form.
 */
async function periodAnswers(
  propertyId: string,
  taxYear: number
): Promise<Map<string, unknown>> {
  const answers = new Map<string, unknown>();
  const { data: period } = await db
    .from("report_periods")
    .select("id")
    .eq("property_id", propertyId)
    .eq("tax_year", taxYear)
    .maybeSingle();
  if (!period) return answers;

  const { data: rows } = await db
    .from("report_questions")
    .select("field_key, answer, answered_at")
    .eq("report_period_id", period.id)
    .is("activity_id", null)
    .not("answer", "is", null)
    .order("answered_at", { ascending: true });
  for (const r of rows ?? []) if (r.field_key) answers.set(r.field_key, r.answer);
  return answers;
}

export async function fetchAssemblyInput(
  propertyId: string,
  taxYear: number
): Promise<AssemblyInput> {
  const [containers, answers, { data: property }, { data: owner }, { data: filing }] =
    await Promise.all([
      fetchReportContainers(propertyId, taxYear),
      periodAnswers(propertyId, taxYear),
      db
        .from("properties")
        .select("name, county, appraisal_account, address")
        .eq("id", propertyId)
        .maybeSingle(),
      db
        .from("owner_profiles")
        .select("owner_name, mailing_address, phone")
        .eq("property_id", propertyId)
        .maybeSingle(),
      db
        .from("form50129_filings")
        .select("answers")
        .eq("property_id", propertyId)
        .order("tax_year", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const str = (v: unknown) => (typeof v === "string" ? v : null);
  const bool = (v: unknown) => (typeof v === "boolean" ? v : null);
  const managed = (filing?.answers as { section5?: { managedByAssociation?: unknown } } | null)
    ?.section5?.managedByAssociation;

  return {
    propertyId,
    taxYear,
    containers,
    identity: {
      ownerName: owner?.owner_name ?? null,
      accountNumber: property?.appraisal_account ?? null,
      mailingAddress: owner?.mailing_address ?? property?.address ?? null,
      phone: owner?.phone ?? null,
      tractName: property?.name ?? null,
      majorityCounty: property?.county ?? null,
    },
    additionalCounties: str(answers.get("identity.additionalCounties")),
    association: {
      member: bool(answers.get("association.member")),
      name: str(answers.get("association.name")),
      proposedMember: bool(managed),
    },
  };
}
