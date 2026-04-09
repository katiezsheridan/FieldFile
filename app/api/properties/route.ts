import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
