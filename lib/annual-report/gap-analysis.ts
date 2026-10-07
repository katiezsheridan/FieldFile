/**
 * What the PWD-888 annual report still needs, for one property in one tax year.
 *
 * This module ANALYSES and REPORTS. It never prompts, never writes, and never
 * infers a classification — it returns a typed list the questionnaire step will
 * later turn into questions. Same division of labour as
 * `detectMissing()` in lib/forms/form50129/buildPayload.ts, and the same bucket
 * model, so the two collect-the-rest UIs can share a shape.
 *
 * Pure: `analyzeReportGaps()` takes already-fetched rows. The fetching lives in
 * gap-analysis-server.ts so this stays testable without a database.
 */

import { MIN_PRACTICES_PER_YEAR, PRACTICE_CODES } from "@/lib/practices";
import { PRACTICE_DEF_BY_CODE, SUB_ACTIVITY_BY_CODE } from "@/lib/sub-activities";
import type { PracticeCode } from "@/lib/types";

/**
 * 1 = known, fill silently. 2 = ask once, reuse forever. 3 = per-report.
 * Mirrors FilingBucket in the 50-129 assembler.
 */
export type ReportGapBucket = 1 | 2 | 3;

export type ReportGap = {
  /** Stable key, e.g. "practices.floor" or "activity.<uuid>.subActivity". */
  key: string;
  /** Human-facing section, e.g. "Part I" or "Part IV". */
  section: string;
  label: string;
  bucket: ReportGapBucket;
  /**
   * `blocking` stops the report being rendered honestly; `warning` weakens it
   * but does not falsify it. A practice short of the floor is blocking; a
   * container with a date and no photo is a warning.
   */
  severity: "blocking" | "warning";
};

/** One container, reduced to what the count cares about. */
export type ContainerInput = {
  id: string;
  practiceCode: PracticeCode | null;
  /** Null means the landowner has not said WHICH item of the practice this was. */
  subActivityCode: string | null;
  performedOn: string | null;
  /** Photos, receipts and field-log captures attached to this container. */
  evidenceCount: number;
  /** Answers recorded against the sub-activity's PWD-888 blanks. */
  answeredFieldCount: number;
};

export type PracticeStatus = {
  code: PracticeCode;
  name: string;
  /** Containers for this practice in the tax year. */
  containers: number;
  /** Of those, how many are classified AND carry evidence. */
  qualifying: number;
  /** Counts toward the three-of-seven floor. */
  counts: boolean;
};

export type GapAnalysisInput = {
  propertyId: string;
  taxYear: number;
  containers: ContainerInput[];
  /** PWD-888 Part I. Absent values become bucket-2 gaps. */
  identity: {
    ownerName?: string | null;
    accountNumber?: string | null;
    mailingAddress?: string | null;
    phone?: string | null;
    tractName?: string | null;
    majorityCounty?: string | null;
  };
  /** PWD-888 Part III. `null` means never answered, not "no". */
  associationMember?: boolean | null;
  associationName?: string | null;
};

export type GapAnalysis = {
  propertyId: string;
  taxYear: number;
  practices: PracticeStatus[];
  /** How many of the seven are performed AND documented this year. */
  qualifyingPractices: number;
  meetsMinimum: boolean;
  gaps: ReportGap[];
};

const has = (v: unknown): boolean =>
  typeof v === "string" ? v.trim().length > 0 : v !== null && v !== undefined;

/**
 * A container counts toward the floor only when it is dated, classified AND
 * documented — the statute's three constraints, each a distinct failure mode
 * (CLAUDE.md > "Annual Report Domain Model" > 2).
 *
 *   * DATED. "Per tax year" — an undated container belongs to no year, so it
 *     cannot count toward this one. Undated rows are still analysed, because
 *     reporting them as a gap is the only way they ever get fixed; they are
 *     just not counted.
 *   * CLASSIFIED. A container with no sub-activity names a practice, which is
 *     a category, not an act, so it cannot satisfy "performed".
 *   * DOCUMENTED. No evidence, no documentation.
 *
 * None of these is a judgement we get to make for the landowner. Each is a gap
 * to close, and the report must not claim a practice on the strength of any of
 * them.
 */
function qualifies(c: ContainerInput): boolean {
  return (
    Boolean(c.performedOn) && Boolean(c.subActivityCode) && c.evidenceCount > 0
  );
}

