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
};

export type Activity = {
  id: string;
  propertyId: string;
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

export type PropertyWithDetails = Property & {
  activities: Activity[];
  filing: Filing;
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
