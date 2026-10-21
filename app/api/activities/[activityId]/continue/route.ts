/**
 * POST /api/activities/:activityId/continue -> { id, year }
 *
 * Start next tax year's copy of an activity (same practice, sub-activity and
 * details, empty work log). See continueNextYear().
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { continueNextYear, visitErrorResponse } from "@/lib/activity-visits-server";

export async function POST(_req: Request, { params }: { params: Promise<{ activityId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { activityId } = await params;
  try {
    return NextResponse.json(await continueNextYear(activityId, userId));
  } catch (err) {
    return visitErrorResponse(err, "Could not start next year's activity");
  }
}
