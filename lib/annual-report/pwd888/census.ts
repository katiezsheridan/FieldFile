/**
 * Census observations as report containers.
 *
 * Census counts are recorded in `census_observations`, not `activities`, so
 * without this bridge a landowner who logs every spotlight night still reads
 * "0 containers" for Census. Each observation becomes one CE container whose
 * sub-activity comes from its method (the CensusMethod → CE-xx table in
 * CLAUDE.md > "Annual Report Domain Model" > Sub-activities) and whose blanks
 * are filled only from what the observation actually recorded.
 *
 * Census observations are never linked to an activity row (census photos carry
 * `observation_id` and a null `activity_id`), so nothing here is counted twice.
 */

import type { CensusMethod, FieldValue } from "@/lib/types";
import type { ReportContainer, ReportEvidence } from "./types";

export type CensusObservationInput = {
  id: string;
  observedOn: string;
  method: CensusMethod;
  methodLabel: string;
  milesSurveyed: number | null;
  /** Display labels of every species recorded, e.g. "White-tailed deer". */
  species: string[];
  /** Per-species totals. Only counts above zero make the record evidence. */
  counts: { species: string; count: number }[];
  photos: ReportEvidence[];
};

export const CENSUS_METHOD_SUB_ACTIVITY: Record<CensusMethod, string> = {
  spotlight: "CE-01",
  direct_observation: "CE-02",
  aerial: "CE-04",
  track_survey: "CE-05",
  daylight_count: "CE-06",
  harvest_record: "CE-07",
  browse_utilization: "CE-08",
  endangered_species: "CE-09",
  nongame: "CE-10",
  photo_station: "CE-11",
  game_camera: "CE-11",
  time_area_count: "CE-11",
  roost_count: "CE-11",
  songbird_transect: "CE-11",
  quail_call_covey: "CE-11",
  point_count: "CE-11",
  other: "CE-11",
};

/** CE-11 "Method" boxes, verbatim from lib/sub-activities.ts. */
const CE11_METHOD: Partial<Record<CensusMethod, string>> = {
  photo_station: "Remote detection (i.e. cameras)",
  game_camera: "Remote detection (i.e. cameras)",
  time_area_count: "Time/area counts",
  roost_count: "Roost counts",
  songbird_transect: "Songbird transects and counts",
  quail_call_covey: "Quail call and covey counts",
  point_count: "Point counts",
  other: "Other",
};

/** CE-06 prints four species boxes; anything else is "Other". */
const CE06_SPECIES = ["Deer", "Turkey", "Dove", "Quail"];

function daylightSpecies(species: string[]): Record<string, FieldValue> {
  const boxes = new Set<string>();
  const other: string[] = [];
  for (const s of species) {
    const box = CE06_SPECIES.find((b) => s.toLowerCase().includes(b.toLowerCase()));
    if (box) boxes.add(box);
    else other.push(s);
  }
  if (other.length) boxes.add("Other");
  return {
    species: CE06_SPECIES.concat("Other").filter((b) => boxes.has(b)),
    ...(other.length ? { species_other: other.join(", ") } : {}),
  };
}

/**
 * The blanks this observation can honestly fill. Methods whose blanks ask for
 * something the observation does not record (track-count categories, harvest
 * data recorded) contribute only the date and the evidence; the blank stays a
 * gap for the landowner.
 */
function fieldValuesFor(o: CensusObservationInput): Record<string, FieldValue> {
  const species = o.species.join(", ");
  const has = species.length > 0;
  switch (CENSUS_METHOD_SUB_ACTIVITY[o.method]) {
    case "CE-01":
      return {
        ...(has ? { target_species: species } : {}),
        ...(o.milesSurveyed ? { route_length: o.milesSurveyed } : {}),
      };
    case "CE-02":
      return has ? { target_species: species } : {};
    case "CE-04":
      return has ? { species_counted: species } : {};
    case "CE-06":
      return has ? daylightSpecies(o.species) : {};
    case "CE-09":
    case "CE-10":
      return {
        ...(has ? { species } : {}),
        method_and_dates: `${o.methodLabel}, ${o.observedOn}`,
      };
    case "CE-11":
      return {
        ...(has ? { species_counted: species } : {}),
        methods: [CE11_METHOD[o.method] ?? "Other"],
        ...(o.method === "other" ? { methods_other: o.methodLabel } : {}),
      };
    default:
      return {};
  }
}

/**
 * The observation's own counts as a Part V exhibit — the census data sheet.
 * Null when nothing was counted: a census entry with no counts is a date and a
 * method, which documents that someone went out, not what they found.
 */
function censusRecord(o: CensusObservationInput): ReportEvidence | null {
  const counted = o.counts.filter((c) => c.count > 0);
  if (counted.length === 0) return null;
  return {
    id: `census-record:${o.id}`,
    kind: "census_record",
    docType: "note",
    capturedAt: o.observedOn,
    caption: `${o.methodLabel} — census data sheet`,
    lat: null,
    lng: null,
    storagePath: null,
    censusCounts: counted,
  };
}

export function censusToContainer(o: CensusObservationInput): ReportContainer {
  const record = censusRecord(o);
  return {
    id: `census:${o.id}`,
    source: "census",
    label: `${o.methodLabel} (census)`,
    practiceCode: "CE",
    subActivityCode: CENSUS_METHOD_SUB_ACTIVITY[o.method],
    performedOn: o.observedOn,
    fieldValues: fieldValuesFor(o),
    evidence: record ? [record, ...o.photos] : o.photos,
  };
}
