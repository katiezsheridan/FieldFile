"use client";

import { Document, Activity } from "@/lib/types";
import { FileUploader } from "./FileUploader";
import { DocumentList } from "./DocumentList";

interface DocumentVaultProps {
  documents: Document[];
  onUpload: (files: File[]) => void;
  activities?: Activity[];
  groupByActivity?: boolean;
}

export function DocumentVault({
  documents,
  onUpload,
  activities,
  groupByActivity = false,
}: DocumentVaultProps) {
  // Group documents by activity if requested and activities are provided
  const groupedDocuments = groupByActivity && activities
    ? activities.reduce((acc, activity) => {
        const activityDocs = documents.filter(
          (doc) => doc.activityId === activity.id
        );
        if (activityDocs.length > 0) {
          acc.push({
            activityName: activity.name,
            activityId: activity.id,
            documents: activityDocs,
          });
        }
        return acc;
      }, [] as { activityName: string; activityId: string; documents: Document[] }[])
    : null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-field-ink">Document Vault</h2>

      <FileUploader onUpload={onUpload} />

      <div className="mt-8">
        {groupedDocuments ? (
          <div className="space-y-8">
            {groupedDocuments.map((group) => (
              <div key={group.activityId}>
                <h3 className="text-lg font-medium text-field-forest mb-4">
                  {group.activityName}
                </h3>
                <DocumentList documents={group.documents} />
              </div>
            ))}
            {groupedDocuments.length === 0 && (
              <div className="text-center py-8 text-field-ink/60">
                No documents uploaded yet.
              </div>
            )}
          </div>
        ) : (
          <DocumentList documents={documents} />
        )}
      </div>
    </div>
  );
}
