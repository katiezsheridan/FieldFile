"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { CensusObservation } from "@/lib/types";
import { getMethodLabel, getSpeciesLabel } from "@/lib/census-species";
import { formatDate } from "@/lib/utils";

export default function CensusLogPage() {
  const params = useParams();
  const id = params.id as string;
  const [observations, setObservations] = useState<CensusObservation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/properties/${id}/census`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed to load");
        return r.json();
      })
      .then(setObservations)
      .catch((e) => setError(e.message));
  }, [id]);

  return (
    <div className="min-h-screen bg-field-cream">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/properties/${id}`}
            className="text-sm text-field-forest hover:underline"
          >
            ← Back to property
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-field-ink">
              Wildlife Census Log
            </h1>
            <p className="text-field-ink/60 text-sm mt-1">
              Record of monitoring sessions and species observations
            </p>
          </div>
          <Link
            href={`/properties/${id}/census/new`}
            className="px-4 py-2 bg-field-forest text-white text-sm font-medium rounded-lg hover:bg-field-forest/90"
          >
            + New Entry
          </Link>
        </div>

        {error && (
          <div className="bg-white border border-field-terra/30 text-field-terra rounded-lg p-4 mb-4 text-sm">
            {error}
          </div>
        )}

        {!observations && !error && (
          <div className="animate-pulse space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 bg-field-wheat/60 rounded-lg" />
            ))}
          </div>
        )}

        {observations && observations.length === 0 && (
          <div className="bg-white border border-field-wheat rounded-lg p-8 text-center">
            <p className="text-field-ink/70 mb-4">No census entries yet.</p>
            <Link
              href={`/properties/${id}/census/new`}
              className="inline-block px-4 py-2 bg-field-forest text-white text-sm font-medium rounded-lg hover:bg-field-forest/90"
            >
              Log your first observation
            </Link>
          </div>
        )}

        {observations && observations.length > 0 && (
          <div className="space-y-3">
            {observations.map((o) => (
              <Link
                key={o.id}
                href={`/properties/${id}/census/${o.id}`}
                className="block hover:opacity-90"
              >
                <ObservationRow o={o} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ObservationRow({ o }: { o: CensusObservation }) {
  const totalAnimals = o.species.reduce((sum, s) => {
    return (
      sum +
      (s.countTotal || 0) +
      (s.countBuck || 0) + (s.countDoe || 0) + (s.countFawn || 0) +
      (s.countMale || 0) + (s.countFemale || 0) +
      (s.countJuvenile || 0) + (s.countUnknown || 0)
    );
  }, 0);

  return (
    <div className="bg-white border border-field-wheat rounded-lg p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-field-ink">
              {formatDate(o.observedOn)}
            </span>
            {o.observedAtTime && (
              <span className="text-xs text-field-ink/60">{o.observedAtTime.slice(0, 5)}</span>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full bg-field-mist text-field-ink/80">
              {getMethodLabel(o.method)}
            </span>
          </div>
          {o.locationLabel && (
            <p className="text-sm text-field-ink/70">{o.locationLabel}</p>
          )}
          {o.species.length > 0 && (
            <p className="text-sm text-field-ink/80 mt-2">
              {o.species
                .map((s) => getSpeciesLabel(s.category, s.species))
                .join(", ")}
            </p>
          )}
          {o.notes && (
            <p className="text-xs text-field-ink/60 mt-2 line-clamp-2">{o.notes}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold text-field-forest">{totalAnimals}</div>
          <div className="text-xs text-field-ink/60">animals</div>
        </div>
      </div>
    </div>
  );
}
