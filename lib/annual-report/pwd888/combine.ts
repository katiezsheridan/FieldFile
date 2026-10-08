/**
 * Fold several containers of one sub-activity into the single set of blanks
 * PWD-888 Part IV prints for it.
 *
 * Each blank combines by its `CombineRule` (lib/sub-activities.ts). The rules
 * only ever restate what the landowner entered: they add, list or union, and
 * where two entries disagree they report a conflict instead of choosing one.
 * Pure — no database, no dates from the clock.
 */

import {
  combineRuleOf,
  isFieldVisible,
  type FieldDef,
  type SubActivityDef,
} from "@/lib/sub-activities";
import type { FieldValue } from "@/lib/types";

/** One container's say in a sub-activity, already filtered to the tax year. */
export type Contribution = {
  containerId: string;
  performedOn: string;
  fieldValues: Record<string, FieldValue>;
  /** True when the values came from a census record, not typed by the landowner. */
  fromCensus: boolean;
};

/**
 * How a blank's value came to be — what the review screen shows beside it.
 *   entered  one container, typed by the landowner
 *   combined several containers folded by the field's rule
 *   derived  filled from work dates or a census record, never typed into this blank
 *   answered set on the review screen for this report, e.g. settling a conflict
 */
export type BlankBasis = "entered" | "combined" | "derived" | "answered";

export type ReportBlank = {
  key: string;
  /** The form's wording — this is what the PDF prints beside the blank. */
  formLabel: string;
  value: FieldValue;
  basis: BlankBasis;
  sourceIds: string[];
};

export type BlankConflict = {
  key: string;
  formLabel: string;
  /** Each distinct value, with the containers that hold it. */
  values: { value: FieldValue; containerIds: string[]; performedOn: string[] }[];
};

export type CombinedSubActivity = {
  blanks: ReportBlank[];
  conflicts: BlankConflict[];
  /** Required blanks still empty after combining. */
  missingRequired: FieldDef[];
  /** Dates beyond the slots the form prints (a fourth spotlight night). */
  overflowDates: string[];
};

const formLabelOf = (f: FieldDef) => f.formLabel ?? f.label;

/**
 * Empty, for the purposes of the form. Zero counts as empty: the add-activity
 * form stores 0 when a number input is cleared, and "Number of feeders: 0"
 * under a feeders activity is a blank the landowner skipped, not a fact to
 * print on a tax report.
 */
export function isBlank(v: FieldValue | undefined): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim().length === 0;
  if (typeof v === "number") return v === 0 || Number.isNaN(v);
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return !v.from && !v.to;
  return false;
}

const sameValue = (a: FieldValue, b: FieldValue) =>
  JSON.stringify(a) === JSON.stringify(b);

const distinctSorted = (xs: string[]) => Array.from(new Set(xs)).sort();

function basisFor(contribs: Contribution[]): BlankBasis {
  if (contribs.every((c) => c.fromCensus)) return "derived";
  return contribs.length > 1 ? "combined" : "entered";
}

/**
 * Combine one blank. Returns the value, or a conflict, or nothing when no
 * container filled it (and, for `dates`, there were no work dates either).
 */
