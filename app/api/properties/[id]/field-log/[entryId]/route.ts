import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  resolvePropertyId,
  fetchFieldLogEntry,
  mapEntryWithSignedUrl,
} from "@/lib/field-log-server";

// GET /api/properties/[id]/field-log/[entryId] — one entry with a fresh signed
// photo URL, for the detail view. Scoped to the owning user + property so a
// guessed id can't read someone else's row.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, entryId } = await params;
  const propertyId = await resolvePropertyId(id, userId);
  if (!propertyId)
    return NextResponse.json({ error: "Property not found" }, { status: 404 });

  const { data, error } = await fetchFieldLogEntry(propertyId, userId, entryId);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data)
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });

  return NextResponse.json(await mapEntryWithSignedUrl(data));
}
