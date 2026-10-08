/**
 * Report every PWD-888 catalog field the layout cannot place on the form.
 *
 *   npx tsx scripts/pwd888-layout-check.ts
 *
 * Exits non-zero when anything is unresolved, so a catalog or template change
 * that breaks an anchor is caught before it silently drops a value.
 */
import { PDFDocument, StandardFonts } from "pdf-lib";
import { SUB_ACTIVITY_DEFS } from "../lib/sub-activities";
import { resolveSubActivity } from "../lib/forms/pwd888/anchors";
import { NO_HEADING } from "../lib/forms/pwd888/layout";

async function main() {
  const doc = await PDFDocument.create();
  const times = await doc.embedFont(StandardFonts.TimesRoman);
  const measure = (t: string, size: number) => {
    try { return times.widthOfTextAtSize(t, size); } catch { return t.length * size * 0.5; }
  };
  let missing = 0;
  let placed = 0;
  for (const sub of SUB_ACTIVITY_DEFS) {
    const r = resolveSubActivity(sub, measure);
    if (!r.heading && !NO_HEADING.has(sub.code)) { console.log(`✗ ${sub.code} heading "${sub.name}"`); missing++; continue; }
    for (const m of r.unresolved) { console.log(`✗ ${sub.code} ${m}`); missing++; }
    // Two fields (or two options) on one spot means one of them is misplaced.
    const seen = new Map<string, string>();
    const claim = (where: { page: number; x: number; y: number }, who: string) => {
      const k = `${where.page}:${where.x.toFixed(0)}:${where.y.toFixed(0)}`;
      if (seen.has(k)) { console.log(`✗ ${sub.code} ${who} shares a spot with ${seen.get(k)}`); missing++; }
      else seen.set(k, who);
    };
    for (const [key, a] of Object.entries(r.fields)) {
      if (a.kind === "blank") claim(a.blank, key);
      if (a.kind === "boxes") for (const [c, b] of Object.entries(a.boxes)) claim(b, `${key}="${c}"`);
      if (a.kind === "yesno") { claim(a.yes, `${key}=yes`); claim(a.no, `${key}=no`); }
      if (a.kind === "flag") claim(a.box, key);
    }
    placed += r.placed;
  }
  console.log(`\n${placed} anchors placed, ${missing} unresolved`);
  process.exit(missing ? 1 : 0);
}
main();