function combineField(
  field: FieldDef,
  contributions: Contribution[]
): ReportBlank | BlankConflict | null {
  const rule = combineRuleOf(field);
  const filled = contributions.filter((c) => !isBlank(c.fieldValues[field.key]));
  const valueOf = (c: Contribution) => c.fieldValues[field.key] as FieldValue;
  const blank = (value: FieldValue, from: Contribution[], basis?: BlankBasis): ReportBlank => ({
    key: field.key,
    formLabel: formLabelOf(field),
    value,
    basis: basis ?? basisFor(from),
    sourceIds: from.map((c) => c.containerId),
  });

  if (rule === "dates") {
    // The blank says when the work happened. A container that left it empty
    // still happened on its work date, so that date is the honest fill.
    const entered = filled.flatMap((c) => {
      const v = valueOf(c);
      return Array.isArray(v) ? v : [String(v)];
    });
    const fromWorkDates = contributions
      .filter((c) => isBlank(c.fieldValues[field.key]))
      .map((c) => c.performedOn);
    const all = distinctSorted([...entered, ...fromWorkDates]);
    if (all.length === 0) return null;
    const basis: BlankBasis =
      fromWorkDates.length > 0 ? "derived" : basisFor(filled);
    return blank(all, contributions, basis);
  }

  if (filled.length === 0) return null;

  switch (rule) {
    case "sum": {
      const total = filled.reduce((n, c) => n + Number(valueOf(c)), 0);
      return blank(Number(total.toFixed(4)), filled);
    }
    case "max": {
      const top = Math.max(...filled.map((c) => Number(valueOf(c))));
      return blank(top, filled);
    }
    case "union": {
      const picked = new Set(filled.flatMap((c) => valueOf(c) as string[]));
      // Keep the form's printed order, so the PDF ticks boxes top to bottom.
      const ordered = (field.choices ?? []).filter((x) => picked.has(x));
      const extra = Array.from(picked).filter((x) => !ordered.includes(x));
      return blank([...ordered, ...extra], filled);
    }
    case "join": {
      const seen = new Map<string, string>();
      for (const c of filled) {
        const s = String(valueOf(c)).trim();
        if (!seen.has(s.toLowerCase())) seen.set(s.toLowerCase(), s);
      }
      return blank(Array.from(seen.values()).join("; "), filled);
    }
    case "agree": {
      const groups: BlankConflict["values"] = [];
      for (const c of filled) {
        const v = valueOf(c);
        const g = groups.find((x) => sameValue(x.value, v));
        if (g) {
          g.containerIds.push(c.containerId);
          g.performedOn.push(c.performedOn);
        } else {
          groups.push({ value: v, containerIds: [c.containerId], performedOn: [c.performedOn] });
        }
      }
      if (groups.length === 1) return blank(groups[0].value, filled);
      return { key: field.key, formLabel: formLabelOf(field), values: groups };
    }
  }
}

const isConflict = (x: ReportBlank | BlankConflict): x is BlankConflict =>
  "values" in x;

/**
 * Fold `contributions` (sorted by date by the caller) into the sub-activity's
 * blanks. Conditional blanks (`showWhen`) are kept only while the combined
 * answer still shows them — "Other (describe)" disappears if no container
 * ticked "Other".
 */
export function combineSubActivity(
  sub: SubActivityDef,
  contributions: Contribution[]
): CombinedSubActivity {
  const slots = new Set(sub.dateSlots ?? []);
  const blanks: ReportBlank[] = [];
  const conflicts: BlankConflict[] = [];
  let overflowDates: string[] = [];

  for (const field of sub.fields) {
    if (slots.has(field.key)) continue;
    const r = combineField(field, contributions);
    if (!r) continue;
    if (isConflict(r)) conflicts.push(r);
    else blanks.push(r);
  }

  // Slots: one spotlight night per container, so pool every date entered in
  // any slot with the work date of each container that entered none.
  if (sub.dateSlots?.length) {
    const entered = contributions.flatMap((c) =>
      sub.dateSlots!.map((k) => c.fieldValues[k]).filter((v) => !isBlank(v)).map(String)
    );
    const fromWorkDates = contributions
      .filter((c) => sub.dateSlots!.every((k) => isBlank(c.fieldValues[k])))
      .map((c) => c.performedOn);
    const pooled = distinctSorted([...entered, ...fromWorkDates]);
    sub.dateSlots.forEach((key, i) => {
      if (!pooled[i]) return;
      const field = sub.fields.find((f) => f.key === key)!;
      blanks.push({
        key,
        formLabel: formLabelOf(field),
        value: pooled[i],
        basis: entered.includes(pooled[i]) ? basisFor(contributions) : "derived",
        sourceIds: contributions
          .filter((c) =>
            c.performedOn === pooled[i] ||
            sub.dateSlots!.some((k) => c.fieldValues[k] === pooled[i])
          )
          .map((c) => c.containerId),
      });
    });
    overflowDates = pooled.slice(sub.dateSlots.length);
  }

  const combinedValues: Record<string, unknown> = Object.fromEntries(
    blanks.map((b) => [b.key, b.value])
  );
  const visible = blanks.filter((b) => {
    const field = sub.fields.find((f) => f.key === b.key)!;
    return isFieldVisible(field, combinedValues);
  });

  const missingRequired = sub.fields.filter(
    (f) =>
      f.requiredForForm &&
      isFieldVisible(f, combinedValues) &&
      !visible.some((b) => b.key === f.key) &&
      !conflicts.some((c) => c.key === f.key)
  );

  return { blanks: visible, conflicts, missingRequired, overflowDates };
}
