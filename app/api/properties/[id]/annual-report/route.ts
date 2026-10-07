/**
 * PWD-888 annual report review API for one property.
 *
 *   GET   ?year=YYYY  -> the assembled report: payload, gaps, conflicts, proposals
 *   PATCH             -> save Part I owner details (owner_profiles / properties,
 *                        reused every year and by the 50-129) and/or confirmed
 *                        period answers (report_questions), then re-assemble.
 *
 * Never renders, signs or submits anything. Every answer written here is a
 * recorded confirmation: `answered_by` + `answered_at` on the row.
 */

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { resolvePropertyId } from "@/lib/field-log-server";
import { describeError } from "@/lib/errors";
import { blockingGaps } from "@/lib/annual-report/gap-analysis";
import { buildPwd888 } from "@/lib/annual-report/pwd888/build-server";
import {
  describeQuestion,
  isValidAnswer,
  type AnnualReportPatch,
  type PartIInput,
} from "@/lib/annual-report/pwd888/questions";
import { ownerProfileToRow } from "@/lib/forms/form50129/serialize";
import type { FieldValue } from "@/lib/types";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function resolveYear(raw: unknown): number | null {
  const n = Number(raw ?? new Date().getFullYear());
  return Number.isInteger(n) && n >= 2000 && n <= 2100 ? n : null;
}

async function assembled(propertyId: string, year: number) {
  const r = await buildPwd888(propertyId, year);
  const blocking = blockingGaps({ ...r.analysis, gaps: r.gaps });
  return {
    taxYear: year,
    ...r,
    blockingCount: blocking.length,
    ready: r.analysis.meetsMinimum && blocking.length === 0,
  };
}

async function authorize(params: Promise<{ id: string }>) {
  const { userId } = await auth();
  if (!userId) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const { id } = await params;
  const propertyId = await resolvePropertyId(id, userId);
  if (!propertyId) {
    return { error: NextResponse.json({ error: "Property not found" }, { status: 404 }) };
  }
  return { userId, propertyId };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const a = await authorize(params);
  if ("error" in a) return a.error;
  const year = resolveYear(new URL(request.url).searchParams.get("year"));
  if (!year) return NextResponse.json({ error: "Invalid year" }, { status: 400 });

  try {
    return NextResponse.json(await assembled(a.propertyId, year));
  } catch (err) {
    const message = describeError(err, "Could not assemble the report");
    console.error("[annual-report]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Part I: bucket 2. Written to the same rows the 50-129 reads. */
async function savePartI(propertyId: string, userId: string, p: PartIInput) {
  const trim = (s: string | undefined) => (s === undefined ? undefined : s.trim());
  let mailingAddress: string | undefined;
  if (p.mailingAddress) {
    const { street, city, state, zip } = p.mailingAddress;
    const parts = [street, city].map((s) => s.trim());
    const stateZip = `${state.trim().toUpperCase()} ${zip.trim()}`.trim();
    mailingAddress = [...parts, stateZip].filter(Boolean).join(", ");
  }

  const row = ownerProfileToRow({
    name: trim(p.ownerName),
    mailingAddress,
    phone: trim(p.phone),
  });
  if (Object.keys(row).length > 0) {
    const { error } = await db.from("owner_profiles").upsert(
      { property_id: propertyId, user_id: userId, ...row, updated_at: new Date().toISOString() },
      { onConflict: "property_id" }
    );
    if (error) throw error;
  }
  if (p.accountNumber !== undefined) {
    const { error } = await db
      .from("properties")
      .update({ appraisal_account: p.accountNumber.trim() || null })
      .eq("id", propertyId);
    if (error) throw error;
  }
}

async function ensurePeriod(propertyId: string, year: number): Promise<string> {
  const { data, error } = await db
    .from("report_periods")
    .upsert(
      { property_id: propertyId, tax_year: year },
      { onConflict: "property_id,tax_year", ignoreDuplicates: false }
    )
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

/**
 * One row per (period, key). Re-answering updates it in place: the newest
 * confirmation is the answer, stamped with who gave it and when.
 */
async function saveAnswers(
  propertyId: string,
  userId: string,
  year: number,
  answers: Record<string, FieldValue>
) {
  const periodId = await ensurePeriod(propertyId, year);
  const now = new Date().toISOString();

  for (const [key, value] of Object.entries(answers)) {
    const q = describeQuestion(key)!;
    const fields = {
      answer: value,
      answered_at: value === null ? null : now,
      answered_by: value === null ? null : userId,
      skipped: false,
      updated_at: now,
    };
    const { data: existing, error: findErr } = await db
      .from("report_questions")
      .select("id")
      .eq("report_period_id", periodId)
      .is("activity_id", null)
      .eq("field_key", key)
      .limit(1)
      .maybeSingle();
    if (findErr) throw findErr;

    const { error } = existing
      ? await db.from("report_questions").update(fields).eq("id", existing.id)
      : await db.from("report_questions").insert({
          report_period_id: periodId,
          field_key: key,
          question_text: q.questionText,
          input_type: q.inputType,
          unit: q.unit ?? null,
          choices: q.choices ?? null,
          priority: q.priority,
          ...fields,
        });
    if (error) throw error;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const a = await authorize(params);
  if ("error" in a) return a.error;

  let body: AnnualReportPatch;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const year = resolveYear(body.taxYear);
  if (!year) return NextResponse.json({ error: "Invalid year" }, { status: 400 });

  // Validate everything before writing anything.
  for (const [key, value] of Object.entries(body.answers ?? {})) {
    const q = describeQuestion(key);
    if (!q) return NextResponse.json({ error: `Unknown question: ${key}` }, { status: 400 });
    if (!isValidAnswer(q, value)) {
      return NextResponse.json({ error: `Invalid answer for ${key}` }, { status: 400 });
    }
  }

  try {
    if (body.partI) await savePartI(a.propertyId, a.userId, body.partI);
    if (body.answers && Object.keys(body.answers).length > 0) {
      await saveAnswers(a.propertyId, a.userId, year, body.answers);
    }
    return NextResponse.json(await assembled(a.propertyId, year));
  } catch (err) {
    const message = describeError(err, "Could not save");
    console.error("[annual-report]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
