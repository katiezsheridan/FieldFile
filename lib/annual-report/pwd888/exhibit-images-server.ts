/**
 * Load Part V exhibits for the PWD-888 render. Server only — reads the private
 * `field-log` bucket with the service-role key, so the caller must already
 * have authorized the property.
 *
 * Photos are re-encoded before embedding: uploaded documents run to 3-20 MB
 * each straight off a phone, and twenty of those make a report too slow to
 * build and too big to email. Each becomes a JPEG at most 1600 px on its long
 * side — still legible full-page — with EXIF orientation applied and all
 * metadata dropped (sharp's default). A PDF receipt is passed through whole
 * and its pages are drawn onto the exhibit. Anything sharp cannot decode (an
 * iPhone HEIC uploaded outside the field-log flow) returns null, and the
 * exhibit page says the file is kept in the landowner's records.
 */

import { createClient } from "@supabase/supabase-js";
import { BUCKET as FIELD_LOG_BUCKET } from "@/lib/field-log-server";
import { prepareImage } from "@/lib/forms/pwd888/prepare-image";
import type { ExhibitImage } from "@/lib/forms/pwd888/render";
import type { Pwd888Exhibit } from "./types";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DOCUMENTS_BUCKET = "documents";

export async function loadExhibitImage(x: Pwd888Exhibit): Promise<ExhibitImage | null> {
  if (!x.storagePath || x.docType === "note") return null;
  const bucket = x.kind === "field_log" ? FIELD_LOG_BUCKET : DOCUMENTS_BUCKET;
  const { data, error } = await db.storage.from(bucket).download(x.storagePath);
  if (error || !data) return null;
  return prepareImage(new Uint8Array(await data.arrayBuffer()));
}
