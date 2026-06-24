// Client-side helpers for the mobile field-logging capture flow (Session 2).
//
// The hybrid GPS strategy that makes this robust in the field:
//   1. Live device location is PRIMARY. iOS strips GPS EXIF from photos taken
//      through a browser camera input, so a freshly-snapped photo usually has
//      NO coordinates — but the Geolocation API does.
//   2. Photo EXIF is the FALLBACK + cross-check. Library uploads usually keep
//      their GPS EXIF, so an uploaded photo often does carry coordinates.
//   3. Manual pin is the LAST resort.
//
// Two ordering rules baked in here:
//   - Read EXIF BEFORE compressing — compression wipes metadata.
//   - Prefer EXIF DateTimeOriginal for the capture time so an old photo
//     uploaded weeks later logs with its true date.
//
// exifr and heic2any are browser-only and dynamically imported so they never
// run during SSR and stay out of the main bundle.

import type { GpsSource } from "@/lib/types";

export type DeviceLocation = {
  lat: number;
  lng: number;
  accuracyMeters: number | null;
};

export type ExifResult = {
  lat: number | null;
  lng: number | null;
  capturedAt: string | null; // ISO, from DateTimeOriginal
};

export type ResolvedLocation = {
  lat: number;
  lng: number;
  accuracyMeters: number | null;
  source: GpsSource;
};

/**
 * Ask the browser for the current high-accuracy position. Resolves to null
 * instead of throwing on denial / timeout / unsupported — a missing coordinate
 * must never block the user from saving.
 */
export function resolveDeviceLocation(
  timeoutMs = 12000
): Promise<DeviceLocation | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyMeters:
            typeof pos.coords.accuracy === "number" ? pos.coords.accuracy : null,
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 }
    );
  });
}

/**
 * Parse GPS + DateTimeOriginal from the image's EXIF. Must be called on the
 * ORIGINAL file, before any compression. Returns nulls (never throws) when
 * there's no EXIF, which is the common case for browser-camera captures.
 */
export async function readPhotoExif(file: File): Promise<ExifResult> {
  const empty: ExifResult = { lat: null, lng: null, capturedAt: null };
  try {
    const exifr = (await import("exifr")).default;
    // gps:true pulls latitude/longitude; pick DateTimeOriginal for capture time.
    const data = await exifr.parse(file, {
      gps: true,
      pick: ["DateTimeOriginal", "latitude", "longitude"],
    });
    if (!data) return empty;

    const lat = typeof data.latitude === "number" ? data.latitude : null;
    const lng = typeof data.longitude === "number" ? data.longitude : null;

    let capturedAt: string | null = null;
    const dto = data.DateTimeOriginal;
    if (dto instanceof Date && !Number.isNaN(dto.getTime())) {
      capturedAt = dto.toISOString();
    }
    return { lat, lng, capturedAt };
  } catch {
    return empty;
  }
}

const HEIC_RE = /\.(heic|heif)$/i;

/** True when the browser handed us a HEIC/HEIF file an <img>/canvas can't read. */
export function isHeic(file: File): boolean {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    HEIC_RE.test(file.name)
  );
}

/**
 * Convert an iPhone HEIC/HEIF to JPEG so the canvas can downscale it. EXIF must
 * already have been read from the original — conversion drops metadata. On any
 * failure we return the original file and let the caller flag it for
 * server-side handling rather than losing the user's capture.
 */
export async function maybeConvertHeic(
  file: File
): Promise<{ file: File; converted: boolean; failed: boolean }> {
  if (!isHeic(file)) return { file, converted: false, failed: false };
  try {
    const heic2any = (await import("heic2any")).default;
    const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
    const blob = Array.isArray(out) ? out[0] : out;
    const jpeg = new File(
      [blob],
      file.name.replace(HEIC_RE, ".jpg"),
      { type: "image/jpeg" }
    );
    return { file: jpeg, converted: true, failed: false };
  } catch {
    return { file, converted: false, failed: true };
  }
}

/**
 * Downscale to long-edge `maxEdge` and re-encode as JPEG to keep Storage and
 * field-data usage down. Call AFTER reading EXIF. Falls back to the input file
 * if the browser can't decode it (e.g. an unconverted HEIC).
 */
export async function compressImage(
  file: File,
  maxEdge = 2000,
  quality = 0.8
): Promise<File> {
  try {
    const bitmap = await loadBitmap(file);
    const { width, height } = bitmap;
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap as CanvasImageSource, 0, 0, w, h);
    if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

// Prefer createImageBitmap (fast, off-DOM); fall back to an <img> element.
async function loadBitmap(
  file: File
): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to <img>
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("decode failed"));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Apply the priority order — device_live > photo_exif > manual_pin — to whatever
 * we managed to capture. Returns null only when nothing is available (the user
 * can still drop a manual pin on the confirm screen).
 */
export function resolveLocation(
  device: DeviceLocation | null,
  exif: ExifResult
): ResolvedLocation | null {
  if (device) {
    return {
      lat: device.lat,
      lng: device.lng,
      accuracyMeters: device.accuracyMeters,
      source: "device_live",
    };
  }
  if (exif.lat != null && exif.lng != null) {
    return {
      lat: exif.lat,
      lng: exif.lng,
      accuracyMeters: null,
      source: "photo_exif",
    };
  }
  return null;
}

export const GPS_SOURCE_LABELS: Record<GpsSource, string> = {
  device_live: "Live device GPS",
  photo_exif: "From photo metadata",
  manual_pin: "Pinned manually",
};
