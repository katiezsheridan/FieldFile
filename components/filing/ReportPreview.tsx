"use client";

import { PropertyWithDetails } from "@/lib/types";
import { cn, getStatusLabel } from "@/lib/utils";

type ReportPreviewProps = {
  property: PropertyWithDetails;
};

export function ReportPreview({ property }: ReportPreviewProps) {
  // Calculate activity statistics
  const completedActivities = property.activities.filter(
    (a) => a.status === "complete"
  ).length;
  const totalActivities = property.activities.length;

  // Count total documents
  const totalDocuments = property.activities.reduce(
    (sum, activity) => sum + activity.documents.length,
    0
  );

  // Count documents by type
  const photoCount = property.activities.reduce(
    (sum, activity) =>
      sum + activity.documents.filter((d) => d.type === "photo").length,
    0
  );
  const receiptCount = property.activities.reduce(
    (sum, activity) =>
      sum + activity.documents.filter((d) => d.type === "receipt").length,
    0
  );

  // Get unique activity types
  const activityTypes = Array.from(new Set(property.activities.map((a) => a.type)));

  const handleGenerateReport = () => {
    alert(
      `Report generated for ${property.name}!\n\nThis is a demo - in the full version, a PDF report would be generated with all property details, activities, and evidence.`
    );
  };

  return (
    <div className="bg-white rounded-lg border border-field-wheat p-6">
      <h3 className="text-lg font-semibold text-field-ink mb-6">
        Report Preview
      </h3>

      <div className="space-y-6">
        {/* Property Info Section */}
        <div className="border-b border-field-wheat pb-5">
          <h4 className="text-sm font-medium text-field-ink/60 uppercase tracking-wide mb-3">
            Property Information
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-field-ink/70">Property Name</span>
              <span className="font-medium text-field-ink">{property.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-field-ink/70">Address</span>
              <span className="font-medium text-field-ink text-right max-w-[60%]">
                {property.address}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-field-ink/70">County</span>
              <span className="font-medium text-field-ink">
                {property.county}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-field-ink/70">Acreage</span>
              <span className="font-medium text-field-ink">
                {property.acreage} acres
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-field-ink/70">Exemption Type</span>
              <span className="font-medium text-field-ink capitalize">
                {property.exemptionType}
              </span>
            </div>
          </div>
        </div>

        {/* Activities Summary Section */}
        <div className="border-b border-field-wheat pb-5">
          <h4 className="text-sm font-medium text-field-ink/60 uppercase tracking-wide mb-3">
            Activities Summary
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-field-ink/70">Total Activities</span>
              <span className="font-medium text-field-ink">
                {totalActivities}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-field-ink/70">Completed</span>
              <span
                className={cn(
                  "font-medium",
                  completedActivities === totalActivities
                    ? "text-status-accepted"
                    : "text-field-ink"
                )}
              >
                {completedActivities} of {totalActivities}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-field-ink/70">Activity Types</span>
              <div className="text-right max-w-[60%]">
                <span className="font-medium text-field-ink">
                  {activityTypes.length} types
                </span>
                <p className="text-sm text-field-ink/50 mt-0.5">
                  {activityTypes
                    .map((t) =>
                      t
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())
                    )
                    .join(", ")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Count Section */}
        <div className="pb-2">
          <h4 className="text-sm font-medium text-field-ink/60 uppercase tracking-wide mb-3">
            Evidence Count
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-field-ink/70">Total Documents</span>
              <span className="font-medium text-field-ink">
                {totalDocuments}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-field-ink/70">Photos</span>
              <span className="font-medium text-field-ink">{photoCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-field-ink/70">Receipts</span>
              <span className="font-medium text-field-ink">{receiptCount}</span>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-4 p-3 bg-field-cream rounded-lg">
            <div className="flex items-center gap-2">
              {completedActivities === totalActivities ? (
                <>
                  <div className="h-5 w-5 rounded-full bg-status-accepted flex items-center justify-center">
                    <svg
                      className="h-3 w-3 text-white"
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
                  <span className="text-sm font-medium text-status-accepted">
                    All activities complete - ready to generate
                  </span>
                </>
              ) : (
                <>
                  <div className="h-5 w-5 rounded-full bg-status-filed flex items-center justify-center">
                    <span className="text-xs font-bold text-white">!</span>
                  </div>
                  <span className="text-sm font-medium text-status-filed">
                    {totalActivities - completedActivities} activities still need completion
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generate Report Button */}
      <button
        onClick={handleGenerateReport}
        className="w-full mt-6 px-4 py-3 bg-field-forest text-white font-medium rounded-lg hover:bg-field-forest/90 transition-colors focus:outline-none focus:ring-2 focus:ring-field-forest focus:ring-offset-2"
      >
        Generate Report
      </button>
    </div>
  );
}
