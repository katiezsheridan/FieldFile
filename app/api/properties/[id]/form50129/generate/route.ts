/**
 * POST /api/properties/[id]/form50129/generate
 *
 * Assemble the payload, fill the Form 50-129 template, store the PDF in Supabase
 * Storage (overwriting any prior version — one file per property + tax year),
 * mark the filing `ready`, and return a short-lived signed URL.
 *
 * Produces a completed-but-UNSIGNED PDF. It never signs, never dates Section 7,
 * and never submits to the county — the owner does that.
 */

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { buildPayload } from "@/lib/forms/form50129/buildPayload";
import { fill50129 } from "@/lib/forms/form50129/fill";
import {
  filingPdfPath,
  uploadFilingPdf,
  signFilingPdf,
} from "@/lib/forms/form50129/storage";

// fill50129 reads the template from disk and uses pdf-lib — Node runtime only.
export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function resolveYear(raw: unknown): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 1900 ? n : new Date().getFullYear();
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: propertyId } = await params;

  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  let body: { taxYear?: number } = {};
  try {
    body = await request.json();
  } catch {
    // no body is fine — default the year
  }
  const year = resolveYear(body.taxYear);

  // Assemble and fill. The payload may still have Bucket-3 gaps; those render
  // blank for the owner to complete by hand — generation is never blocked.
  const { payload } = await buildPayload(propertyId, year, { userId });
  let bytes: Uint8Array;
  try {
    bytes = await fill50129(payload);
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to fill form: ${(err as Error).message}` },
      { status: 500 },
    );
  }

  const path = filingPdfPath(userId, propertyId, year);
  const up = await uploadFilingPdf(path, bytes);
  if (up.error) {
    return NextResponse.json(
      { error: `Failed to store PDF: ${up.error}` },
      { status: 500 },
    );
  }

  const { error: dbError } = await supabase.from("form50129_filings").upsert(
    {
      property_id: propertyId,
      user_id: userId,
      tax_year: year,
      generated_pdf_path: path,
      status: "ready",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "property_id,tax_year" },
  );
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  const pdfUrl = await signFilingPdf(path);
  return NextResponse.json({ taxYear: year, status: "ready", hasPdf: true, pdfUrl });
}
