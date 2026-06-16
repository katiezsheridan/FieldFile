import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Check if it's a UUID or slug
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id
    );

  const { data: prop, error: propError } = await supabase
    .from("properties")
    .select("*")
    .eq(isUUID ? "id" : "slug", id)
    .eq("user_id", userId)
    .single();

  if (propError) {
    return NextResponse.json({ error: propError.message }, { status: 404 });
  }

  // Fetch activities
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

  // Fetch filing
  const { data: filing } = await supabase
    .from("filings")
    .select("*")
    .eq("property_id", prop.id)
    .order("year", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
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
  });
}

// Update an existing property. Accepts a partial set of editable fields, so
// this covers both general edits and the photo-only update (send { photoUrl }).
// Ownership is enforced by matching the Clerk userId on the row.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if ("name" in body) updates.name = body.name;
  if ("county" in body) updates.county = body.county;
  if ("acreage" in body) updates.acreage = body.acreage;
  if ("address" in body) updates.address = body.address;
  if ("state" in body) updates.state = body.state;
  if ("photoUrl" in body) updates.photo_url = body.photoUrl;
  if ("coordinates" in body) {
    const coords = body.coordinates as { lat?: number; lng?: number } | null;
    updates.lat = coords?.lat ?? null;
    updates.lng = coords?.lng ?? null;
  }
  if ("exemptionType" in body) {
    if (!["wildlife", "agriculture", "none"].includes(body.exemptionType as string)) {
      return NextResponse.json({ error: "Invalid exemptionType" }, { status: 400 });
    }
    updates.exemption_type = body.exemptionType;
  }
  if ("exemptionStatus" in body) {
    if (!["active", "pending", "at_risk"].includes(body.exemptionStatus as string)) {
      return NextResponse.json({ error: "Invalid exemptionStatus" }, { status: 400 });
    }
    updates.exemption_status = body.exemptionStatus;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("properties")
    .update(updates)
    .eq(isUUID ? "id" : "slug", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  return NextResponse.json({
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
  });
}
