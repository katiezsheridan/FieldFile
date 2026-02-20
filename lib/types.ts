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
