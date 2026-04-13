export type Property = {
  id: string;
  slug?: string;
  name: string;
  address: string;
  county: string;
  state: string;
  acreage: number;
  exemptionType: "wildlife" | "agriculture";
  coordinates: { lat: number; lng: number };
};

export type ActivityType =
  | "birdhouses"
  | "feeders"
  | "water_sources"
  | "brush_management"
  | "native_planting"
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
  activityId: string;
  type: "photo" | "receipt" | "note";
  name: string;
  url: string;
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
