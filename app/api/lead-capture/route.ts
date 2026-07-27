import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Writes marketing landing-page leads to the `leads` table (see
// migrations/add_leads_table.sql). Uses the service-role key server-side,
// matching the pattern in /api/leads.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { name, email, county, acreage, source } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required." },
        { status: 400 }
      );
    }

    // acreage arrives as a string from the form; store a number or null.
    const acreageNum =
      acreage === "" || acreage == null ? NaN : Number(acreage);

    const { error } = await supabaseAdmin.from("leads").insert({
      name,
      email,
      county: county || null,
      acreage: Number.isFinite(acreageNum) ? acreageNum : null,
      source: source || "wildlife_exemption",
    });

    if (error) {
      console.error("Lead capture insert error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to save lead." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead capture handler failed:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong." },
      { status: 500 }
    );
  }
}
