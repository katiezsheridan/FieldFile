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
        return "bg-field-hero/15 text-field-hero";
      case "ready_to_file":
        return "bg-field-gold/15 text-field-gold";
      case "filed":
        return "bg-field-gold/15 text-field-earth";
      case "accepted":
        return "bg-field-forest/15 text-field-forest";
      case "needs_followup":
        return "bg-field-terra/15 text-field-terra";
      default:
        return "bg-field-mist text-field-earth";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-field-wheat p-6">
      <h3 className="text-sm font-medium text-field-earth mb-3">Filing Status</h3>
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-field-ink">{year} Filing</span>
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
