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
import ReportReadinessCard from "@/components/annual-report/ReportReadinessCard";
import { FileUploader } from "@/components/documents/FileUploader";
import { DocumentList } from "@/components/documents/DocumentList";
import PropertyMapSection from "@/components/map/PropertyMapSection";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { canApplyFor1d1 } from "@/lib/forms/form50129/eligibility";
import { Document, type PracticeCode } from "@/lib/types";

function inferType(file: File): Document["type"] {
  if (file.type.startsWith("image/")) return "photo";
  return "receipt";
}

export default function PropertyPage() {
  const params = useParams();
  const id = params.id as string;
  const [showAddForm, setShowAddForm] = useState(false);
  // Set by "Log it" on a planned practice: opens Add Activity on that practice.
  const [logPractice, setLogPractice] = useState<{ code: PracticeCode; at: number } | null>(null);
  const [readinessKey, setReadinessKey] = useState(0);
  const [summary, setSummary] = useState<{ qualifying: number; meetsMinimum: boolean } | null>(null);
  const startLogging = useCallback((code: PracticeCode) => {
    setLogPractice({ code, at: Date.now() });
    setShowAddForm(true);
    // After the section opens and the form mounts.
    setTimeout(
      () => document.getElementById("add-activity")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50
    );
  }, []);
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

  const activityCount = property.activities.length;

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
            {/* The number that matters: practices documented for this year,
                as the readiness card below counts them. */}
            {summary && (
              <div className="text-right">
                <div
                  className={
                    summary.meetsMinimum
                      ? "text-3xl font-bold text-field-forest"
                      : "text-3xl font-bold text-field-terra"
                  }
                >
                  {summary.qualifying} of 3
                </div>
                <div className="text-sm text-field-ink/60">
                  practices documented for {new Date().getFullYear()}
                  {summary.meetsMinimum ? " ✓" : ""}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 1-d-1 application — assemble & generate the Form 50-129 to file.
            Only offered to landowners who told us at setup that they do not
            have a valuation yet; see canApplyFor1d1. */}
        {canApplyFor1d1(property?.exemptionType) && (
        <Link
          href={`/properties/${id}/1d1`}
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-field-ink">
              1-d-1 application
            </h2>
            <p className="text-sm text-field-earth mt-0.5">
              Assemble and generate your Form 50-129 to review, sign, and file
              with the county.
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
        )}

        {/* Where this property stands against the annual report. Above the
            activity list on purpose: the count is the thing that matters, and
            a list of activities does not tell you whether you qualify. */}
        <div className="mb-6">
          <ReportReadinessCard
            propertyId={property.id}
            taxYear={new Date().getFullYear()}
            onLogPractice={startLogging}
            refreshKey={readinessKey}
            onSummary={setSummary}
          />
        </div>

        {/* Activities with inline evidence */}
        <CollapsibleSection
          title="Wildlife Management Activities"
          summary={`${activityCount} ${activityCount === 1 ? "activity" : "activities"}`}
          openSignal={logPractice?.at}
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
              // property.id, NOT the route param: `id` is the slug
              // (/properties/promised-land-ranch) and activities.property_id is
              // a uuid. Passing the slug fails with 22P02 invalid input syntax.
              <div id="add-activity" className="scroll-mt-4">
                <AddActivityForm
                  // Remount when "Log it" picks a different practice.
                  key={logPractice?.at ?? "manual"}
                  propertyId={property.id}
                  initialPracticeCode={logPractice?.code}
                  onSuccess={() => {
                    setShowAddForm(false);
                    setLogPractice(null);
                    refetch();
                    setReadinessKey((k) => k + 1);
                  }}
                  onCancel={() => {
                    setShowAddForm(false);
                    setLogPractice(null);
                  }}
                />
              </div>
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
