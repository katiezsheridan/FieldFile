/**
 * Resolve each Part IV sub-activity's fields to places on the form.
 *
 * A field becomes one of:
 *   blank  — write the value on an underscore run
 *   boxes  — tick the box for each chosen option (choice / multi_choice)
 *   yesno  — tick Yes or No
 *   flag   — a boolean printed as a lone checkbox (tick when true)
 *
 * The catalog's own wording is tried first; FIELD_LABELS names the printed
 * text where it differs. Anything still unresolved is reported by
 * scripts/pwd888-layout-check.ts and falls through to the continuation page at
 * render time, so a value is never silently dropped.
 */

import type { FieldDef, SubActivityDef } from "@/lib/sub-activities";
import {
  bandOf,
  blankAfter,
  findItem,
  headingBox,
  optionBox,
  type Blank,
  type Box,
  type Measure,
} from "./layout";

export type FieldAnchor =
  | {
      kind: "blank";
      blank: Blank;
      boxed: Box | null;
      /** A different blank to use when another field holds a given value. */
      when?: { key: string; blanks: Record<string, Blank> };
      /** The box of the option group this blank belongs to, ticked with it. */
      parent?: Box | null;
    }
  | { kind: "boxes"; boxes: Record<string, Box>; parent?: Box | null }
  | { kind: "yesno"; yes: Box; no: Box }
  | { kind: "flag"; box: Box };

export type ResolvedSubActivity = {
  heading: Box | null;
  fields: Record<string, FieldAnchor>;
  unresolved: string[];
  placed: number;
};

/**
 * Printed text that precedes a blank, or labels a lone checkbox, where the
 * catalog's `formLabel ?? label` is not what the form prints. Keyed
 * `<code>.<field key>`.
 */
const FIELD_LABELS: Record<string, string> = {
  "HC-01.grazing_system_other": "Other type of grazing system (describe)",
  "HC-04.mechanical_method_other": "other (describe)",
  "HC-04.chemical_kind": "Kind",
  "HC-04.chemical_rate": "Rate",
  "HC-04.strip_width": "width:",
  "HC-04.strip_length": "length:",
  "HC-07.enhancement_other": "Other (describe)",
  "HC-08.techniques_other": "other (describe)",
  "EC-03.techniques_other": "Other:",
  "PC-01.scare_tactics_detail": "scare tactics:",
  "PC-02.scare_tactics_detail": "scare tactics:",
  "SW-02.facility_other": "Other:",
  "SW-03.work_other": "Other:",
  "SF-05.year_round": "Year round:",
  "SF-05.year_round_when": "state when:",
  "SF-07.overseeded_25_percent": "overseed 25%",
  "SF-07.species_planted_other": "other:",
  "SH-01.cavity_box_count": "Cavity type. Number:",
  "SH-01.bat_box_count": "Bat boxes. Number",
  "SH-01.raptor_pole_count": "Raptor pole. Number",
  "SH-06.strip_width": "width:",
  "SH-06.strip_length": "length:",
  "SH-07.number_per_acre": "Number/acre:",
  "CE-01.date_a": "A.",
  "CE-01.date_b": "B.",
  "CE-01.date_c": "C.",
  "CE-04.percent_surveyed_other": "Other:",
  "CE-06.species_other": "other",
  "CE-11.methods_other": "Other:",
  "PC-04.methods_other": "Other:",
};

/** Printed wording of an option where it differs from the catalog choice. */
const CHOICE_LABELS: Record<string, Record<string, string>> = {
  "HC-01.grazing_system": { "1 herd/3 pasture": "1 herd/3pasture" },
  "HC-07.enhancement": { "Moist soil management": "moist soil" },
  "EC-03.techniques": { "Rip-rap, etc.": "rip-rap," },
  // The form misspells both of these; match what is printed.
  "EC-05.activities": { "Revegetating/stabilize levee areas": "revegtating/stabilize levee areas" },
  "SH-03.plant_types": { Grasses: "grases" },
  "PC-04.methods": {
    "Poison collars (1080 certified, licensed applicator)": "poison collars (1080 certified",
  },
};

/**
 * Fields printed somewhere other than under their own heading. Fire ants,
 * cowbirds and grackle/starling are three checkboxes over ONE shared "Method
 * of control" line, printed after the last of them (PC-03).
 */
const FIELD_BAND: Record<string, string> = { "PC-01": "PC-03", "PC-02": "PC-03" };

/**
 * Catalog fields the form prints no blank for. Their values go on the
 * continuation page, never dropped. CE-02 prints an "other" box for
 * "Observations from" but no line to describe it.
 */
export const CONTINUATION_ONLY = new Set([
  "CE-02.observed_from_other",
  // "□ Cavity type. Number: ___" — the form's cavity type is the box, not a blank.
  "SH-01.cavity_type",
]);

/**
 * A blank printed more than once, the right copy depending on another answer.
 * HC-05 prints "Gap width" once per technique.
 */
