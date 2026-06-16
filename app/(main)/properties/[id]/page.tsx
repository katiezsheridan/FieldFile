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
      <div className="min-h-screen bg-field-cream">
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
      <div className="min-h-screen bg-field-cream flex items-center justify-center">
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
    <div className="min-h-screen bg-field-cream">
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

        {/* Activities with inline evidence */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-field-ink">
              Wildlife Management Activities
            </h2>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-field-forest text-white text-sm font-medium rounded-lg hover:bg-field-forest/90"
              >
                + Add Activity
              </button>
            )}
          </div>

          {showAddForm && (
            <div className="mb-6">
              <AddActivityForm
                propertyId={id}
                onSuccess={() => {
                  setShowAddForm(false);
                  refetch();
                }}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          )}

          {property.activities.length === 0 ? (
            <div className="text-center py-12 bg-white border border-field-wheat rounded-lg">
              <p className="text-field-ink/60">
                No activities found for this property.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {property.activities.map((activity) => (
                <ActivityEvidenceCard
                  key={activity.id}
                  activity={activity}
                  propertyId={id}
                  onChange={refetch}
                />
              ))}
            </div>
          )}
        </section>

        {/* Land documents (not tied to a specific activity) */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-field-ink">
              Land Documents
            </h2>
            {uploadingLand && (
              <span className="text-sm text-field-ink/60">Uploading…</span>
            )}
          </div>
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
        </section>

        {/* Property map */}
        <PropertyMapSection property={property} onChange={refetch} />
      </div>
    </div>
  );
}
