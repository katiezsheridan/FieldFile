// Shared shape and option lists for the plan wizard's editable draft fields.
// Kept separate so the step components and the wizard can both import it
// without a circular dependency.

export type PlanForm = {
  habitatTypes: string[];
  propertyDescription: string;
  waterSources: string[];
  wildlifeSpecies: string[];
  currentLandUse: string;
  landHistory: string;
  targetSpecies: string[];
};

export const EMPTY_PLAN_FORM: PlanForm = {
  habitatTypes: [],
  propertyDescription: "",
  waterSources: [],
  wildlifeSpecies: [],
  currentLandUse: "",
  landHistory: "",
  targetSpecies: [],
};

// Habitat types align with the suitability map Session 3 will use for soft
// "does this practice fit" warnings.
export const HABITAT_OPTIONS: { value: string; label: string }[] = [
  { value: "brush", label: "Brush / shrubland" },
  { value: "woodland", label: "Woodland / forest" },
  { value: "grassland", label: "Grassland / prairie" },
  { value: "wetland", label: "Wetland / marsh" },
  { value: "riparian", label: "Creek or riverbank" },
  { value: "cropland", label: "Cropland / old field" },
];

export const WATER_OPTIONS: { value: string; label: string }[] = [
  { value: "creek_or_river", label: "Creek or river" },
  { value: "pond_or_tank", label: "Pond or stock tank" },
  { value: "spring", label: "Spring or seep" },
  { value: "well_or_trough", label: "Well or trough" },
  { value: "seasonal_only", label: "Seasonal water only" },
  { value: "none", label: "No water on the property" },
];
