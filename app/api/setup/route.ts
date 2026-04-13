import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { slugify } from "@/lib/utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EVIDENCE_REQUIREMENTS: Record<string, { type: string; description: string; required: boolean }[]> = {
  feeders: [
    { type: "photo", description: "Photo of feeder setup and food provided", required: true },
    { type: "photo", description: "Photo showing wildlife using the feeder", required: false },
    { type: "receipt", description: "Receipt for feed/seed purchased", required: true },
    { type: "date", description: "Date feeder was filled or maintained", required: true },
    { type: "gps", description: "GPS location of feeder", required: true },
  ],
  water_sources: [
    { type: "photo", description: "Photo of water source in operation", required: true },
    { type: "photo", description: "Photo showing water level and condition", required: true },
    { type: "receipt", description: "Receipt for equipment or repairs", required: false },
    { type: "date", description: "Date water source was checked or maintained", required: true },
    { type: "gps", description: "GPS location of water source", required: true },
  ],
  birdhouses: [
    { type: "photo", description: "Photo of nest box installation or maintenance", required: true },
    { type: "photo", description: "Photo showing nesting activity or condition", required: false },
    { type: "receipt", description: "Receipt for nest box materials", required: false },
    { type: "date", description: "Date of installation or inspection", required: true },
    { type: "gps", description: "GPS location of nest box", required: true },
  ],
  census: [
    { type: "photo", description: "Trail camera photo or survey photo", required: true },
    { type: "photo", description: "Photo of species observed", required: true },
    { type: "date", description: "Date and time of census count", required: true },
    { type: "gps", description: "GPS location of survey point", required: true },
  ],
  brush_management: [
    { type: "photo", description: "Before photo of area to be managed", required: true },
    { type: "photo", description: "After photo showing completed work", required: true },
    { type: "receipt", description: "Receipt for equipment rental or contractor", required: false },
    { type: "date", description: "Date work was performed", required: true },
    { type: "gps", description: "GPS location of managed area", required: true },
  ],
  native_planting: [
    { type: "photo", description: "Before photo of erosion or planting area", required: true },
    { type: "photo", description: "After photo showing completed work", required: true },
    { type: "receipt", description: "Receipt for seed, plants, or materials", required: true },
    { type: "date", description: "Date work was performed", required: true },
    { type: "gps", description: "GPS location of treated area", required: true },
  ],
  predator_management: [
    { type: "photo", description: "Photo of trap setup or management method", required: true },
    { type: "photo", description: "Photo documenting results", required: true },
    { type: "receipt", description: "Receipt for traps or contractor services", required: false },
    { type: "date", description: "Date of activity", required: true },
    { type: "gps", description: "GPS location of management activity", required: true },
  ],
};

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { property, activities } = body;

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

  // Create activities
  const activityInserts = activities.map(
    (a: { type: string; name: string; description: string }) => ({
      property_id: propertyData.id,
      type: a.type,
      name: a.name,
      description: a.description,
      status: "not_started",
      notes: "",
      required_evidence: EVIDENCE_REQUIREMENTS[a.type] || [],
      locations: [],
      due_date: `${new Date().getFullYear()}-12-31`,
    })
  );

  const { error: activitiesError } = await supabase
    .from("activities")
    .insert(activityInserts);

  if (activitiesError) {
    console.error("Activities creation error:", activitiesError);
    return NextResponse.json(
      { error: activitiesError.message },
      { status: 400 }
    );
  }

  // Create initial filing record
  await supabase.from("filings").insert({
    property_id: propertyData.id,
    year: new Date().getFullYear(),
    status: "draft",
  });

  return NextResponse.json({ success: true, propertyId: propertyData.id });
}
