"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PropertyWithDetails } from "@/lib/types";
import { createPlan } from "@/lib/hooks";
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
  const router = useRouter();
  const [openingPlan, setOpeningPlan] = useState(false);

  // Get-or-create this property's draft plan and open the wizard. Idempotent
  // server-side, so it resumes an existing plan rather than making a second one.
  const openPlan = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpeningPlan(true);
    try {
      const plan = await createPlan(property.id);
      router.push(`/plan/${plan.id}`);
    } catch {
      setOpeningPlan(false);
    }
  };

  return (
    <Link
      href={`/properties/${property.slug || property.id}`}
      className="group flex flex-col bg-white rounded-xl border border-field-wheat overflow-hidden hover:shadow-md hover:border-field-sage transition-all"
    >
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(property);
            }}
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

        {/* Open (or start) this property's wildlife plan */}
        <button
          type="button"
          onClick={openPlan}
          disabled={openingPlan}
          className="mt-5 inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-lg bg-field-forest text-white text-sm font-medium hover:bg-field-forest/90 transition-colors disabled:opacity-60"
        >
          {openingPlan ? "Opening..." : "Build your plan"}
          {!openingPlan && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          )}
        </button>
      </div>
    </Link>
  );
}
