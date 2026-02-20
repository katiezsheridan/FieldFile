"use client";

import { useUser } from "@clerk/nextjs";
import { useProperties } from "@/lib/hooks";
import { demoProperties, getDeadlineDays } from "@/lib/demo-data";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { DeadlineCountdown } from "@/components/dashboard/DeadlineCountdown";
import { FilingStatus } from "@/components/dashboard/FilingStatus";
import { QuickActions } from "@/components/dashboard/QuickActions";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { properties, loading, error } = useProperties(user?.id);
  const daysRemaining = getDeadlineDays();

  // Use Supabase data if available, fallback to demo data
  const property = properties.length > 0 ? properties[0] : demoProperties[0];
  const usingDemoData = properties.length === 0 && !loading;

  const completedActivities = property.activities.filter(
    (activity) => activity.status === "complete"
  ).length;
  const totalActivities = property.activities.length;

  if (!isLoaded || loading) {
    return (
      <main className="min-h-screen bg-field-cream">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-field-wheat rounded w-48 mb-2"></div>
            <div className="h-4 bg-field-wheat rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-field-wheat rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-field-cream">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {user && (
          <div className="mb-4 p-3 bg-field-sage/20 border border-field-sage rounded-lg text-sm text-field-ink/70">
            Your user ID: <code className="bg-white px-1 rounded">{user.id}</code>
          </div>
        )}

        {usingDemoData && (
          <div className="mb-4 p-3 bg-field-wheat/50 border border-field-wheat rounded-lg text-sm text-field-ink/70">
            No properties found. Update your property in Supabase with your user ID above.
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-field-ink">
            {property.name}
          </h1>
          <p className="text-sm text-field-ink/70 mt-1">
            {property.address}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProgressBar
            completed={completedActivities}
            total={totalActivities}
          />
          <DeadlineCountdown daysRemaining={daysRemaining} />
          <FilingStatus
            status={property.filing.status}
            year={property.filing.year}
          />
          <QuickActions />
        </div>
      </div>
    </main>
  );
}
