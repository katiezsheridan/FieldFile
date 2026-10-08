/**
 * POST /api/properties/[id]/annual-report/generate   { taxYear }
 *
 * Assemble the PWD-888, draw it onto the TPWD form with its exhibits, store it
 * privately (overwriting any earlier copy for this year) and return a
 * short-lived signed URL.
 *
 * While blocking gaps remain, every page is stamped DRAFT: the landowner can
 * see where the report stands, but cannot mistake it for one ready to sign.
 * The certification, signature and date are never filled.
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { resolvePropertyId } from "@/lib/field-log-server";
import { describeError } from "@/lib/errors";
import { blockingGaps } from "@/lib/annual-report/gap-analysis";
import { buildPwd888 } from "@/lib/annual-report/pwd888/build-server";
import { loadExhibitImage } from "@/lib/annual-report/pwd888/exhibit-images-server";
import { renderPwd888 } from "@/lib/forms/pwd888/render";
import { reportPdfPath, signReportPdf, uploadReportPdf } from "@/lib/forms/pwd888/storage";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const propertyId = await resolvePropertyId(id, userId);
  if (!propertyId) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  let body: { taxYear?: number } = {};
  try {
    body = await request.json();
  } catch {
    // Empty body: default year.
  }
  const year = Number(body.taxYear ?? new Date().getFullYear());
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  try {
    const r = await buildPwd888(propertyId, year);
    const open = blockingGaps({ ...r.analysis, gaps: r.gaps }).length;
    const ready = r.analysis.meetsMinimum && open === 0;

    const bytes = await renderPwd888(r.payload, {
      loadImage: loadExhibitImage,
      draft: ready ? null : { openItems: Math.max(open, 1) },
    });

    const path = reportPdfPath(userId, propertyId, year);
    const { error } = await uploadReportPdf(path, bytes);
    if (error) throw new Error(error);
    const pdfUrl = await signReportPdf(path);

    return NextResponse.json({ taxYear: year, ready, draft: !ready, pdfUrl });
  } catch (err) {
    const message = describeError(err, "Could not generate the report");
    console.error("[annual-report/generate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
