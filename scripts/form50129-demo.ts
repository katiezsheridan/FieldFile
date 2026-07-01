/**
 * Throwaway demo: fill Form 50-129 with the Bark Springs LLC fixture and write
 * the output PDF. Proves the fill service end-to-end before any UI or data
 * plumbing exists (Session 1).
 *
 *   npx tsx scripts/form50129-demo.ts [outPath]
 *
 * Default output: scratch/form50129-demo.pdf (unsigned — the owner signs).
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fill50129 } from "../lib/forms/form50129/fill";
import { barkSpringsPayload } from "./form50129-fixture";

async function main() {
  const outPath =
    process.argv[2] ?? path.join("scratch", "form50129-demo.pdf");
  const bytes = await fill50129(barkSpringsPayload, { flatten: false });
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, bytes);
  console.log(
    `Filled Form 50-129 (${bytes.length} bytes) written to ${outPath}`,
  );
  console.log("Owner block, tax year, district, acres, legal description,");
  console.log("3 wildlife practices and 'has WMP = Yes' are populated.");
  console.log("Signature and certification Date left blank by design.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
