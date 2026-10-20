/**
 * The report period's lifecycle: draft → finalized → submitted.
 *
 *   finalized  a PDF was generated with nothing blocking (no DRAFT stamp)
 *   submitted  the landowner told us they signed it and gave it to their
 *              appraisal district. FieldFile never submits; this records what
 *              the landowner did, on the date they say, to the district they
 *              name.
 *
 * Recording a submission also keeps a copy of the PDF as it stood, at its own
 * path, because the working PDF is overwritten on every regenerate. The copy
 * is the record of what was handed in. Server only; callers have already
 * authorized the property.
 */

import { createClient } from "@supabase/supabase-js";
import { FILINGS_BUCKET } from "@/lib/forms/form50129/storage";
import { reportPdfPath, signReportPdf, submittedPdfPath } from "@/lib/forms/pwd888/storage";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type PeriodStatus = "draft" | "in_review" | "finalized" | "submitted";

export type PeriodState = {
  status: PeriodStatus;
  finalizedAt: string | null;
  /** The date the landowner says they submitted, YYYY-MM-DD. */
  submittedOn: string | null;
  submittedTo: string | null;
  /** Signed URL of the copy kept at submission. */
  submittedPdfUrl: string | null;
};

const EMPTY: PeriodState = {
  status: "draft",
  finalizedAt: null,
  submittedOn: null,
  submittedTo: null,
  submittedPdfUrl: null,
};

export async function ensurePeriod(propertyId: string, year: number): Promise<string> {
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

export async function getPeriodState(
  userId: string,
  propertyId: string,
  year: number
): Promise<PeriodState> {
  const { data, error } = await db
    .from("report_periods")
    .select("status, finalized_at, submitted_at, submitted_to")
    .eq("property_id", propertyId)
    .eq("tax_year", year)
    .maybeSingle();
  if (error) throw error;
  if (!data) return EMPTY;
  const submitted = data.status === "submitted";
  return {
    status: data.status as PeriodStatus,
    finalizedAt: data.finalized_at,
    submittedOn: submitted && data.submitted_at ? String(data.submitted_at).slice(0, 10) : null,
    submittedTo: submitted ? data.submitted_to : null,
    submittedPdfUrl: submitted ? await signReportPdf(submittedPdfPath(userId, propertyId, year)) : null,
  };
}

/**
 * After a generate: a ready PDF finalizes the period; a DRAFT one sends a
 * finalized period back to draft, because the PDF on file no longer stands
 * behind it. A submitted period is never touched — what was handed in stays
 * handed in, whatever is generated afterwards.
 */
export async function noteGenerated(propertyId: string, year: number, ready: boolean) {
  await ensurePeriod(propertyId, year);
  const now = new Date().toISOString();
  const { error } = await db
    .from("report_periods")
    .update(
      ready
        ? { status: "finalized", finalized_at: now, updated_at: now }
        : { status: "draft", finalized_at: null, updated_at: now }
    )
    .eq("property_id", propertyId)
    .eq("tax_year", year)
    .neq("status", "submitted");
  if (error) throw error;
}

export class PeriodError extends Error {}

/**
 * Record that the landowner submitted the finalized report. Requires a
 * finalized period (a ready PDF on file) — or an already-submitted one, to
 * correct the date or district. Copies the working PDF to the submitted path.
 */
export async function recordSubmission(
  userId: string,
  propertyId: string,
  year: number,
  submittedOn: string,
  submittedTo: string
) {
  const { data: period, error } = await db
    .from("report_periods")
    .select("status")
    .eq("property_id", propertyId)
    .eq("tax_year", year)
    .maybeSingle();
  if (error) throw error;
  if (!period || (period.status !== "finalized" && period.status !== "submitted")) {
    throw new PeriodError(
      "Generate the final (non-draft) PDF before recording a submission."
    );
  }

  if (period.status === "finalized") {
    const from = reportPdfPath(userId, propertyId, year);
    const to = submittedPdfPath(userId, propertyId, year);
    const bucket = db.storage.from(FILINGS_BUCKET);
    await bucket.remove([to]); // a copy from an undone submission
    const { error: copyErr } = await bucket.copy(from, to);
    if (copyErr) throw new PeriodError(`Could not keep a copy of the PDF: ${copyErr.message}`);
  }

  const now = new Date().toISOString();
  const { error: upErr } = await db
    .from("report_periods")
    .update({
      status: "submitted",
      // Noon UTC, so the calendar date survives any timezone it is read in.
      submitted_at: `${submittedOn}T12:00:00Z`,
      submitted_to: submittedTo,
      updated_at: now,
    })
    .eq("property_id", propertyId)
    .eq("tax_year", year);
  if (upErr) throw upErr;
}

/** Undo a submission recorded by mistake. The period returns to finalized. */
export async function undoSubmission(userId: string, propertyId: string, year: number) {
  const now = new Date().toISOString();
  const { error } = await db
    .from("report_periods")
    .update({ status: "finalized", submitted_at: null, submitted_to: null, updated_at: now })
    .eq("property_id", propertyId)
    .eq("tax_year", year)
    .eq("status", "submitted");
  if (error) throw error;
  await db.storage.from(FILINGS_BUCKET).remove([submittedPdfPath(userId, propertyId, year)]);
}
