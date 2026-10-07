/**
 * Fetch what gap analysis needs and run it. Server-only — uses the service-role
 * client, with ownership enforced by the caller having already resolved the
 * property through `resolvePropertyId()`.
 *
 * Kept apart from gap-analysis.ts so the analysis itself stays pure and
 * testable without a database, the same split the 50-129 assembler uses.
 */

import { createClient } from "@supabase/supabase-js";
import { isPracticeCode } from "@/lib/practices";
import {
  analyzeReportGaps,
  type ContainerInput,
  type GapAnalysis,
} from "./gap-analysis";
import type { PracticeCode } from "@/lib/types";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Evidence is counted per container from two sources: `documents` attached to
 * the activity, and field-log captures that carry a photo.
 *
 * A pin-only field-log entry — coordinates and a note, no photo — is
 * deliberately NOT counted. PWD-888 Part V asks for "receipts, maps, photos";
 * a dropped pin records that someone was somewhere, which is not the same as
 * showing what was done. It still belongs to the container and still appears on
 * the report; it just does not by itself make a practice "documented".
 */
async function evidenceCounts(
  activityIds: string[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (activityIds.length === 0) return counts;

  const [{ data: docs }, { data: captures }] = await Promise.all([
    db.from("documents").select("activity_id").in("activity_id", activityIds),
    db
      .from("field_log_entries")
      .select("activity_id, photo_path")
      .in("activity_id", activityIds),
  ]);

  for (const d of docs ?? []) {
    if (d.activity_id) {
      counts.set(d.activity_id, (counts.get(d.activity_id) ?? 0) + 1);
    }
  }
  for (const c of captures ?? []) {
    if (c.activity_id && c.photo_path) {
      counts.set(c.activity_id, (counts.get(c.activity_id) ?? 0) + 1);
    }
  }
  return counts;
}

/**
 * The containers that belong to this tax year.
 *
 * Selected on `performed_on`, the date the work happened — never `created_at`.
 * A photo uploaded in January of work done the previous November belongs to the
 * previous year (CLAUDE.md > "Annual Report Domain Model" > 2).
 *
 * Activities with a NULL `performed_on` are included so the analysis can report
 * them as gaps. They would otherwise vanish silently from every year at once,
 * which is the most misleading possible outcome.
 */
export async function analyzePropertyYear(
  propertyId: string,
  taxYear: number
): Promise<GapAnalysis> {
  const { data: rows } = await db
    .from("activities")
    .select(
      "id, practice_code, sub_activity_id, performed_on, field_values, sub_activities(code)"
    )
    .eq("property_id", propertyId)
    .or(
      `and(performed_on.gte.${taxYear}-01-01,performed_on.lte.${taxYear}-12-31),performed_on.is.null`
    );

  const activities = rows ?? [];
  const counts = await evidenceCounts(activities.map((a) => a.id));

  const containers: ContainerInput[] = activities.map((a) => {
    const joined = a.sub_activities as { code?: string } | null;
    const fieldValues = (a.field_values ?? {}) as Record<string, unknown>;
    return {
      id: a.id,
      practiceCode: isPracticeCode(a.practice_code)
        ? (a.practice_code as PracticeCode)
        : null,
      subActivityCode: joined?.code ?? null,
      performedOn: a.performed_on ?? null,
      evidenceCount: counts.get(a.id) ?? 0,
      answeredFieldCount: Object.keys(fieldValues).length,
    };
  });

  const [{ data: property }, { data: owner }] = await Promise.all([
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
  ]);

  return analyzeReportGaps({
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
    // Part III is not stored anywhere yet, so it is always an open question.
    // Reported as a gap rather than assumed "no" — silence is not an answer.
    associationMember: null,
  });
}
