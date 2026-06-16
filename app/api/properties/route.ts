import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { slugify } from "@/lib/utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch properties
  const { data: properties, error: propertiesError } = await supabase
    .from("properties")
    .select("*")
    .eq("user_id", userId);

  if (propertiesError) {
    return NextResponse.json(
      { error: propertiesError.message },
      { status: 400 }
    );
  }

  // Backfill any missing/empty slugs so URLs render the property name, not the UUID.
  const usedSlugs = new Set(
    (properties || [])
      .map((p) => p.slug)
      .filter((s): s is string => !!s && s.length > 0)
  );
  for (const prop of properties || []) {
    if (prop.slug && prop.slug.length > 0) continue;
    const base = slugify(prop.name);
    let candidate = base;
    let i = 2;
    while (usedSlugs.has(candidate)) {
      candidate = `${base}-${i++}`;
    }
    const { error: slugErr } = await supabase
      .from("properties")
      .update({ slug: candidate })
      .eq("id", prop.id)
      .eq("user_id", userId);
    if (!slugErr) {
      prop.slug = candidate;
      usedSlugs.add(candidate);
    }
  }

  // For each property, fetch activities with documents, and filing
  const propertiesWithDetails = await Promise.all(
    (properties || []).map(async (prop) => {
      const { data: activities } = await supabase
        .from("activities")
        .select("*")
        .eq("property_id", prop.id);

      const activitiesWithDocs = await Promise.all(
        (activities || []).map(async (act) => {
          const { data: docs } = await supabase
            .from("documents")
            .select("*")
            .eq("activity_id", act.id);

          return {
            id: act.id,
            propertyId: act.property_id,
            type: act.type,
            name: act.name,
            description: act.description || "",
            status: act.status,
            requiredEvidence: act.required_evidence || [],
            documents: (docs || []).map((doc) => ({
              id: doc.id,
              activityId: doc.activity_id,
              type: doc.type,
              name: doc.name,
              url: doc.url,
              uploadedAt: doc.uploaded_at,
              metadata: doc.gps_lat
                ? { gpsCoordinates: { lat: doc.gps_lat, lng: doc.gps_lng } }
                : undefined,
            })),
            notes: act.notes || "",
            dueDate: act.due_date || "",
            completedDate: act.completed_date,
            locations: act.locations || [],
          };
        })
      );

      const { data: filing } = await supabase
        .from("filings")
        .select("*")
        .eq("property_id", prop.id)
        .order("year", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        id: prop.id,
        name: prop.name,
        slug: prop.slug,
        address: prop.address,
        county: prop.county,
        state: prop.state,
        acreage: prop.acreage,
        exemptionType: prop.exemption_type,
        exemptionStatus: prop.exemption_status ?? undefined,
        photoUrl: prop.photo_url ?? undefined,
        coordinates: { lat: prop.lat, lng: prop.lng },
        activities: activitiesWithDocs,
        filing: filing
          ? {
              id: filing.id,
              propertyId: filing.property_id,
              year: filing.year,
              status: filing.status,
              filedDate: filing.filed_date,
              method: filing.method,
              confirmationNumber: filing.confirmation_number,
            }
          : {
              id: "",
              propertyId: prop.id,
              year: new Date().getFullYear(),
              status: "draft",
            },
      };
    })
  );

  return NextResponse.json(propertiesWithDetails);
}

// Create a property from the Property Overview snapshot.
// Required: name, county, acreage, exemptionType, exemptionStatus.
// Optional: photoUrl, address, state (defaults 'TX'), coordinates.
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    name,
    county,
    acreage,
    exemptionType,
    exemptionStatus,
    photoUrl,
    address,
    state,
    coordinates,
  } = body as {
    name?: string;
    county?: string;
    acreage?: number;
    exemptionType?: string;
    exemptionStatus?: string;
    photoUrl?: string;
    address?: string;
    state?: string;
    coordinates?: { lat?: number; lng?: number };
  };

  if (
    !name ||
    !county ||
    acreage == null ||
    !exemptionType ||
    !exemptionStatus
  ) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: name, county, acreage, exemptionType, exemptionStatus",
      },
      { status: 400 }
    );
  }

  if (!["wildlife", "agriculture", "none"].includes(exemptionType)) {
    return NextResponse.json(
      { error: "Invalid exemptionType" },
      { status: 400 }
    );
  }
  if (!["active", "pending", "at_risk", "applying"].includes(exemptionStatus)) {
    return NextResponse.json(
      { error: "Invalid exemptionStatus" },
      { status: 400 }
    );
  }

  // Generate a slug unique within this user's properties.
  const { data: existing } = await supabase
    .from("properties")
    .select("slug")
    .eq("user_id", userId);
  const usedSlugs = new Set(
    (existing || [])
      .map((p) => p.slug)
      .filter((s): s is string => !!s && s.length > 0)
  );
  const base = slugify(name);
  let slug = base;
  let i = 2;
  while (usedSlugs.has(slug)) {
    slug = `${base}-${i++}`;
  }

  const { data, error } = await supabase
    .from("properties")
    .insert({
      user_id: userId,
      name,
      county,
      acreage,
      exemption_type: exemptionType,
      exemption_status: exemptionStatus,
      photo_url: photoUrl ?? null,
      address: address ?? null,
      state: state ?? "TX",
      lat: coordinates?.lat ?? null,
      lng: coordinates?.lng ?? null,
      slug,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    {
      id: data.id,
      slug: data.slug,
      name: data.name,
      county: data.county,
      acreage: data.acreage,
      exemptionType: data.exemption_type,
      exemptionStatus: data.exemption_status ?? undefined,
      photoUrl: data.photo_url ?? undefined,
      address: data.address ?? undefined,
      state: data.state,
      coordinates: { lat: data.lat, lng: data.lng },
    },
    { status: 201 }
  );
}
