/**
 * Load Part V exhibit photos for the PWD-888 render. Server only — reads the
 * private `field-log` bucket with the service-role key, so the caller must
 * already have authorized the property.
 *
 * pdf-lib embeds JPEG and PNG only. Anything else (a HEIC that slipped
 * through, a PDF receipt) returns null, and the exhibit page says the file is
 * kept in the landowner's records instead of showing it.
 */

import { createClient } from "@supabase/supabase-js";
import { BUCKET as FIELD_LOG_BUCKET } from "@/lib/field-log-server";
import type { ExhibitImage } from "@/lib/forms/pwd888/render";
import type { Pwd888Exhibit } from "./types";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DOCUMENTS_BUCKET = "documents";

function sniff(bytes: Uint8Array): ExhibitImage["type"] | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  return null;
}

export async function loadExhibitImage(x: Pwd888Exhibit): Promise<ExhibitImage | null> {
  if (!x.storagePath || x.docType === "note") return null;
  const bucket = x.kind === "field_log" ? FIELD_LOG_BUCKET : DOCUMENTS_BUCKET;
  const { data, error } = await db.storage.from(bucket).download(x.storagePath);
  if (error || !data) return null;
  const bytes = new Uint8Array(await data.arrayBuffer());
  const type = sniff(bytes);
  return type ? { bytes, type } : null;
}
