"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useProperty,
  usePropertyDocuments,
  createLandDocument,
  updateDocumentName,
  deleteDocumentRecord,
} from "@/lib/hooks";
import { uploadLandDocument } from "@/lib/supabase";
import { getProperty } from "@/lib/demo-data";
import ActivityEvidenceCard from "@/components/activities/ActivityEvidenceCard";
import AddActivityForm from "@/components/activities/AddActivityForm";
import { FileUploader } from "@/components/documents/FileUploader";
import { DocumentList } from "@/components/documents/DocumentList";
import PropertyMapSection from "@/components/map/PropertyMapSection";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { Document } from "@/lib/types";

function inferType(file: File): Document["type"] {
  if (file.type.startsWith("image/")) return "photo";
  return "receipt";
}

export default function PropertyPage() {
  const params = useParams();
  const id = params.id as string;
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadingLand, setUploadingLand] = useState(false);

  const { property: supabaseProperty, loading, refetch } = useProperty(id);

  // Fallback to demo data if no Supabase data
  const demoProperty = getProperty(id);
  const property = supabaseProperty || demoProperty;
  const propertyId = property?.id;

  const {
    landDocuments,
    loading: docsLoading,
    refetch: refetchDocs,
  } = usePropertyDocuments(propertyId);

  const handleLandUpload = useCallback(
    async (files: File[]) => {
      if (!propertyId) return;
      setUploadingLand(true);
      try {
        for (const file of files) {
          const result = await uploadLandDocument(file, propertyId);
          if (result) {
            await createLandDocument(propertyId, {
              type: inferType(file),
              name: file.name,
              url: result.url,
              storagePath: result.path,
            });
          }
        }
        await refetchDocs();
      } finally {
        setUploadingLand(false);
      }
    },
    [propertyId, refetchDocs]
  );

  const handleLandRename = useCallback(
    async (doc: Document, name: string) => {
      await updateDocumentName(doc.id, name);
      await refetchDocs();
    },
    [refetchDocs]
  );

  const handleLandDelete = useCallback(
    async (doc: Document) => {
      await deleteDocumentRecord(doc.id, doc.storagePath);
      await refetchDocs();
    },
    [refetchDocs]
  );

  if (loading) {
    return (
      <div className="min-h-full bg-field-cream">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-field-wheat rounded w-32 mb-6"></div>
            <div className="bg-white border border-field-wheat rounded-lg p-6 mb-8">
              <div className="h-8 bg-field-wheat rounded w-48 mb-2"></div>
              <div className="h-4 bg-field-wheat rounded w-64 mb-4"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-field-wheat rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-full bg-field-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-field-ink mb-2">
            Property not found
          </h1>
          <Link href="/dashboard" className="text-field-forest hover:underline">
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const completedCount = property.activities.filter(
    (a) => a.status === "complete"
  ).length;
  const totalCount = property.activities.length;

  return (
    <div className="min-h-full bg-field-cream">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Property header */}
        <div className="bg-white border border-field-wheat rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-field-ink mb-2">
                {property.name}
              </h1>
              <p className="text-field-ink/70">{property.address}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-field-ink/60">
                <span>{property.acreage} acres</span>
                <span>{property.county} County</span>
                <span className="capitalize">
                  {property.exemptionType} exemption
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-field-forest">
                {completedCount}/{totalCount}
              </div>
              <div className="text-sm text-field-ink/60">
                activities complete
              </div>
            </div>
          </div>
        </div>

        {/* Field log — mobile capture of geotagged practice evidence */}
        <Link
          href={`/properties/${id}/field-log`}
          className="group flex items-center gap-4 bg-white border border-field-wheat rounded-lg p-5 hover:border-field-forest/50 transition-colors"
        >
          <div className="shrink-0 w-11 h-11 rounded-lg bg-field-forest/10 flex items-center justify-center text-field-forest">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-field-ink">Field log</h2>
            <p className="text-sm text-field-earth mt-0.5">
              Capture geotagged, timestamped photo evidence from the field.
            </p>
          </div>
          <svg
            className="w-5 h-5 shrink-0 text-field-earth group-hover:text-field-forest transition-colors"
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
        </Link>

        {/* Activities with inline evidence */}
        <CollapsibleSection
          title="Wildlife Management Activities"
          summary={`${completedCount}/${totalCount} complete`}
        >
          <div className="space-y-4">
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-field-forest text-white text-sm font-medium rounded-lg hover:bg-field-forest/90"
              >
                + Add Activity
              </button>
            )}

            {showAddForm && (
              <AddActivityForm
                propertyId={id}
                onSuccess={() => {
                  setShowAddForm(false);
                  refetch();
                }}
                onCancel={() => setShowAddForm(false)}
              />
            )}

            {property.activities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-field-ink/60">
                  No activities found for this property.
                </p>
              </div>
            ) : (
              property.activities.map((activity) => (
                <ActivityEvidenceCard
                  key={activity.id}
                  activity={activity}
                  propertyId={id}
                  onChange={refetch}
                />
              ))
            )}
          </div>
        </CollapsibleSection>

        {/* Land documents (not tied to a specific activity) */}
        <CollapsibleSection
          title="Land Documents"
          summary={
            uploadingLand
              ? "Uploading…"
              : `${landDocuments.length} ${
                  landDocuments.length === 1 ? "file" : "files"
                }`
          }
        >
          <div className="space-y-4">
            <FileUploader onUpload={handleLandUpload} />
            {docsLoading ? (
              <div className="text-field-ink/60 text-sm">Loading…</div>
            ) : (
              <DocumentList
                documents={landDocuments}
                onRename={handleLandRename}
                onDelete={handleLandDelete}
              />
            )}
          </div>
        </CollapsibleSection>

        {/* Property map */}
        <PropertyMapSection property={property} onChange={refetch} />
      </div>
    </div>
  );
}
