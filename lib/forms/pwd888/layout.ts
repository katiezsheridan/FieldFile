/**
 * Where things go on templates/pwd_888.pdf.
 *
 * The form has no AcroForm fields, so every mark is drawn at a coordinate. The
 * coordinates are not hand-measured: they are resolved from the form's own
 * printed text (text-positions.json, extracted by
 * scripts/extract-pwd888-positions.mjs). The form is regular enough for that —
 *
 *   * every checkbox is a "□" glyph printed immediately left of its label;
 *   * every blank is a run of underscores printed after its label.
 *
 * So a checkbox is found by its label and a blank by the text before it,
 * searched only inside the sub-activity's own band of the form so that
 * "Acres treated" under Brush Management never lands under Hay Meadow.
 *
 * Anchors that the catalog's wording does not reach automatically are named
 * explicitly in OVERRIDES. `scripts/pwd888-layout-check.ts` reports every
 * catalog field that resolves to nothing — keep that list empty, or each
 * entry deliberately routed to the continuation page.
 */

import positions from "./text-positions.json";
import { PRACTICE_DEFS, SUB_ACTIVITY_DEFS, type SubActivityDef } from "@/lib/sub-activities";

export type TextItem = { p: number; x: number; y: number; w: number; h: number; s: string };

/** Width of `text` in the form's own font at `size`. Supplied by the renderer. */
export type Measure = (text: string, size: number) => number;

export type Box = { page: number; x: number; y: number; size: number };
export type Blank = { page: number; x: number; y: number; width: number };

const ITEMS = positions as TextItem[];
const BOX = "□";

/** Reading order: page, then top to bottom, then left to right. */
const order = (a: TextItem, b: TextItem) =>
  a.p - b.p || b.y - a.y || a.x - b.x;
const SORTED = [...ITEMS].sort(order);

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

const sameLine = (a: TextItem, b: TextItem) => a.p === b.p && Math.abs(a.y - b.y) < 2;

// ---------------------------------------------------------------------------
// Bands: the stretch of the form each sub-activity owns
// ---------------------------------------------------------------------------

/** Indexes into the sorted items, [from, to). `heading` is skipped by option lookups. */
export type Band = { from: number; to: number; heading?: number };

/** The checkbox item that heads a line whose text starts with `label`. */
function headingIndex(label: string, after: number): number {
  const want = norm(label).slice(0, 18);
  for (let i = after; i < SORTED.length - 1; i++) {
    const t = SORTED[i];
    const next = SORTED[i + 1];
    if (t.s === BOX && sameLine(t, next) && norm(next.s).startsWith(want)) return i;
  }
  return -1;
}

/**
 * The printed heading for each sub-activity, where the catalog name differs
 * from what the form prints at the start of that line.
 */
const HEADING_TEXT: Record<string, string> = {
  "HC-03": "Range Enhancement",
  "HC-04": "Brush Management",
  "HC-06": "Riparian management",
  "HC-07": "Wetland enhancement",
  "HC-08": "Habitat Protection",
  "HC-09": "Prescribed Control",
  "EC-04": "Herbaceous and/or woody",
  "EC-05": "Dike/Levee",
  "PC-02": "control of cowbirds",
  "PC-03": "grackle/starling",
  "SW-01": "Marsh/Wetland",
  "SW-02": "Well/trough/windmill",
  "SW-03": "Spring development",
  "SF-05": "Feeders and mineral",
  "SF-06": "Managing tame pasture",
  "SF-07": "Transition management",
  "SH-01": "Nest boxes",
  "SH-02": "Brush piles",
  "SH-04": "Hay meadow",
  "SH-05": "Half-cutting",
  "SH-06": "Woody plant/shrub",
  "SH-07": "Natural cavity",
  "CE-02": "Standardized incidental",
  "CE-03": "Stand counts",
  "CE-06": "Daylight deer herd",
  "CE-07": "Harvest data",
  "CE-08": "Browse utilization",
  "CE-09": "Census of endangered",
  "CE-10": "Census and monitoring",
  "CE-11": "Miscellaneous counts",
};

const headingLabel = (sub: SubActivityDef) => HEADING_TEXT[sub.code] ?? sub.name;

/**
 * Sub-activities the form prints without a checkbox of their own. PC-04
 * ("mammal and other predator control") is just its row of species boxes
 * starting at "Coyotes" — the band starts there, but nothing is ticked as a
 * heading; the species boxes say it.
 */
export const NO_HEADING = new Set(["PC-04"]);
HEADING_TEXT["PC-04"] = "Coyotes";

/** Heading index per sub-activity, in form order; -1 where not found. */
export const HEADINGS: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let cursor = 0;
  const ordered = [...SUB_ACTIVITY_DEFS].sort((a, b) => {
    const s = (x: SubActivityDef) =>
      PRACTICE_DEFS.find((p) => p.code === x.practiceCode)!.formSectionNumber * 100 + x.sortOrder;
    return s(a) - s(b);
  });
  for (const sub of ordered) {
    const i = headingIndex(headingLabel(sub), cursor);
    out[sub.code] = i;
    if (i >= 0) cursor = i + 1;
  }
  return out;
})();

