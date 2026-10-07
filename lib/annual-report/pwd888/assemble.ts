/**
 * Assemble the PWD-888 annual report for one property and tax year.
 *
 * Pure: takes already-fetched containers and answers (data-server.ts does the
 * fetching) and returns the payload the render step draws, plus every gap and
 * conflict still open. Same split as `assembleForm50129()` / `buildPayload()`.
 *
 * The count is not redone here. Part II and the choice of what reaches Part IV
 * come from `analyzeReportGaps()` and its `qualifies()` rule, so the readiness
 * card and the rendered form cannot disagree about which practices count.
 */

import { PRACTICE_CODES } from "@/lib/practices";
import { PRACTICE_DEF_BY_CODE, SUB_ACTIVITY_BY_CODE } from "@/lib/sub-activities";
import type { PracticeCode } from "@/lib/types";
import { analyzeReportGaps, qualifies, type ContainerInput, type ReportGap } from "../gap-analysis";
import { combineSubActivity, isBlank, type Contribution } from "./combine";
import type {
  AssemblyInput,
  Pwd888Assembly,
  Pwd888Entry,
  Pwd888Exhibit,
  ReportContainer,
} from "./types";

const nz = (s: string | null | undefined) => (s && s.trim() ? s.trim() : null);

export function toContainerInput(c: ReportContainer): ContainerInput {
  return {
    id: c.id,
    source: c.source,
    practiceCode: c.practiceCode,
    subActivityCode: c.subActivityCode,
    performedOn: c.performedOn,
    evidenceCount: c.evidence.length,
    answeredFieldCount: Object.values(c.fieldValues).filter((v) => !isBlank(v)).length,
  };
}

/**
 * The form prints the mailing address over two blanks: street, then "City,
 * town, post office, state and zip code". owner_profiles keeps one string.
 *
 * Split only when the commas make it unambiguous: "12 Oak Ln, Dripping
 * Springs, TX 78620" → "12 Oak Ln" / "Dripping Springs, TX 78620". The common
 * "1606 Headway Cir Austin, TX 78619" has no comma between street and city,
 * and guessing where the city starts would print a wrong address on the form —
 * so it stays whole on the first blank and `split` is false, which assembly
 * reports as a gap for the landowner to separate.
 */
export function splitMailingAddress(addr: string | null): {
  street: string | null;
  cityStateZip: string | null;
  split: boolean;
} {
  const a = nz(addr);
  if (!a) return { street: null, cityStateZip: null, split: false };
  const parts = a.split(",").map((p) => p.trim()).filter(Boolean);
  const stateZip = /^[A-Za-z]{2}\.?\s+\d{5}(-\d{4})?$/;
  if (parts.length >= 3 && stateZip.test(parts[parts.length - 1])) {
    return {
      street: parts.slice(0, -2).join(", "),
      cityStateZip: `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`,
      split: true,
    };
  }
  return { street: a, cityStateZip: null, split: false };
}

const fmtList = (dates: string[]) => dates.join(", ");

