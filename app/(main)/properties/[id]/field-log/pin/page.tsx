"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import CensusLocationPicker from "@/components/census/CensusLocationPickerWrapper";
import { PRACTICE_CATEGORIES } from "@/lib/field-log";
import type { GpsSource, PracticeCategory } from "@/lib/types";
import {
  GPS_SOURCE_LABELS,
  compressImage,
  maybeConvertHeic,
  resolveDeviceLocation,
} from "@/lib/field-capture";

type Coords = { lat: number; lng: number };

// Drop a pin (Session 3): log a wildlife-management activity that has nothing to
// photograph (filled feeders, ran a spotlight census, cleared cedar). The pitch
// is "log it before you forget, in five seconds" — so we grab the live location
// the moment this page mounts and keep the flow to category + Save.
export default function DropPinPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [propertyCenter, setPropertyCenter] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);

  // Location state. Starts from the live device fix; flips to manual_pin the
  // moment the user nudges the marker.
  const [pin, setPin] = useState<Coords | null>(null);
  const [gpsSource, setGpsSource] = useState<GpsSource | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);

  // Optional photo — reuses the Session 2 conversion + compression pipeline.
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [heicUnconverted, setHeicUnconverted] = useState(false);

  // Form fields.
  const [category, setCategory] = useState<PracticeCategory | "">("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Grab the live fix immediately on mount — it's the whole point of "drop a
  // pin." Fetch the property center in parallel as a map fallback.
  useEffect(() => {
    let cancelled = false;

    resolveDeviceLocation().then((device) => {
      if (cancelled) return;
      if (device) {
        setPin({ lat: device.lat, lng: device.lng });
        setGpsSource("device_live");
        setAccuracyMeters(device.accuracyMeters);
      } else {
        setLocationDenied(true);
      }
      setLocating(false);
    });

    fetch(`/api/properties/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (cancelled) return;
        if (p?.coordinates?.lat && p?.coordinates?.lng) {
          setPropertyCenter({ lat: p.coordinates.lat, lng: p.coordinates.lng });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Revoke the object URL when it's replaced or the page unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // User nudged the marker (or dropped one on a denied/no-fix map) — record that
  // honestly as the source.
  function handlePinChange(coords: Coords | null) {
    setPin(coords);
    if (coords) {
      setGpsSource("manual_pin");
      setAccuracyMeters(null);
    } else {
      setGpsSource(null);
    }
  }

  async function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setHeicUnconverted(false);
    try {
      // The pin already carries the live location, so we don't read EXIF for
      // coordinates here — just normalize the image for Storage.
      const heic = await maybeConvertHeic(file);
      const compressed = await compressImage(heic.file);
      setHeicUnconverted(heic.failed);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPhotoFile(compressed);
      setPreviewUrl(URL.createObjectURL(compressed));
    } catch {
      setError("Could not process that photo. You can still save without it.");
    }
  }

  function removePhoto() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhotoFile(null);
    setPreviewUrl(null);
    setHeicUnconverted(false);
  }

  async function handleSave() {
    if (!category) {
      setError("Pick a management practice so this maps to an auditor-recognized category.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        entryType: "pin_activity",
        practiceCategory: category,
        note: note || null,
        latitude: pin?.lat ?? null,
        longitude: pin?.lng ?? null,
        // Accuracy is only meaningful for a live device fix.
        gpsAccuracyMeters: gpsSource === "device_live" ? accuracyMeters : null,
        gpsSource: pin ? gpsSource : null,
        capturedAt: new Date().toISOString(),
      };

      const form = new FormData();
      form.append("payload", JSON.stringify(payload));
      if (photoFile) form.append("photo", photoFile, photoFile.name);

      const r = await fetch(`/api/properties/${id}/field-log`, {
        method: "POST",
        body: form,
      });
      if (!r.ok) {
        throw new Error((await r.json()).error || "Failed to save");
      }
      router.push(`/properties/${id}/field-log`);
    } catch (err: any) {
      setError(err?.message || "Failed to save");
      setSubmitting(false);
    }
  }

  const mapCenter = pin ?? propertyCenter;

  return (
    <div className="min-h-full bg-field-cream">
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="mb-5">
          <Link
            href={`/properties/${id}/field-log`}
            className="text-sm text-field-forest hover:underline"
          >
            ← Back to field log
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-field-ink mb-1">Drop a pin</h1>
        <p className="text-sm text-field-earth mb-6">
          Log a wildlife-management activity right where you&apos;re standing —
          no photo needed. We&apos;ll capture the location and time.
        </p>

        {/* Hidden camera/library input for the optional photo. */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoSelected}
          className="hidden"
        />

        <div className="space-y-5">
          {/* Soft-fail notices — never block the save. */}
          {locationDenied && (
            <Notice>
              Live location wasn&apos;t available (permission denied or no fix).
              Tap the map below to drop a pin, or save without one.
            </Notice>
          )}
          {heicUnconverted && (
            <Notice>
              This looks like an iPhone HEIC photo we couldn&apos;t convert in the
              browser. It&apos;ll be uploaded as-is for server-side handling.
            </Notice>
          )}

          <section className="bg-white border border-field-wheat rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-field-ink text-sm">Location</h2>
              <LocationBadge source={pin ? gpsSource : null} />
            </div>

            {locating ? (
              <div className="h-[320px] w-full flex flex-col items-center justify-center bg-field-mist rounded-lg border border-field-wheat">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-field-forest mb-2" />
                <p className="text-field-ink/60 text-xs">Getting your location…</p>
              </div>
            ) : mapCenter ? (
              <CensusLocationPicker
                propertyCenter={propertyCenter}
                mapCenter={mapCenter}
                value={pin}
                onChange={handlePinChange}
              />
            ) : (
              <div className="h-[200px] w-full flex items-center justify-center bg-field-mist rounded-lg border border-field-wheat text-center px-4">
                <p className="text-field-ink/60 text-xs">
                  No location yet and this property has no saved center. You can
                  still save — the entry will be marked as having no coordinates.
                </p>
              </div>
            )}

            {!locating && (
              <p className="text-xs text-field-ink/60">
                {pin ? (
                  <>
                    {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
                    {gpsSource === "device_live" && accuracyMeters != null
                      ? ` · ±${Math.round(accuracyMeters)} m`
                      : ""}
                    {" — tap or drag the marker to correct it."}
                  </>
                ) : (
                  "Tap the map to drop a pin, or save without a location."
                )}
              </p>
            )}
          </section>

          <section className="bg-white border border-field-wheat rounded-xl p-4 space-y-3">
            <label className="block">
              <span className="block text-xs font-medium text-field-ink/70 mb-1">
                Management practice *
              </span>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as PracticeCategory | "")
                }
                className={inputCls}
              >
                <option value="">— Select a practice —</option>
                {PRACTICE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-field-ink/70 mb-1">
                Note
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className={inputCls}
                placeholder="What did you do? e.g. Filled the north protein feeders."
              />
            </label>
          </section>

          {/* Optional photo — same capture component as Log photo evidence. */}
          <section className="bg-white border border-field-wheat rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-field-ink text-sm">
                Photo <span className="font-normal text-field-ink/50">(optional)</span>
              </h2>
            </div>

            {previewUrl ? (
              <div className="flex items-center gap-3">
                <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden border border-field-wheat bg-field-mist">
                  <Image
                    src={previewUrl}
                    alt="Attached photo"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="flex gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-field-forest font-medium hover:underline"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="text-field-terra font-medium hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border border-dashed border-field-wheat text-field-earth text-sm font-medium rounded-lg hover:bg-field-mist"
              >
                📷 Add a photo
              </button>
            )}
          </section>

          {error && (
            <div className="bg-white border border-field-terra/30 text-field-terra rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={submitting || locating}
            className="w-full px-5 py-3 bg-field-forest text-white font-semibold rounded-xl hover:bg-field-forest/90 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save activity"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 bg-field-cream border border-field-wheat rounded-lg text-sm text-field-ink focus:outline-none focus:ring-2 focus:ring-field-forest/40";

function LocationBadge({ source }: { source: GpsSource | null }) {
  const label = source ? GPS_SOURCE_LABELS[source] : "No location";
  const tone =
    source === "device_live"
      ? "bg-field-forest/10 text-field-forest"
      : source
        ? "bg-field-gold/15 text-field-earth"
        : "bg-field-wheat/40 text-field-earth";
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${tone}`}>
      {label}
    </span>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-field-gold/10 border border-field-gold/40 text-field-earth rounded-lg p-3 text-xs leading-relaxed">
      {children}
    </div>
  );
}
