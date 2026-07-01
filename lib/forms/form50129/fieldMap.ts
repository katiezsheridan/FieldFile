/**
 * Field map for Texas Comptroller Form 50-129 —
 * "Application for 1-d-1 (Open-Space) Agricultural Use Appraisal".
 *
 * Field-name strings below were extracted verbatim from the canonical
 * Comptroller AcroForm (see TEMPLATE.revision). They must stay byte-exact:
 * pdf-lib looks fields up by their literal /T name. Do NOT retype them by
 * hand — regenerate from the template if it ever changes (npm run
 * forms:inspect, or the extraction in scripts/).
 *
 * Server-only module (no data access here — this is a pure name/shape map).
 */

export const TEMPLATE = {
  formName: "50-129",
  /** Comptroller form revision printed on the template footer. */
  revision: "9-25/22",
  /**
   * The canonical Comptroller form is year-agnostic: Section 4's year column
   * is a generic "Year"/"Current" header, not hardcoded to a tax year, so a
   * single template serves any filing year. `null` records that fact. Some
   * appraisal districts publish a derived, year-stamped copy with different
   * field names — those need their own template + map. See the spec's
   * "Template is year-specific" and "County variation" notes.
   */
  templateTaxYear: null as number | null,
  /** Path relative to the repo root / process.cwd(). */
  templatePath: "templates/50-129.pdf",
} as const;

/** Text (/Tx) fields, keyed by a semantic name → verbatim AcroForm /T. */
export const TEXT_FIELDS = {
  // --- Header ---
  appraisalDistrictCounty: "Appraisal Districts County",
  /** Header account-number line (distinct from the Section 3 account field). */
  headerAccountNumber: "Appraisal District Account Number if known",
  taxYear: "Tax Year",

  // --- Section 1: Property Owner / Applicant ---
  ownerName: "Name of Property Owner",
  ownerDateOfBirth: "Date of Birth",
  ownerPhysicalAddress: "Physical Address City State ZIP Code",
  ownerPhone: "Primary Phone Number area code and number",
  ownerEmail: "Email Address",
  ownerMailingAddress:
    "Mailing Address City State ZIP Code if different from the physical address provided above",
  /** Free-text shown when owner type = Other. */
  ownerTypeOther: "Sect1-other",

  // --- Section 2: Authorized Representative ---
  repName: "Name of Authorized Representative",
  repTitle: "Title of Authorized Representative",
  repPhone: "Primary Phone Number area code and number_2",
  repEmail: "Email Address_2",
  repMailingAddress: "Mailing Address City State ZIP Code",
  /** Free-text shown when rep basis = Other and explain basis. */
  repBasisOther: "2-a-other",

  // --- Section 3: Property Description and Information ---
  accountNumber: "Account Number if known",
  numberOfAcres: "Number of Acres subject to this application",
  legalDescription:
    "Legal description abstract numbers field numbers andor plat numbers",

  // --- Section 5: Wildlife Management Use ---
  /** The three (or more) wildlife management practices, Section 5 Q1. */
  practice1: "Sect5-1a",
  practice2: "Sect5-1b",
  practice3: "Sect5-1c",
  /** Section 5 Q2: ag land-use category prior to wildlife conversion. */
  priorUseCategory: "category of use prior to conversion",

  // --- Section 6: Conversion to Timber Production ---
  timberConversionDate: "Sect6-1b",

  // --- Section 7: Certification and Signature ---
  /**
   * Printed name of the person certifying. Signature (/Sig) and the
   * certification Date are intentionally NOT in this map — FieldFile never
   * signs or dates the sworn statement; the owner does that by hand.
   */
  certPrintedName: "Printed Name of Property Owner or Authorized Representative",
} as const;

/**
 * Section 4 (Property Use) repeating rows. Row 0 is the "Current" year; rows
 * 1..7 work back through prior years. All optional per-filing data.
 */