export function analyzeReportGaps(input: GapAnalysisInput): GapAnalysis {
  const { containers, taxYear } = input;
  const gaps: ReportGap[] = [];

  // ---- Part IV: the three-of-seven count ---------------------------------
  const practices: PracticeStatus[] = PRACTICE_CODES.map((code) => {
    const mine = containers.filter((c) => c.practiceCode === code);
    const qualifying = mine.filter(qualifies).length;
    return {
      code,
      name: PRACTICE_DEF_BY_CODE[code].name,
      containers: mine.length,
      qualifying,
      counts: qualifying > 0,
    };
  });

  const qualifyingPractices = practices.filter((p) => p.counts).length;
  const meetsMinimum = qualifyingPractices >= MIN_PRACTICES_PER_YEAR;

  if (!meetsMinimum) {
    gaps.push({
      key: "practices.floor",
      section: "Part II",
      label: `${qualifyingPractices} of the required ${MIN_PRACTICES_PER_YEAR} practices are documented for ${taxYear}. A practice counts once it has an activity that says what was done and has evidence attached.`,
      bucket: 3,
      severity: "blocking",
    });
  }

  // ---- Per-container gaps -------------------------------------------------
  // Deliberately one gap per container rather than a summary: the fix is
  // different for each, and "3 activities need photos" is not actionable.
  for (const c of containers) {
    const name = c.subActivityCode
      ? SUB_ACTIVITY_BY_CODE[c.subActivityCode]?.name ?? c.subActivityCode
      : c.practiceCode
        ? PRACTICE_DEF_BY_CODE[c.practiceCode].name
        : "Unclassified activity";

    if (!c.practiceCode) {
      gaps.push({
        key: `activity.${c.id}.practice`,
        section: "Part IV",
        label: `"${name}" has no practice, so it counts toward nothing.`,
        bucket: 3,
        severity: "blocking",
      });
      continue;
    }

    if (!c.subActivityCode) {
      gaps.push({
        key: `activity.${c.id}.subActivity`,
        section: "Part IV",
        label: `"${name}" needs the specific activity chosen before it can appear on the report.`,
        bucket: 3,
        severity: "blocking",
      });
    }

    if (c.evidenceCount === 0) {
      gaps.push({
        key: `activity.${c.id}.evidence`,
        section: "Part V",
        label: `"${name}" has no photo or receipt attached. Part V asks you to attach supporting documentation.`,
        bucket: 3,
        severity: c.subActivityCode ? "blocking" : "warning",
      });
    }

    if (!c.performedOn) {
      gaps.push({
        key: `activity.${c.id}.performedOn`,
        section: "Part IV",
        label: `"${name}" has no date, so it belongs to no tax year.`,
        bucket: 3,
        severity: "blocking",
      });
    }

    // Classified, evidenced, but the form's own blanks are empty. Not blocking:
    // the report can be rendered, it just says less than it could.
    if (c.subActivityCode && c.evidenceCount > 0 && c.answeredFieldCount === 0) {
      const sub = SUB_ACTIVITY_BY_CODE[c.subActivityCode];
      if (sub && sub.fields.length > 0) {
        gaps.push({
          key: `activity.${c.id}.detail`,
          section: "Part IV",
          label: `"${name}" has no detail recorded — the form asks for ${sub.fields.length > 1 ? `${sub.fields.length} items` : "one item"} such as ${sub.fields[0].label.toLowerCase()}.`,
          bucket: 3,
          severity: "warning",
        });
      }
    }
  }

  // ---- Part I: owner and tract identity -----------------------------------
  // Bucket 2 throughout: this is the same information as owner_profiles and the
  // property record. On year two it should be a confirmation, not a re-entry.
  const identityFields: { key: string; label: string; ok: boolean }[] = [
    { key: "identity.ownerName", label: "Owner's name", ok: has(input.identity.ownerName) },
    { key: "identity.accountNumber", label: "Appraisal district account number", ok: has(input.identity.accountNumber) },
    { key: "identity.mailingAddress", label: "Current mailing address", ok: has(input.identity.mailingAddress) },
    { key: "identity.phone", label: "Phone number", ok: has(input.identity.phone) },
    { key: "identity.tractName", label: "Tract name", ok: has(input.identity.tractName) },
    { key: "identity.majorityCounty", label: "Majority county", ok: has(input.identity.majorityCounty) },
  ];
  for (const f of identityFields) {
    if (!f.ok) {
      gaps.push({
        key: f.key,
        section: "Part I",
        label: f.label,
        bucket: 2,
        severity: "blocking",
      });
    }
  }

  // ---- Part III: association membership -----------------------------------
  // null means never answered. `false` is a real answer and closes the gap.
  if (input.associationMember === null || input.associationMember === undefined) {
    gaps.push({
      key: "association.member",
      section: "Part III",
      label: "Are you a member of a wildlife management property association?",
      bucket: 2,
      severity: "blocking",
    });
  } else if (input.associationMember && !has(input.associationName)) {
    gaps.push({
      key: "association.name",
      section: "Part III",
      label: "Name of the wildlife management property association",
      bucket: 2,
      severity: "blocking",
    });
  }

  return {
    propertyId: input.propertyId,
    taxYear,
    practices,
    qualifyingPractices,
    meetsMinimum,
    gaps,
  };
}

/** Gaps that stop the report being rendered honestly. */
export const blockingGaps = (a: GapAnalysis): ReportGap[] =>
  a.gaps.filter((g) => g.severity === "blocking");

export const isReportReady = (a: GapAnalysis): boolean =>
  a.meetsMinimum && blockingGaps(a).length === 0;
