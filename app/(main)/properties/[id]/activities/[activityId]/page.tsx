"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useProperty, useActivity } from "@/lib/hooks";
import { getProperty } from "@/lib/demo-data";
import { uploadDocument } from "@/lib/supabase";
import { createDocument } from "@/lib/hooks";
import ActivityDetail from "@/components/activities/ActivityDetail";
import { EvidenceUploader } from "@/components/documents/EvidenceUploader";

export default function ActivityDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const activityId = params.activityId as string;

  const { property: supabaseProperty, loading: propertyLoading } = useProperty(id);
  const { activity: supabaseActivity, loading: activityLoading, refetch: refetchActivity } = useActivity(activityId);
  const [showUploader, setShowUploader] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fallback to demo data
  const demoProperty = getProperty(id);
  const property = supabaseProperty || demoProperty;
  const demoActivity = demoProperty?.activities.find((a) => a.id === activityId);
  const activity = supabaseActivity || demoActivity;

  const handleUpload = useCallback(async (file: File, type: "photo" | "receipt" | "note", date?: string) => {
    setUploading(true);
    console.log("Uploading:", file.name, "Type:", type, "Date:", date);

    try {
      const result = await uploadDocument(file, activityId);
      console.log("Upload result:", result);

      if (result) {
        await createDocument(activityId, {
          type,
          name: file.name,
          url: result.url,
          storagePath: result.path,
        });
        setShowUploader(false);
        refetchActivity();
      }
    } catch (err) {
      console.error("Upload/save error:", err);
    }

    setUploading(false);
  }, [activityId, refetchActivity]);

  if (propertyLoading || activityLoading) {
    return (
      <div className="min-h-screen bg-field-cream">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-field-wheat rounded w-32 mb-6"></div>
            <div className="space-y-6">
              <div className="bg-white border border-field-wheat rounded-lg p-6">
                <div className="h-8 bg-field-wheat rounded w-64 mb-2"></div>
                <div className="h-4 bg-field-wheat rounded w-48"></div>
              </div>
              <div className="bg-white border border-field-wheat rounded-lg p-6">
                <div className="h-6 bg-field-wheat rounded w-40 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-field-wheat rounded w-full"></div>
                  <div className="h-4 bg-field-wheat rounded w-3/4"></div>
                </div>
              </div>
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

  if (!activity) {
    return (
      <div className="min-h-screen bg-field-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-field-ink mb-2">
            Activity not found
          </h1>
          <Link
            href={`/properties/${id}`}
            className="text-field-forest hover:underline"
          >
            Return to property
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-field-cream">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href={`/properties/${id}`}
          className="inline-flex items-center text-field-forest hover:text-field-forest/80 text-sm font-medium mb-6"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to {property.name}
        </Link>

        {/* Activity Detail Component */}
        <ActivityDetail activity={activity} propertyId={id} onDocsChange={refetchActivity} />

        {/* File Uploader */}
        {showUploader && (
          <div className="mt-8 bg-white border border-field-wheat rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-field-ink">Upload Evidence</h3>
              <button
                onClick={() => setShowUploader(false)}
                className="text-field-ink/60 hover:text-field-ink"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <EvidenceUploader onUpload={handleUpload} uploading={uploading} />
          </div>
        )}

        {/* Upload Evidence Button */}
        {!showUploader && (
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setShowUploader(true)}
              className="w-full sm:w-auto px-6 py-3 bg-field-forest text-white font-medium rounded-lg hover:bg-field-forest/90 transition-colors"
            >
              Upload Evidence
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