const BLANK_BY_ANSWER: Record<string, { on: string; nth: Record<string, number> }> = {
  "HC-05.gap_width": {
    on: "technique",
    nth: { "Replace sections of net-wire with barbed wire": 1 },
  },
};

/**
 * Option groups whose own box heads a line ("□ Mechanical" over its methods).
 * Filling anything in the group ticks the group's box too.
 */
const PARENT_BOX: Record<string, string> = {
  "HC-04.mechanical_method": "Mechanical",
  "HC-04.mechanical_method_other": "Mechanical",
  "HC-04.chemical_kind": "Chemical:",
  "HC-04.chemical_rate": "Chemical:",
  "HC-04.design": "Brush management design:",
  "HC-06.fencing": "Fencing of riparian area",
  "HC-06.deferment": "Deferment from livestock grazing",
  "HC-06.season_deferred": "Deferment from livestock grazing",
  "HC-06.vegetation_trees": "Establish vegetation",
  "HC-06.vegetation_shrubs": "Establish vegetation",
  "HC-06.vegetation_herbaceous": "Establish vegetation",
};

/**
 * Blanks that share a line with an unrelated box, which must not be ticked
 * with them: "□ No. If not, state when: ___" belongs to Year round's No.
 */
const NOT_BOXED = new Set(["SF-05.year_round_when"]);

function labelCandidates(sub: SubActivityDef, f: FieldDef): string[] {
  const explicit = FIELD_LABELS[`${sub.code}.${f.key}`];
  const base = [f.formLabel, f.label].filter(Boolean) as string[];
  const out = explicit ? [explicit] : [];
  for (const b of base) {
    out.push(b);
    const afterDash = b.split(/\s+[—–-]\s+/).pop()!;
    if (afterDash !== b) out.push(afterDash);
    out.push(b.replace(/\s*\(.*?\)\s*/g, " ").trim());
  }
  return Array.from(new Set(out.filter((s) => s.length > 1)));
}

export function resolveSubActivity(sub: SubActivityDef, measure: Measure): ResolvedSubActivity {
  const band = bandOf(FIELD_BAND[sub.code] ?? sub.code);
  const heading = headingBox(sub.code);
  const fields: Record<string, FieldAnchor> = {};
  const unresolved: string[] = [];
  let placed = heading ? 1 : 0;
  if (!band) return { heading, fields, unresolved: sub.fields.map((f) => f.key), placed };

  const parentOf = (f: FieldDef) => {
    const label = PARENT_BOX[`${sub.code}.${f.key}`];
    if (!label) return undefined;
    const box = optionBox(band, label);
    if (!box) unresolved.push(`${f.key} parent box "${label}"`);
    return box;
  };

  for (const f of sub.fields) {
    if (CONTINUATION_ONLY.has(`${sub.code}.${f.key}`)) continue;
    const labels = labelCandidates(sub, f);

    if (f.inputType === "choice" || f.inputType === "multi_choice") {
      const boxes: Record<string, Box> = {};
      for (const choice of f.choices ?? []) {
        const printed = CHOICE_LABELS[`${sub.code}.${f.key}`]?.[choice] ?? choice;
        const box = optionBox(band, printed);
        if (box) boxes[choice] = box;
        else unresolved.push(`${f.key} option "${choice}"`);
      }
      fields[f.key] = { kind: "boxes", boxes, parent: parentOf(f) };
      placed += Object.keys(boxes).length;
      continue;
    }

    if (f.inputType === "boolean") {
      let done = false;
      for (const label of labels) {
        const item = findItem(band, label);
        if (!item) continue;
        const yes = optionBox(band, "Yes", 0, item);
        const no = optionBox(band, "No", 0, item);
        if (yes && no) {
          fields[f.key] = { kind: "yesno", yes, no };
          placed += 2;
        } else {
          const box = optionBox(band, label);
          if (!box) continue;
          fields[f.key] = { kind: "flag", box };
          placed += 1;
        }
        done = true;
        break;
      }
      if (!done) unresolved.push(`${f.key} (yes/no "${labels[0]}")`);
      continue;
    }

    // Text, number, date: a blank after the label.
    let found = false;
    for (const label of labels) {
      const b = blankAfter(band, label, measure);
      if (!b) continue;
      const alt = BLANK_BY_ANSWER[`${sub.code}.${f.key}`];
      const when = alt
        ? {
            key: alt.on,
            blanks: Object.fromEntries(
              Object.entries(alt.nth)
                .map(([v, nth]) => [v, blankAfter(band, label, measure, nth)])
                .filter(([, x]) => x)
            ) as Record<string, Blank>,
          }
        : undefined;
      fields[f.key] = {
        kind: "blank",
        blank: b,
        boxed: NOT_BOXED.has(`${sub.code}.${f.key}`) ? null : b.boxed,
        when,
        parent: parentOf(f),
      };
      placed += 1;
      found = true;
      break;
    }
    if (!found) unresolved.push(`${f.key} (blank "${labels[0]}")`);
  }
  return { heading, fields, unresolved, placed };
}
