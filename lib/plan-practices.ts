import { PracticeType } from "./types";

// The seven qualifying wildlife-management practices, in the order TPWD lists
// them, with plain-language descriptions. Session 3 will add the
// habitat-suitability map and the per-practice documentation sub-forms; for now
// this drives the practices placeholder and the review summary labels.

export type PracticeMeta = {
  type: PracticeType;
  label: string;
  blurb: string;
};

export const PLAN_PRACTICES: PracticeMeta[] = [
  {
    type: "habitat_control",
    label: "Habitat Control",
    blurb: "Shaping the land so wildlife have native plants, cover, and space.",
  },
  {
    type: "erosion_control",
    label: "Erosion Control",
    blurb: "Keeping soil in place and protecting water quality.",
  },
  {
    type: "predator_control",
    label: "Predator Control",
    blurb: "Managing predator and invasive pressure to protect target species.",
  },
  {
    type: "supplemental_water",
    label: "Supplemental Water",
    blurb: "Adding reliable water for wildlife.",
  },
  {
    type: "supplemental_food",
    label: "Supplemental Food",
    blurb: "Adding food beyond what the land provides.",
  },
  {
    type: "supplemental_shelter",
    label: "Providing Shelters",
    blurb: "Adding structures wildlife use for nesting and cover.",
  },
  {
    type: "census",
    label: "Census Counts",
    blurb: "Counting wildlife to guide management.",
  },
];

export const practiceLabel = (type: PracticeType): string =>
  PLAN_PRACTICES.find((p) => p.type === type)?.label ?? type;
