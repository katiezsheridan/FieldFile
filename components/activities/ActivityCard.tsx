"use client";

import Link from "next/link";
import { Activity } from "@/lib/types";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const documentCount = activity.documents.length;

  return (
    <Link
      href={`/properties/${activity.propertyId}/activities/${activity.id}`}
      className="block bg-white border border-field-wheat rounded-lg p-5 hover:shadow-md hover:border-field-sage transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-field-ink text-lg leading-tight">
          {activity.name}
        </h3>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
            activity.status
          )}`}
        >
          {getStatusLabel(activity.status)}
        </span>
      </div>

      <p className="text-field-ink/70 text-sm mb-4 line-clamp-2">
        {activity.description}
      </p>

      <div className="flex items-center justify-between text-sm">
        <span className="text-field-ink/60">
          {documentCount === 0
            ? "No documents"
            : documentCount === 1
            ? "1 document uploaded"
            : `${documentCount} documents uploaded`}
        </span>
        <span className="text-field-ink/60">
          Due {formatDate(activity.dueDate)}
        </span>
      </div>

      <div className="mt-4 pt-3 border-t border-field-wheat">
        <span className="text-field-forest text-sm font-medium">
          View details →
        </span>
      </div>
    </Link>
  );
}
