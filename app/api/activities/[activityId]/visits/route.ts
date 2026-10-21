/**
 * GET  /api/activities/:activityId/visits        -> { visits }
 * POST /api/activities/:activityId/visits  body  -> { visit }   (VisitInput)
 *
 * The activity's work log. Ownership and tax-year rules live in
 * lib/activity-visits-server.ts.
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { addVisit, listVisits, visitErrorResponse, type VisitInput } from "@/lib/activity-visits-server";

export async function GET(_req: Request, { params }: { params: Promise<{ activityId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { activityId } = await params;
  try {
    return NextResponse.json({ visits: await listVisits(activityId, userId) });
  } catch (err) {
    return visitErrorResponse(err, "Could not load the work log");
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ activityId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { activityId } = await params;
  let body: VisitInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  try {
    return NextResponse.json({ visit: await addVisit(activityId, userId, body) });
  } catch (err) {
    return visitErrorResponse(err, "Could not save the visit");
  }
}
