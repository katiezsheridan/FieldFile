/**
 * The practices the landowner's wildlife plan (PWD-885) selected, for showing
 * beside what the annual report (PWD-888) actually counts.
 *
 * Display only. A planned practice is an intention; it never counts toward
 * the three-of-seven floor and never creates a container (CLAUDE.md >
 * "Annual Report Domain Model" > 2). The readiness card uses this to say
 * "planned, not logged yet" and offer to log it.
 *
 * Server only; the caller has already authorized the property.
 */

import { createClient } from "@supabase/supabase-js";
import { PRACTICE_CODE_BY_CATEGORY } from "@/lib/practices";
import type { PracticeCategory, PracticeCode } from "@/lib/types";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type PlannedPractices = { planYear: number; codes: PracticeCode[] } | null;

/**
 * The plan that governs `taxYear`: the latest one for that year or earlier
 * (a plan carries forward until replaced), else the earliest later one, for
 * a landowner who planned ahead. Null when the property has no plan.
 */
export async function plannedPractices(
  propertyId: string,
  taxYear: number
): Promise<PlannedPractices> {
  const { data: plans, error } = await db
    .from("plans")
    .select("id, year")
    .eq("property_id", propertyId)
    .order("year", { ascending: true });
  if (error) throw error;
  if (!plans?.length) return null;

  const governing =
    [...plans].reverse().find((p) => p.year <= taxYear) ?? plans[0];

  const { data: rows, error: pErr } = await db
    .from("plan_practices")
    .select("practice_type")
    .eq("plan_id", governing.id)
    .eq("selected", true);
  if (pErr) throw pErr;

  const codes = (rows ?? [])
    .map((r) => PRACTICE_CODE_BY_CATEGORY[r.practice_type as PracticeCategory])
    .filter(Boolean);
  return { planYear: governing.year, codes };
}
