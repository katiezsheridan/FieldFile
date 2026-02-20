"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getProperty } from "@/lib/demo-data";
import { FilingTimeline, TimelineEvent } from "@/components/filing/FilingTimeline";
import { ReportPreview } from "@/components/filing/ReportPreview";
import { cn, getStatusLabel } from "@/lib/utils";
import { FilingStatus } from "@/lib/types";

// Demo timeline events based on filing status
function getTimelineEvents(status: FilingStatus): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      status: "draft",
      date: "2024-12-01",
      note: "Filing created for 2024 tax year",
    },
  ];

  if (
    status === "ready_to_file" ||
    status === "filed" ||
    status === "accepted" ||
    status === "needs_followup"
  ) {
    events.push({
      status: "evidence_collected",
      date: "2024-12-15",
      note: "All required evidence uploaded",
    });
  }

  if (
    status === "filed" ||
    status === "accepted" ||
    status === "needs_followup"
  ) {
    events.push({
      status: "ready_to_file",
      date: "2024-12-18",
      note: "Report reviewed and approved",
    });
    events.push({
      status: "filed",
      date: "2024-12-20",
      note: "Submitted to county appraisal district",
    });
  }

  if (status === "accepted") {
    events.push({
      status: "accepted",
      date: "2024-12-22",
      note: "Wildlife exemption confirmed",
    });
  }

  return events;
}

function getStatusBadgeStyles(status: FilingStatus): string {
  switch (status) {
    case "draft":
      return "bg-status-draft text-white";
    case "ready_to_file":
      return "bg-status-ready text-white";
    case "filed":
      return "bg-status-filed text-white";
    case "accepted":
      return "bg-status-accepted text-white";
    case "needs_followup":
      return "bg-status-followup text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

export default function FilingPage() {
  const params = useParams();
  const id = params.id as string;
  const property = getProperty(id);

  if (!property) {
    return (
      <div className="min-h-screen bg-field-cream p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-field-ink">
            Property not found
          </h1>
          <p className="text-field-ink/60 mt-2">
            The property you are looking for does not exist.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-field-forest hover:text-field-forest/80 font-medium"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { filing } = property;
  const timelineEvents = getTimelineEvents(filing.status);

  const showGetHelpButton =
    filing.status === "needs_followup" || filing.status === "filed";

  const handleSubmitFiling = () => {
    alert(
      "Filing submission initiated!\n\nThis is a demo - in the full version, this would submit your wildlife management plan to your county appraisal district."
    );
  };

  const handleGetHelp = () => {
    alert(
      "Help request submitted!\n\nThis is a demo - in the full version, a FieldFile specialist would contact you to help resolve any issues with your filing."
    );
  };

  return (
    <div className="min-h-screen bg-field-cream">
      <div className="max-w-6xl mx-auto px-4 py-8">
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
          Back to Property
        </Link>

        {/* Page header */}
        <div className="bg-white border border-field-wheat rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-field-ink">
                  {property.name}
                </h1>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    getStatusBadgeStyles(filing.status)
                  )}
                >
                  {getStatusLabel(filing.status)}
                </span>
              </div>
              <p className="text-field-ink/70">
                {filing.year} Wildlife Tax Exemption Filing
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-field-ink/60">
                {property.county} County, {property.state}
              </p>
              <p className="text-sm text-field-ink/60 mt-0.5">
                {property.acreage} acres
              </p>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timeline */}
          <div>
            <FilingTimeline
              currentStatus={filing.status}
              events={timelineEvents}
            />
          </div>

          {/* Report Preview */}
          <div>
            <ReportPreview property={property} />
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {filing.status === "ready_to_file" && (
            <button
              onClick={handleSubmitFiling}
              className="px-8 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-field-forest text-white hover:bg-field-forest/90 focus:ring-field-forest"
            >
              Submit Filing
            </button>
          )}

          {showGetHelpButton && (
            <button
              onClick={handleGetHelp}
              className="px-8 py-3 bg-field-earth text-white rounded-lg font-medium hover:bg-field-earth/90 transition-colors focus:outline-none focus:ring-2 focus:ring-field-earth focus:ring-offset-2"
            >
              Get Help
            </button>
          )}

          {filing.status === "accepted" && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-status-accepted/10 border border-status-accepted/20 rounded-lg">
                <svg
                  className="h-5 w-5 text-status-accepted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium text-status-accepted">
                  Filing Accepted - No action required
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Filing details (if filed) */}
        {(filing.status === "filed" ||
          filing.status === "accepted" ||
          filing.status === "needs_followup") &&
          filing.confirmationNumber && (
            <div className="mt-8 bg-white border border-field-wheat rounded-lg p-6">
              <h3 className="text-lg font-semibold text-field-ink mb-4">
                Filing Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-field-ink/60">Confirmation Number</p>
                  <p className="font-medium text-field-ink mt-0.5">
                    {filing.confirmationNumber}
                  </p>
                </div>
                {filing.filedDate && (
                  <div>
                    <p className="text-sm text-field-ink/60">Filed Date</p>
                    <p className="font-medium text-field-ink mt-0.5">
                      {new Date(filing.filedDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
                {filing.method && (
                  <div>
                    <p className="text-sm text-field-ink/60">Filing Method</p>
                    <p className="font-medium text-field-ink mt-0.5 capitalize">
                      {filing.method}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
