export type ExemptionType = "wildlife" | "agriculture" | "none";

export type ExemptionStatus = "active" | "pending" | "at_risk" | "applying";

export type Property = {
  id: string;
  slug?: string;
  name: string;
  address?: string;
  county: string;
  state: string;
  acreage: number;
  exemptionType: ExemptionType;
  exemptionStatus?: ExemptionStatus;
  photoUrl?: string;
  coordinates: { lat: number; lng: number };
  // Identity fields needed for a complete wildlife plan. Optional everywhere a
  // property is created; required only for a plan to reach 100% completion.
  legalDescription?: string;
  appraisalAccount?: string;
};

export type ActivityType =
  | "birdhouses"
  | "feeders"
  | "water_sources"
  | "brush_management"
  | "native_planting"
  | "erosion_control"
  | "predator_management"
  | "census";

export type ActivityStatus =
  | "not_started"
  | "in_progress"
  | "evidence_uploaded"
  | "needs_followup"
  | "complete";

export type EvidenceRequirement = {
  type: "photo" | "receipt" | "gps" | "date";
  description: string;
  required: boolean;
};

export type Document = {
  id: string;
  activityId?: string;
  propertyId?: string;
  type: "photo" | "receipt" | "note";
  name: string;
  url: string;
  storagePath?: string;
  uploadedAt: string;
  metadata?: {
    gpsCoordinates?: { lat: number; lng: number };
    timestamp?: string;
  };

  // ---- Annual Report model (migrations/add_annual_report_domain.sql) ----
  // All optional: existing rows predate the model, and the backfill leaves
  // anything it cannot establish as null rather than guessing.

  /** Denormalized from the parent activity. Kept in sync by a DB trigger. */
  reportPeriodId?: string;
  contentHash?: string;
  /**
   * When the evidence was captured. Supersedes the legacy `taken_at` /
   * `gps_lat` / `gps_lng` columns, which still exist and are still written by
   * the census document routes — keep both in sync until those are migrated.
   */
  capturedAt?: string;
  capturedLat?: number;
  capturedLng?: number;
  exifRaw?: Record<string, unknown>;
  phase?: EvidencePhase;
  phaseSource?: ProposalSource;
  caption?: string;
  captionSource?: ProposalSource;
  /** 0..1. PROPOSAL ONLY — never a value on a rendered form. */
  aiConfidence?: number;
  aiObservations?: Record<string, unknown>;
  aiModelVersion?: string;
  usabilityFlags?: string[];
  /** The recorded human confirmation event for this document's AI output. */
  confirmedBy?: string;
  confirmedAt?: string;
  exhibitNumber?: string;
  // Receipt extraction. Money is numeric(12,2) in the DB — never do arithmetic
  // on these in floating point; format and total server-side.
  vendor?: string;
  purchaseDate?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  lineItems?: ReceiptLineItem[];
  extractionConfidence?: number;
  extractionRaw?: Record<string, unknown>;
};

export type Activity = {
  id: string;
  propertyId: string;
  /** Legacy flat taxonomy. Superseded by practiceCode + subActivityId. */
  type: ActivityType;
  name: string;
  description: string;
  status: ActivityStatus;
  requiredEvidence: EvidenceRequirement[];
  documents: Document[];
  notes: string;
  dueDate: string;
  completedDate?: string;
  locations?: { lat: number; lng: number; label?: string }[];

  // ---- Annual Report model: THE ACTIVITY IS THE CONTAINER ----
  // practiceCode and subActivityId are chosen by the landowner when the
  // container is created. Evidence inherits its classification from here and
  // is never classified after the fact.

  practiceCode?: PracticeCode;
  subActivityId?: string;
  reportPeriodId?: string;
  /** When the work happened — NOT when the row was created. */
  performedOn?: string;
  /** Set only for work spanning days; null means a single-day activity. */
  performedThrough?: string;
  locationLabel?: string;
  locationLat?: number;
  locationLng?: number;
  performedBy?: string;
  /** Answers keyed by `FieldRequirement.fieldKey` for this sub-activity. */
  fieldValues?: Record<string, FieldValue>;
  narrative?: string;
  narrativeSource?: ProposalSource;
  /** e.g. "Exhibits 4-9". Assigned at render time. */
  exhibitRange?: string;
};

export type FilingStatus = "draft" | "ready_to_file" | "filed" | "accepted" | "needs_followup";

export type Filing = {
  id: string;
  propertyId: string;
  year: number;
  status: FilingStatus;
  filedDate?: string;
  method?: "online" | "mail" | "portal";
  confirmationNumber?: string;
};

// A property's wildlife plan reduced to what a list view needs: how far along
// it is and where to resume. Computed server-side with computePlanCompletion so
// the dashboard and the wizard never disagree about the percentage.
// PlanStatus is declared further down with the rest of the plan types.
export type PlanSummary = {
  id: string;
  year: number;
  status: PlanStatus;
  completionPct: number; // 0..100
  canSubmit: boolean;
  // Labels of the blocks still incomplete, in wizard order.
  remainingBlocks: string[];
};

