/**
 * The work log inside an activity: one row per time the work was done.
 * Server only (service-role client); every function takes the Clerk userId
 * and refuses activities the user does not own.
 *
 * The activity's own dates are derived from its visits — performed_on is the
 * first visit, performed_through the last (null when there is one), and
 * completed_date the last — so the annual report, which reads those columns,
 * needs no second notion of "when". Visits must fall in the activity's tax
 * year (CLAUDE.md > "Annual Report Domain Model" > 2: per tax year).
 */

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { describeError, isMissingSchemaError } from "@/lib/errors";
import { ensurePeriod } from "@/lib/annual-report/pwd888/period-server";
import { texasDate } from "@/lib/dates";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type Visit = {
  id: string;
  activityId: string;
  visitedOn: string;
  notes: string | null;
  timeSpent: string | null;
  cost: number | null;
  amount: string | null;
  performedBy: string | null;
};

export type VisitInput = {
  visitedOn: string;
  notes?: string | null;
  timeSpent?: string | null;
  cost?: number | null;
  amount?: string | null;
  performedBy?: string | null;
};

export class VisitError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

/** A route's error response: VisitError keeps its status, anything else is a 500. */
export function visitErrorResponse(err: unknown, fallback: string) {
  if (err instanceof VisitError) return NextResponse.json({ error: err.message }, { status: err.status });
  const message = describeError(err, fallback);
  console.error("[visits]", message);
  return NextResponse.json({ error: message }, { status: 500 });
}

export const VISITS_NOT_MIGRATED =
  "The work log isn't available yet: apply migrations/add_activity_visits.sql in the Supabase SQL editor.";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

const mapVisit = (r: Record<string, unknown>): Visit => ({
  id: r.id as string,
  activityId: r.activity_id as string,
  visitedOn: String(r.visited_on),
  notes: (r.notes as string | null) ?? null,
  timeSpent: (r.time_spent as string | null) ?? null,
  cost: r.cost === null || r.cost === undefined ? null : Number(r.cost),
  amount: (r.amount as string | null) ?? null,
  performedBy: (r.performed_by as string | null) ?? null,
});

type OwnedActivity = {
  id: string;
  property_id: string;
  performed_on: string | null;
  performed_through: string | null;
};

