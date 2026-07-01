/**
 * Assemble a Form 50-129 payload from stored FieldFile data and report what's
 * still missing, tagged by "bucket" so the UI knows what to do about each gap.
 *
 * This session only ASSEMBLES and REPORTS — it never prompts the user and never
 * fills or signs anything. The returned `payload` feeds straight into
 * fill50129(); the returned `missing[]` drives the (future) collect-the-rest UI.
 *
 * The three buckets (see the feature spec):
 *   1 = Known → should fill silently (CAD/property record + Wildlife Plan output)
 *   2 = Ask once, reuse forever (owner profile — Sections 1 & 2)
 *   3 = Genuinely per-filing (Section 4 history + the yes/no confirmations)
 *
 * Server-only.
 */

import {
  type Form50129Payload,
  type OwnerBlock,
  type RepresentativeBlock,
  type WildlifeBlock,
  type Section4Block,
  type TimberBlock,
  type OwnerType,
  type RepBasis,
} from "./fieldMap";
import { practiceLabel } from "@/lib/plan-practices";
import {
  type Form50129DataSource,
  type PropertyRecord,
  type OwnerProfileRecord,
  type PlanRecord,
  type FilingRecord,
  createSupabaseDataSource,
} from "./dataSource";

/** Per-filing (Bucket-3) answers, persisted on form50129_filings.answers. */
export type FilingAnswers = {
  section3?: {
    /** Explicit override of the renewal branch inferred from prior filings. */
    allowedLastYear?: boolean;
    ownershipChangedSinceLastYear?: boolean;
    deceasedSurvivingSpouse?: boolean;
    newOwnerSameUse?: boolean;
    withinCityLimits?: boolean;
  };
  section4?: Section4Block;
  section5?: {
    partOfLargerTract?: boolean;
    managedByAssociation?: boolean;
    endangeredHabitat?: boolean;
    esaPermit?: boolean;
    habitatPreserveEasement?: boolean;
    conservationProject?: {
      cercla?: boolean;
      oilPollutionAct?: boolean;
      waterPollutionControl?: boolean;
      texasNrc40?: boolean;
    };
  };
  timber?: TimberBlock;
};

export type FilingBucket = 1 | 2 | 3;

export type MissingField = {
  /** Stable key, e.g. "owner.email" or "section3.withinCityLimits". */
  key: string;
  /** Human-facing section label, e.g. "Section 1". */
  section: string;
  /** Human-facing field label. */
  label: string;
  bucket: FilingBucket;
};

export type BuildPayloadResult = {
  payload: Form50129Payload;
  missing: MissingField[];
};

/** Everything the pure assembler needs — fetched by buildPayload(). */
export type AssemblyContext = {
  taxYear: number;
  property: PropertyRecord;
  ownerProfile: OwnerProfileRecord | null;
  plan: PlanRecord | null;
  filing: FilingRecord | null;
  priorFilings: FilingRecord[];
  /**
   * Identity to prefill Section 1 with on FIRST open (no owner_profile row yet)
   * — e.g. the Clerk account name/email. Ignored once a profile exists, so it
   * never overrides what the owner has saved.
   */
  fallbackOwner?: { name?: string; email?: string };
};

const REP_BASIS_MAP: Record<
  NonNullable<OwnerProfileRecord["rep_basis"]>,
  RepBasis
> = {
  officer: "officer",
  general_partner: "generalPartner",
  attorney: "attorney",
  agent_tax_matters: "agentTaxMatters",
  other: "other",
};

const nz = (v: string | null | undefined): string | undefined =>
  v && v.trim().length > 0 ? v : undefined;

/** A prior FILED filing means the district already granted 1-d-1 → renewal. */
function inferRenewal(priorFilings: FilingRecord[]): boolean | undefined {
  return priorFilings.some((f) => f.status === "filed") ? true : undefined;
}

/**
 * Pure assembler: turn fetched records into { payload, missing }. Exported so
 * tests can drive it directly with fixtures (no data source, no async).
 */
