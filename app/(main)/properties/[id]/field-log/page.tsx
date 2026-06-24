"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { practiceCategoryLabel } from "@/lib/field-log";
import { GPS_SOURCE_LABELS } from "@/lib/field-capture";
import type { FieldLogEntry, GpsSource } from "@/lib/types";

type EntryWithUrl = FieldLogEntry & { photoUrl?: string | null };

export default function FieldLogLandingPage() {
  const params = useParams();
  const id = params.id as string;

  const [entries, setEntries] = useState<EntryWithUrl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/properties/${id}/field-log`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-full bg-field-cream">
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="mb-5">
          <Link
            href={`/properties/${id}`}
            className="text-sm text-field-forest hover:underline"
          >
            ← Back to property
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-field-ink mb-1">Field log</h1>
        <p className="text-sm text-field-earth mb-6">
          Capture evidence of wildlife-management practices, geotagged and
          timestamped for your records.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <Link
            href={`/properties/${id}/field-log/new`}
            className="flex items-center justify-center gap-2 py-5 bg-field-forest text-white text-base font-semibold rounded-2xl hover:bg-field-forest/90 active:scale-[0.99] transition shadow-sm"
          >
            📷 Log photo evidence
          </Link>
          {/* Session 3 — quick pin without a photo. */}
          <Link
            href={`/properties/${id}/field-log/pin`}
            className="flex items-center justify-center gap-2 py-5 bg-field-forest text-white text-base font-semibold rounded-2xl hover:bg-field-forest/90 active:scale-[0.99] transition shadow-sm"
          >
            📍 Drop a pin
          </Link>
        </div>

        <h2 className="text-sm font-semibold text-field-ink/70 uppercase tracking-wide mb-3">
          Recent entries
        </h2>

        {loading ? (
          <div className="py-10 flex justify-center">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-field-forest" />
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white border border-field-wheat rounded-xl p-6 text-center">
            <p className="text-field-ink/70 text-sm">
              No entries yet. Tap{" "}
              <span className="font-medium">Log photo evidence</span> to capture
              your first.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {entries.map((e) => (
              <li
                key={e.id}
                className="flex gap-3 bg-white border border-field-wheat rounded-xl p-3"
              >
                <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-field-mist">
                  {e.photoUrl ? (
                    <Image
                      src={e.photoUrl}
                      alt={practiceCategoryLabel(e.practiceCategory)}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-field-earth/50 text-xl">
                      📍
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-field-ink truncate">
                    {practiceCategoryLabel(e.practiceCategory)}
                  </p>
                  {e.note && (
                    <p className="text-xs text-field-ink/70 truncate">{e.note}</p>
                  )}
                  <p className="text-[11px] text-field-ink/50 mt-1">
                    {formatDate(e.capturedAt || e.createdAt)}
                    {e.gpsSource ? ` · ${GPS_SOURCE_LABELS[e.gpsSource as GpsSource]}` : " · No location"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
