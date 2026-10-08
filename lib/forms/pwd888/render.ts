/**
 * Render the PWD-888 annual report onto the real TPWD form.
 *
 * Server-only, otherwise pure: takes the assembled payload and an image loader
 * and returns PDF bytes. FieldFile produces a completed but UNSIGNED form —
 * the certification, signature and date on page 8 are never drawn on.
 *
 * The form has no AcroForm fields, so values are drawn at coordinates resolved
 * from the form's own printed text (layout.ts, anchors.ts). Anything that will
 * not fit its blank, or that the form prints no blank for, goes on a
 * continuation page — the form itself says "Use additional pages if
 * necessary" — with a pointer left in the blank. Nothing is dropped.
 *
 * After the form: continuation page(s), then one page per Part V exhibit.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, degrees, type PDFFont, type PDFPage } from "pdf-lib";
import { PRACTICE_DEF_BY_CODE, SUB_ACTIVITY_BY_CODE } from "@/lib/sub-activities";
import type { Pwd888Exhibit, Pwd888Payload } from "@/lib/annual-report/pwd888/types";
import type { FieldValue, PracticeCode } from "@/lib/types";
import { resolveSubActivity, type FieldAnchor } from "./anchors";
import { blankAfter, optionBox, pageBand, type Blank, type Box, type Measure } from "./layout";

export const TEMPLATE_PATH = path.join(process.cwd(), "templates", "pwd_888.pdf");

export type ExhibitImage = { bytes: Uint8Array; type: "jpg" | "png" };

export type RenderOptions = {
  templateBytes?: Uint8Array;
  /** Fetch an exhibit's photo. Null when it cannot be loaded (it is then listed, not shown). */
  loadImage?: (exhibit: Pwd888Exhibit) => Promise<ExhibitImage | null>;
  /** Stamp every page DRAFT — used while blocking gaps remain. */
  draft?: { openItems: number } | null;
};

const INK = rgb(0.05, 0.15, 0.45); // a pen-blue, so filled values read as entries, not print
const VALUE_SIZE = 9.5;
const MIN_SIZE = 6.5;

/** Part II boxes, by the wording page 1 prints beside each. */
const PART_II_LABEL: Record<PracticeCode, string> = {
  HC: "Habitat control",
  EC: "Erosion control",
  PC: "Predator control",
  SW: "Provide supplemental supplies of water",
  SF: "Provide supplemental supplies of food",
  SH: "Provide shelters",
  CE: "Making census counts",
};

// ---------------------------------------------------------------------------
// Value formatting
// ---------------------------------------------------------------------------

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const fmtDate = (iso: string) => `${iso.slice(5, 7)}/${iso.slice(8, 10)}/${iso.slice(0, 4)}`;

export function formatValue(v: FieldValue): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return ISO_DATE.test(v) ? fmtDate(v) : v;
  if (Array.isArray(v)) return v.map((x) => (ISO_DATE.test(x) ? fmtDate(x) : x)).join(", ");
  return [v.from, v.to].filter(Boolean).map((x) => fmtDate(x!)).join(" – ");
}

/** pdf-lib's standard fonts are WinAnsi; replace what they cannot encode. */
const safe = (s: string) =>
  s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[—]/g, "-").replace(/[^\x20-\x7E\xA0-\xFF–]/g, "?");

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

type Ctx = {
  doc: PDFDocument;
  pages: PDFPage[];
  font: PDFFont;
  bold: PDFFont;
  measure: Measure;
  /** Blank writes, merged per blank so two sub-activities sharing a line both show. */
  blanks: Map<string, { blank: Blank; texts: string[]; labels: string[] }>;
  ticks: Map<string, Box>;
  continuation: { ref: string; label: string; text: string }[];
};

function tick(ctx: Ctx, box: Box | null | undefined) {
  if (box) ctx.ticks.set(`${box.page}:${box.x}:${box.y}`, box);
}

/** `label` names the blank on the continuation page if the value overflows. */
function write(ctx: Ctx, blank: Blank | null | undefined, text: string, label: string) {
  if (!blank || !text) return;
  const k = `${blank.page}:${blank.x.toFixed(1)}:${blank.y}`;
  const entry = ctx.blanks.get(k) ?? { blank, texts: [], labels: [] };
  if (!entry.texts.includes(text)) entry.texts.push(text);
  if (!entry.labels.includes(label)) entry.labels.push(label);
  ctx.blanks.set(k, entry);
}

