"use client";

import dynamic from "next/dynamic";

interface MapWrapperProps {
  center: { lat: number; lng: number };
  propertyName: string;
  locations?: { lat: number; lng: number; label?: string }[];
}

const PropertyMap = dynamic(() => import("./PropertyMap"), {
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-field-cream rounded-lg border border-field-wheat">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-field-forest mx-auto mb-2"></div>
        <p className="text-field-ink/60 text-sm">Loading map...</p>
      </div>
    </div>
  ),
  ssr: false,
});

export default function MapWrapper({
  center,
  propertyName,
  locations = [],
}: MapWrapperProps) {
  return (
    <PropertyMap
      center={center}
      propertyName={propertyName}
      locations={locations}
    />
  );
}