/** The activity, if `userId` owns its property. */
async function ownedActivity(activityId: string, userId: string): Promise<OwnedActivity> {
  const { data, error } = await db
    .from("activities")
    .select("id, property_id, performed_on, performed_through, properties!inner(user_id)")
    .eq("id", activityId)
    .eq("properties.user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new VisitError("Activity not found", 404);
  return data as unknown as OwnedActivity;
}

function clean(input: VisitInput) {
  const s = (v: string | null | undefined) => {
    const t = v?.trim();
    return t ? t.slice(0, 2000) : null;
  };
  if (!ISO.test(input.visitedOn ?? "")) throw new VisitError("Enter the date of the visit.");
  if (input.visitedOn > texasDate()) throw new VisitError("A visit can't be in the future.");
  const cost = input.cost === null || input.cost === undefined || (input.cost as unknown) === "" ? null : Number(input.cost);
  if (cost !== null && (!Number.isFinite(cost) || cost < 0)) throw new VisitError("Cost must be a positive number.");
  return {
    visited_on: input.visitedOn,
    notes: s(input.notes),
    time_spent: s(input.timeSpent),
    cost,
    amount: s(input.amount),
    performed_by: s(input.performedBy),
  };
}

/**
 * The tax year visits must fall in: the activity's existing year, or — for a
 * first visit on an undated activity — the visit's own year.
 */
function checkYear(activity: OwnedActivity, others: Visit[], visitedOn: string) {
  const year =
    others[0]?.visitedOn.slice(0, 4) ?? activity.performed_on?.slice(0, 4) ?? null;
  if (year && visitedOn.slice(0, 4) !== year) {
    throw new VisitError(
      `This activity is for the ${year} tax year, so its visits must be in ${year}. ` +
        `Log ${visitedOn.slice(0, 4)} work in that year's activity (use "Continue in ${Number(year) + 1}").`
    );
  }
}

/** Re-derive the activity's dates (and report period) from its visits. */
async function syncDates(activity: OwnedActivity) {
  const { data, error } = await db
    .from("activity_visits")
    .select("visited_on")
    .eq("activity_id", activity.id)
    .order("visited_on", { ascending: true });
  if (error) throw error;
  if (!data?.length) return; // no visits: leave the activity's own dates alone
  const first = String(data[0].visited_on);
  const last = String(data[data.length - 1].visited_on);
  const periodId = await ensurePeriod(activity.property_id, Number(first.slice(0, 4)));
  const { error: upErr } = await db
    .from("activities")
    .update({
      performed_on: first,
      performed_through: last === first ? null : last,
      completed_date: last,
      report_period_id: periodId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", activity.id);
  if (upErr) throw upErr;
}

/**
 * The activity's visits, oldest first. An activity logged before the work log
 * existed is converted the first time it is read: one visit for its Date
 * performed and, when it carried a range, one for the end date — a range like
 * "Jan 3 to Apr 4" was almost always two separate times.
 */
export async function listVisits(activityId: string, userId: string): Promise<Visit[]> {
  const activity = await ownedActivity(activityId, userId);
  const read = async () => {
    const { data, error } = await db
      .from("activity_visits")
      .select("*")
      .eq("activity_id", activityId)
      .order("visited_on", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      if (isMissingSchemaError(error)) throw new VisitError(VISITS_NOT_MIGRATED, 503);
      throw error;
    }
    return (data ?? []).map(mapVisit);
  };

  const visits = await read();
  if (visits.length > 0 || !activity.performed_on) return visits;

  const seed = [activity.performed_on, activity.performed_through].filter(
    (d, i, all): d is string => Boolean(d) && all.indexOf(d) === i
  );
  const { error } = await db
    .from("activity_visits")
    .insert(seed.map((d) => ({ activity_id: activityId, visited_on: d })));
  if (error) throw error;
  return read();
}

export async function addVisit(activityId: string, userId: string, input: VisitInput): Promise<Visit> {
  const activity = await ownedActivity(activityId, userId);
  const row = clean(input);
  checkYear(activity, await listVisits(activityId, userId), row.visited_on);
  const { data, error } = await db
    .from("activity_visits")
    .insert({ activity_id: activityId, ...row })
    .select("*")
    .single();
  if (error) throw error;
  await syncDates(activity);
  return mapVisit(data);
}

export async function updateVisit(
  activityId: string,
  visitId: string,
  userId: string,
  input: VisitInput
): Promise<Visit> {
  const activity = await ownedActivity(activityId, userId);
  const row = clean(input);
  const others = (await listVisits(activityId, userId)).filter((v) => v.id !== visitId);
  checkYear(activity, others, row.visited_on);
  const { data, error } = await db
    .from("activity_visits")
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq("id", visitId)
    .eq("activity_id", activityId)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new VisitError("Visit not found", 404);
  await syncDates(activity);
  return mapVisit(data);
}

/** Delete a visit. Its photos stay on the activity, unlinked from the visit. */
export async function deleteVisit(activityId: string, visitId: string, userId: string) {
  const activity = await ownedActivity(activityId, userId);
  const { error } = await db
    .from("activity_visits")
    .delete()
    .eq("id", visitId)
    .eq("activity_id", activityId);
  if (error) throw error;
  await syncDates(activity);
}

/**
 * Start next year's copy of this activity: same practice, sub-activity,
 * details, name and location, an empty work log, and no date until its first
 * visit is logged.
 */
export async function continueNextYear(activityId: string, userId: string): Promise<{ id: string; year: number }> {
  await ownedActivity(activityId, userId);
  const { data: a, error } = await db.from("activities").select("*").eq("id", activityId).single();
  if (error) throw error;
  const year = Number(String(a.performed_on ?? texasDate()).slice(0, 4)) + 1;
  const { data: created, error: insErr } = await db
    .from("activities")
    .insert({
      property_id: a.property_id,
      type: a.type,
      name: a.name,
      description: a.description,
      status: "not_started",
      required_evidence: a.required_evidence,
      practice_code: a.practice_code,
      sub_activity_id: a.sub_activity_id,
      field_values: a.field_values,
      location_label: a.location_label,
      location_lat: a.location_lat,
      location_lng: a.location_lng,
      report_period_id: await ensurePeriod(a.property_id, year),
    })
    .select("id")
    .single();
  if (insErr) throw insErr;
  return { id: created.id as string, year };
}