export type PropertyWithDetails = Property & {
  activities: Activity[];
  filing: Filing;
  // Absent when the property has no plan yet (or predates the plan feature).
  plan?: PlanSummary;
};

// ---------- Wildlife Census Monitoring ----------

export type CensusMethod =
  | "spotlight"
  | "aerial"
  | "daylight_count"
  | "photo_station"
  | "harvest_record"
  | "browse_utilization"
  | "endangered_species"
  | "nongame"
  | "time_area_count"
  | "roost_count"
  | "songbird_transect"
  | "quail_call_covey"
  | "point_count"
  | "game_camera"
  | "track_survey"
  | "direct_observation"
  | "other";

export type CensusSpeciesCount = {
  id: string;
  observationId: string;
  category: string;
  species: string;
  countTotal?: number | null;
  countBuck?: number | null;
  countDoe?: number | null;
  countFawn?: number | null;
  countMale?: number | null;
  countFemale?: number | null;
  countJuvenile?: number | null;
  countUnknown?: number | null;
  notes?: string | null;
};

export type CensusObservation = {
  id: string;
  propertyId: string;
  observedOn: string;           // ISO date
  observedAtTime?: string | null; // HH:MM:SS
  method: CensusMethod;
  locationLabel?: string | null;
  lat?: number | null;
  lng?: number | null;
  weather?: string | null;
  notes?: string | null;
  milesSurveyed?: number | null;
  durationMinutes?: number | null;
  species: CensusSpeciesCount[];
  createdAt: string;
};

// ---------- Mobile Field Logging ----------

export type FieldLogEntryType = "photo_evidence" | "pin_activity";

export type GpsSource = "device_live" | "photo_exif" | "manual_pin";

// TPWD's seven recognized wildlife-management practices.
export type PracticeCategory =
  | "habitat_control"
  | "erosion_control"
  | "predator_control"
  | "supplemental_water"
  | "supplemental_food"
  | "supplemental_shelter"
  | "census";

export type FieldLogEntry = {
  id: string;
  userId: string;
  propertyId: string;
  entryType: FieldLogEntryType;
  practiceCategory: PracticeCategory;
  /** `{PRACTICE}-{NN}` — what the landowner tapped in the field. */
  subActivityCode?: string | null;
  /** The activity container this evidence belongs to. Assigned server-side. */
  activityId?: string | null;
  note?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  gpsAccuracyMeters?: number | null;
  gpsSource?: GpsSource | null;
  capturedAt?: string | null;   // ISO timestamp of the actual activity
  createdAt: string;            // ISO timestamp of row insert
  photoPath?: string | null;    // path in the private 'field-log' bucket
};

// ---------- Wildlife Plan ----------

export type PlanStatus = "draft" | "ready" | "submitted";

// The plan's qualifying practices reuse the canonical TPWD seven defined above
// as PracticeCategory, so a selected practice maps cleanly to a seeded activity.
export type PracticeType = PracticeCategory;

// Free-form documentation captured per practice. Stored as jsonb on the row;
// every field is optional so a practice can be partially filled while drafting.
export type PracticeDocumentation = {
  description?: string;
  plannedActivities?: string[];
  dates?: string[];
  locations?: { lat: number; lng: number; label?: string }[];
  notes?: string;
};

export type PlanPractice = {
  id: string;
  planId: string;
  practiceType: PracticeType;
  selected: boolean;
  documentation: PracticeDocumentation;
};

export type Plan = {
  id: string;
  propertyId: string;
  userId: string;
  year: number;
  status: PlanStatus;
  targetSpecies: string[];
  // Land description block.
  habitatTypes: string[];
  propertyDescription?: string;
  waterSources: string[];
  wildlifeSpecies: string[];
  currentLandUse?: string;
  landHistory?: string;
  practices: PlanPractice[];
  createdAt: string;
  updatedAt: string;
};

// ---------- Annual Report (PWD-888) ----------
//
// See CLAUDE.md > "Annual Report Domain Model" for the rules these types encode.
// Schema: migrations/add_annual_report_domain.sql.
//
// There is no Supabase type codegen in this repo (no `supabase/` directory, no
// `gen types` script) — every table is hand-typed here, matching the existing
// convention of camelCase in TS and snake_case in the DB.

/**
 * The seven qualifying practices under Tax Code 23.51(7)(A)(i)-(vii).
 *
 * This is the stable WIRE format — report payloads, AI proposals, URL params,
 * analytics. `PracticeCategory` above stays the STORAGE format (it is a check
 * constraint on field_log_entries and plan_practices). Convert with
 * PRACTICE_CODE_BY_CATEGORY in lib/practices.ts; never introduce a third
 * spelling of the seven.
 */
export type PracticeCode = "HC" | "EC" | "PC" | "SW" | "SF" | "SH" | "CE";

export type Practice = {
  code: PracticeCode;
  name: string;
  description?: string;
  /** Section number in PWD-888 Part IV (1-7). Matches the statutory order. */
  formSectionNumber: number;
};

