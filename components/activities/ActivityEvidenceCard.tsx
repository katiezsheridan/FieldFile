"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Activity, Document } from "@/lib/types";
import { cn, getStatusColor, getStatusLabel } from "@/lib/utils";
import { uploadDocument } from "@/lib/supabase";
import {
  createDocument,
  updateDocumentName,
  deleteDocumentRecord,
} from "@/lib/hooks";
import { EvidenceUploader } from "@/components/documents/EvidenceUploader";
import { DocumentList } from "@/components/documents/DocumentList";

interface ActivityEvidenceCardProps {
  activity: Activity;
  propertyId: string;
  // Called after any evidence change so the parent can refetch.
  onChange: () => void;
}

// One activity shown with its evidence inline: the activity's documents plus an
// uploader that attaches new evidence directly to this activity.
export default function ActivityEvidenceCard({
  activity,
  propertyId,
  onChange,
}: ActivityEvidenceCardProps) {
  const [open, setOpen] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(
    async (file: File, type: "photo" | "receipt" | "note") => {
      setUploading(true);
      try {
        const result = await uploadDocument(file, activity.id);
        if (result) {
          await createDocument(activity.id, {
            type,
            name: file.name,
            url: result.url,
            storagePath: result.path,
          });
          setShowUploader(false);
          onChange();
        }
      } catch (err) {
        console.error("Evidence upload error:", err);
      } finally {
        setUploading(false);
      }
    },
    [activity.id, onChange]
  );

  const handleRename = useCallback(
    async (doc: Document, name: string) => {
      await updateDocumentName(doc.id, name);
      onChange();
    },
    [onChange]
  );

  const handleDelete = useCallback(
    async (doc: Document) => {
      await deleteDocumentRecord(doc.id, doc.storagePath);
      onChange();
    },
    [onChange]
  );

  return (
    <div className="bg-white border border-field-wheat rounded-lg p-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-3 text-left"
      >
        <span className="flex items-start gap-2 min-w-0">
          <svg
            className={cn(
              "w-5 h-5 mt-0.5 shrink-0 text-field-earth transition-transform duration-200",
              open && "rotate-90"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
          <span className="min-w-0">
            <span className="block font-semibold text-field-ink text-lg leading-tight">
              {activity.name}
            </span>
            {activity.description && (
              <span className="block text-field-ink/70 text-sm mt-1">
                {activity.description}
              </span>
            )}
          </span>
        </span>
        <span className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-field-ink/50 whitespace-nowrap">
            {activity.documents.length}{" "}
            {activity.documents.length === 1 ? "doc" : "docs"}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
              activity.status
            )}`}
          >
            {getStatusLabel(activity.status)}
          </span>
        </span>
      </button>

      {open && (
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
            <Link
              href={`/properties/${propertyId}/activities/${activity.id}`}
              className="text-field-forest font-medium hover:underline"
            >
              View details →
            </Link>
            {activity.type === "census" && (
              <Link
                href={`/properties/${propertyId}/census/new`}
                className="text-field-forest font-medium hover:underline"
              >
                Start census count →
              </Link>
            )}
          </div>

          <DocumentList
            documents={activity.documents}
            onRename={handleRename}
            onDelete={handleDelete}
          />

          <div className="mt-4">
            {showUploader ? (
          <div className="border border-field-wheat rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-field-ink">
                Upload evidence
              </span>
              <button
                type="button"
                onClick={() => setShowUploader(false)}
                className="text-field-ink/60 hover:text-field-ink text-sm"
              >
                Cancel
              </button>
            </div>
            <EvidenceUploader onUpload={handleUpload} uploading={uploading} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowUploader(true)}
            className="px-4 py-2 bg-field-forest text-white text-sm font-medium rounded-lg hover:bg-field-forest/90 transition-colors"
          >
            Upload evidence
          </button>
        )}
          </div>
        </div>
      )}
    </div>
  );
}
