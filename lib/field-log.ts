import type { PracticeCategory } from "@/lib/types";

// Labeled options for the seven TPWD-recognized wildlife-management practices.
// Mirrors lib/census-species.ts: the type union lives in lib/types.ts, the
// display list lives here. Order is the order TPWD lists them; labels are the
// audit-facing names a county appraiser recognizes.
export const PRACTICE_CATEGORIES: { value: PracticeCategory; label: string }[] = [
  { value: "habitat_control", label: "Habitat Control" },
  { value: "erosion_control", label: "Erosion Control" },
  { value: "predator_control", label: "Predator Control" },
  { value: "supplemental_water", label: "Supplemental Water" },
  { value: "supplemental_food", label: "Supplemental Food" },
  { value: "supplemental_shelter", label: "Providing Supplemental Shelter" },
  { value: "census", label: "Census / Population Counts" },
];

// Lookup helper for rendering a stored value back to its label.
export const practiceCategoryLabel = (value: PracticeCategory): string =>
  PRACTICE_CATEGORIES.find((p) => p.value === value)?.label ?? value;
