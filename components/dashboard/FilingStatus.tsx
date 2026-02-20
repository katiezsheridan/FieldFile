"use client";

import { FilingStatus as FilingStatusType } from "@/lib/types";
import { cn, getStatusLabel } from "@/lib/utils";

type FilingStatusProps = {
  status: FilingStatusType;
  year: number;
};

export function FilingStatus({ status, year }: FilingStatusProps) {
  const getStatusBadgeStyles = () => {
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
  };

  return (
    <div className="bg-white rounded-lg border border-field-wheat p-6">
      <h3 className="text-sm font-medium text-field-ink mb-3">Filing Status</h3>
      <div className="flex items-center justify-between">
        <span className="text-lg font-medium text-field-ink">{year} Filing</span>
        <span
          className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            getStatusBadgeStyles()
          )}
        >
          {getStatusLabel(status)}
        </span>
      </div>
    </div>
  );
}
