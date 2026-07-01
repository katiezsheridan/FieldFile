/**
 * Supabase Storage for generated Form 50-129 PDFs.
 *
 * Private bucket + short-lived signed URLs (same shape as the field-log photo
 * store). The storage path is stable per property + tax year, so regenerating
 * OVERWRITES the previous PDF rather than orphaning it — there is only ever one
 * current file per filing.
 *
 * Server-only. Uses the service-role client, so callers MUST have already
 * verified ownership (Clerk userId owns the property).
 */

import { createClient } from "@supabase/supabase-js";

export const FILINGS_BUCKET = "filings";
const SIGNED_URL_TTL = 60 * 60; // 1 hour

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * Stable storage path for a filing's PDF. Scoped by userId so one user can
 * never read another's object even with a leaked path; one object per
 * property + tax year (regeneration overwrites it).
 */
export function filingPdfPath(
  userId: string,
  propertyId: string,
  taxYear: number,
): string {
  return `form50129/${userId}/${propertyId}/${taxYear}.pdf`;
}

/** Upload (overwriting any existing object at the same path). */
export async function uploadFilingPdf(
  path: string,
  bytes: Uint8Array,
): Promise<{ error?: string }> {
  const { error } = await db.storage
    .from(FILINGS_BUCKET)
    .upload(path, Buffer.from(bytes), {
      contentType: "application/pdf",
      upsert: true, // overwrite — never orphan a stale version
    });
  return error ? { error: error.message } : {};
}

/** Short-lived signed URL for previewing/downloading a private PDF. */
export async function signFilingPdf(path: string): Promise<string | null> {
  const { data } = await db.storage
    .from(FILINGS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  return data?.signedUrl ?? null;
}
