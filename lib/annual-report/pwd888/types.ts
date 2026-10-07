/**
 * The PWD-888 report payload and the inputs it is assembled from.
 *
 * The payload is what the render step draws onto `templates/pwd_888.pdf`, part
 * for part. Every value in it was entered by the landowner, combined from what
 * they entered, or derived from a dated record they made — never inferred.
 */

import type { FieldValue, PracticeCode } from "@/lib/types";
import type { BlankConflict, ReportBlank } from "./combine";
import type { GapAnalysis, ReportGap } from "../gap-analysis";

/** One piece of Part V supporting documentation. */
export type ReportEvidence = {
  id: string;
  /**
   * `census_record` is the census observation's own data sheet — its species
   * counts. It is evidence in its own right: TPWD treats a census data sheet
   * as documentation, so a count needs no photo. It exists only when at least
   * one species has a count above zero; a census with no counts documents
   * nothing.
   */
  kind: "document" | "field_log" | "census_photo" | "census_record";
  docType: "photo" | "receipt" | "note";
  capturedAt: string | null;
  /** Only a human-written or human-confirmed caption — never an AI proposal. */
  caption: string | null;
  lat: number | null;
  lng: number | null;
  storagePath: string | null;
  /** `census_record` only: what was counted, for the Part V data sheet. */
  censusCounts?: { species: string; count: number }[];
};

/** A unit of performed work: an activity row, or a census observation. */
export type ReportContainer = {
  /** Activity uuid, or `census:<observation uuid>`. */
  id: string;
  source: "activity" | "census";
  /** What the landowner called it, for gap messages. */
  label: string;
  practiceCode: PracticeCode | null;
  subActivityCode: string | null;
  performedOn: string | null;
  fieldValues: Record<string, FieldValue>;
  evidence: ReportEvidence[];
};

export type ReportIdentity = {
  ownerName: string | null;
  accountNumber: string | null;
  mailingAddress: string | null;
  phone: string | null;
  tractName: string | null;
  majorityCounty: string | null;
};

export type AssemblyInput = {
  propertyId: string;
  taxYear: number;
  containers: ReportContainer[];
  identity: ReportIdentity;
  /** Answered report question. `""` is a real answer ("none"); null is unasked. */
  additionalCounties: string | null;
  association: {
    member: boolean | null;
    name: string | null;
    /** The 50-129's "managed through an association?" answer. Proposed only. */
    proposedMember: boolean | null;
  };
  /**
   * Confirmed review-screen answers for Part IV blanks, keyed
   * `partIV.<sub-activity code>.<field key>`. They win over the combined value
   * — the landowner settling "which grazing system applied this year".
   */
  partIVAnswers: Record<string, FieldValue>;
};

export type Pwd888Entry = {
  code: string;
  practiceCode: PracticeCode;
  /** The form's line-item heading — the box this entry ticks. */
  name: string;
  containerIds: string[];
  workDates: string[];
  blanks: ReportBlank[];
  /** Dates beyond the slots the form prints, listed on a continuation page. */
  overflowDates: string[];
};

export type Pwd888Exhibit = ReportEvidence & {
  number: number;
  containerId: string;
  subActivityCode: string;
};

export type Pwd888Payload = {
  /** Header: "Wildlife Management Annual Report for the Year(s)". */
  years: string;
  partI: {
    accountNumber: string | null;
    ownerName: string | null;
    /** Street line. The form splits the address across two blanks. */
    mailingAddress: string | null;
    /** "City, town, post office, state and zip code". */
    cityStateZip: string | null;
    phone: string | null;
    tractName: string | null;
    majorityCounty: string | null;
    additionalCounties: string | null;
  };
  /** Ticked only for practices performed AND documented this year. */
  partII: Record<PracticeCode, boolean>;
  partIII: {
    member: boolean | null;
    associationName: string | null;
  };
  /** In form order: practice section, then sub-activity sort order. */
  partIV: Pwd888Entry[];
  partV: Pwd888Exhibit[];
  // Signature and date are deliberately absent. The landowner signs.
};

export type Pwd888Assembly = {
  payload: Pwd888Payload;
  analysis: GapAnalysis;
  /** Everything still open: gap analysis plus what assembly found. */
  gaps: ReportGap[];
  conflicts: (BlankConflict & { subActivityCode: string })[];
  /** Pre-fills awaiting the landowner's confirmation. Never rendered. */
  proposals: { key: string; value: FieldValue; source: string }[];
};
