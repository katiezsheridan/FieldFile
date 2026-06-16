"use client";

import Image from "next/image";
import { PropertyWithDetails } from "@/lib/types";
import {
  cn,
  getExemptionTypeLabel,
  getExemptionStatusLabel,
  getExemptionStatusBadge,
} from "@/lib/utils";

// Shown when a property has no photo of its own.
const PLACEHOLDER_PHOTO = "/images/property-placeholder.jpg";

type PropertyCardProps = {
  property: PropertyWithDetails;
  onEdit: (property: PropertyWithDetails) => void;
};

// A single property rendered as a card: photo (falling back to a default Hill
// Country image), name, location/size, and exemption type + color-coded status
// badges. Editing details and the photo both happen in the Edit modal.
export function PropertyCard({ property, onEdit }: PropertyCardProps) {
  return (
    <div className="flex flex-col bg-white rounded-xl border border-field-wheat overflow-hidden">
      {/* Photo (or default placeholder) */}
      <div className="relative w-full h-40 bg-field-mist">
        <Image
          src={property.photoUrl || PLACEHOLDER_PHOTO}
          alt={property.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      {/* Facts */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-field-ink break-words">
              {property.name}
            </h3>
            <p className="text-sm text-field-earth mt-0.5">
              {property.county} County &middot; {property.acreage} acres
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEdit(property)}
            className="shrink-0 text-sm font-medium text-field-forest hover:text-field-forest/80 transition-colors"
          >
            Edit
          </button>
        </div>

        {/* Badges: exemption type (neutral) + color-coded status */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-field-mist text-field-earth">
            {getExemptionTypeLabel(property.exemptionType)}
          </span>
          {property.exemptionStatus && (
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium",
                getExemptionStatusBadge(property.exemptionStatus)
              )}
            >
              {getExemptionStatusLabel(property.exemptionStatus)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
