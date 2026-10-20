/**
 * GET /api/properties/:param/resolve -> { id, slug }
 *
 * Lightweight lookup for the property pages' layout: given a uuid, a slug, or
 * a slug the property used before a rename, return its current slug so an old
 * URL can be replaced with the live one.
 */

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { resolvePropertyRef } from "@/lib/property-slug";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const ref = await resolvePropertyRef(supabase, id, userId);
  if (!ref) return NextResponse.json({ error: "Property not found" }, { status: 404 });
  return NextResponse.json(ref);
}
