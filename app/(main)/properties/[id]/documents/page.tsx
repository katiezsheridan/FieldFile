"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  useProperties,
  usePropertyDocuments,
  createLandDocument,
  createDocument,
  updateDocumentName,
  deleteDocumentRecord,
} from "@/lib/hooks";
import { uploadLandDocument, uploadDocument } from "@/lib/supabase";
import { FileUploader } from "@/components/documents/FileUploader";
import { EvidenceUploader } from "@/components/documents/EvidenceUploader";
import { DocumentList } from "@/components/documents/DocumentList";
import { PropertySelect } from "@/components/documents/PropertySelect";
import { Document } from "@/lib/types";

function inferType(file: File): Document["type"] {
  if (file.type.startsWith("image/")) return "photo";
  return "receipt";
}

export default function DocumentsPage() {
  const params = useParams();
  const urlId = params.id as string;

  const { user } = useUser();
  const { properties, loading: propertiesLoading } = useProperties(user?.id);

  // Which property the page is currently scoped to. Defaults to the property in
  // the URL; switching it changes context in place (no navigation).
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeProperty = useMemo(() => {
    if (properties.length === 0) return null;
    if (selectedId) {
      const chosen = properties.find((p) => p.id === selectedId);
      if (chosen) return chosen;
    }
    const fromUrl = properties.find((p) => p.id === urlId || p.slug === urlId);
    return fromUrl ?? properties[0];
  }, [properties, selectedId, urlId]);

  const propertyId = activeProperty?.id;
  const {
    landDocuments,
    activityDocuments,
    loading: docsLoading,
    refetch,
  } = usePropertyDocuments(propertyId);

  const [uploading, setUploading] = useState(false);
  const [evidenceUploading, setEvidenceUploading] = useState(false);

  // Activity the evidence uploader attaches to. Falls back to the first
  // activity of the active property if the current selection no longer applies.
  const activities = activeProperty?.activities ?? [];
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const activeActivityId = activities.some((a) => a.id === selectedActivityId)
    ? selectedActivityId
    : activities[0]?.id ?? "";

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

  const handleEvidenceUpload = useCallback(
    async (file: File, type: "photo" | "receipt" | "note") => {
      if (!activeActivityId) return;
      setEvidenceUploading(true);
      try {
        const result = await uploadDocument(file, activeActivityId);
        if (result) {
          await createDocument(activeActivityId, {
            type,
            name: file.name,
            url: result.url,
            storagePath: result.path,
          });
          await refetch();
        }
      } catch (err) {
        console.error("Evidence upload error:", err);
      } finally {
        setEvidenceUploading(false);
      }
    },
    [activeActivityId, refetch]
  );

  if (propertiesLoading) {
    return (
      <div className="min-h-screen bg-field-cream p-8">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-field-wheat rounded w-64 mb-4" />
          <div className="h-4 bg-field-wheat rounded w-48" />
        </div>
      </div>
    );
  }

  if (!activeProperty) {
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
  const evidenceByActivity = activeProperty.activities
    .map((a) => ({
      activity: a,
      docs: activityDocuments.filter((d) => d.activityId === a.id),
    }))
    .filter((g) => g.docs.length > 0);

  return (
    <div className="min-h-screen bg-field-cream">
      <div className="max-w-4xl mx-auto p-8 space-y-10">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-semibold text-field-ink">
              {activeProperty.name}
            </h1>
            <p className="text-field-ink/60 mt-1">{activeProperty.address}</p>
          </div>
          <PropertySelect
            properties={properties}
            value={activeProperty}
            onChange={(p) => setSelectedId(p.id)}
          />
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

          {/* Upload evidence for one of this property's activities */}
          {activities.length === 0 ? (
            <div className="text-field-ink/60 text-sm">
              Add an activity to this property before uploading evidence.
            </div>
          ) : (
            <div className="bg-white border border-field-wheat rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-field-ink mb-2">
                  Activity
                </label>
                <select
                  value={activeActivityId}
                  onChange={(e) => setSelectedActivityId(e.target.value)}
                  className="w-full sm:w-72 p-2 border border-field-wheat rounded-lg bg-white text-field-ink focus:outline-none focus:ring-2 focus:ring-field-forest/20"
                >
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
                </select>
              </div>
              <EvidenceUploader
                onUpload={handleEvidenceUpload}
                uploading={evidenceUploading}
              />
            </div>
          )}

          {docsLoading ? (
            <div className="text-field-ink/60 text-sm">Loading…</div>
          ) : evidenceByActivity.length === 0 ? (
            <div className="text-field-ink/60 text-sm">
              No activity evidence uploaded yet.
            </div>
          ) : (
            <div className="space-y-8">
              {evidenceByActivity.map(({ activity, docs }) => (
                <div key={activity.id}>
                  <Link
                    href={`/properties/${activeProperty.slug || activeProperty.id}/activities/${activity.id}`}
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
