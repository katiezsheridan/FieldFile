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

// Bare value list + a type guard, for validating query params / payloads
// without re-typing the seven keys. Mirrors PRACTICE_CATEGORIES order.
export const PRACTICE_CATEGORY_VALUES = PRACTICE_CATEGORIES.map((p) => p.value);

export const isPracticeCategory = (v: unknown): v is PracticeCategory =>
  typeof v === "string" &&
  PRACTICE_CATEGORY_VALUES.includes(v as PracticeCategory);

// A stable identity color per practice, used for map pins (Leaflet divIcons need
// an explicit color, not a Tailwind class) and the matching list/legend dots.
// The semantic field-* palette only carries a handful of hues, so — as the
// PropertyMapSection legend already does — categories get their own distinct
// set, chosen to read on satellite imagery and to echo the practice (water =
// blue, food = gold, census = the existing observation purple).
export const PRACTICE_CATEGORY_COLORS: Record<PracticeCategory, string> = {
  habitat_control: "#495336", // field-forest — cover/habitat
  erosion_control: "#8B5E34", // earth brown — soil
  predator_control: "#B64F2F", // field-terra — alert
  supplemental_water: "#2E6F8E", // blue — water
  supplemental_food: "#CAAC58", // field-gold — feed
  supplemental_shelter: "#5E7080", // field-hero slate — structure
  census: "#6C3483", // purple — counts
};

export type CategoryGroup<T> = {
  category: PracticeCategory;
  label: string;
  color: string;
  entries: T[];
};

// Group entries by practice, in canonical TPWD order, always returning all
// seven buckets (empties included). This is the raw material for the annual
// report's "activities by practice category" section and drives the map legend
// (filter to non-empty for display).
export function groupByPracticeCategory<
  T extends { practiceCategory: PracticeCategory },
>(entries: T[]): CategoryGroup<T>[] {
  return PRACTICE_CATEGORIES.map(({ value, label }) => ({
    category: value,
    label,
    color: PRACTICE_CATEGORY_COLORS[value],
    entries: entries.filter((e) => e.practiceCategory === value),
  }));
}
