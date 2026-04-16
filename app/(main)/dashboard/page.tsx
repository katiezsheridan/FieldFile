"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useProperties } from "@/lib/hooks";
import { getDeadlineDays } from "@/lib/demo-data";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { DeadlineCountdown } from "@/components/dashboard/DeadlineCountdown";
import { QuickActions } from "@/components/dashboard/QuickActions";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { properties, loading } = useProperties(user?.id);
  const daysRemaining = getDeadlineDays();

  if (!isLoaded || loading) {
    return (
      <main className="min-h-screen bg-field-cream">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-field-wheat rounded-lg w-48 mb-2"></div>
            <div className="h-4 bg-field-wheat rounded-lg w-64 mb-10"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-field-mist rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // No properties yet — prompt user to set one up
  if (properties.length === 0) {
    return (
      <main className="min-h-screen bg-field-cream">
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <div className="w-16 h-16 bg-field-hero/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-field-hero" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-field-ink mb-2">
            Welcome{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="text-field-earth mb-8 leading-relaxed">
            Set up your first property to start tracking wildlife management
            activities and building your annual report.
          </p>
          <Link
            href="/setup"
            className="inline-block px-8 py-3 bg-field-forest text-white font-medium rounded-lg hover:bg-field-forest/90 transition-colors"
          >
            Set up your property
          </Link>
        </div>
      </main>
    );
  }

  const property = properties[0];
  const completedActivities = property.activities.filter(
    (activity) => activity.status === "complete"
  ).length;
  const totalActivities = property.activities.length;

  return (
    <main className="min-h-screen bg-field-cream">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Property header */}
        <header className="mb-8">
          <p className="text-sm text-field-earth mb-1">
            {property.county} County &middot; {property.acreage} acres
          </p>
          <h1 className="text-2xl font-semibold text-field-ink">
            {property.name}
          </h1>
          <p className="text-sm text-field-earth mt-1">
            {property.address}
          </p>
        </header>

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ProgressBar
            completed={completedActivities}
            total={totalActivities}
          />
          <DeadlineCountdown daysRemaining={daysRemaining} />
          <QuickActions />
        </div>
      </div>
    </main>
  );
}
