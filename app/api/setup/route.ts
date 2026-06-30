import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { slugify } from "@/lib/utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Onboarding: create the property identity, then a draft wildlife plan for the
// current year, and hand the planId back so the client routes the new user
// straight into the plan wizard. Practices are chosen once, inside the plan
// (Session 2), so the old "pick 3 activities" step is gone; activities are
// seeded from the plan's practices in a later session.
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { property } = body;

  // Geocode the address to get coordinates
  let lat = property.lat || 0;
  let lng = property.lng || 0;

  if (property.address && (lat === 0 && lng === 0)) {
    try {
      const query = encodeURIComponent(
        `${property.address}, ${property.county} County, ${property.state}`
      );
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
        { headers: { "User-Agent": "FieldFile/1.0" } }
      );
      const geoData = await geoRes.json();
      if (geoData.length > 0) {
        lat = parseFloat(geoData[0].lat);
        lng = parseFloat(geoData[0].lon);
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    }
  }

  // Generate a unique slug from the name (append -2, -3, ... if taken for this user)
  const baseSlug = slugify(property.name) || "property";
  let slug = baseSlug;
  for (let i = 2; i < 100; i++) {
    const { data: existing } = await supabase
      .from("properties")
      .select("id")
      .eq("user_id", userId)
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${i}`;
  }

  // Create property
  const { data: propertyData, error: propertyError } = await supabase
    .from("properties")
    .insert({
      user_id: userId,
      name: property.name,
      slug,
      address: property.address,
      county: property.county,
      state: property.state,
      acreage: property.acreage,
      exemption_type: property.exemptionType,
      legal_description: property.legalDescription ?? null,
      appraisal_account: property.appraisalAccount ?? null,
      lat,
      lng,
    })
    .select()
    .single();

  if (propertyError) {
    console.error("Property creation error:", propertyError);
    return NextResponse.json(
      { error: propertyError.message },
      { status: 400 }
    );
  }

  const year = new Date().getFullYear();

  // Create the draft plan the user is about to fill in.
  const { data: planData, error: planError } = await supabase
    .from("plans")
    .insert({
      property_id: propertyData.id,
      user_id: userId,
      year,
      status: "draft",
    })
    .select()
    .single();

  if (planError) {
    console.error("Plan creation error:", planError);
    return NextResponse.json({ error: planError.message }, { status: 400 });
  }

  // Create initial filing record
  await supabase.from("filings").insert({
    property_id: propertyData.id,
    year,
    status: "draft",
  });

  return NextResponse.json({
    success: true,
    propertyId: propertyData.id,
    planId: planData.id,
  });
}