/** A PWD-888 Part IV line item, e.g. HC-02 "Prescribed burning". */
export type SubActivity = {
  id: string;
  practiceCode: PracticeCode;
  /** Stable `{PRACTICE}-{NN}` code. Never renumbered, never reused. */
  code: string;
  name: string;
  slug: string;
  /** Minimum-intensity guidance, or a note on how the form prints this item. */
  helpText?: string;
  sortOrder: number;
};

export type FieldInputType =
  | "number"
  | "integer"
  | "text"
  | "longtext"
  | "date"
  | "date_range"
  | "choice"
  | "multi_choice"
  | "boolean";

/** A value stored in `Activity.fieldValues`, shaped by its `FieldInputType`. */
export type FieldValue =
  | number
  | string
  | boolean
  | string[]
  | { from?: string; to?: string }
  | null;

/**
 * The load-bearing table: one row per piece of detail a sub-activity needs to
 * be reportable. Drives the adaptive questionnaire, gap analysis
 * (`requiredForForm`), and what an AI pass is permitted to propose
 * (`aiExtractable`).
 */
export type FieldRequirement = {
  id: string;
  subActivityId: string;
  /** Key used inside `Activity.fieldValues`. Unique per sub-activity. */
  fieldKey: string;
  label: string;
  /**
   * Includes the TPWD minimum-intensity threshold where one exists. Thresholds
   * seeded today are the Edwards Plateau / Cross Timbers standard and say so —
   * intensity is ecoregion-specific.
   */
  helpText?: string;
  inputType: FieldInputType;
  unit?: string;
  /** Present only for choice / multi_choice. The string is value AND label. */
  choices?: string[];
  /** A missing required field is a gap that blocks the render. */
  requiredForForm: boolean;
  aiExtractable: boolean;
  sortOrder: number;
};

export type ReportPeriodStatus =
  | "draft"
  | "in_review"
  | "finalized"
  | "submitted";

/** One annual report, for one property, for one tax year. */
export type ReportPeriod = {
  id: string;
  propertyId: string;
  taxYear: number;
  status: ReportPeriodStatus;
  finalizedAt?: string;
  submittedAt?: string;
  /** The CAD the landowner told us they submitted to. FieldFile never submits. */
  submittedTo?: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * blocking      — the report cannot render without it
 * compliance    — it renders, but the answer risks the three-of-seven rule
 * strengthening — optional; makes the evidence more persuasive
 */
export type QuestionPriority = "blocking" | "compliance" | "strengthening";

/** Whether a value came from a model or from a human confirming one. */
export type ProposalSource = "ai_proposed" | "user_confirmed";

export type EvidencePhase =
  | "before"
  | "during"
  | "after"
  | "standalone"
  | "unknown";

/**
 * One question in the adaptive questionnaire. Questions are GENERATED by gap
 * analysis — a question exists because something is missing.
 *
 * PROPOSE, DO NOT ASSERT: `proposedAnswer` may be pre-filled by AI, last year's
 * filing, or a heuristic, and is rendered as an answer the user taps to
 * confirm. `answer` is only ever written by a human action, and `answeredAt` +
 * `answeredBy` ARE the recorded confirmation event. A row with a
 * `proposedAnswer` and no `answer` has NOT been confirmed and must not reach a
 * rendered form.
 */
export type ReportQuestion = {
  id: string;
  reportPeriodId: string;
  /** Null for period-level questions (Part I owner info, Part III association). */
  activityId?: string;
  /** The `FieldRequirement.fieldKey` this answers, when it maps to one. */
  fieldKey?: string;
  questionText: string;
  inputType: FieldInputType;
  unit?: string;
  choices?: string[];
  priority: QuestionPriority;
  proposedAnswer?: FieldValue;
  /** e.g. "ai:receipt-extraction", "prior-year:2025", "heuristic:acreage". */
  proposedSource?: string;
  answer?: FieldValue;
  answeredAt?: string;
  answeredBy?: string;
  skipped: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReceiptLineItem = {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
};

/**
 * Splitting one receipt across practices — a $900 feed-store receipt might be
 * $600 supplemental food and $300 shelter. Allocation is per practice, not per
 * sub-activity. A DB trigger enforces that allocations never exceed the
 * document total.
 */
export type ReceiptAllocation = {
  id: string;
  documentId: string;
  practiceCode: PracticeCode;
  /** numeric(12,2) in the DB. Do not do float arithmetic on it. */
  amount: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Append-only. Enforced by RLS (no update/delete policy) AND by a trigger,
 * because this app uses the service-role key, which bypasses RLS.
 *
 * The audit trail is the product: if a CAD asks how a value reached the form,
 * the answer must be "the owner confirmed it on this date".
 */
export type AuditEvent = {
  id: string;
  reportPeriodId: string;
  entityType: string;
  entityId?: string;
  eventType: string;
  /** Clerk user id, or a system identifier like "system:gap-analysis". */
  actor: string;
  payload: Record<string, unknown>;
  createdAt: string;
};
