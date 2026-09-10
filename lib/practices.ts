import type { PracticeCategory, PracticeCode } from "./types";

// The single bridge between the two spellings of the seven qualifying
// practices. See CLAUDE.md > "Annual Report Domain Model" > section 1.
//
//   PracticeCode     ("HC")              — the stable WIRE format. Report
//                                          payloads, AI proposals, URL params,
//                                          analytics, practices.code.
//   PracticeCategory ("habitat_control") — the STORAGE format. Already a check
//                                          constraint on field_log_entries and
//                                          plan_practices; not worth migrating.
//
// Do not introduce a third spelling, and do not hand-roll a second mapping.

export const PRACTICE_CODE_BY_CATEGORY: Record<PracticeCategory, PracticeCode> =
  {
    habitat_control: "HC",
    erosion_control: "EC",
    predator_control: "PC",
    supplemental_water: "SW",
    supplemental_food: "SF",
    supplemental_shelter: "SH",
    census: "CE",
  };

export const PRACTICE_CATEGORY_BY_CODE: Record<PracticeCode, PracticeCategory> =
  Object.fromEntries(
    Object.entries(PRACTICE_CODE_BY_CATEGORY).map(([category, code]) => [
      code,
      category,
    ])
  ) as Record<PracticeCode, PracticeCategory>;

// Statutory order — Tax Code 23.51(7)(A)(i)-(vii), which is also PWD-888
// Part IV's numbering and the order PRACTICE_CATEGORIES uses in lib/field-log.ts.
export const PRACTICE_CODES: PracticeCode[] = [
  "HC",
  "EC",
  "PC",
  "SW",
  "SF",
  "SH",
  "CE",
];

export const isPracticeCode = (v: unknown): v is PracticeCode =>
  typeof v === "string" && (PRACTICE_CODES as string[]).includes(v);

/** PWD-888 Part IV section number (1-7) for a practice code. */
export const practiceFormSectionNumber = (code: PracticeCode): number =>
  PRACTICE_CODES.indexOf(code) + 1;

/** The statutory floor: at least three of the seven, per tax year, per tract. */
export const MIN_PRACTICES_PER_YEAR = 3;
