"use client";

import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  useProperty,
  usePropertyDocuments,
  createLandDocument,
  updateDocumentName,
  deleteDocumentRecord,
} from "@/lib/hooks";
import { uploadLandDocument } from "@/lib/supabase";
import { FileUploader } from "@/components/documents/FileUploader";
import { DocumentList } from "@/components/documents/DocumentList";
import { Document } from "@/lib/types";

function inferType(file: File): Document["type"] {
  if (file.type.startsWith("image/")) return "photo";
  return "receipt";
}

export default function DocumentsPage() {
  const params = useParams();
  const id = params.id as string;

  const { property, loading: propertyLoading } = useProperty(id);
  const propertyId = property?.id;
  const {
    landDocuments,
    activityDocuments,
    loading: docsLoading,
    refetch,
  } = usePropertyDocuments(propertyId);

  const [uploading, setUploading] = useState(false);

  const handleRename = useCallback(
    async (doc: Document, name: string) => {
      await updateDocumentName(doc.id, name);
      await refetch();
    },
    [refetch]
  );

  const handleDelete = useCallback(
    async (doc: Document) => {
      await deleteDocumentRecord(doc.id, doc.storagePath);
      await refetch();
    },
    [refetch]
  );

  const handleLandUpload = useCallback(
    async (files: File[]) => {
      if (!propertyId) return;
      setUploading(true);
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
        await refetch();
      } finally {
        setUploading(false);
      }
    },
    [propertyId, refetch]
  );

  if (propertyLoading) {
    return (
      <div className="min-h-screen bg-field-cream p-8">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-field-wheat rounded w-64 mb-4" />
          <div className="h-4 bg-field-wheat rounded w-48" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-field-cream p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-field-ink">
            Property not found
          </h1>
          <Link href="/dashboard" className="text-field-forest hover:underline">
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Group activity evidence by activity for display
  const evidenceByActivity = property.activities
    .map((a) => ({
      activity: a,
      docs: activityDocuments.filter((d) => d.activityId === a.id),
    }))
    .filter((g) => g.docs.length > 0);

  return (
    <div className="min-h-screen bg-field-cream">
      <div className="max-w-4xl mx-auto p-8 space-y-10">
        <div>
          <h1 className="text-3xl font-semibold text-field-ink">
            {property.name}
          </h1>
          <p className="text-field-ink/60 mt-1">{property.address}</p>
        </div>

        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold text-field-ink">
              Land Documents
            </h2>
            {uploading && (
              <span className="text-sm text-field-ink/60">Uploading…</span>
            )}
          </div>
          <FileUploader onUpload={handleLandUpload} />
          {docsLoading ? (
            <div className="text-field-ink/60 text-sm">Loading…</div>
          ) : (
            <DocumentList
              documents={landDocuments}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-field-ink">
            Activity Evidence
          </h2>
          {docsLoading ? (
            <div className="text-field-ink/60 text-sm">Loading…</div>
          ) : evidenceByActivity.length === 0 ? (
            <div className="text-field-ink/60 text-sm">
              No activity evidence uploaded yet. Upload from an activity page.
            </div>
          ) : (
            <div className="space-y-8">
              {evidenceByActivity.map(({ activity, docs }) => (
                <div key={activity.id}>
                  <Link
                    href={`/properties/${id}/activities/${activity.id}`}
                    className="text-lg font-medium text-field-forest hover:underline mb-4 inline-block"
                  >
                    {activity.name}
                  </Link>
                  <DocumentList
                    documents={docs}
                    onRename={handleRename}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
