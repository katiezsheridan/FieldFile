"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { GapAnalysis, ReportGap } from "@/lib/annual-report/gap-analysis";

/**
 * Where a property stands against the annual report, for one tax year.
 *
 * The honest version of a progress bar: it shows how many of the seven
 * practices are actually documented, and names what is missing. A practice only
 * counts when an activity is dated, says what was done, and has evidence — so
 * this will read lower than a naive "how many activities do I have" count, and
 * that is the point. A landowner who believes they are covered and is not has
 * a problem that surfaces at audit, which is far too late.
 */

type GapResponse = GapAnalysis & { blockingCount: number; ready: boolean };

export default function ReportReadinessCard({
  propertyId,
  taxYear,
}: {
  propertyId: string;
  taxYear: number;
}) {
  const [data, setData] = useState<GapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/properties/${propertyId}/report-gaps?year=${taxYear}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [propertyId, taxYear]);

  if (loading) {
    return (
      <div className="bg-white border border-field-wheat rounded-lg p-6">
        <div className="h-5 w-48 bg-field-wheat rounded animate-pulse" />
      </div>
    );
  }
  if (!data) return null;

  const { qualifyingPractices, meetsMinimum, practices, gaps } = data;
  const blocking = gaps.filter((g) => g.severity === "blocking");
  const shown = showAll ? gaps : gaps.slice(0, 5);

  return (
    <div className="bg-white border border-field-wheat rounded-lg p-6">
      <div className="flex items-baseline justify-between gap-4 mb-1">
        <h2 className="text-lg font-semibold text-field-ink">
          {taxYear} annual report
        </h2>
        <span
          className={
            meetsMinimum
              ? "text-sm font-medium text-field-forest"
              : "text-sm font-medium text-field-terra"
          }
        >
          {qualifyingPractices} of 3 required
        </span>
      </div>

      <p className="text-sm text-field-earth mb-4">
        A practice counts once an activity is dated, says what was done, and has
        a photo or receipt attached. Texas requires three.
      </p>

      {/* The seven, in the order PWD-888 Part IV prints them. */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-4">
        {practices.map((p) => (
          <li
            key={p.code}
            className="flex items-center justify-between text-sm py-1 border-b border-field-mist"
          >
            <span className={p.counts ? "text-field-ink" : "text-field-ink/60"}>
              <span
                aria-hidden
                className={
                  p.counts
                    ? "inline-block w-2 h-2 rounded-full bg-field-forest mr-2"
                    : "inline-block w-2 h-2 rounded-full bg-field-wheat mr-2"
                }
              />
              {p.name}
            </span>
            <span className="text-xs text-field-earth shrink-0">
              {p.counts
                ? `${p.qualifying} counted`
                : p.containers > 0
                  ? `${p.containers} not counted`
                  : "—"}
            </span>
          </li>
        ))}
      </ul>

      {gaps.length === 0 ? (
        <p className="text-sm text-field-forest">
          Nothing outstanding for {taxYear}.
        </p>
      ) : (
        <>
          <h3 className="text-sm font-semibold text-field-ink mb-2">
            {blocking.length > 0
              ? `${blocking.length} thing${blocking.length === 1 ? "" : "s"} to fix`
              : "Worth adding"}
          </h3>
          <ul className="space-y-1.5">
            {shown.map((g) => (
              <GapRow key={g.key} gap={g} propertyId={propertyId} />
            ))}
          </ul>
          {gaps.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 text-sm font-medium text-field-forest hover:underline"
            >
              {showAll ? "Show fewer" : `Show all ${gaps.length}`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function GapRow({ gap, propertyId }: { gap: ReportGap; propertyId: string }) {
  // Gaps keyed to a container link straight to it — the fix is always there.
  const activityId = gap.key.startsWith("activity.")
    ? gap.key.split(".")[1]
    : null;

  const body = (
    <>
      <span
        aria-hidden
        className={
          gap.severity === "blocking"
            ? "inline-block w-1.5 h-1.5 rounded-full bg-field-terra mt-1.5 shrink-0"
            : "inline-block w-1.5 h-1.5 rounded-full bg-field-gold mt-1.5 shrink-0"
        }
      />
      <span>
        <span className="text-xs text-field-earth mr-1.5">{gap.section}</span>
        {gap.label}
      </span>
    </>
  );

  return (
    <li className="flex items-start gap-2 text-sm text-field-ink">
      {activityId ? (
        <Link
          href={`/properties/${propertyId}/activities/${activityId}`}
          className="flex items-start gap-2 hover:underline"
        >
          {body}
        </Link>
      ) : (
        body
      )}
    </li>
  );
}