export function bandOf(code: string): Band | null {
  const from = HEADINGS[code];
  if (from === undefined || from < 0) return null;
  const later = Object.values(HEADINGS).filter((i) => i > from);
  // A practice header ("2. EROSION CONTROL") also ends a band.
  const practiceHeader = SORTED.findIndex((t, i) => i > from && /^\d\.\s+[A-Z ]+$/.test(t.s.trim()));
  const candidates = [...later, practiceHeader > 0 ? practiceHeader : SORTED.length];
  return { from, to: Math.min(...candidates), heading: NO_HEADING.has(code) ? undefined : from };
}

// ---------------------------------------------------------------------------
// Resolvers
// ---------------------------------------------------------------------------

/** The heading checkbox of a sub-activity. */
export function headingBox(code: string): Box | null {
  if (NO_HEADING.has(code)) return null;
  const i = HEADINGS[code];
  if (i === undefined || i < 0) return null;
  const t = SORTED[i];
  return { page: t.p, x: t.x, y: t.y, size: t.w };
}

function itemsIn(band: Band): { item: TextItem; index: number }[] {
  const out = [];
  for (let i = band.from; i < band.to; i++) out.push({ item: SORTED[i], index: i });
  return out;
}

/** The checkbox printed immediately left of an item, on the same line. */
function boxBefore(index: number): Box | null {
  const t = SORTED[index];
  const prev = SORTED[index - 1];
  if (prev && prev.s === BOX && sameLine(prev, t) && t.x - prev.x < 30) {
    return { page: prev.p, x: prev.x, y: prev.y, size: prev.w };
  }
  return null;
}

/**
 * The checkbox for the option labelled `label` inside `band`. `nth` picks
 * among repeats (the second "Yes" on a line). The heading line is skipped so
 * an option never resolves to the sub-activity's own box.
 */
export function optionBox(band: Band, label: string, nth = 0, onLineOf?: TextItem): Box | null {
  const want = norm(label);
  let seen = 0;
  for (const { item, index } of itemsIn(band)) {
    if (index === band.heading || index === (band.heading ?? -2) + 1 || item.s === BOX) continue;
    if (onLineOf && !sameLine(item, onLineOf)) continue;
    // "No. If not, state when:" is the "No" box: the label may run on, but
    // only past a word boundary.
    const got = norm(item.s);
    if (got.startsWith(want) && !/[a-z0-9]/.test(got.charAt(want.length))) {
      const box = boxBefore(index);
      if (box && seen++ === nth) return box;
    }
  }
  return null;
}

/** The first item in the band whose text contains `label`. */
export function findItem(band: Band, label: string): TextItem | null {
  const want = norm(label);
  for (const { item } of itemsIn(band)) if (norm(item.s).includes(want)) return item;
  return null;
}

/**
 * The underscore run following `label` inside the band. Returns where it
 * starts and how wide it is, measured in the form's font so the value lands on
 * the line, not over the label. `boxed` is the checkbox at the start of the
 * same item, if any (e.g. "□ drill new well depth: ____").
 */
export function blankAfter(
  band: Band,
  label: string,
  measure: Measure,
  nth = 0
): (Blank & { boxed: Box | null }) | null {
  const want = norm(label);
  let seen = 0;
  for (const { item, index } of itemsIn(band)) {
    const at = norm(item.s).indexOf(want);
    if (at === -1) continue;
    if (seen++ < nth) continue;
    // Map the normalised index back onto the raw string (normalisation only
    // collapses whitespace, so walk both in step).
    const raw = item.s;
    let r = 0;
    let n = 0;
    while (n < at + want.length && r < raw.length) {
      if (/\s/.test(raw[r]) && /\s/.test(raw[r + 1] ?? "")) { r++; continue; }
      r++; n++;
    }
    const runStart = raw.indexOf("_", r);
    let runItem = item;
    let start = runStart;
    if (runStart === -1) {
      // The blank is a separate item on the same line ("Majority County:" / "____").
      const next = SORTED[index + 1];
      if (!next || !sameLine(next, item) || !/^_+$/.test(next.s.trim())) continue;
      runItem = next;
      start = next.s.indexOf("_");
    }
    const runEnd = (() => {
      let e = start;
      while (runItem.s[e] === "_" || runItem.s[e] === "\\") e++;
      return e;
    })();
    const scale = runItem.w / Math.max(1, measure(runItem.s, runItem.h));
    const x = runItem.x + measure(runItem.s.slice(0, start), runItem.h) * scale;
    const width = measure(runItem.s.slice(start, runEnd), runItem.h) * scale;
    return { page: runItem.p, x, y: runItem.y, width, boxed: boxBefore(index) };
  }
  return null;
}

/** All items on a page — for Part I-III, which have no bands. */
export function pageBand(page: number): Band {
  const from = SORTED.findIndex((t) => t.p === page);
  let to = from;
  while (to < SORTED.length && SORTED[to].p === page) to++;
  return { from, to };
}

export const PAGE_COUNT = Math.max(...ITEMS.map((t) => t.p));