export function assemblePwd888(input: AssemblyInput): Pwd888Assembly {
  const { taxYear, containers } = input;

  const analysis = analyzeReportGaps({
    propertyId: input.propertyId,
    taxYear,
    containers: containers.map(toContainerInput),
    identity: input.identity,
    associationMember: input.association.member,
    associationName: input.association.name,
  });
  const gaps: ReportGap[] = [...analysis.gaps];
  const conflicts: Pwd888Assembly["conflicts"] = [];

  // ---- Part IV ------------------------------------------------------------
  // Only containers that count. A container short of a date, a sub-activity or
  // evidence is already a gap above; printing it would claim work the report
  // cannot stand behind.
  const counted = containers
    .filter((c) => qualifies(toContainerInput(c)))
    .sort((a, b) => a.performedOn!.localeCompare(b.performedOn!));

  const bySub = new Map<string, ReportContainer[]>();
  for (const c of counted) {
    const list = bySub.get(c.subActivityCode!) ?? [];
    list.push(c);
    bySub.set(c.subActivityCode!, list);
  }

  const partIV: Pwd888Entry[] = [];
  for (const [code, group] of Array.from(bySub.entries())) {
    const sub = SUB_ACTIVITY_BY_CODE[code];
    if (!sub) continue;
    const contributions: Contribution[] = group.map((c) => ({
      containerId: c.id,
      performedOn: c.performedOn!,
      fieldValues: c.fieldValues,
      fromCensus: c.source === "census",
    }));
    const combined = combineSubActivity(sub, contributions);

    partIV.push({
      code,
      practiceCode: sub.practiceCode,
      name: sub.name,
      containerIds: group.map((c) => c.id),
      workDates: Array.from(new Set(group.map((c) => c.performedOn!))),
      blanks: combined.blanks,
      overflowDates: combined.overflowDates,
    });

    for (const conflict of combined.conflicts) {
      conflicts.push({ ...conflict, subActivityCode: code });
      const detail = conflict.values
        .map((v) => `${JSON.stringify(v.value)} (${fmtList(v.performedOn)})`)
        .join(" vs ");
      gaps.push({
        key: `report.${code}.${conflict.key}.conflict`,
        section: "Part IV",
        label: `${sub.name}: "${conflict.formLabel}" differs between your activities this year — ${detail}. The form has one blank; choose what applies to ${taxYear}.`,
        bucket: 3,
        severity: "blocking",
      });
    }

    // Warning, not blocking — matches gap analysis's "no detail recorded":
    // the practice still counts, the form just says less than it asks for.
    for (const field of combined.missingRequired) {
      gaps.push({
        key: `report.${code}.${field.key}`,
        section: "Part IV",
        label: `${sub.name}: the form asks for "${field.formLabel ?? field.label}".`,
        bucket: 3,
        severity: "warning",
      });
    }
  }

  partIV.sort((a, b) => {
    const s = (e: Pwd888Entry) =>
      PRACTICE_DEF_BY_CODE[e.practiceCode].formSectionNumber * 100 +
      SUB_ACTIVITY_BY_CODE[e.code].sortOrder;
    return s(a) - s(b);
  });

  // ---- Part V -------------------------------------------------------------
  // Exhibits follow Part IV order, then capture date, so "Exhibit 4" sits next
  // to the line item it supports.
  const byId = new Map(counted.map((c) => [c.id, c]));
  const partV: Pwd888Exhibit[] = [];
  for (const entry of partIV) {
    const items = entry.containerIds.flatMap((id) =>
      byId.get(id)!.evidence.map((e) => ({ ...e, containerId: id, subActivityCode: entry.code }))
    );
    items.sort((a, b) => (a.capturedAt ?? "").localeCompare(b.capturedAt ?? ""));
    for (const item of items) partV.push({ ...item, number: partV.length + 1 });
  }

  // ---- Part I / III ---------------------------------------------------------
  const { street, cityStateZip, split } = splitMailingAddress(input.identity.mailingAddress);
  if (street && !split) {
    gaps.push({
      key: "identity.cityStateZip",
      section: "Part I",
      label: `City, state and zip code — the form has its own blank for these, and "${street}" can't be split reliably`,
      bucket: 2,
      severity: "warning",
    });
  }

  if (input.additionalCounties === null) {
    gaps.push({
      key: "identity.additionalCounties",
      section: "Part I",
      label: "Additional counties the property lies in, if any",
      bucket: 2,
      severity: "warning",
    });
  }

  const proposals: Pwd888Assembly["proposals"] = [];
  if (input.association.member === null && input.association.proposedMember !== null) {
    proposals.push({
      key: "association.member",
      value: input.association.proposedMember,
      source: "form50129.section5.managedByAssociation",
    });
  }

  const partII = Object.fromEntries(
    PRACTICE_CODES.map((code) => [
      code,
      analysis.practices.find((p) => p.code === code)?.counts ?? false,
    ])
  ) as Record<PracticeCode, boolean>;

  return {
    payload: {
      years: String(taxYear),
      partI: {
        accountNumber: nz(input.identity.accountNumber),
        ownerName: nz(input.identity.ownerName),
        mailingAddress: street,
        cityStateZip,
        phone: nz(input.identity.phone),
        tractName: nz(input.identity.tractName),
        majorityCounty: nz(input.identity.majorityCounty),
        additionalCounties: nz(input.additionalCounties),
      },
      partII,
      partIII: {
        member: input.association.member,
        associationName: input.association.member ? nz(input.association.name) : null,
      },
      partIV,
      partV,
    },
    analysis,
    gaps,
    conflicts,
    proposals,
  };
}
