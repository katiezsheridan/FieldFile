/**
 * PATCH  /api/activities/:activityId/visits/:visitId  body -> { visit }
 * DELETE /api/activities/:activityId/visits/:visitId       -> { ok }
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { deleteVisit, updateVisit, visitErrorResponse, type VisitInput } from "@/lib/activity-visits-server";

type Params = { params: Promise<{ activityId: string; visitId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { activityId, visitId } = await params;
  let body: VisitInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  try {
    return NextResponse.json({ visit: await updateVisit(activityId, visitId, userId, body) });
  } catch (err) {
    return visitErrorResponse(err, "Could not save the visit");
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { activityId, visitId } = await params;
  try {
    await deleteVisit(activityId, visitId, userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return visitErrorResponse(err, "Could not delete the visit");
  }
}
