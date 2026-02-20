"use client";

import { Activity } from "@/lib/types";
import ActivityCard from "./ActivityCard";

interface ActivityGridProps {
  activities: Activity[];
}

export default function ActivityGrid({ activities }: ActivityGridProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-field-wheat rounded-lg">
        <p className="text-field-ink/60">No activities found for this property.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
