/**
 * Make an exhibit file embeddable: photos shrunk to at most 1600 px on the
 * long side as JPEG (EXIF orientation applied, metadata dropped — sharp's
 * default), PDFs passed through whole. Pure — no storage access — so the
 * render sample can use it without a database.
 */

import sharp from "sharp";
import type { ExhibitImage } from "./render";

const MAX_EDGE = 1600;

const isPdf = (b: Uint8Array) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46; // %PDF

/** Shrink and normalise a photo for embedding. Null if it cannot be decoded. */
export async function prepareImage(bytes: Uint8Array): Promise<ExhibitImage | null> {
  if (isPdf(bytes)) return { bytes, type: "pdf" };
  try {
    const out = await sharp(bytes, { failOn: "none" })
      .rotate()
      .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
    return { bytes: new Uint8Array(out), type: "jpg" };
  } catch {
    return null;
  }
}
