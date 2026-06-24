"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import FieldLogMap from "@/components/field-log/FieldLogMapWrapper";
import { useOfflineSync } from "@/components/offline/OfflineSyncProvider";
import {
  getQueuedEntries,
  QUEUE_CHANGED_EVENT,
  type QueuedEntry,
} from "@/lib/offline-queue";
import {
  PRACTICE_CATEGORIES,
  practiceCategoryLabel,
  PRACTICE_CATEGORY_COLORS,
  groupByPracticeCategory,
} from "@/lib/field-log";
import { GPS_SOURCE_LABELS } from "@/lib/field-capture";
import type { FieldLogEntry, GpsSource, PracticeCategory } from "@/lib/types";

type EntryWithUrl = FieldLogEntry & { photoUrl?: string | null };
type Coords = { lat: number; lng: number };
type View = "list" | "map";
type CategoryFilter = PracticeCategory | "all";

export default function FieldLogLandingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const { pending } = useOfflineSync();

  const [entries, setEntries] = useState<EntryWithUrl[]>([]);
  const [loading, setLoading] = useState(true);

  // Locally-queued (not-yet-synced) captures for this property.
  const [queued, setQueued] = useState<QueuedEntry[]>([]);
  const [queuedUrls, setQueuedUrls] = useState<Record<string, string>>({});
  const justQueued = searchParams.get("queued") === "1";
  const [queuedBannerHidden, setQueuedBannerHidden] = useState(false);

  const [propertyCenter, setPropertyCenter] = useState<Coords | null>(null);
  const [propertyName, setPropertyName] = useState<string | undefined>();

  const [view, setView] = useState<View>("list");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Property center + name, once — used as the map's anchor and house marker.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/properties/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (cancelled || !p) return;
        if (p.coordinates?.lat && p.coordinates?.lng) {
          setPropertyCenter({ lat: p.coordinates.lat, lng: p.coordinates.lng });
        }
        if (p.name) setPropertyName(p.name);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Entries, refetched whenever a filter changes — the server does the date /
  // category narrowing (same query path the annual report will use), so the
  // list and map always agree.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const qs = new URLSearchParams();
    if (category !== "all") qs.set("category", category);
    if (dateFrom) qs.set("from", dayStartISO(dateFrom));
    if (dateTo) qs.set("to", dayEndISO(dateTo));
    const suffix = qs.toString() ? `?${qs}` : "";

    fetch(`/api/properties/${id}/field-log${suffix}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled) setEntries(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        /* offline or transient — keep whatever we already have on screen */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // `pending` is included so the list refetches once a background sync drains
    // the queue and those entries become server-backed.
  }, [id, category, dateFrom, dateTo, pending]);

  // Keep the queued list in step with the offline queue (enqueue / flush).
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      getQueuedEntries(id).then((q) => {
        if (!cancelled) setQueued(q);
      });
    load();
    const onChange = () => load();
    window.addEventListener(QUEUE_CHANGED_EVENT, onChange);
    return () => {
      cancelled = true;
      window.removeEventListener(QUEUE_CHANGED_EVENT, onChange);
    };
  }, [id]);

  // Object URLs for queued-photo thumbnails; rebuilt and revoked with the queue.
  useEffect(() => {
    const map: Record<string, string> = {};
    queued.forEach((q) => {
      if (q.photo) map[q.localId] = URL.createObjectURL(q.photo);
    });
    setQueuedUrls(map);
    return () => Object.values(map).forEach((u) => URL.revokeObjectURL(u));
  }, [queued]);

  const locatedCount = useMemo(
    () => entries.filter((e) => e.latitude != null && e.longitude != null).length,
    [entries]
  );
  const legend = useMemo(
    () => groupByPracticeCategory(entries).filter((g) => g.entries.length > 0),
    [entries]
  );

  // Queued entries honor the active category chip (they predate the date range,
  // so date filters don't apply to them).
  const visibleQueued = useMemo(
    () =>
      category === "all"
        ? queued
        : queued.filter((q) => q.payload.practiceCategory === category),
    [queued, category]
  );

  const filtersActive = category !== "all" || !!dateFrom || !!dateTo;

  function applyPreset(key: string, from: string, to: string) {
    setActivePreset(key);
    setDateFrom(from);
    setDateTo(to);
  }
  function clearFilters() {
    setActivePreset(null);
    setCategory("all");
    setDateFrom("");
    setDateTo("");
  }

  return (
    <div className="min-h-full bg-field-cream">
      <div className="max-w-2xl mx-auto px-4 py-6">
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

        {/* View toggle */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-field-ink/70 uppercase tracking-wide">
            Logged entries
          </h2>
          <div className="inline-flex rounded-lg border border-field-wheat overflow-hidden text-sm">
            {(["list", "map"] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={
                  "px-3 py-1.5 font-medium capitalize " +
                  (view === v
                    ? "bg-field-forest text-white"
                    : "bg-white text-field-earth hover:bg-field-mist")
                }
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-field-wheat rounded-xl p-3 mb-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={category === "all"}
              onClick={() => setCategory("all")}
            >
              All practices
            </FilterChip>
            {PRACTICE_CATEGORIES.map((c) => (
              <FilterChip
                key={c.value}
                active={category === c.value}
                color={PRACTICE_CATEGORY_COLORS[c.value]}
                onClick={() => setCategory(c.value)}
              >
                {c.label}
              </FilterChip>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-3 pt-1">
            <label className="block">
              <span className="block text-[11px] font-medium text-field-ink/60 mb-1">
                From
              </span>
              <input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => {
                  setActivePreset(null);
                  setDateFrom(e.target.value);
                }}
                className={dateInputCls}
              />
            </label>
            <label className="block">
              <span className="block text-[11px] font-medium text-field-ink/60 mb-1">
                To
              </span>
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => {
                  setActivePreset(null);
                  setDateTo(e.target.value);
                }}
                className={dateInputCls}
              />
            </label>
          </div>

          {/* Reporting-window shortcuts (annual report covers a calendar year,
              due April 30 of the next; Q4 is a common push). */}
          <div className="flex flex-wrap gap-2">
            {reportingPresets().map((p) => (
              <FilterChip
                key={p.key}
                active={activePreset === p.key}
                onClick={() => applyPreset(p.key, p.from, p.to)}
              >
                {p.label}
              </FilterChip>
            ))}
            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-field-terra font-medium px-2 py-1 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {justQueued && !queuedBannerHidden && (
          <div className="mb-4 flex items-start gap-2 bg-field-gold/10 border border-field-gold/40 text-field-earth rounded-xl p-3 text-sm">
            <span aria-hidden>✓</span>
            <p className="flex-1">
              Saved on this device. It&apos;ll sync automatically when you&apos;re
              back online.
            </p>
            <button
              type="button"
              onClick={() => setQueuedBannerHidden(true)}
              className="text-field-earth/60 hover:text-field-earth"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-10 flex justify-center">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-field-forest" />
          </div>
        ) : entries.length === 0 && visibleQueued.length === 0 ? (
          <div className="bg-white border border-field-wheat rounded-xl p-6 text-center">
            <p className="text-field-ink/70 text-sm">
              {filtersActive ? (
                <>No entries match these filters.</>
              ) : (
                <>
                  No entries yet. Tap{" "}
                  <span className="font-medium">Log photo evidence</span> to
                  capture your first.
                </>
              )}
            </p>
          </div>
        ) : view === "map" ? (
          <div>
            {locatedCount === 0 ? (
              <div className="bg-white border border-field-wheat rounded-xl p-6 text-center mb-3">
                <p className="text-field-ink/70 text-sm">
                  {entries.length === 0
                    ? "No synced entries to map yet."
                    : `None of these ${entries.length} entries has a location to map.`}
                </p>
              </div>
            ) : (
              <FieldLogMap
                entries={entries}
                center={propertyCenter}
                propertyName={propertyName}
                propertyId={id}
                height={460}
              />
            )}

            {legend.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                {legend.map((g) => (
                  <span
                    key={g.category}
                    className="inline-flex items-center gap-1.5 text-xs text-field-earth"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: g.color }}
                    />
                    {g.label}{" "}
                    <span className="text-field-ink/40">({g.entries.length})</span>
                  </span>
                ))}
              </div>
            )}

            {locatedCount < entries.length && (
              <p className="text-[11px] text-field-ink/50 mt-2">
                {entries.length - locatedCount} of {entries.length} entries have
                no location and aren&apos;t shown on the map.
              </p>
            )}
            {visibleQueued.length > 0 && (
              <p className="text-[11px] text-field-ink/50 mt-2">
                {visibleQueued.length} pending{" "}
                {visibleQueued.length === 1 ? "entry is" : "entries are"} waiting
                to sync and not on the map yet.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {visibleQueued.length > 0 && (
              <ul className="space-y-3">
                {visibleQueued.map((q) => {
                  const cat = q.payload.practiceCategory as PracticeCategory;
                  const note = (q.payload.note as string | null) || null;
                  return (
                    <li
                      key={q.localId}
                      className="flex gap-3 bg-field-gold/5 border border-field-gold/40 rounded-xl p-3"
                    >
                      <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-field-mist">
                        {queuedUrls[q.localId] ? (
                          <Image
                            src={queuedUrls[q.localId]}
                            alt={practiceCategoryLabel(cat)}
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
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-field-ink truncate">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor: PRACTICE_CATEGORY_COLORS[cat],
                            }}
                          />
                          {practiceCategoryLabel(cat)}
                        </p>
                        {note && (
                          <p className="text-xs text-field-ink/70 truncate">
                            {note}
                          </p>
                        )}
                        <p className="mt-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-field-gold/20 text-field-earth">
                            <span className="h-1.5 w-1.5 rounded-full bg-field-gold" />
                            Pending sync
                          </span>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <ul className="space-y-3">
              {entries.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/properties/${id}/field-log/${e.id}`}
                  className="flex gap-3 bg-white border border-field-wheat rounded-xl p-3 hover:border-field-forest/40 transition"
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
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-field-ink truncate">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            PRACTICE_CATEGORY_COLORS[e.practiceCategory],
                        }}
                      />
                      {practiceCategoryLabel(e.practiceCategory)}
                    </p>
                    {e.note && (
                      <p className="text-xs text-field-ink/70 truncate">
                        {e.note}
                      </p>
                    )}
                    <p className="text-[11px] text-field-ink/50 mt-1">
                      {formatDate(e.capturedAt || e.createdAt)}
                      {e.gpsSource
                        ? ` · ${GPS_SOURCE_LABELS[e.gpsSource as GpsSource]}`
                        : " · No location"}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

