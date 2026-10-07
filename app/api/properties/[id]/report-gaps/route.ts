import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { resolvePropertyId } from "@/lib/field-log-server";
import { analyzePropertyYear } from "@/lib/annual-report/gap-analysis-server";
import { blockingGaps, isReportReady } from "@/lib/annual-report/gap-analysis";

/**
 * GET /api/properties/:idOrSlug/report-gaps?year=2026
 *
 * What the PWD-888 annual report still needs for this property and year.
 * Read-only: it reports, it never prompts and never writes.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const propertyId = await resolvePropertyId(id, userId);
  if (!propertyId) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const yearParam = new URL(request.url).searchParams.get("year");
  const year = Number(yearParam ?? new Date().getFullYear());
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  const analysis = await analyzePropertyYear(propertyId, year);

  return NextResponse.json({
    ...analysis,
    blockingCount: blockingGaps(analysis).length,
    ready: isReportReady(analysis),
  });
}
