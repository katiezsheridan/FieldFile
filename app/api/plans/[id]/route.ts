import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { mapPlanRow, PlanPropertySummary } from "@/lib/plan-serialize";
import { computePlanCompletion } from "@/lib/plan-completion";
import { Plan, PlanStatus } from "@/lib/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_STATUSES: PlanStatus[] = ["draft", "ready", "submitted"];

async function loadPlanContext(planId: string, userId: string) {
  const { data: planRow } = await supabase
    .from("plans")
    .select("*")
    .eq("id", planId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!planRow) return null;

  const { data: practiceRows } = await supabase
    .from("plan_practices")
    .select("*")
    .eq("plan_id", planId);

  const { data: propRow } = await supabase
    .from("properties")
    .select(
      "id, slug, name, county, acreage, legal_description, appraisal_account, exemption_type, exemption_status"
    )
    .eq("id", planRow.property_id)
    .maybeSingle();

  const property: PlanPropertySummary | null = propRow
    ? {
        id: propRow.id,
        slug: propRow.slug ?? undefined,
        name: propRow.name,
        county: propRow.county,
        acreage: propRow.acreage,
        legalDescription: propRow.legal_description ?? undefined,
        appraisalAccount: propRow.appraisal_account ?? undefined,
        exemptionType: propRow.exemption_type ?? undefined,
        exemptionStatus: propRow.exemption_status ?? undefined,
      }
    : null;

  return { plan: mapPlanRow(planRow, practiceRows ?? []), property };
}

// Build the completion calculator's input from a plan + its property summary.
function completionInput(plan: Plan, property: PlanPropertySummary | null) {
  return {
    identity: {
      name: property?.name,
      county: property?.county,
      acreage: property?.acreage,
      legalDescription: property?.legalDescription,
      appraisalAccount: property?.appraisalAccount,
    },
    landDescription: {
      habitatTypes: plan.habitatTypes,
      propertyDescription: plan.propertyDescription,
      waterSources: plan.waterSources,
      wildlifeSpecies: plan.wildlifeSpecies,
      currentLandUse: plan.currentLandUse,
    },
    targetSpecies: plan.targetSpecies,
    practices: plan.practices.map((p) => ({
      selected: p.selected,
      documentation: p.documentation,
    })),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const ctx = await loadPlanContext(id, userId);
  if (!ctx) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  return NextResponse.json({ ...ctx.plan, property: ctx.property });
}

// Update draft fields and/or advance status. Saving a draft never validates;
// advancing to "ready" or "submitted" is blocked unless the plan is 100%
// complete, using the same calculator the wizard shows the user.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ctx = await loadPlanContext(id, userId);
  if (!ctx) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  // Apply incoming changes onto the current plan so we can both persist them and
  // re-check completion when status is advancing.
  const next = { ...ctx.plan };
  const updates: Record<string, unknown> = {};

  if ("targetSpecies" in body) {
    next.targetSpecies = (body.targetSpecies as string[]) ?? [];
    updates.target_species = next.targetSpecies;
  }
  if ("habitatTypes" in body) {
    next.habitatTypes = (body.habitatTypes as string[]) ?? [];
    updates.habitat_types = next.habitatTypes;
  }
  if ("propertyDescription" in body) {
    next.propertyDescription = (body.propertyDescription as string) ?? undefined;
    updates.property_description = body.propertyDescription ?? null;
  }
  if ("waterSources" in body) {
    next.waterSources = (body.waterSources as string[]) ?? [];
    updates.water_sources = next.waterSources;
  }
  if ("wildlifeSpecies" in body) {
    next.wildlifeSpecies = (body.wildlifeSpecies as string[]) ?? [];
    updates.wildlife_species = next.wildlifeSpecies;
  }
  if ("currentLandUse" in body) {
    next.currentLandUse = (body.currentLandUse as string) ?? undefined;
    updates.current_land_use = body.currentLandUse ?? null;
  }
  if ("landHistory" in body) {
    next.landHistory = (body.landHistory as string) ?? undefined;
    updates.land_history = body.landHistory ?? null;
  }

  if ("status" in body) {
    const status = body.status as PlanStatus;
    if (!PLAN_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    // Gate the forward transitions on completion. Returning to draft is allowed.
    if (status === "ready" || status === "submitted") {
      const { canSubmit } = computePlanCompletion(
        completionInput(next, ctx.property)
      );
      if (!canSubmit) {
        return NextResponse.json(
          { error: "Plan is not complete yet" },
          { status: 400 }
        );
      }
    }
    updates.status = status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from("plans")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ...mapPlanRow(updated, ctx.plan.practices.map((p) => ({
      id: p.id,
      plan_id: p.planId,
      practice_type: p.practiceType,
      selected: p.selected,
      documentation: p.documentation,
    }))),
    property: ctx.property,
  });
}
