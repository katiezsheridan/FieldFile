import type { CensusMethod } from "./types";

// Two-level species taxonomy: category -> specifics.
// `sexAgeFields` controls which count buckets appear in the form.
// Extend conservatively — species added here appear in the picker without
// any schema change (species is stored as TEXT on census_species_counts).

export type SexAgeField =
  | "total"
  | "buck"
  | "doe"
  | "fawn"
  | "male"
  | "female"
  | "juvenile"
  | "unknown";

export type SpeciesCategory = {
  id: string;
  label: string;
  // which sex/age fields apply to most species in this category
  sexAgeFields: SexAgeField[];
  species: { id: string; label: string }[];
};

export const SPECIES_CATEGORIES: SpeciesCategory[] = [
  {
    id: "deer",
    label: "Deer",
    sexAgeFields: ["buck", "doe", "fawn", "unknown"],
    species: [
      { id: "whitetail", label: "White-tailed Deer" },
      { id: "mule_deer", label: "Mule Deer" },
      { id: "axis", label: "Axis Deer" },
    ],
  },
  {
    id: "bird",
    label: "Bird",
    sexAgeFields: ["total", "male", "female", "juvenile"],
    species: [
      { id: "bobwhite_quail", label: "Northern Bobwhite Quail" },
      { id: "scaled_quail", label: "Scaled Quail" },
      { id: "rio_grande_turkey", label: "Rio Grande Turkey" },
      { id: "eastern_turkey", label: "Eastern Turkey" },
      { id: "mourning_dove", label: "Mourning Dove" },
      { id: "white_winged_dove", label: "White-winged Dove" },
      { id: "waterfowl_duck", label: "Duck (generic)" },
      { id: "songbird_other", label: "Songbird (other)" },
      { id: "raptor", label: "Raptor" },
    ],
  },
  {
    id: "small_mammal",
    label: "Small Mammal",
    sexAgeFields: ["total", "unknown"],
    species: [
      { id: "cottontail", label: "Cottontail Rabbit" },
      { id: "jackrabbit", label: "Jackrabbit" },
      { id: "squirrel_fox", label: "Fox Squirrel" },
      { id: "squirrel_gray", label: "Gray Squirrel" },
    ],
  },
  {
    id: "predator",
    label: "Predator",
    sexAgeFields: ["total", "unknown"],
    species: [
      { id: "coyote", label: "Coyote" },
      { id: "bobcat", label: "Bobcat" },
      { id: "grey_fox", label: "Grey Fox" },
      { id: "mountain_lion", label: "Mountain Lion" },
      { id: "raccoon", label: "Raccoon" },
    ],
  },
  {
    id: "hog",
    label: "Feral Hog",
    sexAgeFields: ["total", "male", "female", "juvenile"],
    species: [{ id: "feral_hog", label: "Feral Hog" }],
  },
  {
    id: "other",
    label: "Other",
    sexAgeFields: ["total", "unknown"],
    species: [{ id: "other", label: "Other (see notes)" }],
  },
];

type MethodOption = { value: CensusMethod; label: string; hint?: string; common?: boolean };

// Order matters: first 4 = "common" group shown by default
export const CENSUS_METHODS: MethodOption[] = [
  { value: "direct_observation", label: "Direct Observation", common: true, hint: "Most common" },
  { value: "game_camera", label: "Game Camera Pull", common: true },
  { value: "spotlight", label: "Spotlight Survey", common: true, hint: "Deer: 3 counts or 15 miles/year" },
  { value: "daylight_count", label: "Daylight Wildlife Count", common: true },
  { value: "aerial", label: "Aerial Count" },
  { value: "photo_station", label: "Photo Station" },
  { value: "harvest_record", label: "Harvest Data / Record Keeping" },
  { value: "browse_utilization", label: "Browse Utilization Survey" },
  { value: "endangered_species", label: "Endangered / Threatened Species Survey" },
  { value: "nongame", label: "Nongame Wildlife Survey" },
  { value: "time_area_count", label: "Time / Area Count" },
  { value: "roost_count", label: "Roost Count" },
  { value: "songbird_transect", label: "Song Bird Transect" },
  { value: "quail_call_covey", label: "Quail Call / Covey Count" },
  { value: "point_count", label: "Point Count" },
  { value: "track_survey", label: "Track Survey" },
  { value: "other", label: "Other" },
];

export const COMMON_METHODS = CENSUS_METHODS.filter((m) => m.common);

export function getCategory(id: string): SpeciesCategory | undefined {
  return SPECIES_CATEGORIES.find((c) => c.id === id);
}

export function getSpeciesLabel(categoryId: string, speciesId: string): string {
  const cat = getCategory(categoryId);
  return cat?.species.find((s) => s.id === speciesId)?.label ?? speciesId;
}

export function getMethodLabel(method: CensusMethod): string {
  return CENSUS_METHODS.find((m) => m.value === method)?.label ?? method;
}