export function assembleForm50129(ctx: AssemblyContext): BuildPayloadResult {
  const { property, ownerProfile, plan, filing, priorFilings, taxYear } = ctx;
  const answers: FilingAnswers = filing?.answers ?? {};
  const isWildlife = property.exemption_type === "wildlife";

  // --- Section 1: owner (Bucket 2) ---
  // Prefill name/email from the fallback (Clerk account) only before any
  // owner_profile row exists — never overriding a saved profile.
  const noProfile = ownerProfile === null;
  const fallback = noProfile ? ctx.fallbackOwner : undefined;
  const ownerType = (ownerProfile?.owner_type ?? "individual") as OwnerType;
  const owner: OwnerBlock = {
    type: ownerType,
    typeOther: nz(ownerProfile?.owner_type_other),
    name: nz(ownerProfile?.owner_name) ?? nz(fallback?.name) ?? "",
    dateOfBirth: nz(ownerProfile?.date_of_birth),
    physicalAddress: nz(ownerProfile?.physical_address),
    mailingAddress: nz(ownerProfile?.mailing_address),
    phone: nz(ownerProfile?.phone),
    email: nz(ownerProfile?.email) ?? nz(fallback?.email),
  };
  const isEntity = ownerType !== "individual";

  // --- Section 2: authorized representative (Bucket 2, entities only) ---
  let representative: RepresentativeBlock | undefined;
  if (isEntity && ownerProfile?.rep_basis) {
    representative = {
      basis: REP_BASIS_MAP[ownerProfile.rep_basis],
      basisOther: nz(ownerProfile.rep_basis_other),
      name: nz(ownerProfile.rep_name),
      title: nz(ownerProfile.rep_title),
      phone: nz(ownerProfile.rep_phone),
      email: nz(ownerProfile.rep_email),
      mailingAddress: nz(ownerProfile.rep_mailing_address),
    };
  }

  // --- Section 3: property description + yes/no branch ---
  const s3 = answers.section3 ?? {};
  const allowedLastYear = s3.allowedLastYear ?? inferRenewal(priorFilings);

  // --- Section 5: wildlife management (Bucket 1, from the plan) ---
  let wildlife: WildlifeBlock | undefined;
  if (plan) {
    const selected = plan.practices.filter((p) => p.selected);
    const practices = selected.map((p) => {
      const label = practiceLabel(p.practice_type);
      const desc = nz(p.documentation?.description ?? undefined);
      return desc ? `${label} — ${desc}` : label;
    });
    const s5 = answers.section5 ?? {};
    wildlife = {
      practices,
      priorUseCategory: nz(plan.pre_conversion_category),
      hasWmp: true, // a plan built on the TPWD-form workflow exists
      partOfLargerTract: s5.partOfLargerTract,
      managedByAssociation: s5.managedByAssociation,
      endangeredHabitat: s5.endangeredHabitat,
      esaPermit: s5.esaPermit,
      habitatPreserveEasement: s5.habitatPreserveEasement,
      conservationProject: s5.conservationProject,
    };
  }

  const payload: Form50129Payload = {
    taxYear,
    appraisalDistrictCounty: property.county,
    accountNumber: nz(property.appraisal_account),
    owner,
    representative,
    property: {
      numberOfAcres: property.acreage ?? "",
      legalDescription: nz(property.legal_description),
      accountNumber: nz(property.appraisal_account),
      allowedLastYear,
      ownershipChangedSinceLastYear: s3.ownershipChangedSinceLastYear,
      deceasedSurvivingSpouse: s3.deceasedSurvivingSpouse,
      newOwnerSameUse: s3.newOwnerSameUse,
      withinCityLimits: s3.withinCityLimits,
    },
    section4: answers.section4,
    wildlife,
    timber: answers.timber,
    certification: {
      printedName: nz(ownerProfile?.rep_name) ?? nz(ownerProfile?.owner_name),
    },
  };

  // --- Gap detection ---
  const missing = detectMissing({
    payload,
    ownerType,
    isEntity,
    isWildlife,
    hasPlan: plan !== null,
  });

  return { payload, missing };
}

