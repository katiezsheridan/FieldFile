import type { ActivityType, FieldInputType, PracticeCode } from "./types";

/**
 * The PWD-888 Part IV catalog: the seven practices, their 48 sub-activities,
 * and every blank, checkbox and yes/no the form actually prints.
 *
 * SOURCE OF TRUTH. Transcribed from the real TPWD form —
 * "1-D-1 Open Space Agricultural Valuation Wildlife Management Annual Report",
 * PWD 888 - W7000 (03/02), Part IV — a copy of which is kept at
 * `templates/pwd_888.pdf` and its extracted Part IV text at
 * `docs/pwd888-part-iv.txt`. Diff against those before changing anything here.
 *
 * The SQL seed for `sub_activities` / `field_requirements` in
 * migrations/add_annual_report_domain.sql is GENERATED from this file by
 * `scripts/generate-field-requirements-seed.ts`. Edit here, regenerate there —
 * never hand-edit the seed, or the two spellings drift.
 *
 * Transcription rules:
 *   * `choices` are the form's own wording, because they name a box printed on
 *     the PDF. Do not "improve" them.
 *   * `label` is what WE show. The annual report is retrospective but the form
 *     reuses the PWD-885 plan sheets, so several of its blanks are phrased
 *     prospectively ("Planned date of construction", "Acreage to be treated
 *     annually"). We render past tense and keep the form's wording in
 *     `formLabel` so the PDF fill stays honest.
 *   * Nothing is invented. If the form does not ask for it, it is not here —
 *     minimum-intensity thresholds live in `helpText` as guidance only, never
 *     as an extra field.
 */

export type FieldDef = {
  /** Key inside `Activity.fieldValues`. Stable, unique within the sub-activity. */
  key: string;
  /** What we show the landowner. Past tense. */
  label: string;
  /** The form's own wording, when it differs from `label`. */
  formLabel?: string;
  inputType: FieldInputType;
  unit?: string;
  /** Verbatim form wording — these name boxes printed on the PDF. */
  choices?: string[];
  helpText?: string;
  /** A blank the form treats as mandatory for this activity to count. */
  requiredForForm?: boolean;
  /**
   * Whether an AI pass is permitted to PROPOSE this value from a photo or
   * receipt. Nothing sets it yet — there is no AI-generated content in the app
   * today, and a proposal is inert until a human confirms it either way.
   */
  aiExtractable?: boolean;
  /** Render only while `key` holds (or, for multi_choice, contains) a value in `equals`. */
  showWhen?: { key: string; equals: (string | boolean)[] };
};

export type SubActivityDef = {
  /** Stable `{PRACTICE}-{NN}`. Never renumbered, never reused. */
  code: string;
  practiceCode: PracticeCode;
  /** The form's own heading for this line item. */
  name: string;
  slug: string;
  /** Position within the practice, as printed on the form. */
  sortOrder: number;
  helpText?: string;
  fields: FieldDef[];
};

export type PracticeDef = {
  code: PracticeCode;
  /** The form's Part IV heading. */
  name: string;
  /** Part IV section number (1-7). Matches the statutory order. */
  formSectionNumber: number;
  description: string;
  /** Tax Code 23.51(7)(A) clause this practice comes from. */
  statute: string;
};

export const PRACTICE_DEFS: PracticeDef[] = [
  {
    code: "HC",
    name: "Habitat Control",
    formSectionNumber: 1,
    description: "Grazing, burning, brush and range work that shapes habitat.",
    statute: "23.51(7)(A)(i)",
  },
  {
    code: "EC",
    name: "Erosion Control",
    formSectionNumber: 2,
    description: "Ponds, gullies, streambanks, levees and water diversions.",
    statute: "23.51(7)(A)(ii)",
  },
  {
    code: "PC",
    name: "Predator Control",
    formSectionNumber: 3,
    description: "Fire ants, nest parasites and mammalian predators.",
    statute: "23.51(7)(A)(iii)",
  },
  {
    code: "SW",
    name: "Providing Supplemental Water",
    formSectionNumber: 4,
    description: "Wetlands, wells, troughs, guzzlers and springs.",
    statute: "23.51(7)(A)(iv)",
  },
  {
    code: "SF",
    name: "Providing Supplemental Food",
    formSectionNumber: 5,
    description: "Food plots, feeders, minerals and pasture management.",
    statute: "23.51(7)(A)(v)",
  },
  {
    code: "SH",
    name: "Providing Supplemental Shelter",
    formSectionNumber: 6,
    description: "Nest boxes, brush piles, fence lines, snags and woody cover.",
    statute: "23.51(7)(A)(vi)",
  },
  {
    code: "CE",
    name: "Census",
    formSectionNumber: 7,
    description: "Counts and records that document your wildlife population.",
    statute: "23.51(7)(A)(vii)",
  },
];

