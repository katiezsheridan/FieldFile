/**
 * Where generated PWD-888 PDFs live: the same private `filings` bucket and
 * signed-URL helpers as the 50-129 (lib/forms/form50129/storage.ts). One
 * object per property + tax year; regenerating overwrites it.
 */

export { uploadFilingPdf as uploadReportPdf, signFilingPdf as signReportPdf } from "../form50129/storage";

/** Scoped by userId so a leaked path never reaches another user's object. */
export function reportPdfPath(userId: string, propertyId: string, taxYear: number): string {
  return `pwd888/${userId}/${propertyId}/${taxYear}.pdf`;
}
