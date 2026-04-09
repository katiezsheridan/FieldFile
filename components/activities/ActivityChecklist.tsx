"use client";

import Link from "next/link";
import { EvidenceRequirement, Document } from "@/lib/types";

interface ActivityChecklistProps {
  requiredEvidence: EvidenceRequirement[];
  documents: Document[];
  propertyId?: string;
  hasLocations?: boolean;
}

export default function ActivityChecklist({
  requiredEvidence,
  documents,
  propertyId,
  hasLocations = false,
}: ActivityChecklistProps) {
  // Check if a requirement type has matching documents
  const hasDocumentForType = (type: EvidenceRequirement["type"]): boolean => {
    // Map evidence requirement types to document types
    if (type === "photo") {
      return documents.some((doc) => doc.type === "photo");
    }
    if (type === "receipt") {
      return documents.some((doc) => doc.type === "receipt");
    }
    // For GPS and date requirements, check if any photo has metadata
    if (type === "gps") {
      return hasLocations;
    }
    if (type === "date") {
      return documents.some((doc) => doc.metadata?.timestamp || doc.uploadedAt);
    }
    return false;
  };

  return (
    <div className="space-y-1">
      {requiredEvidence.map((requirement, index) => {
        const isComplete = hasDocumentForType(requirement.type);

        return (
          <div
            key={index}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              isComplete ? "bg-field-forest/5" : ""
            }`}
          >
            <div className="flex-shrink-0">
              {isComplete ? (
                <svg className="w-4 h-4 text-field-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-field-ink/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </div>
            <div className="flex-1 flex items-center gap-2">
              <p
                className={`text-sm ${
                  isComplete
                    ? "text-field-forest font-medium line-through"
                    : "text-field-ink/80"
                }`}
              >
                {requirement.description}
                {!requirement.required && (
                  <span className="text-field-ink/40 ml-1 text-xs">(optional)</span>
                )}
              </p>
              {requirement.type === "gps" && !isComplete && propertyId && (
                <Link
                  href={`/properties/${propertyId}/map`}
                  className="text-xs font-medium text-field-forest hover:underline whitespace-nowrap"
                >
                  Mark on map
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
