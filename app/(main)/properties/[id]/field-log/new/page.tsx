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
  readPhotoExif,
  resolveDeviceLocation,
  resolveLocation,
} from "@/lib/field-capture";

type Phase = "choose" | "preparing" | "confirm";
type Coords = { lat: number; lng: number };

export default function NewFieldPhotoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("choose");
  const [error, setError] = useState<string | null>(null);

  const [propertyCenter, setPropertyCenter] = useState<Coords | null>(null);

  // Capture state, populated once a photo is processed.
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pin, setPin] = useState<Coords | null>(null);
  const [gpsSource, setGpsSource] = useState<GpsSource | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [capturedAt, setCapturedAt] = useState<string>("");
  const [locationDenied, setLocationDenied] = useState(false);
  const [heicUnconverted, setHeicUnconverted] = useState(false);

  // Form fields on the confirm screen.
  const [category, setCategory] = useState<PracticeCategory | "">("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (p?.coordinates?.lat && p?.coordinates?.lng) {
          setPropertyCenter({ lat: p.coordinates.lat, lng: p.coordinates.lng });
        }
      })
      .catch(() => {});
  }, [id]);

  // Revoke the object URL when it's replaced or the page unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Allow re-selecting the same file later.
    e.target.value = "";
    if (!file) return;

    setError(null);
    setLocationDenied(false);
    setHeicUnconverted(false);
    setPhase("preparing");

    try {
      // Kick off live location immediately — it's the primary source and can
      // run while we process the image bytes.
      const locationPromise = resolveDeviceLocation();

      // Read EXIF from the ORIGINAL file, before HEIC-conversion or compression
      // wipe the metadata.
      const exif = await readPhotoExif(file);
      const heic = await maybeConvertHeic(file);
      const compressed = await compressImage(heic.file);

      const device = await locationPromise;
      const resolved = resolveLocation(device, exif);

      setLocationDenied(device === null);
      setHeicUnconverted(heic.failed);

      setPhotoFile(compressed);
      const url = URL.createObjectURL(compressed);
      setPreviewUrl(url);

      setPin(resolved ? { lat: resolved.lat, lng: resolved.lng } : null);
      setGpsSource(resolved?.source ?? null);
      setAccuracyMeters(resolved?.accuracyMeters ?? null);
      setCapturedAt(exif.capturedAt ?? new Date().toISOString());

      setPhase("confirm");
    } catch (err: any) {
      setError(err?.message || "Could not process that photo. Please try again.");
      setPhase("choose");
    }
  }

  // User corrected the pin by hand — record that honestly as the source.
  function handlePinChange(coords: Coords | null) {
    setPin(coords);
    if (coords) {
      setGpsSource("manual_pin");
      setAccuracyMeters(null);
    } else {
      setGpsSource(null);
    }
  }

  async function handleSave() {
    if (!photoFile) return;
    if (!category) {
      setError("Pick a management practice so this maps to an auditor-recognized category.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        entryType: "photo_evidence",
        practiceCategory: category,
        note: note || null,
        latitude: pin?.lat ?? null,
        longitude: pin?.lng ?? null,
        // Accuracy is only meaningful for a live device fix.
        gpsAccuracyMeters: gpsSource === "device_live" ? accuracyMeters : null,
        gpsSource: pin ? gpsSource : null,
        capturedAt,
      };

      const form = new FormData();
      form.append("payload", JSON.stringify(payload));
      form.append("photo", photoFile, photoFile.name);

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

        <h1 className="text-2xl font-bold text-field-ink mb-1">
          Log photo evidence
        </h1>
        <p className="text-sm text-field-earth mb-6">
          Snap a photo of a wildlife-management practice. We&apos;ll capture the
          location and time as audit-ready evidence.
        </p>

        {/* Hidden camera/library input — rear camera on mobile, library elsewhere. */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelected}
          className="hidden"
        />

        {phase === "choose" && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-6 bg-field-forest text-white text-lg font-semibold rounded-2xl hover:bg-field-forest/90 active:scale-[0.99] transition shadow-sm"
          >
            📷 Take or choose a photo
          </button>
        )}

        {phase === "preparing" && (
          <div className="w-full py-12 flex flex-col items-center justify-center bg-white border border-field-wheat rounded-2xl">
            <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-field-forest mb-3" />
            <p className="text-field-ink/70 text-sm">
              Reading location &amp; preparing photo…
            </p>
          </div>
        )}

        {phase === "confirm" && previewUrl && (
          <div className="space-y-5">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-field-wheat bg-field-mist">
              <Image
                src={previewUrl}
                alt="Captured evidence"
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            {/* Soft-fail notices — never block the save. */}
            {locationDenied && (
              <Notice>
                Live location wasn&apos;t available (permission denied or no fix).
                {pin
                  ? " Using the photo’s own location instead — adjust the pin if it looks off."
                  : " Drop a pin on the map below to set the location, or save without one."}
              </Notice>
            )}
            {heicUnconverted && (
              <Notice>
                This looks like an iPhone HEIC photo we couldn&apos;t convert in
                the browser. It&apos;ll be uploaded as-is for server-side
                handling.
              </Notice>
            )}

            <section className="bg-white border border-field-wheat rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-field-ink text-sm">Location</h2>
                <LocationBadge source={pin ? gpsSource : null} />
              </div>

              {mapCenter ? (
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
                  placeholder="What does this document? e.g. Refilled north protein feeder."
                />
              </label>

              <p className="text-xs text-field-ink/60">
                Captured {formatCapturedAt(capturedAt)}
              </p>
            </section>

            {error && (
              <div className="bg-white border border-field-terra/30 text-field-terra rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={submitting}
                className="flex-1 px-5 py-3 bg-field-forest text-white font-semibold rounded-xl hover:bg-field-forest/90 disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Save evidence"}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting}
                className="px-5 py-3 text-field-ink/70 font-medium rounded-xl hover:bg-field-mist disabled:opacity-60"
              >
                Retake
              </button>
            </div>
          </div>
        )}

        {error && phase !== "confirm" && (
          <div className="mt-4 bg-white border border-field-terra/30 text-field-terra rounded-lg p-3 text-sm">
            {error}
          </div>
        )}
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

function formatCapturedAt(iso: string): string {
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