export const SUB_ACTIVITY_DEFS: SubActivityDef[] = [
  // ======================= 1. HABITAT CONTROL =======================
  {
    code: "HC-01",
    practiceCode: "HC",
    name: "Grazing management",
    slug: "grazing-management",
    sortOrder: 1,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: deferment and/or rotational grazing.",
    fields: [
      {
        key: "grazing_system",
        label: "Grazing system used",
        formLabel: "Check grazing system being utilized",
        inputType: "choice",
        requiredForForm: true,
        choices: [
          "1 herd/3 pasture",
          "1 herd/4 pasture",
          "1 herd/multiple pasture",
          "High intensity/low frequency (HILF)",
          "Short duration system",
          "Other type of grazing system",
        ],
      },
      {
        key: "grazing_system_other",
        label: "Other grazing system (describe)",
        inputType: "text",
        showWhen: { key: "grazing_system", equals: ["Other type of grazing system"] },
      },
    ],
  },
  {
    code: "HC-02",
    practiceCode: "HC",
    name: "Prescribed burning",
    slug: "prescribed-burning",
    sortOrder: 2,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: at least 15% of the acreage burned over 7 years.",
    fields: [
      {
        key: "acres_burned",
        label: "Acres burned",
        inputType: "number",
        unit: "acres",
        requiredForForm: true,
      },
      { key: "burn_date", label: "Date burned", inputType: "date", requiredForForm: true },
    ],
  },
  {
    code: "HC-03",
    practiceCode: "HC",
    name: "Range enhancement (range reseeding)",
    slug: "range-enhancement",
    sortOrder: 3,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: 10% of the designated area or 10 acres annually, whichever is smaller, until the project is complete.",
    fields: [
      {
        key: "acres_seeded",
        label: "Acres seeded",
        inputType: "number",
        unit: "acres",
        requiredForForm: true,
      },
      { key: "seeding_date", label: "Date seeded", inputType: "date", requiredForForm: true },
      {
        key: "seeding_method",
        label: "Seeding method",
        inputType: "choice",
        choices: ["Broadcast", "Drilled", "Native hay"],
        requiredForForm: true,
      },
      { key: "seed_mixture", label: "Seeding mixture used", inputType: "text" },
      { key: "fertilized", label: "Fertilized", inputType: "boolean" },
      {
        key: "weed_control",
        label: "Weed control needed for establishment",
        inputType: "boolean",
      },
    ],
  },
  {
    code: "HC-04",
    practiceCode: "HC",
    name: "Brush management",
    slug: "brush-management",
    sortOrder: 4,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: 10% of the designated area or 10 acres annually, whichever is smaller.",
    fields: [
      {
        key: "acres_treated",
        label: "Acres treated",
        inputType: "number",
        unit: "acres",
        requiredForForm: true,
      },
      {
        key: "mechanical_method",
        label: "Mechanical method",
        inputType: "multi_choice",
        choices: [
          "Grubber",
          "Chain",
          "Roller chopper/aerator",
          "Rhome disc",
          "Brush hog (shredder)",
          "Dozer",
          "Hand-cutting (chainsaw)",
          "Hydraulic shears",
          "Other",
        ],
      },
      {
        key: "mechanical_method_other",
        label: "Other mechanical method (describe)",
        inputType: "text",
        showWhen: { key: "mechanical_method", equals: ["Other"] },
      },
      { key: "chemical_kind", label: "Chemical: kind", inputType: "text" },
      { key: "chemical_rate", label: "Chemical: rate", inputType: "text" },
      {
        key: "design",
        label: "Brush management design",
        inputType: "choice",
        choices: ["Block", "Mosaic", "Strips"],
      },
      {
        key: "strip_width",
        label: "Strip width",
        inputType: "number",
        unit: "feet",
        showWhen: { key: "design", equals: ["Strips"] },
      },
      {
        key: "strip_length",
        label: "Strip length",
        inputType: "number",
        unit: "feet",
        showWhen: { key: "design", equals: ["Strips"] },
      },
    ],
  },
  {
    code: "HC-05",
    practiceCode: "HC",
    name: "Fence modification",
    slug: "fence-modification",
    sortOrder: 5,
    helpText:
      "Not part of the Edwards Plateau / Cross Timbers intensity standard — pronghorn and bighorn are Trans-Pecos and Panhandle species. Confirm this practice applies in your ecoregion before relying on it.",
    fields: [
      {
        key: "target_species",
        label: "Target species",
        inputType: "multi_choice",
        choices: ["Pronghorn antelope", "Bighorn sheep"],
        requiredForForm: true,
      },
      {
        key: "technique",
        label: "Technique",
        inputType: "choice",
        choices: [
          "Fold up bottom of net-wire",
          "Replace sections of net-wire with barbed wire",
          "Replace entire net-wire fence with barbed wire",
        ],
        requiredForForm: true,
      },
      {
        key: "gap_width",
        label: "Gap width",
        inputType: "number",
        unit: "inches",
        showWhen: {
          key: "technique",
          equals: [
            "Fold up bottom of net-wire",
            "Replace sections of net-wire with barbed wire",
          ],
        },
      },
      {
        key: "miles_modified",
        label: "Miles of fencing modified",
        formLabel: "Miles of fencing that will be modified",
        inputType: "number",
        unit: "miles",
      },
      {
        key: "miles_replaced",
        label: "Miles replaced",
        inputType: "number",
        unit: "miles",
        showWhen: {
          key: "technique",
          equals: ["Replace entire net-wire fence with barbed wire"],
        },
      },
    ],
  },
  {
    code: "HC-06",
    practiceCode: "HC",
    name: "Riparian management and enhancement",
    slug: "riparian-management",
    sortOrder: 6,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: fence, defer grazing or establish vegetation — 1 project every 10 years.",
    fields: [
      {
        key: "fencing",
        label: "Fencing of riparian area",
        inputType: "choice",
        choices: ["Complete fencing", "Partial fencing"],
      },
      {
        key: "deferment",
        label: "Deferment from livestock grazing",
        inputType: "choice",
        choices: ["Complete deferment", "Partial deferment"],
      },
      { key: "season_deferred", label: "Season deferred", inputType: "text" },
      {
        key: "vegetation_trees",
        label: "Vegetation established — trees (list species)",
        inputType: "text",
      },
      {
        key: "vegetation_shrubs",
        label: "Vegetation established — shrubs (list species)",
        inputType: "text",
      },
      {
        key: "vegetation_herbaceous",
        label: "Vegetation established — herbaceous species (list)",
        inputType: "text",
      },
    ],
  },
  {
    code: "HC-07",
    practiceCode: "HC",
    name: "Wetland enhancement",
    slug: "wetland-enhancement",
    sortOrder: 7,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: annual moist-soil management, or 1 new project per 10 years.",
    fields: [
      {
        key: "enhancement",
        label: "Enhancement performed",
        inputType: "multi_choice",
        choices: [
          "Provide seasonal water",
          "Provide permanent water",
          "Moist soil management",
          "Other",
        ],
        requiredForForm: true,
      },
      {
        key: "enhancement_other",
        label: "Other enhancement (describe)",
        inputType: "text",
        showWhen: { key: "enhancement", equals: ["Other"] },
      },
    ],
  },
  {
    code: "HC-08",
    practiceCode: "HC",
    name: "Habitat protection for species of concern",
    slug: "habitat-protection",
    sortOrder: 8,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: maintain, restore or protect suitable habitat and reduce negative impacts — 1 new project every 10 years.",
    fields: [
      {
        key: "techniques",
        label: "Protection techniques used",
        inputType: "multi_choice",
        choices: [
          "Fencing",
          "Firebreaks",
          "Prescribed burning",
          "Control of nest parasites",
          "Habitat manipulation (thinning, etc.)",
          "Native/exotic ungulate control",
          "Other",
        ],
        requiredForForm: true,
      },
      {
        key: "techniques_other",
        label: "Other technique (describe)",
        inputType: "text",
        showWhen: { key: "techniques", equals: ["Other"] },
      },
    ],
  },
  {
    code: "HC-09",
    practiceCode: "HC",
    name: "Prescribed control of native, exotic and feral species",
    slug: "prescribed-control",
    sortOrder: 9,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: invasive plant control on 10% of the designated area or 10 acres, whichever is smaller.",
    fields: [
      {
        key: "control_target",
        label: "What was controlled",
        inputType: "multi_choice",
        choices: [
          "Prescribed control of vegetation",
          "Prescribed control of animal species",
        ],
        requiredForForm: true,
      },
      {
        key: "species_controlled",
        label: "Species being controlled",
        inputType: "text",
        requiredForForm: true,
      },
      { key: "control_method", label: "Method of control", inputType: "text", requiredForForm: true },
    ],
  },
  {
    code: "HC-10",
    practiceCode: "HC",
    name: "Wildlife restoration",
    slug: "wildlife-restoration",
    sortOrder: 10,
    helpText:
      "Edwards Plateau / Cross Timbers standard: native species reintroduction and management must be coordinated with TPWD to qualify.",
    fields: [
      {
        key: "restoration_type",
        label: "Type of restoration",
        inputType: "multi_choice",
        choices: ["Habitat restoration", "Wildlife restoration"],
        requiredForForm: true,
      },
      { key: "target_species", label: "Target species", inputType: "text", requiredForForm: true },
      { key: "restoration_method", label: "Method of restoration", inputType: "text" },
    ],
  },

  // ======================= 2. EROSION CONTROL =======================
  {
    code: "EC-01",
    practiceCode: "EC",
    name: "Pond construction and repair",
    slug: "pond-construction",
    sortOrder: 1,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: approved NRCS erosion control — 1 new project every 10 years.",
    fields: [
      { key: "surface_area", label: "Surface area", inputType: "number", unit: "acres" },
      {
        key: "cubic_yards",
        label: "Cubic yards of soil displaced",
        formLabel: "Number of cubic yards of soil displaced",
        inputType: "integer",
        unit: "cubic yards",
      },
      { key: "dam_length", label: "Length of dam", inputType: "number", unit: "feet" },
      {
        key: "construction_date",
        label: "Date of construction",
        formLabel: "Planned date of construction",
        inputType: "date",
        requiredForForm: true,
      },
    ],
  },
  {
    code: "EC-02",
    practiceCode: "EC",
    name: "Gully shaping",
    slug: "gully-shaping",
    sortOrder: 2,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: grading and planting erodible areas — 1 new project every 10 years.",
    fields: [
      {
        key: "total_acres",
        label: "Total acres to be treated",
        inputType: "number",
        unit: "acres",
      },
      {
        key: "acres_treated_annually",
        label: "Acres treated annually",
        inputType: "number",
        unit: "acres",
        requiredForForm: true,
      },
      {
        key: "seed_mix",
        label: "Seeding mix used for reestablishment of vegetation",
        inputType: "text",
      },
      {
        key: "construction_date",
        label: "Date of construction",
        formLabel: "Planned date of construction",
        inputType: "date",
        requiredForForm: true,
      },
    ],
  },
  {
    code: "EC-03",
    practiceCode: "EC",
    name: "Streamside, pond, and wetland revegetation",
    slug: "streamside-revegetation",
    sortOrder: 3,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: 1 new project every 10 years.",
    fields: [
      {
        key: "techniques",
        label: "Techniques used",
        inputType: "multi_choice",
        choices: [
          "Native hay bales",
          "Fencing",
          "Filter strips",
          "Seeding upland buffer",
          "Rip-rap, etc.",
          "Stream crossings",
          "Other",
        ],
        requiredForForm: true,
      },
      {
        key: "techniques_other",
        label: "Other technique (describe)",
        inputType: "text",
        showWhen: { key: "techniques", equals: ["Other"] },
      },
      {
        key: "construction_date",
        label: "Date of construction",
        formLabel: "Planned date of construction",
        inputType: "date",
        requiredForForm: true,
      },
    ],
  },
  {
    code: "EC-04",
    practiceCode: "EC",
    name: "Herbaceous and/or woody plant establishment on critical areas (erodible)",
    slug: "critical-area-planting",
    sortOrder: 4,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: a windbreak/shelterbelt of at least 4 rows in 120 ft width by 1/4 mile length, a field border over 30 yards wide, no-till, or CRP management.",
    fields: [
      {
        key: "practices",
        label: "Practices used",
        inputType: "multi_choice",
        choices: [
          "Establish windbreak",
          "Establish shrub mottes",
          "Improve plant diversity",
          "Improve wildlife habitat",
          "Conservation/no-till practices",
          "Manage CRP cover",
        ],
        requiredForForm: true,
      },
    ],
  },
  {
    code: "EC-05",
    practiceCode: "EC",
    name: "Dike/levee construction and management",
    slug: "dike-levee",
    sortOrder: 5,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: 1 new project completed and maintained every 10 years.",
    fields: [
      {
        key: "activities",
        label: "Work performed",
        inputType: "multi_choice",
        choices: [
          "Reshaping/repairing erosion damage",
          "Revegetating/stabilize levee areas",
          "Install water control structure",
          "Fencing",
        ],
        requiredForForm: true,
      },
    ],
  },
  {
    code: "EC-06",
    practiceCode: "EC",
    name: "Establish water diversion",
    slug: "water-diversion",
    sortOrder: 6,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: a diversion protecting erodible areas and recharging wetlands — 1 new project completed and maintained every 10 years.",
    fields: [
      {
        key: "diversion_type",
        label: "Type",
        inputType: "choice",
        choices: ["Channel", "Ridge"],
        requiredForForm: true,
      },
      { key: "slope", label: "Slope", inputType: "choice", choices: ["Level", "Graded"] },
      { key: "length", label: "Length", inputType: "number", unit: "feet" },
      { key: "vegetated", label: "Vegetated", inputType: "boolean" },
      {
        key: "vegetation_native",
        label: "If vegetated — native",
        inputType: "text",
        showWhen: { key: "vegetated", equals: [true] },
      },
      {
        key: "vegetation_crop",
        label: "If vegetated — crop",
        inputType: "text",
        showWhen: { key: "vegetated", equals: [true] },
      },
    ],
  },

  // ======================= 3. PREDATOR CONTROL =======================
  // The form prints fire ants, cowbirds and grackle/starling/house sparrow as
  // three checkboxes sharing ONE "Method of control:" line. We split them into
  // three sub-activities (they are separately countable work) and repeat the
  // shared method list on each.
  {
    code: "PC-01",
    practiceCode: "PC",
    name: "Imported red fire ant control",
    slug: "fire-ant-control",
    sortOrder: 1,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: treat 10 acres or 10% of the infested area. Verify the product is labeled for pasture use before applying.",
    fields: [
      {
        key: "methods",
        label: "Method of control",
        inputType: "multi_choice",
        choices: ["Trapping", "Shooting", "Scare tactics"],
      },
      {
        key: "scare_tactics_detail",
        label: "Scare tactics (describe)",
        inputType: "text",
        showWhen: { key: "methods", equals: ["Scare tactics"] },
      },
    ],
  },
  {
    code: "PC-02",
    practiceCode: "PC",
    name: "Control of cowbirds",
    slug: "cowbird-control",
    sortOrder: 2,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: remove 30 cowbirds annually.",
    fields: [
      {
        key: "methods",
        label: "Method of control",
        inputType: "multi_choice",
        choices: ["Trapping", "Shooting", "Scare tactics"],
        requiredForForm: true,
      },
      {
        key: "scare_tactics_detail",
        label: "Scare tactics (describe)",
        inputType: "text",
        showWhen: { key: "methods", equals: ["Scare tactics"] },
      },
    ],
  },
  {
    code: "PC-03",
    practiceCode: "PC",
    name: "Grackle/starling/house sparrow control",
    slug: "grackle-starling-sparrow-control",
    sortOrder: 3,
    fields: [
      {
        key: "methods",
        label: "Method of control",
        inputType: "multi_choice",
        choices: ["Trapping", "Shooting", "Scare tactics"],
        requiredForForm: true,
      },
      {
        key: "scare_tactics_detail",
        label: "Scare tactics (describe)",
        inputType: "text",
        showWhen: { key: "methods", equals: ["Scare tactics"] },
      },
    ],
  },
  {
    code: "PC-04",
    practiceCode: "PC",
    name: "Mammal and other predator control",
    slug: "predator-control",
    sortOrder: 4,
    fields: [
      {
        key: "species",
        label: "Species controlled",
        inputType: "multi_choice",
        choices: [
          "Coyotes",
          "Feral hogs",
          "Raccoon",
          "Skunk",
          "Bobcat",
          "Mountain lion",
          "Rat snakes",
          "Feral cats/dogs",
        ],
        requiredForForm: true,
      },
      {
        key: "methods",
        label: "Method of control",
        inputType: "multi_choice",
        choices: [
          "Trapping",
          "Shooting",
          "M-44 (licensed applicators)",
          "Poison collars (1080 certified, licensed applicator)",
          "Other",
        ],
        requiredForForm: true,
      },
      {
        key: "methods_other",
        label: "Other method (describe)",
        inputType: "text",
        showWhen: { key: "methods", equals: ["Other"] },
      },
    ],
  },

  // =================== 4. PROVIDING SUPPLEMENTAL WATER ===================
  {
    code: "SW-01",
    practiceCode: "SW",
    name: "Marsh/wetland restoration or development",
    slug: "marsh-wetland-restoration",
    sortOrder: 1,
    fields: [
      {
        key: "types",
        label: "Type of project",
        inputType: "multi_choice",
        choices: [
          "Greentree reservoirs",
          "Shallow roost pond development",
          "Seasonally flooded crops",
          "Artificially created wetlands",
          "Marsh restoration/development/protection",
          "Prairie pothole restoration/development/protection",
          "Moist soil management units",
        ],
        requiredForForm: true,
      },
      {
        key: "construction_date",
        label: "Date of construction",
        formLabel: "Planned date of construction",
        inputType: "date",
        requiredForForm: true,
      },
    ],
  },
  {
    code: "SW-02",
    practiceCode: "SW",
    name: "Well/trough/windmill overflow/other wildlife watering facilities",
    slug: "watering-facilities",
    sortOrder: 2,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: one water source per 300 acres, dependable year-round and wildlife-accessible.",
    fields: [
      {
        key: "work",
        label: "Work performed",
        inputType: "multi_choice",
        choices: [
          "Drill new well",
          "Windmill",
          "Pump",
          "Pipeline",
          "Modification(s) of existing water source",
          "Fencing",
          "Overflow",
          "Trough modification",
        ],
        requiredForForm: true,
      },
      {
        key: "well_depth",
        label: "New well — depth",
        inputType: "number",
        unit: "feet",
        showWhen: { key: "work", equals: ["Drill new well"] },
      },
      {
        key: "well_gpm",
        label: "New well — gallons per minute",
        inputType: "number",
        unit: "gpm",
        showWhen: { key: "work", equals: ["Drill new well"] },
      },
      {
        key: "pipeline_size",
        label: "Pipeline — size",
        inputType: "text",
        showWhen: { key: "work", equals: ["Pipeline"] },
      },
      {
        key: "pipeline_length",
        label: "Pipeline — length",
        inputType: "number",
        unit: "feet",
        showWhen: { key: "work", equals: ["Pipeline"] },
      },
      {
        key: "distance_between_sources",
        label: "Distance between water sources (waterers)",
        inputType: "text",
      },
      // "Type of wildlife watering facility" — the form prints each type with
      // its own "- number ____" blank. One integer field each, in form order.
      { key: "facility_pvc_pipe", label: "PVC pipe facility — number", inputType: "integer" },
      {
        key: "facility_drum",
        label: "Drum with faucet or float — number",
        inputType: "integer",
      },
      {
        key: "facility_small_game_guzzler",
        label: "Small game guzzler — number",
        inputType: "integer",
      },
      {
        key: "facility_dripper",
        label: "Windmill supply pipe dripper — number",
        inputType: "integer",
      },
      {
        key: "facility_plastic_container",
        label: "Plastic container — number",
        inputType: "integer",
      },
      {
        key: "facility_in_ground_bowl",
        label: "In-ground bowl trough — number",
        inputType: "integer",
      },
      {
        key: "facility_big_game_guzzler",
        label: "Big game guzzler — number",
        inputType: "integer",
      },
      {
        key: "facility_inverted_umbrella_guzzler",
        label: "Inverted umbrella guzzler — number",
        inputType: "integer",
      },
      {
        key: "facility_flying_saucer_guzzler",
        label: "Flying saucer guzzler — number",
        inputType: "integer",
      },
      {
        key: "facility_ranch_specialties_guzzler",
        label: "Ranch Specialties guzzler — number",
        inputType: "integer",
      },
      { key: "facility_other", label: "Other facility type", inputType: "text" },
    ],
  },
  {
    code: "SW-03",
    practiceCode: "SW",
    name: "Spring development and/or enhancement",
    slug: "spring-development",
    sortOrder: 3,
    fields: [
      {
        key: "work",
        label: "Work performed",
        inputType: "multi_choice",
        choices: [
          "Fencing",
          "Water diversion/pipeline",
          "Brush removal",
          "Spring clean out",
          "Other",
        ],
        requiredForForm: true,
      },
      {
        key: "work_other",
        label: "Other work (describe)",
        inputType: "text",
        showWhen: { key: "work", equals: ["Other"] },
      },
    ],
  },

  // =================== 5. PROVIDING SUPPLEMENTAL FOOD ===================
  // The form repeats grazing management, prescribed burning and range
  // enhancement here as bare checkboxes — their blanks are printed once, under
  // Habitat Control. Record the detail on the HC activity and check the box here.
  {
    code: "SF-01",
    practiceCode: "SF",
    name: "Grazing management",
    slug: "grazing-management",
    sortOrder: 1,
    helpText:
      "The form prints this as a checkbox only. Its detail lives under Habitat Control > Grazing management.",
    fields: [],
  },
  {
    code: "SF-02",
    practiceCode: "SF",
    name: "Prescribed burning",
    slug: "prescribed-burning",
    sortOrder: 2,
    helpText:
      "The form prints this as a checkbox only. Its detail lives under Habitat Control > Prescribed burning.",
    fields: [],
  },
  {
    code: "SF-03",
    practiceCode: "SF",
    name: "Range enhancement",
    slug: "range-enhancement",
    sortOrder: 3,
    helpText:
      "The form prints this as a checkbox only. Its detail lives under Habitat Control > Range enhancement.",
    fields: [],
  },
  {
    code: "SF-04",
    practiceCode: "SF",
    name: "Food plots",
    slug: "food-plots",
    sortOrder: 4,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: food plots on at least 1% of the habitat, in units of 1/2 acre or larger.",
    fields: [
      { key: "size", label: "Size", inputType: "number", unit: "acres", requiredForForm: true },
      { key: "fenced", label: "Fenced", inputType: "boolean" },
      { key: "irrigated", label: "Irrigated", inputType: "boolean" },
      {
        key: "cool_season_annual_crops",
        label: "Plantings — cool season annual crops",
        inputType: "text",
      },
      {
        key: "warm_season_annual_crops",
        label: "Plantings — warm season annual crops",
        inputType: "text",
      },
      {
        key: "annual_native_mix",
        label: "Plantings — annual mix of native plants",
        inputType: "text",
      },
      {
        key: "perennial_native_mix",
        label: "Plantings — perennial mix of native plants",
        inputType: "text",
      },
    ],
  },
  {
    code: "SF-05",
    practiceCode: "SF",
    name: "Feeders and mineral supplementation",
    slug: "feeders-and-minerals",
    sortOrder: 5,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: one feeder per 320 acres, kept full year-round.",
    fields: [
      {
        key: "purpose",
        label: "Purpose",
        inputType: "multi_choice",
        choices: ["Supplementation", "Harvesting of wildlife"],
        requiredForForm: true,
      },
      { key: "target_species", label: "Targeted wildlife species", inputType: "text" },
      { key: "feed_type", label: "Feed type", inputType: "text" },
      { key: "mineral_type", label: "Mineral type", inputType: "text" },
      { key: "feeder_type", label: "Feeder type", inputType: "text" },
      { key: "feeder_count", label: "Number of feeders", inputType: "integer" },
      {
        key: "mineral_dispensing_method",
        label: "Method of mineral dispensing",
        inputType: "text",
      },
      {
        key: "mineral_location_count",
        label: "Number of mineral locations",
        inputType: "integer",
      },
      { key: "year_round", label: "Year round", inputType: "boolean" },
      {
        key: "year_round_when",
        label: "If not year round, state when",
        inputType: "text",
        showWhen: { key: "year_round", equals: [false] },
      },
    ],
  },
  {
    code: "SF-06",
    practiceCode: "SF",
    name: "Managing tame pasture, old fields and croplands",
    slug: "tame-pasture-management",
    sortOrder: 6,
    fields: [
      {
        key: "practices",
        label: "Practices used",
        inputType: "multi_choice",
        choices: [
          "Overseeding cool and/or warm season legumes and/or small grains",
          "Periodic disturbance (discing)",
          "Conservation/no-till",
        ],
        requiredForForm: true,
      },
    ],
  },
  {
    code: "SF-07",
    practiceCode: "SF",
    name: "Transition management of tame grass monocultures",
    slug: "tame-grass-transition",
    sortOrder: 7,
    fields: [
      {
        key: "overseeded_25_percent",
        label: "Overseeded 25% of tame grass pastures with locally adapted legumes",
        inputType: "boolean",
        requiredForForm: true,
      },
      {
        key: "species_planted",
        label: "Species planted",
        inputType: "multi_choice",
        choices: ["Clover", "Peas", "Vetch", "Other"],
      },
      {
        key: "species_planted_other",
        label: "Other species planted",
        inputType: "text",
        showWhen: { key: "species_planted", equals: ["Other"] },
      },
    ],
  },

  // ================== 6. PROVIDING SUPPLEMENTAL SHELTER ==================
  {
    code: "SH-01",
    practiceCode: "SH",
    name: "Nest boxes, bat boxes and raptor poles",
    slug: "nest-boxes",
    sortOrder: 1,
    helpText:
      "Edwards Plateau / Cross Timbers minimum intensity: one box per 20 acres, maintained annually.",
    fields: [
      { key: "target_species", label: "Target species", inputType: "text" },
      { key: "cavity_type", label: "Cavity type", inputType: "text" },
      { key: "cavity_box_count", label: "Cavity nest boxes — number", inputType: "integer" },
      { key: "bat_box_count", label: "Bat boxes — number", inputType: "integer" },
      { key: "raptor_pole_count", label: "Raptor poles — number", inputType: "integer" },
    ],
  },
  {
    code: "SH-02",
    practiceCode: "SH",
    name: "Brush piles and slash retention",
    slug: "brush-piles",
    sortOrder: 2,
    fields: [
      {
        key: "type",
        label: "Type",
        inputType: "multi_choice",
        choices: ["Slash", "Brush piles"],
        requiredForForm: true,
      },
      { key: "number_per_acre", label: "Number per acre", inputType: "number" },
    ],
  },
  {
    code: "SH-03",
    practiceCode: "SH",
    name: "Fence line management",
    slug: "fence-line-management",
    sortOrder: 3,
    fields: [
      { key: "length", label: "Length", inputType: "number", unit: "feet" },
      { key: "initial_establishment", label: "Initial establishment", inputType: "boolean" },
      {
        key: "plant_types",
        label: "Plant type established",
        inputType: "multi_choice",
        choices: ["Trees", "Shrubs", "Forbs", "Grasses"],
      },
    ],
  },
  {
    code: "SH-04",
    practiceCode: "SH",
    name: "Hay meadow, pasture and cropland management for wildlife",
    slug: "hay-meadow-management",
    sortOrder: 4,
    fields: [
      {
        key: "acres_treated",
        label: "Acres treated",
        inputType: "number",
        unit: "acres",
        requiredForForm: true,
      },
      {
        key: "shelter_establishment",
        label: "Shelter establishment",
        inputType: "multi_choice",
        choices: [
          "Roadside management",
          "Terrace/wind breaks",
          "Field borders",
          "Shelterbelts",
        ],
      },
      {
        key: "crp_management",
        label: "Conservation Reserve Program lands management",
        inputType: "boolean",
      },
      {
        key: "vegetation_type",
        label: "Type of vegetation",
        inputType: "choice",
        choices: ["Annual", "Perennial"],
        showWhen: { key: "crp_management", equals: [true] },
      },
      {
        key: "species_and_percent",
        label: "Species and percent of mixture",
        inputType: "text",
        showWhen: { key: "crp_management", equals: [true] },
      },
      { key: "deferred_mowing", label: "Deferred mowing", inputType: "boolean" },
      {
        key: "deferment_period",
        label: "Period of deferment",
        inputType: "text",
        showWhen: { key: "deferred_mowing", equals: [true] },
      },
      { key: "mowing", label: "Mowing", inputType: "boolean" },
      {
        key: "acres_mowed_annually",
        label: "Acres mowed annually",
        inputType: "number",
        unit: "acres",
        showWhen: { key: "mowing", equals: [true] },
      },
      { key: "no_till", label: "No till/minimum till", inputType: "boolean" },
    ],
  },
  {
    code: "SH-05",
    practiceCode: "SH",
    name: "Half-cutting trees or shrubs",
    slug: "half-cutting",
    sortOrder: 5,
    fields: [
      {
        key: "acres_treated_annually",
        label: "Acreage treated annually",
        formLabel: "Acreage to be treated annually",
        inputType: "number",
        unit: "acres",
        requiredForForm: true,
      },
      {
        key: "half_cut_count",
        label: "Number of half-cuts annually",
        inputType: "integer",
      },
    ],
  },
  {
    code: "SH-06",
    practiceCode: "SH",
    name: "Woody plant/shrub establishment",
    slug: "woody-plant-establishment",
    sortOrder: 6,
    fields: [
      {
        key: "pattern",
        label: "Pattern",
        inputType: "choice",
        choices: ["Block", "Mosaic", "Strips"],
      },
      {
        key: "strip_width",
        label: "Strip width",
        inputType: "number",
        unit: "feet",
        showWhen: { key: "pattern", equals: ["Strips"] },
      },
      {
        key: "strip_length",
        label: "Strip length",
        inputType: "number",
        unit: "feet",
        showWhen: { key: "pattern", equals: ["Strips"] },
      },
      {
        key: "acreage_or_length",
        label: "Acreage or length established annually",
        inputType: "text",
        requiredForForm: true,
      },
      { key: "spacing", label: "Spacing", inputType: "text" },
      { key: "species_used", label: "Shrub/tree species used", inputType: "text" },
    ],
  },
  {
    code: "SH-07",
    practiceCode: "SH",
    name: "Natural cavity/snag development",
    slug: "snag-development",
    sortOrder: 7,
    fields: [
      { key: "snag_species", label: "Species of snag", inputType: "text" },
      { key: "snag_size", label: "Size of snags", inputType: "text" },
      { key: "number_per_acre", label: "Number per acre", inputType: "number" },
    ],
  },

  // ======================= 7. CENSUS =======================
  {
    code: "CE-01",
    practiceCode: "CE",
    name: "Spotlight counts",
    slug: "spotlight-counts",
    sortOrder: 1,
    helpText: "The form requires three dates.",
    fields: [
      { key: "target_species", label: "Targeted species", inputType: "text", requiredForForm: true },
      { key: "route_length", label: "Length of route", inputType: "number", unit: "miles" },
      { key: "route_visibility", label: "Visibility of route", inputType: "text" },
      { key: "date_a", label: "Date A", inputType: "date", requiredForForm: true },
      { key: "date_b", label: "Date B", inputType: "date", requiredForForm: true },
      { key: "date_c", label: "Date C", inputType: "date", requiredForForm: true },
    ],
  },
  {
    code: "CE-02",
    practiceCode: "CE",
    name: "Standardized incidental observations",
    slug: "incidental-observations",
    sortOrder: 2,
    fields: [
      { key: "target_species", label: "Targeted species", inputType: "text", requiredForForm: true },
      {
        key: "observed_from",
        label: "Observations from",
        inputType: "multi_choice",
        choices: ["Feeders", "Food plots", "Blinds", "Vehicle", "Other"],
        requiredForForm: true,
      },
      {
        key: "observed_from_other",
        label: "Other observation point (describe)",
        inputType: "text",
        showWhen: { key: "observed_from", equals: ["Other"] },
      },
      {
        key: "dates",
        label: "Dates",
        inputType: "text",
        helpText: "The form prints one line — list the dates you observed.",
        requiredForForm: true,
      },
    ],
  },
  {
    code: "CE-03",
    practiceCode: "CE",
    name: "Stand counts of deer",
    slug: "stand-counts",
    sortOrder: 3,
    helpText: "The form requires five one-hour counts per stand.",
    fields: [
      { key: "stand_count", label: "Number of stands", inputType: "integer", requiredForForm: true },
      {
        key: "dates",
        label: "Dates",
        inputType: "text",
        helpText: "The form prints one line — list the count dates.",
        requiredForForm: true,
      },
    ],
  },
  {
    code: "CE-04",
    practiceCode: "CE",
    name: "Aerial counts",
    slug: "aerial-counts",
    sortOrder: 4,
    fields: [
      { key: "species_counted", label: "Species counted", inputType: "text", requiredForForm: true },
      {
        key: "survey_type",
        label: "Type of survey",
        inputType: "choice",
        choices: ["Helicopter", "Fixed-wing"],
        requiredForForm: true,
      },
      {
        key: "percent_surveyed",
        label: "Percent of area surveyed",
        inputType: "choice",
        choices: ["Total", "50%", "Other"],
      },
      {
        key: "percent_surveyed_other",
        label: "Other percent surveyed",
        inputType: "text",
        showWhen: { key: "percent_surveyed", equals: ["Other"] },
      },
    ],
  },
  {
    code: "CE-05",
    practiceCode: "CE",
    name: "Track counts",
    slug: "track-counts",
    sortOrder: 5,
    fields: [
      {
        key: "categories",
        label: "Counted",
        inputType: "multi_choice",
        choices: ["Predators", "Furbearers", "Deer", "Other"],
        requiredForForm: true,
      },
      {
        key: "categories_other",
        label: "Other (describe)",
        inputType: "text",
        showWhen: { key: "categories", equals: ["Other"] },
      },
    ],
  },
  {
    code: "CE-06",
    practiceCode: "CE",
    name: "Daylight deer herd/wildlife composition counts",
    slug: "daylight-composition-counts",
    sortOrder: 6,
    fields: [
      {
        key: "species",
        label: "Species",
        inputType: "multi_choice",
        choices: ["Deer", "Turkey", "Dove", "Quail", "Other"],
        requiredForForm: true,
      },
      {
        key: "species_other",
        label: "Other species",
        inputType: "text",
        showWhen: { key: "species", equals: ["Other"] },
      },
    ],
  },
  {
    code: "CE-07",
    practiceCode: "CE",
    name: "Harvest data collection/record keeping",
    slug: "harvest-records",
    sortOrder: 7,
    fields: [
      {
        key: "groups",
        label: "Harvest recorded for",
        inputType: "multi_choice",
        choices: ["Deer", "Game birds"],
        requiredForForm: true,
      },
      {
        key: "data_recorded",
        label: "Data recorded",
        inputType: "multi_choice",
        choices: ["Age", "Weight", "Sex", "Antler data", "Harvest date"],
        requiredForForm: true,
      },
    ],
  },
  {
    code: "CE-08",
    practiceCode: "CE",
    name: "Browse utilization surveys",
    slug: "browse-utilization",
    sortOrder: 8,
    helpText:
      "The form prints this as a checkbox only, and requires thirty 12-foot circular plots.",
    fields: [],
  },
  {
    code: "CE-09",
    practiceCode: "CE",
    name: "Census of endangered, threatened, or protected wildlife",
    slug: "endangered-species-census",
    sortOrder: 9,
    fields: [
      { key: "species", label: "Species", inputType: "text", requiredForForm: true },
      {
        key: "method_and_dates",
        label: "Method and dates",
        inputType: "longtext",
        requiredForForm: true,
      },
    ],
  },
  {
    code: "CE-10",
    practiceCode: "CE",
    name: "Census and monitoring of nongame wildlife species",
    slug: "nongame-census",
    sortOrder: 10,
    fields: [
      { key: "species", label: "Species", inputType: "text", requiredForForm: true },
      {
        key: "method_and_dates",
        label: "Method and dates",
        inputType: "longtext",
        requiredForForm: true,
      },
    ],
  },
  {
    code: "CE-11",
    practiceCode: "CE",
    name: "Miscellaneous counts",
    slug: "miscellaneous-counts",
    sortOrder: 11,
    fields: [
      {
        key: "species_counted",
        label: "Species being counted",
        inputType: "text",
        requiredForForm: true,
      },
      {
        key: "methods",
        label: "Method",
        inputType: "multi_choice",
        choices: [
          "Remote detection (i.e. cameras)",
          "Hahn (walking) line",
          "Roost counts",
          "Booming ground counts",
          "Time/area counts",
          "Songbird transects and counts",
          "Quail call and covey counts",
          "Point counts",
          "Small mammal traps",
          "Drift fences and pitfall traps",
          "Bat departures",
          "Dove call counts",
          "Chachalaca counts",
          "Turkey hen/poult counts",
          "Waterfowl/water bird counts",
          "Other",
        ],
        requiredForForm: true,
      },
      {
        key: "methods_other",
        label: "Other method (describe)",
        inputType: "text",
        showWhen: { key: "methods", equals: ["Other"] },
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export const SUB_ACTIVITY_BY_CODE: Record<string, SubActivityDef> =
  Object.fromEntries(SUB_ACTIVITY_DEFS.map((s) => [s.code, s]));

export const PRACTICE_DEF_BY_CODE: Record<PracticeCode, PracticeDef> =
  Object.fromEntries(PRACTICE_DEFS.map((p) => [p.code, p])) as Record<
    PracticeCode,
    PracticeDef
  >;

/** Sub-activities for one practice, in the order the form prints them. */
export function subActivitiesFor(practiceCode: PracticeCode): SubActivityDef[] {
  return SUB_ACTIVITY_DEFS.filter((s) => s.practiceCode === practiceCode).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
}

/**
 * Whether a conditional field should be shown, given the answers so far.
 * A `multi_choice` gate matches when the selection CONTAINS one of `equals`;
 * everything else matches on equality.
 */
export function isFieldVisible(
  field: FieldDef,
  values: Record<string, unknown>
): boolean {
  if (!field.showWhen) return true;
  const gate = values[field.showWhen.key];
  if (Array.isArray(gate)) {
    return field.showWhen.equals.some((want) => gate.includes(want as string));
  }
  return field.showWhen.equals.some((want) => gate === want);
}

/** The fields to render for a sub-activity, given the answers so far. */
export function visibleFields(
  sub: SubActivityDef,
  values: Record<string, unknown>
): FieldDef[] {
  return sub.fields.filter((f) => isFieldVisible(f, values));
}

/**
 * Legacy `activities.type` for a sub-activity. The column is `not null` and
 * still read by ActivityCard, the dashboard and plan seeding, so new containers
 * keep it populated. It is the INVERSE of the backfill map in
 * migrations/add_annual_report_domain.sql section 10c; keep the two in step.
 */
export function legacyActivityType(subActivityCode: string): ActivityType {
  const exact: Record<string, ActivityType> = {
    "SH-01": "birdhouses",
    "SF-05": "feeders",
    "SW-02": "water_sources",
    "HC-04": "brush_management",
    "HC-03": "native_planting",
    "PC-04": "predator_management",
  };
  if (exact[subActivityCode]) return exact[subActivityCode];

  const byPractice: Record<PracticeCode, ActivityType> = {
    HC: "brush_management",
    EC: "erosion_control",
    PC: "predator_management",
    SW: "water_sources",
    SF: "feeders",
    SH: "birdhouses",
    CE: "census",
  };
  const practice = SUB_ACTIVITY_BY_CODE[subActivityCode]?.practiceCode;
  return practice ? byPractice[practice] : "brush_management";
}
