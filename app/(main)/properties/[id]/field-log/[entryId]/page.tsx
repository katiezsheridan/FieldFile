"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import FieldLogMap from "@/components/field-log/FieldLogMapWrapper";
import {
  practiceCategoryLabel,
  PRACTICE_CATEGORY_COLORS,
} from "@/lib/field-log";
import { GPS_SOURCE_LABELS } from "@/lib/field-capture";
import type { FieldLogEntry, GpsSource } from "@/lib/types";

type EntryWithUrl = FieldLogEntry & { photoUrl?: string | null };

export default function FieldLogEntryPage() {
  const params = useParams();
  const id = params.id as string;
  const entryId = params.entryId as string;

  const [entry, setEntry] = useState<EntryWithUrl | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">(
    "loading"
  );

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/properties/${id}/field-log/${entryId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.id) {
          setEntry(data);
          setStatus("ready");
        } else {
          setStatus("missing");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("missing");
      });
    return () => {
      cancelled = true;
    };
  }, [id, entryId]);

  const hasLocation =
    entry?.latitude != null && entry?.longitude != null;

  return (
    <div className="min-h-full bg-field-cream">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-5">
          <Link
            href={`/properties/${id}/field-log`}
            className="text-sm text-field-forest hover:underline"
          >
            ← Back to field log
          </Link>
        </div>

        {status === "loading" ? (
          <div className="py-10 flex justify-center">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-field-forest" />
          </div>
        ) : status === "missing" || !entry ? (
          <div className="bg-white border border-field-wheat rounded-xl p-6 text-center">
            <p className="text-field-ink/70 text-sm">
              This entry could not be found.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    PRACTICE_CATEGORY_COLORS[entry.practiceCategory],
                }}
              />
              <h1 className="text-2xl font-bold text-field-ink">
                {practiceCategoryLabel(entry.practiceCategory)}
              </h1>
            </div>

            {/* Full photo, or a clear note that this was a pin-only activity. */}
            {entry.photoUrl ? (
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-field-mist border border-field-wheat">
                <Image
                  src={entry.photoUrl}
                  alt={practiceCategoryLabel(entry.practiceCategory)}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-full rounded-xl bg-field-mist border border-field-wheat p-6 text-center text-field-earth text-sm">
                📍 Pin activity — no photo attached.
              </div>
            )}

            {entry.note && (
              <section className="bg-white border border-field-wheat rounded-xl p-4">
                <h2 className="text-xs font-semibold text-field-ink/60 uppercase tracking-wide mb-1">
                  Note
                </h2>
                <p className="text-sm text-field-ink whitespace-pre-wrap">
                  {entry.note}
                </p>
              </section>
            )}

            {/* Location — full-size map + accuracy circle, or a no-location note. */}
            <section className="bg-white border border-field-wheat rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-field-ink text-sm">Location</h2>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-field-mist text-field-earth">
                  {entry.gpsSource
                    ? GPS_SOURCE_LABELS[entry.gpsSource as GpsSource]
                    : "No location"}
                </span>
              </div>

              {hasLocation ? (
                <>
                  <FieldLogMap
                    entries={[entry]}
                    propertyId={id}
                    height={320}
                    showAccuracy
                    linkToDetail={false}
                  />
                  <p className="text-xs text-field-ink/60">
                    {entry.latitude!.toFixed(5)}, {entry.longitude!.toFixed(5)}
                    {entry.gpsAccuracyMeters != null
                      ? ` · ±${Math.round(entry.gpsAccuracyMeters)} m accuracy`
                      : ""}
                  </p>
                </>
              ) : (
                <p className="text-sm text-field-ink/60">
                  No coordinates were recorded for this entry.
                </p>
              )}
            </section>

            {/* Timestamps — both the activity time and the log time, for audit. */}
            <section className="bg-white border border-field-wheat rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Captured">{formatDateTime(entry.capturedAt)}</Field>
              <Field label="Logged">{formatDateTime(entry.createdAt)}</Field>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-field-ink/60 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-sm text-field-ink">{children || "—"}</p>
    </div>
  );
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