type GapContext = {
  payload: Form50129Payload;
  ownerType: OwnerType;
  isEntity: boolean;
  isWildlife: boolean;
  hasPlan: boolean;
};

function detectMissing(ctx: GapContext): MissingField[] {
  const { payload, ownerType, isEntity, isWildlife, hasPlan } = ctx;
  const p = payload.property;
  const w = payload.wildlife;
  const has = (v: unknown): boolean =>
    v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "");
  const bool = (v: unknown): boolean => v === true || v === false;

  type Check = {
    key: string;
    section: string;
    label: string;
    bucket: FilingBucket;
    ok: boolean;
    when?: boolean;
  };

  const checks: Check[] = [
    // Section 1 — owner profile (Bucket 2)
    { key: "owner.name", section: "Section 1", label: "Name of property owner", bucket: 2, ok: has(payload.owner.name) },
    { key: "owner.physicalAddress", section: "Section 1", label: "Physical address", bucket: 2, ok: has(payload.owner.physicalAddress) },
    { key: "owner.phone", section: "Section 1", label: "Primary phone number", bucket: 2, ok: has(payload.owner.phone) },
    { key: "owner.email", section: "Section 1", label: "Email address", bucket: 2, ok: has(payload.owner.email) },
    { key: "owner.dateOfBirth", section: "Section 1", label: "Date of birth", bucket: 2, ok: has(payload.owner.dateOfBirth), when: ownerType === "individual" },
    { key: "owner.typeOther", section: "Section 1", label: "Owner type (specify)", bucket: 2, ok: has(payload.owner.typeOther), when: ownerType === "other" },

    // Section 2 — authorized representative (Bucket 2, entities only)
    { key: "rep.basis", section: "Section 2", label: "Basis for authority", bucket: 2, ok: !!payload.representative, when: isEntity },
    { key: "rep.name", section: "Section 2", label: "Name of authorized representative", bucket: 2, ok: has(payload.representative?.name), when: isEntity },
    { key: "rep.title", section: "Section 2", label: "Title of authorized representative", bucket: 2, ok: has(payload.representative?.title), when: isEntity },
    { key: "rep.phone", section: "Section 2", label: "Representative phone number", bucket: 2, ok: has(payload.representative?.phone), when: isEntity },
    { key: "rep.email", section: "Section 2", label: "Representative email", bucket: 2, ok: has(payload.representative?.email), when: isEntity },

    // Section 3 — from CAD/property record (Bucket 1)
    { key: "property.county", section: "Section 3", label: "Appraisal district's county", bucket: 1, ok: has(payload.appraisalDistrictCounty) },
    { key: "property.accountNumber", section: "Section 3", label: "Appraisal district account number", bucket: 1, ok: has(p.accountNumber) },
    { key: "property.numberOfAcres", section: "Section 3", label: "Number of acres", bucket: 1, ok: has(p.numberOfAcres) },
    { key: "property.legalDescription", section: "Section 3", label: "Legal description", bucket: 1, ok: has(p.legalDescription) },

    // Section 3 — per-filing confirmations (Bucket 3)
    { key: "section3.allowedLastYear", section: "Section 3", label: "Was 1-d-1 allowed last year? (renewal vs. new)", bucket: 3, ok: bool(p.allowedLastYear) },
    { key: "section3.ownershipChangedSinceLastYear", section: "Section 3", label: "Has ownership changed since Jan 1 of last year?", bucket: 3, ok: bool(p.ownershipChangedSinceLastYear) },
    { key: "section3.deceasedSurvivingSpouse", section: "Section 3", label: "Former owner deceased / surviving spouse?", bucket: 3, ok: bool(p.deceasedSurvivingSpouse) },
    { key: "section3.newOwnerSameUse", section: "Section 3", label: "New owner using land the same way?", bucket: 3, ok: bool(p.newOwnerSameUse), when: p.ownershipChangedSinceLastYear === true },
    { key: "section3.withinCityLimits", section: "Section 3", label: "Within corporate city limits?", bucket: 3, ok: bool(p.withinCityLimits) },

    // Section 4 — ag-use history (Bucket 3)
    { key: "section4.history", section: "Section 4", label: "Agricultural use history (current year at minimum)", bucket: 3, ok: (payload.section4?.history?.length ?? 0) >= 1 },

    // Section 5 — wildlife content from the plan (Bucket 1), when applicable
    { key: "wildlife.practices", section: "Section 5", label: "At least three wildlife management practices", bucket: 1, ok: (w?.practices?.length ?? 0) >= 3, when: isWildlife },
    { key: "wildlife.priorUseCategory", section: "Section 5", label: "Category of use prior to conversion", bucket: 1, ok: has(w?.priorUseCategory), when: isWildlife },
    { key: "wildlife.hasWmp", section: "Section 5", label: "Wildlife management plan on the TPWD form", bucket: 1, ok: hasPlan, when: isWildlife },

    // Section 5 — per-filing confirmations (Bucket 3), when applicable
    { key: "section5.partOfLargerTract", section: "Section 5", label: "Part of a larger qualified tract last year?", bucket: 3, ok: bool(w?.partOfLargerTract), when: isWildlife },
    { key: "section5.managedByAssociation", section: "Section 5", label: "Managed through a wildlife management association?", bucket: 3, ok: bool(w?.managedByAssociation), when: isWildlife },
    { key: "section5.endangeredHabitat", section: "Section 5", label: "Designated endangered/threatened species habitat?", bucket: 3, ok: bool(w?.endangeredHabitat), when: isWildlife },
    { key: "section5.esaPermit", section: "Section 5", label: "Subject to a federal ESA permit?", bucket: 3, ok: bool(w?.esaPermit), when: isWildlife },

    // Section 6 — timber conversion (Bucket 3)
    { key: "timber.convertedAfter1997", section: "Section 6", label: "Converted to timber production after Sept 1, 1997?", bucket: 3, ok: bool(payload.timber?.convertedAfter1997) },
    { key: "timber.continueAs1d1", section: "Section 6", label: "Wish to keep 1-d-1 appraisal?", bucket: 3, ok: bool(payload.timber?.continueAs1d1), when: payload.timber?.convertedAfter1997 === true },
  ];

  return checks
    .filter((c) => (c.when ?? true) && !c.ok)
    .map(({ key, section, label, bucket }) => ({ key, section, label, bucket }));
}

/**
 * Fetch the records for one property + tax year and assemble the payload.
 * Pass a fake `dataSource` in tests; production uses the Supabase-backed source.
 */
export async function buildPayload(
  propertyId: string,
  taxYear: number,
  opts: {
    userId: string;
    dataSource?: Form50129DataSource;
    fallbackOwner?: { name?: string; email?: string };
  },
): Promise<BuildPayloadResult> {
  const { userId } = opts;
  const dataSource = opts.dataSource ?? createSupabaseDataSource();

  const property = await dataSource.getProperty(propertyId, userId);
  if (!property) {
    throw new Error(
      `Form 50-129: property ${propertyId} not found for this user.`,
    );
  }

  const [ownerProfile, plan, filing, priorFilings] = await Promise.all([
    dataSource.getOwnerProfile(propertyId, userId),
    dataSource.getPlan(propertyId, taxYear, userId),
    dataSource.getFiling(propertyId, taxYear, userId),
    dataSource.getPriorFilings(propertyId, taxYear, userId),
  ]);

  return assembleForm50129({
    taxYear,
    property,
    ownerProfile,
    plan,
    filing,
    priorFilings,
    fallbackOwner: opts.fallbackOwner,
  });
}
