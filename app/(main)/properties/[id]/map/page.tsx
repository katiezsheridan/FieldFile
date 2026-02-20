import Link from "next/link";
import { notFound } from "next/navigation";
import { getProperty } from "@/lib/demo-data";
import MapWrapper from "@/components/map/MapWrapper";

interface MapPageProps {
  params: Promise<{ id: string }>;
}

export default async function MapPage({ params }: MapPageProps) {
  const { id } = await params;
  const property = getProperty(id);

  if (!property) {
    notFound();
  }

  // Collect all activity locations from the property
  const activityLocations = property.activities
    .filter((activity) => activity.locations && activity.locations.length > 0)
    .flatMap((activity) => activity.locations || []);

  return (
    <div className="min-h-screen bg-field-cream">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href={`/properties/${id}`}
          className="inline-flex items-center text-field-forest hover:text-field-forest/80 text-sm font-medium mb-6"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Property
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-field-ink">
            {property.name} - Property Map
          </h1>
          <p className="text-field-ink/70 mt-1">{property.address}</p>
        </div>

        {/* Map container */}
        <div className="bg-white border border-field-wheat rounded-lg overflow-hidden">
          <div className="h-[600px]">
            <MapWrapper
              center={property.coordinates}
              propertyName={property.name}
              locations={activityLocations}
            />
          </div>
        </div>

        {/* Legend */}
        {activityLocations.length > 0 && (
          <div className="mt-4 bg-white border border-field-wheat rounded-lg p-4">
            <h2 className="text-sm font-semibold text-field-ink mb-2">
              Activity Locations
            </h2>
            <ul className="space-y-1">
              {activityLocations.map((location, index) => (
                <li
                  key={`${location.lat}-${location.lng}-${index}`}
                  className="text-sm text-field-ink/70"
                >
                  {location.label || `Location ${index + 1}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
