import { PracticeType } from "./types";

// The seven qualifying wildlife-management practices, in the order TPWD lists
// them, with plain-language descriptions and a habitat-suitability hint.
//
// `bestFit` is "any" for practices that qualify anywhere, or a list of habitat
// values (matching HABITAT_OPTIONS in components/plan/planForm.ts) the practice
// is typically strongest on. It powers a SOFT, non-blocking warning: if a
// landowner selects a practice and none of their described habitats are in its
// bestFit, we note it but never stop them.

export type PracticeMeta = {
  type: PracticeType;
  label: string;
  blurb: string;
  bestFit: "any" | string[];
};

export const PLAN_PRACTICES: PracticeMeta[] = [
  {
    type: "habitat_control",
    label: "Habitat Control",
    blurb: "Shaping the land so wildlife have native plants, cover, and space.",
    bestFit: ["brush", "woodland", "grassland"],
  },
  {
    type: "erosion_control",
    label: "Erosion Control",
    blurb: "Keeping soil in place and protecting water quality.",
    bestFit: "any",
  },
  {
    type: "predator_control",
    label: "Predator Control",
    blurb: "Managing predator and invasive pressure to protect target species.",
    bestFit: "any",
  },
  {
    type: "supplemental_water",
    label: "Supplemental Water",
    blurb: "Adding reliable water for wildlife.",
    bestFit: "any",
  },
  {
    type: "supplemental_food",
    label: "Supplemental Food",
    blurb: "Adding food beyond what the land provides.",
    bestFit: ["grassland", "woodland", "brush"],
  },
  {
    type: "supplemental_shelter",
    label: "Providing Shelters",
    blurb: "Adding structures wildlife use for nesting and cover.",
    bestFit: ["woodland", "brush", "wetland"],
  },
  {
    type: "census",
    label: "Census Counts",
    blurb: "Counting wildlife to guide management.",
    bestFit: "any",
  },
];

export const PRACTICE_TYPES: PracticeType[] = PLAN_PRACTICES.map((p) => p.type);

export const practiceLabel = (type: PracticeType): string =>
  PLAN_PRACTICES.find((p) => p.type === type)?.label ?? type;

// Plain labels for the habitat values, used only in the suitability warning
// text. Kept in sync with HABITAT_OPTIONS (components/plan/planForm.ts); lib
// does not import from components to keep the dependency direction clean.
const HABITAT_FIT_LABELS: Record<string, string> = {
  brush: "brushland",
  woodland: "woodland",
  grassland: "grassland",
  wetland: "wetland",
  riparian: "creeks and riverbanks",
  cropland: "cropland",
};

// Returns a soft warning string if the practice does not fit any of the
// described habitats, or null if it fits (or there is nothing to judge against).
export function practiceSuitabilityWarning(
  type: PracticeType,
  habitatTypes: string[]
): string | null {
  const meta = PLAN_PRACTICES.find((p) => p.type === type);
  if (!meta || meta.bestFit === "any") return null;
  if (habitatTypes.length === 0) return null; // no habitat described yet
  if (habitatTypes.some((h) => (meta.bestFit as string[]).includes(h))) {
    return null;
  }
  const fits = meta.bestFit
    .map((h) => HABITAT_FIT_LABELS[h] ?? h)
    .join(", ");
  return `${meta.label} usually fits ${fits}. Based on the habitat you described, it may not be the strongest fit here. You can still include it.`;
}