function drawTick(page: PDFPage, box: Box) {
  // The "□" glyph sits on the baseline; its square is ~0.62 of its advance.
  const s = box.size * 0.62;
  const x0 = box.x + box.size * 0.12;
  const y0 = box.y + box.size * 0.02;
  const opts = { thickness: 1.3, color: INK };
  page.drawLine({ start: { x: x0, y: y0 }, end: { x: x0 + s, y: y0 + s }, ...opts });
  page.drawLine({ start: { x: x0, y: y0 + s }, end: { x: x0 + s, y: y0 }, ...opts });
}

/** Draw `text` on a blank, shrinking to fit; past MIN_SIZE it is continued. */
function drawBlank(ctx: Ctx, blank: Blank, text: string, ref: string, label: string) {
  const page = ctx.pages[blank.page - 1];
  const room = Math.max(blank.width - 2, 20);
  let size = VALUE_SIZE;
  const t = safe(text);
  while (size > MIN_SIZE && ctx.font.widthOfTextAtSize(t, size) > room) size -= 0.5;
  if (ctx.font.widthOfTextAtSize(t, size) <= room) {
    page.drawText(t, { x: blank.x + 1, y: blank.y + 1.5, size, font: ctx.font, color: INK });
    return;
  }
  // Point to the continuation page, as briefly as the blank needs.
  const long = `See continuation ${ref}`;
  const pointer = ctx.font.widthOfTextAtSize(long, MIN_SIZE) <= room ? long : `(${ref})`;
  page.drawText(pointer, { x: blank.x + 1, y: blank.y + 1.5, size: MIN_SIZE, font: ctx.font, color: INK });
  ctx.continuation.push({ ref, label, text });
}

// ---------------------------------------------------------------------------
// Parts
// ---------------------------------------------------------------------------

function fillPage1(ctx: Ctx, f: Pwd888Payload) {
  const band = pageBand(1);
  const at = (label: string) => blankAfter(band, label, ctx.measure);
  write(ctx, at("Year(s)"), f.years, "Part I: Year(s)");
  write(ctx, at("Account Number:"), f.partI.accountNumber ?? "", "Part I: Account Number");
  write(ctx, at("Owner’s Name:"), f.partI.ownerName ?? "", "Part I: Owner’s Name");
  write(ctx, at("Current mailing address:"), f.partI.mailingAddress ?? "", "Part I: Current mailing address");
  write(ctx, at("state and zip code"), f.partI.cityStateZip ?? "", "Part I: state and zip code");
  write(ctx, at("Phone number"), f.partI.phone ?? "", "Part I: Phone number");
  write(ctx, at("Tract Name:"), f.partI.tractName ?? "", "Part I: Tract Name");
  write(ctx, at("Majority County:"), f.partI.majorityCounty ?? "", "Part I: Majority County");
  write(ctx, at("Additional Counties (if any):"), f.partI.additionalCounties ?? "", "Part I: Additional Counties (if any)");

  for (const [code, label] of Object.entries(PART_II_LABEL) as [PracticeCode, string][]) {
    if (f.partII[code]) tick(ctx, optionBox(band, label));
  }

  if (f.partIII.member !== null) tick(ctx, optionBox(band, f.partIII.member ? "Yes" : "No"));
  if (f.partIII.member) write(ctx, at("if YES is checked."), f.partIII.associationName ?? "", "Part III: association name");
}

function fillPartIV(ctx: Ctx, f: Pwd888Payload) {
  for (const entry of f.partIV) {
    const sub = SUB_ACTIVITY_BY_CODE[entry.code];
    if (!sub) continue;
    const r = resolveSubActivity(sub, ctx.measure);
    tick(ctx, r.heading);

    const values = Object.fromEntries(entry.blanks.map((b) => [b.key, b.value]));
    for (const b of entry.blanks) {
      const anchor: FieldAnchor | undefined = r.fields[b.key];
      const field = sub.fields.find((x) => x.key === b.key);
      const label = `${sub.name}: ${field?.formLabel ?? field?.label ?? b.key}`;
      if (!anchor) {
        ctx.continuation.push({ ref: "", label, text: formatValue(b.value) });
        continue;
      }
      switch (anchor.kind) {
        case "blank": {
          const other = anchor.when ? values[anchor.when.key] : undefined;
          const alt = typeof other === "string" ? anchor.when?.blanks[other] : undefined;
          write(ctx, alt ?? anchor.blank, formatValue(b.value), label);
          tick(ctx, anchor.boxed);
          tick(ctx, anchor.parent);
          break;
        }
        case "boxes": {
          tick(ctx, anchor.parent);
          const chosen = Array.isArray(b.value) ? b.value : [String(b.value)];
          for (const c of chosen) {
            if (anchor.boxes[c]) tick(ctx, anchor.boxes[c]);
            else ctx.continuation.push({ ref: "", label, text: c });
          }
          break;
        }
        case "yesno":
          if (typeof b.value === "boolean") tick(ctx, b.value ? anchor.yes : anchor.no);
          break;
        case "flag":
          if (b.value === true) tick(ctx, anchor.box);
          break;
      }
    }
    if (entry.overflowDates.length) {
      ctx.continuation.push({
        ref: "",
        label: `${sub.name}: additional dates`,
        text: entry.overflowDates.map(fmtDate).join(", "),
      });
    }
  }
}