export const SECTION4_FIELDS = {
  /** Ag-use category per year row: [Current, yr1..yr7]. */
  agUseCategory: [
    "Agricultural Use Category of Land List all that apply Current",
    "Agricultural Use Category of Land List all that apply1",
    "Agricultural Use Category of Land List all that apply2",
    "Agricultural Use Category of Land List all that apply3",
    "Agricultural Use Category of Land List all that apply4",
    "Agricultural Use Category of Land List all that apply5",
    "Agricultural Use Category of Land List all that apply6",
    "Agricultural Use Category of Land List all that apply7",
  ],
  /** Acres principally devoted per year row: [Current, yr1..yr7]. */
  agUseAcres: [
    "Acres Principally Devoted to Agricultural UseCurrent",
    "Acres Principally Devoted to Agricultural Use1",
    "Acres Principally Devoted to Agricultural Use2",
    "Acres Principally Devoted to Agricultural Use3",
    "Acres Principally Devoted to Agricultural Use4",
    "Acres Principally Devoted to Agricultural Use5",
    "Acres Principally Devoted to Agricultural Use6",
    "Acres Principally Devoted to Agricultural Use7",
  ],
  /** Q2(a): livestock/exotic/wildlife + acres, up to 3 rows. */
  livestock: [
    { name: "Livestock Exotic or WildlifeRow1", acres: "Number of AcresRow1" },
    { name: "Livestock Exotic or WildlifeRow2", acres: "Number of AcresRow2" },
    { name: "Livestock Exotic or WildlifeRow3", acres: "Number of AcresRow3" },
  ],
  /** Q2(b): livestock/exotics + head count, up to 3 rows. */
  livestockHead: [
    { name: "Livestock or ExoticsRow1", head: "Number of HeadRow1" },
    { name: "Livestock or ExoticsRow2", head: "Number of HeadRow2" },
    { name: "Livestock or ExoticsRow3", head: "Number of HeadRow3" },
  ],
  /** Q3: crops + acres, up to 3 rows. */
  crops: [
    { name: "Type of CropRow1", acres: "Number of AcresRow1_2" },
    { name: "Type of CropRow2", acres: "Number of AcresRow2_2" },
    { name: "Type of CropRow3", acres: "Number of AcresRow3_2" },
  ],
  /** Q4: government programs + acres, up to 3 rows. */
  govPrograms: [
    { name: "Program NameRow1", acres: "Number of AcresRow1_3" },
    { name: "Program NameRow2", acres: "Number of AcresRow2_3" },
    { name: "Program NameRow3", acres: "Number of AcresRow3_3" },
  ],
  /** Q5: nonagricultural uses + acres, up to 3 rows. */
  nonAgUses: [
    { name: "Nonagricultural UseRow1", acres: "Number of AcresRow1_4" },
    { name: "Nonagricultural UseRow2", acres: "Number of AcresRow2_4" },
    { name: "Nonagricultural UseRow3", acres: "Number of AcresRow3_4" },
  ],
} as const;

/** Button (/Btn) fields — radio/checkbox groups set via setBtnChoice. */
export const BUTTON_FIELDS = {
  ownerType: "Ownership type",
  repBasis: "2-a",
  // Section 3 yes/no questions. NOTE: the question order was reorganized in
  // form revision 9-25/22 vs. older revisions — these mappings reflect the
  // question text actually printed on the 9-25/22 template (verified by
  // rendering), NOT the field-name numbering, which is a stable-but-opaque
  // artifact. Re-verify against the template if the revision changes.
  /** Q1 "did this district allow 1-d-1 last year" — the renewal-vs-new branch. */
  sec3AllowedLastYear: "Sect3-1",
  /** Q2 "has ownership changed since Jan 1 of last year". */
  sec3OwnershipChanged: "Sect3-2",
  /** Q3 "former owner passed away AND are you the surviving spouse" (combined). */
  sec3DeceasedSurvivingSpouse: "Sect3-3",
  /** Q4 "is the new owner using the land the same way, same individuals" (new in 9-25/22). */
  sec3NewOwnerSameUse: "Sect3-4",
  /** Q5 "is the property within the corporate limits of a city/town". */
  sec3WithinCityLimits: "Sect3-5",
  // Section 5 yes/no questions
  sec5HasWmp: "Sect5-3",
  sec5PartOfLargerTract: "Sect5-4",
  sec5ManagedByAssociation: "Sect5-5",
  sec5EndangeredHabitat: "Sect5-6",
  sec5EsaPermit: "Sect5-7a",
  sec5HabitatPreserveEasement: "Sect5-7b",
  sec5Cercla: "Sect5-8a",
  sec5OilPollutionAct: "Sect5-8b",
  sec5WaterPollutionControl: "Sect5-8c",
  sec5TexasNrc40: "Sect5-8d",
  // Section 6
  sec6ConvertedToTimber: "Sect6-1",
  sec6ContinueAs1d1: "Sect6-2",
} as const;

