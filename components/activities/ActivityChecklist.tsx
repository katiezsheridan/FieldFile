"use client";

import { EvidenceRequirement, Document } from "@/lib/types";

interface ActivityChecklistProps {
  requiredEvidence: EvidenceRequirement[];
  documents: Document[];
}

export default function ActivityChecklist({
  requiredEvidence,
  documents,
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
      return documents.some((doc) => doc.metadata?.gpsCoordinates);
    }
    if (type === "date") {
      return documents.some((doc) => doc.metadata?.timestamp || doc.uploadedAt);
    }
    return false;
  };

  return (
    <div className="space-y-2">
      {requiredEvidence.map((requirement, index) => {
        const isComplete = hasDocumentForType(requirement.type);

        return (
          <div key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {isComplete ? (
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm ${
                  isComplete ? "text-field-ink" : "text-field-ink/70"
                }`}
              >
                {requirement.description}
                {!requirement.required && (
                  <span className="text-field-ink/50 ml-1">(optional)</span>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
