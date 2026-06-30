import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { mapPlanRow } from "@/lib/plan-serialize";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get-or-create the draft plan for a property + year. One plan per property per
// year (DB-enforced), so this is idempotent: calling it again returns the
// existing plan rather than erroring. Used by the setup flow and anywhere a
// landowner starts (or resumes) a plan.
//
// Body: { propertyId: string, year?: number }
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { propertyId?: string; year?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { propertyId } = body;
  const year = body.year ?? new Date().getFullYear();
  if (!propertyId) {
    return NextResponse.json({ error: "Missing propertyId" }, { status: 400 });
  }

  // Ownership: the property must belong to this user.
  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  // Return the existing plan for this property + year if there is one.
  const { data: existing } = await supabase
    .from("plans")
    .select("*")
    .eq("property_id", propertyId)
    .eq("year", year)
    .maybeSingle();

  if (existing) {
    const { data: practices } = await supabase
      .from("plan_practices")
      .select("*")
      .eq("plan_id", existing.id);
    return NextResponse.json(mapPlanRow(existing, practices ?? []));
  }

  const { data: created, error } = await supabase
    .from("plans")
    .insert({ property_id: propertyId, user_id: userId, year, status: "draft" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(mapPlanRow(created, []), { status: 201 });
}
