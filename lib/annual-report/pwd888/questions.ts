/**
 * The review-screen questions that can be answered for a report period, and
 * what makes an answer valid.
 *
 * A key here is a `report_questions.field_key` on a period-level row
 * (`activity_id` null). Anything not described here is refused by the API —
 * the questionnaire never writes a key the assembler would not read.
 *
 * Part I owner details are NOT here: they are bucket 2, live on
 * `owner_profiles` / `properties`, and are reused by the 50-129 as well.
 */

import { SUB_ACTIVITY_BY_CODE, type FieldDef } from "@/lib/sub-activities";
import type { FieldInputType, FieldValue } from "@/lib/types";

export type PeriodQuestion = {
  key: string;
  questionText: string;
  inputType: FieldInputType;
  priority: "blocking" | "compliance" | "strengthening";
  choices?: string[];
  unit?: string;
};

const FIXED: Record<string, PeriodQuestion> = {
  "identity.additionalCounties": {
    key: "identity.additionalCounties",
    questionText: "Does the property extend into any other counties? List them, or leave blank for none.",
    inputType: "text",
    priority: "strengthening",
  },
  "association.member": {
    key: "association.member",
    questionText: "Are you a member of a wildlife management property association?",
    inputType: "boolean",
    priority: "blocking",
  },
  "association.name": {
    key: "association.name",
    questionText: "Name of the wildlife management property association",
    inputType: "text",
    priority: "blocking",
  },
};

function partIVField(key: string): { code: string; field: FieldDef } | null {
  const m = /^partIV\.([A-Z]{2}-\d{2})\.([a-z0-9_]+)$/.exec(key);
  if (!m) return null;
  const field = SUB_ACTIVITY_BY_CODE[m[1]]?.fields.find((f) => f.key === m[2]);
  return field ? { code: m[1], field } : null;
}

export function describeQuestion(key: string): PeriodQuestion | null {
  if (FIXED[key]) return FIXED[key];
  const p = partIVField(key);
  if (!p) return null;
  return {
    key,
    questionText: `${SUB_ACTIVITY_BY_CODE[p.code].name}: ${p.field.formLabel ?? p.field.label}`,
    inputType: p.field.inputType,
    priority: "blocking",
    choices: p.field.choices,
    unit: p.field.unit,
  };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Whether `value` fits the question. `null` always passes — it clears an
 * answer. A `dates` blank holds a list, so a date question accepts either one
 * ISO date or a list of them.
 */
export function isValidAnswer(q: PeriodQuestion, value: FieldValue): boolean {
  if (value === null) return true;
  switch (q.inputType) {
    case "boolean":
      return typeof value === "boolean";
    case "number":
    case "integer":
      return typeof value === "number" && Number.isFinite(value) && value >= 0 &&
        (q.inputType === "number" || Number.isInteger(value));
    case "text":
    case "longtext":
      return typeof value === "string" && value.length <= 2000;
    case "date":
      return (typeof value === "string" && ISO_DATE.test(value)) ||
        (Array.isArray(value) && value.every((d) => ISO_DATE.test(d)));
    case "choice":
      return typeof value === "string" && (!q.choices || q.choices.includes(value));
    case "multi_choice":
      return Array.isArray(value) && value.every((v) => !q.choices || q.choices.includes(v));
    case "date_range":
      return typeof value === "object" && !Array.isArray(value);
  }
}

/** Part I owner details, saved to owner_profiles / properties (bucket 2). */
export type PartIInput = {
  ownerName?: string;
  /** Composed as "street, city, ST zip" so the form's two blanks split cleanly. */
  mailingAddress?: { street: string; city: string; state: string; zip: string };
  phone?: string;
  accountNumber?: string;
};

/** PATCH /api/properties/:id/annual-report */
export type AnnualReportPatch = {
  taxYear?: number;
  partI?: PartIInput;
  /** Keyed by a question key; `null` clears the answer. */
  answers?: Record<string, FieldValue>;
};