const dateInputCls =
  "px-3 py-2 bg-field-cream border border-field-wheat rounded-lg text-sm text-field-ink focus:outline-none focus:ring-2 focus:ring-field-forest/40";

function FilterChip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition " +
        (active
          ? "bg-field-forest text-white border-field-forest"
          : "bg-white text-field-earth border-field-wheat hover:bg-field-mist")
      }
    >
      {color && (
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: active ? "#fff" : color }}
        />
      )}
      {children}
    </button>
  );
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
function ymd(y: number, m: number, d: number): string {
  return `${y}-${pad(m)}-${pad(d)}`;
}

// Date-only input (local) → inclusive ISO bounds for the captured_at filter.
function dayStartISO(d: string): string {
  return new Date(`${d}T00:00:00`).toISOString();
}
function dayEndISO(d: string): string {
  return new Date(`${d}T23:59:59.999`).toISOString();
}

// Shortcuts tied to the 1-d-1 reporting calendar: a report is filed by April 30
// for the prior calendar year, and Q4 is a common end-of-year activity window.
function reportingPresets() {
  const now = new Date();
  const y = now.getFullYear();
  return [
    { key: "this-year", label: `This year (${y})`, from: ymd(y, 1, 1), to: ymd(y, 12, 31) },
    {
      key: "last-year",
      label: `Last year (${y - 1})`,
      from: ymd(y - 1, 1, 1),
      to: ymd(y - 1, 12, 31),
    },
    { key: "q4", label: `Q4 (Oct–Dec ${y})`, from: ymd(y, 10, 1), to: ymd(y, 12, 31) },
  ];
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
