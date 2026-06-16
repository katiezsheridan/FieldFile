"use client";

import Image from "next/image";
import { Property } from "@/lib/types";
import {
  cn,
  getExemptionTypeLabel,
  getExemptionStatusLabel,
  getExemptionStatusBadge,
} from "@/lib/utils";

type PropertyOverviewProps = {
  property: Property;
};

// Snapshot card shown at the top of the dashboard: the key facts a landowner
// wants to see first — photo, name, location/size, and exemption type + status.
export function PropertyOverview({ property }: PropertyOverviewProps) {
  return (
    <div className="bg-white rounded-xl border border-field-wheat overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Photo (or placeholder) */}
        <div className="relative w-full sm:w-48 h-40 sm:h-auto shrink-0 bg-field-mist">
          {property.photoUrl ? (
            <Image
              src={property.photoUrl}
              alt={property.name}
              fill
              sizes="(max-width: 640px) 100vw, 192px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-field-earth/40">
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 4.5v15M2.25 19.5h19.5"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Facts */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-field-ink">
                {property.name}
              </h2>
              <p className="text-sm text-field-earth mt-0.5">
                {property.county} County &middot; {property.acreage} acres
              </p>
            </div>
            {property.exemptionStatus && (
              <span
                className={cn(
                  "shrink-0 px-2.5 py-1 rounded-full text-xs font-medium",
                  getExemptionStatusBadge(property.exemptionStatus)
                )}
              >
                {getExemptionStatusLabel(property.exemptionStatus)}
              </span>
            )}
          </div>

          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div>
              <dt className="text-field-earth">Exemption</dt>
              <dd className="text-field-ink font-medium">
                {getExemptionTypeLabel(property.exemptionType)}
              </dd>
            </div>
            {property.address && (
              <div>
                <dt className="text-field-earth">Address</dt>
                <dd className="text-field-ink font-medium">
                  {property.address}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