/** Lay every merged blank down, routing what will not fit to continuation. */
function flushBlanks(ctx: Ctx) {
  // Number in form order: blanks that overflow first, by page and line, then
  // values the form prints no blank for.
  const blanks = Array.from(ctx.blanks.values()).sort(
    (a, b) => a.blank.page - b.blank.page || b.blank.y - a.blank.y || a.blank.x - b.blank.x
  );
  const unplaced = ctx.continuation.splice(0);
  let n = 0;
  for (const { blank, texts, labels } of blanks) {
    const before = ctx.continuation.length;
    drawBlank(ctx, blank, texts.join("; "), `C${n + 1}`, labels.join(" / "));
    if (ctx.continuation.length > before) n++;
  }
  for (const c of unplaced) ctx.continuation.push({ ...c, ref: `C${++n}` });
  for (const box of Array.from(ctx.ticks.values())) drawTick(ctx.pages[box.page - 1], box);
}

/** Exhibit index inside page 8's Part V box. */
function fillPartV(ctx: Ctx, f: Pwd888Payload) {
  const page = ctx.pages[7];
  let y = 470;
  const line = (text: string, bold = false) => {
    page.drawText(safe(text), { x: 55, y, size: 9, font: bold ? ctx.bold : ctx.font, color: INK });
    y -= 12;
  };
  if (f.partV.length === 0) {
    line("No supporting documentation attached.");
    return;
  }
  line(
    f.partV.length === 1
      ? "Supporting documentation attached as Exhibit 1:"
      : `Supporting documentation attached as Exhibits 1–${f.partV.length}:`,
    true
  );
  const room = Math.floor((470 - 225) / 12) - 1;
  const shown = f.partV.length > room ? f.partV.slice(0, room - 1) : f.partV;
  for (const x of shown) line(`Exhibit ${x.number}. ${exhibitTitle(x)}`);
  if (shown.length < f.partV.length) {
    line(`Exhibits ${shown.length + 1}–${f.partV.length}: see the exhibit pages that follow.`);
  }
}

const KIND: Record<Pwd888Exhibit["kind"], string> = {
  document: "Document",
  field_log: "Field photo",
  census_photo: "Census photo",
  census_record: "Census data sheet",
};

function exhibitTitle(x: Pwd888Exhibit): string {
  const kind = x.docType === "receipt" ? "Receipt" : KIND[x.kind];
  const sub = SUB_ACTIVITY_BY_CODE[x.subActivityCode];
  const date = x.capturedAt ? fmtDate(x.capturedAt.slice(0, 10)) : "undated";
  return `${kind} — ${sub ? `${PRACTICE_DEF_BY_CODE[sub.practiceCode].name}: ${sub.name}` : x.subActivityCode}, ${date}`;
}

// ---------------------------------------------------------------------------
// Appended pages
// ---------------------------------------------------------------------------

const LETTER: [number, number] = [612, 792];

function header(ctx: Ctx, page: PDFPage, title: string, f: Pwd888Payload) {
  page.drawText(safe(title), { x: 45, y: 742, size: 13, font: ctx.bold });
  page.drawText(
    safe(`PWD-888 annual report for ${f.years} — ${f.partI.tractName ?? ""}${f.partI.accountNumber ? `, account ${f.partI.accountNumber}` : ""}`),
    { x: 45, y: 726, size: 9, font: ctx.font, color: rgb(0.35, 0.35, 0.35) }
  );
  page.drawLine({ start: { x: 45, y: 718 }, end: { x: 567, y: 718 }, thickness: 0.6, color: rgb(0.6, 0.6, 0.6) });
}

/** Word-wrap within `width` at `size`. */
function wrap(font: PDFFont, text: string, size: number, width: number): string[] {
  const out: string[] = [];
  for (const para of safe(text).split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) > width && line) {
        out.push(line);
        line = word;
      } else line = next;
    }
    out.push(line);
  }
  return out;
}

