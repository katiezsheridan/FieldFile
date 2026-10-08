/**
 * Extract every positioned text item from templates/pwd_888.pdf into
 * lib/forms/pwd888/text-positions.json — the anchors the PWD-888 render
 * draws against (see lib/forms/pwd888/layout.ts).
 *
 * Run only when TPWD revises the form. pdfjs-dist is deliberately NOT a
 * project dependency; run this from a scratch directory that has it:
 *
 *   mkdir /tmp/pdfx && cd /tmp/pdfx && npm init -y && npm i pdfjs-dist@4.10.38
 *   cp <repo>/scripts/extract-pwd888-positions.mjs . && \
 *     node extract-pwd888-positions.mjs <repo>/templates/pwd_888.pdf out.json
 *
 * then drop the footer items and copy out.json over text-positions.json.
 * Coordinates are PDF points, origin bottom-left; `h` is the font size.
 */
import { readFileSync, writeFileSync } from "node:fs";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const data = new Uint8Array(readFileSync(process.argv[2]));
const doc = await pdfjs.getDocument({ data, useSystemFonts: false }).promise;
const out = [];
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const tc = await page.getTextContent();
  for (const it of tc.items) {
    if (!it.str || !it.str.trim()) continue;
    out.push({
      p,
      x: +it.transform[4].toFixed(1),
      y: +it.transform[5].toFixed(1),
      w: +it.width.toFixed(1),
      h: +it.height.toFixed(1),
      s: it.str,
    });
  }
}
writeFileSync(process.argv[3], JSON.stringify(out));
console.log(out.length, "items");
