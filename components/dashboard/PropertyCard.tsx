"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { PropertyWithDetails } from "@/lib/types";
import { updatePropertyPhoto } from "@/lib/hooks";
import { uploadLandDocument } from "@/lib/supabase";
import {
  cn,
  getExemptionTypeLabel,
  getExemptionStatusLabel,
  getExemptionStatusBadge,
} from "@/lib/utils";

type PropertyCardProps = {
  property: PropertyWithDetails;
  onEdit: (property: PropertyWithDetails) => void;
  // Called after the photo is uploaded and saved, so the parent can refetch.
  onPhotoChanged: () => void;
};

// A single property rendered as a card: photo (with upload control), name,
// location/size, and exemption type + color-coded status badges. The photo
// uploads to Supabase Storage and writes the URL back via updatePropertyPhoto.
export function PropertyCard({
  property,
  onEdit,
  onPhotoChanged,
}: PropertyCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    // Reset the input so selecting the same file again still fires onChange.
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const uploaded = await uploadLandDocument(file, property.id);
      if (!uploaded) {
        // uploadLandDocument already alerts on failure.
        setError("Upload failed");
        return;
      }
      await updatePropertyPhoto(property.id, uploaded.url);
      onPhotoChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save photo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-xl border border-field-wheat overflow-hidden">
      {/* Photo (or placeholder) with an overlaid upload control */}
      <div className="relative w-full h-40 bg-field-mist">
        {property.photoUrl ? (
          <Image
            src={property.photoUrl}
            alt={property.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoSelected}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "absolute bottom-2 right-2 px-2.5 py-1 rounded-md text-xs font-medium",
            "bg-field-ink/70 text-white backdrop-blur-sm hover:bg-field-ink/85",
            "transition-colors disabled:opacity-60"
          )}
        >
          {uploading
            ? "Uploading…"
            : property.photoUrl
            ? "Change photo"
            : "Add photo"}
        </button>
      </div>

      {/* Facts */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-field-ink truncate">
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

        {error && (
          <p className="mt-3 text-xs text-field-terra">{error}</p>
        )}
      </div>
    </div>
  );
}