function continuationPages(ctx: Ctx, f: Pwd888Payload) {
  if (ctx.continuation.length === 0) return;
  let page = ctx.doc.addPage(LETTER);
  header(ctx, page, "Continuation", f);
  let y = 696;
  for (const c of ctx.continuation) {
    const body = wrap(ctx.font, c.text, 10, 470);
    if (y - 14 - body.length * 13 < 60) {
      page = ctx.doc.addPage(LETTER);
      header(ctx, page, "Continuation (cont.)", f);
      y = 696;
    }
    page.drawText(safe(`${c.ref}. ${c.label}`), { x: 45, y, size: 10, font: ctx.bold });
    y -= 14;
    for (const l of body) {
      page.drawText(l, { x: 63, y, size: 10, font: ctx.font, color: INK });
      y -= 13;
    }
    y -= 8;
  }
}

async function exhibitPages(ctx: Ctx, f: Pwd888Payload, opts: RenderOptions) {
  for (const x of f.partV) {
    const page = ctx.doc.addPage(LETTER);
    header(ctx, page, `Exhibit ${x.number}`, f);
    let y = 700;
    const meta = [
      exhibitTitle(x),
      x.caption ? `Note: ${x.caption}` : null,
      x.lat !== null && x.lng !== null ? `Location: ${x.lat.toFixed(5)}, ${x.lng.toFixed(5)}` : null,
    ].filter(Boolean) as string[];
    for (const m of meta) {
      for (const l of wrap(ctx.font, m, 10, 520)) {
        page.drawText(l, { x: 45, y, size: 10, font: ctx.font });
        y -= 13;
      }
    }
    y -= 10;

    if (x.kind === "census_record" && x.censusCounts) {
      page.drawText("Species", { x: 45, y, size: 10, font: ctx.bold });
      page.drawText("Count", { x: 400, y, size: 10, font: ctx.bold });
      y -= 16;
      for (const c of x.censusCounts) {
        page.drawText(safe(c.species), { x: 45, y, size: 10, font: ctx.font, color: INK });
        page.drawText(String(c.count), { x: 400, y, size: 10, font: ctx.font, color: INK });
        y -= 14;
      }
      continue;
    }

    const img = opts.loadImage ? await opts.loadImage(x).catch(() => null) : null;
    if (!img) {
      page.drawText("Image not available in this copy — kept in the landowner's FieldFile records.", {
        x: 45, y, size: 10, font: ctx.font, color: rgb(0.45, 0.45, 0.45),
      });
      continue;
    }
    const embedded = img.type === "png" ? await ctx.doc.embedPng(img.bytes) : await ctx.doc.embedJpg(img.bytes);
    const maxW = 522;
    const maxH = y - 50;
    const scale = Math.min(maxW / embedded.width, maxH / embedded.height, 1);
    const w = embedded.width * scale;
    const h = embedded.height * scale;
    page.drawImage(embedded, { x: 45 + (maxW - w) / 2, y: y - h, width: w, height: h });
  }
}

function stampDraft(ctx: Ctx, openItems: number) {
  const text = `DRAFT — ${openItems} item${openItems === 1 ? "" : "s"} still open, not ready to submit`;
  for (const page of ctx.doc.getPages()) {
    page.drawText(safe(text), {
      x: 120, y: 260, size: 22, font: ctx.bold, color: rgb(0.75, 0.2, 0.15),
      opacity: 0.22, rotate: degrees(35),
    });
  }
}

// ---------------------------------------------------------------------------

export async function renderPwd888(payload: Pwd888Payload, opts: RenderOptions = {}): Promise<Uint8Array> {
  const doc = await PDFDocument.load(opts.templateBytes ?? (await readFile(TEMPLATE_PATH)));
  const times = await doc.embedFont(StandardFonts.TimesRoman);
  const ctx: Ctx = {
    doc,
    pages: doc.getPages(),
    font: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    measure: (t, size) => {
      try {
        return times.widthOfTextAtSize(safe(t), size);
      } catch {
        return t.length * size * 0.5;
      }
    },
    blanks: new Map(),
    ticks: new Map(),
    continuation: [],
  };

  fillPage1(ctx, payload);
  fillPartIV(ctx, payload);
  flushBlanks(ctx);
  fillPartV(ctx, payload);
  continuationPages(ctx, payload);
  await exhibitPages(ctx, payload, opts);
  if (opts.draft) stampDraft(ctx, opts.draft.openItems);

  doc.setTitle(`PWD-888 Wildlife Management Annual Report ${payload.years}`);
  doc.setProducer("FieldFile");
  return doc.save();
}
