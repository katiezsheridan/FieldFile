/**
 * Form 50-129 filing API for one property.
 *
 *   GET   ?year=YYYY  -> assembled { payload, missing, status, pdfUrl }
 *   PATCH             -> save Bucket-2 owner profile and/or Bucket-3 filing
 *                        answers, then return the freshly re-assembled result.
 *
 * Never generates, signs, or files anything — that's the /generate route and
 * the owner, respectively.
 */

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { buildPayload, type FilingAnswers } from "@/lib/forms/form50129/buildPayload";
import { ownerProfileToRow, type OwnerProfileInput } from "@/lib/forms/form50129/serialize";
import { signFilingPdf } from "@/lib/forms/form50129/storage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const FILING_STATUSES = ["draft", "ready", "filed"] as const;
type FilingStatus = (typeof FILING_STATUSES)[number];

function resolveYear(raw: string | number | null | undefined): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 1900 ? n : new Date().getFullYear();
}

/** Verify the property belongs to this user; returns false if not. */
async function ownsProperty(propertyId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

/** Assemble + attach the filing's status and a signed URL to any current PDF. */
async function assembleResponse(
  propertyId: string,
  userId: string,
  year: number,
) {
  const { payload, missing } = await buildPayload(propertyId, year, { userId });
  const { data: filing } = await supabase
    .from("form50129_filings")
    .select("status, generated_pdf_path")
    .eq("property_id", propertyId)
    .eq("tax_year", year)
    .eq("user_id", userId)
    .maybeSingle();

  const path = filing?.generated_pdf_path ?? null;
  const pdfUrl = path ? await signFilingPdf(path) : null;

  return {
    taxYear: year,
    payload,
    missing,
    status: (filing?.status as FilingStatus) ?? "draft",
    hasPdf: !!path,
    pdfUrl,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: propertyId } = await params;
  if (!(await ownsProperty(propertyId, userId))) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }
  const year = resolveYear(new URL(request.url).searchParams.get("year"));
  return NextResponse.json(await assembleResponse(propertyId, userId, year));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: propertyId } = await params;
  if (!(await ownsProperty(propertyId, userId))) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  let body: {
    ownerProfile?: OwnerProfileInput;
    answers?: FilingAnswers;
    taxYear?: number;
    status?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const year = resolveYear(body.taxYear);
  const now = new Date().toISOString();

  // --- Bucket 2: owner profile (per property, reused every year) ---
  if (body.ownerProfile) {
    const row = ownerProfileToRow(body.ownerProfile);
    const { error } = await supabase.from("owner_profiles").upsert(
      { property_id: propertyId, user_id: userId, ...row, updated_at: now },
      { onConflict: "property_id" },
    );
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  // --- Bucket 3: per-filing answers / status (per property + tax year) ---
  const filingUpdate: Record<string, unknown> = {};
  if (body.answers !== undefined) filingUpdate.answers = body.answers;
  if (body.status !== undefined) {
    if (!FILING_STATUSES.includes(body.status as FilingStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    filingUpdate.status = body.status;
  }
  if (Object.keys(filingUpdate).length > 0) {
    const { error } = await supabase.from("form50129_filings").upsert(
      {
        property_id: propertyId,
        user_id: userId,
        tax_year: year,
        ...filingUpdate,
        updated_at: now,
      },
      { onConflict: "property_id,tax_year" },
    );
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json(await assembleResponse(propertyId, userId, year));
}
