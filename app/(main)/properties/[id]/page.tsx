"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useProperty } from "@/lib/hooks";
import { getProperty } from "@/lib/demo-data";
import ActivityGrid from "@/components/activities/ActivityGrid";
import AddActivityForm from "@/components/activities/AddActivityForm";

export default function PropertyPage() {
  const params = useParams();
  const id = params.id as string;
  const [showAddForm, setShowAddForm] = useState(false);

  const { property: supabaseProperty, loading, error, refetch } = useProperty(id);

  // Fallback to demo data if no Supabase data
  const demoProperty = getProperty(id);
  const property = supabaseProperty || demoProperty;

  if (loading) {
    return (
      <div className="min-h-screen bg-field-cream">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-field-wheat rounded w-32 mb-6"></div>
            <div className="bg-white border border-field-wheat rounded-lg p-6 mb-8">
              <div className="h-8 bg-field-wheat rounded w-48 mb-2"></div>
              <div className="h-4 bg-field-wheat rounded w-64 mb-4"></div>
              <div className="flex gap-4">
                <div className="h-4 bg-field-wheat rounded w-20"></div>
                <div className="h-4 bg-field-wheat rounded w-24"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-field-wheat rounded-lg"></div>
              ))}
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

  const completedCount = property.activities.filter(
    (a) => a.status === "complete"
  ).length;
  const totalCount = property.activities.length;

  return (
    <div className="min-h-screen bg-field-cream">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Property header */}
        <div className="bg-white border border-field-wheat rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-field-ink mb-2">
                {property.name}
              </h1>
              <p className="text-field-ink/70">{property.address}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-field-ink/60">
                <span>{property.acreage} acres</span>
                <span>{property.county} County</span>
                <span className="capitalize">
                  {property.exemptionType} exemption
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-field-forest">
                {completedCount}/{totalCount}
              </div>
              <div className="text-sm text-field-ink/60">
                activities complete
              </div>
            </div>
          </div>
        </div>

        {/* Activities section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-field-ink">
              Wildlife Management Activities
            </h2>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-field-forest text-white text-sm font-medium rounded-lg hover:bg-field-forest/90"
              >
                + Add Activity
              </button>
            )}
          </div>

          {showAddForm && (
            <div className="mb-6">
              <AddActivityForm
                propertyId={id}
                onSuccess={() => {
                  setShowAddForm(false);
                  refetch();
                }}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          )}

          <ActivityGrid activities={property.activities} />
        </div>
      </div>
    </div>
  );
}
