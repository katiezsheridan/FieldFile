import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { mapPracticeRow } from "@/lib/plan-serialize";
import { PRACTICE_TYPES } from "@/lib/plan-practices";
import { PracticeDocumentation } from "@/lib/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Upsert the full set of practices for a plan in one call. The wizard holds all
// seven practices in state and sends them together, so this replaces each by
// (plan_id, practice_type) — selecting, deselecting, and editing documentation
// all flow through here. Idempotent and safe to call from a debounced save.
//
// Body: { practices: [{ practiceType, selected, documentation }] }
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  // Ownership: the plan must belong to this user.
  const { data: plan } = await supabase
    .from("plans")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  let body: {
    practices?: {
      practiceType?: string;
      selected?: boolean;
      documentation?: PracticeDocumentation;
    }[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const incoming = body.practices ?? [];
  for (const p of incoming) {
    if (!p.practiceType || !PRACTICE_TYPES.includes(p.practiceType as never)) {
      return NextResponse.json(
        { error: `Invalid practiceType: ${p.practiceType}` },
        { status: 400 }
      );
    }
  }

  const now = new Date().toISOString();
  const rows = incoming.map((p) => ({
    plan_id: id,
    practice_type: p.practiceType,
    selected: !!p.selected,
    documentation: p.documentation ?? {},
    updated_at: now,
  }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from("plan_practices")
      .upsert(rows, { onConflict: "plan_id,practice_type" });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  const { data: updated } = await supabase
    .from("plan_practices")
    .select("*")
    .eq("plan_id", id);

  return NextResponse.json((updated ?? []).map(mapPracticeRow));
}