/** On-state export values for the owner-type radio (verbatim from template). */
export const OWNER_TYPE = {
  individual: "Individual",
  partnership: "Partnership",
  corporation: "Corporation",
  other: "Other (Please specify)",
} as const;
export type OwnerType = keyof typeof OWNER_TYPE;

/** On-state export values for the authorized-rep basis radio (Section 2). */
export const REP_BASIS = {
  officer: "Officer of the company",
  generalPartner: "General partner of the company",
  attorney: "Attorney for property owner",
  agentTaxMatters:
    "Agent for tax matters appointed under Tax Code Section 1.111 with completed and signed Form 50-162",
  other: "Other and explain basis:",
} as const;
export type RepBasis = keyof typeof REP_BASIS;

/**
 * Yes/No radios. Callers pass a boolean; setBtnChoice normalizes to the
 * field's actual on-state (handles export-value quirks like "Yes_17"/"No_17"
 * on Sect6-2).
 */
export const YES = "Yes";
export const NO = "No";

// ---------------------------------------------------------------------------
// Semantic payload — what a caller hands to fill50129(). Everything the owner
// hasn't provided is optional and left blank on the form.
// ---------------------------------------------------------------------------

export type OwnerBlock = {
  type: OwnerType;
  /** Required when type === "other". */
  typeOther?: string;
  name: string;
  dateOfBirth?: string;
  physicalAddress?: string;
  mailingAddress?: string;
  phone?: string;
  email?: string;
};

export type RepresentativeBlock = {
  basis: RepBasis;
  /** Required when basis === "other". */
  basisOther?: string;
  name?: string;
  title?: string;
  phone?: string;
  email?: string;
  mailingAddress?: string;
};

export type PropertyBlock = {
  numberOfAcres: string | number;
  legalDescription?: string;
  accountNumber?: string;
  // Section 3 yes/no questions (rev 9-25/22 wording).
  /** Q1 "Was 1-d-1 allowed on this property last year?" — true = renewal branch. */
  allowedLastYear?: boolean;
  /** Q2 "Has ownership changed since Jan 1 of last year?" */
  ownershipChangedSinceLastYear?: boolean;
  /** Q3 "Has the former owner passed away and are you the surviving spouse?" (combined). */
  deceasedSurvivingSpouse?: boolean;
  /** Q4 New-owner-only: using the land the same way, overseen by the same individuals? */
  newOwnerSameUse?: boolean;
  /** Q5 "Is this property within the corporate limits of a city or town?" */
  withinCityLimits?: boolean;
};

export type AgUseRow = {
  /** "Current" for the current year, or a prior-year label the owner writes. */
  category: string;
  acres: string | number;
};

export type Section4Block = {
  /** Ag-use history, most-recent first: index 0 = Current, then prior years. */
  history?: AgUseRow[];
  livestock?: Array<{ name: string; acres: string | number }>;
  livestockHead?: Array<{ name: string; head: string | number }>;
  crops?: Array<{ name: string; acres: string | number }>;
  govPrograms?: Array<{ name: string; acres: string | number }>;
  nonAgUses?: Array<{ name: string; acres: string | number }>;
};

export type WildlifeBlock = {
  /** At least three management practices (Section 5 Q1). */
  practices: string[];
  priorUseCategory?: string;
  hasWmp?: boolean;
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

export type TimberBlock = {
  convertedAfter1997?: boolean;
  conversionDate?: string;
  continueAs1d1?: boolean;
};

export type Form50129Payload = {
  taxYear: string | number;
  appraisalDistrictCounty: string;
  /** Appraisal district account number (fills both header + Section 3 lines). */
  accountNumber?: string;

  owner: OwnerBlock;
  /** Required for all non-individual owners (Section 2). */
  representative?: RepresentativeBlock;
  property: PropertyBlock;
  section4?: Section4Block;
  wildlife?: WildlifeBlock;
  timber?: TimberBlock;

  /**
   * Section 7 certification. Only the printed name is filled; FieldFile never
   * sets the signature or certification date.
   */
  certification?: { printedName?: string };
};
