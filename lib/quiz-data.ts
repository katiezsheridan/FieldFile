export interface QuizResource {
  label: string;
  url: string;
}

export interface QuizInfo {
  title: string;
  content: string;
  resources?: QuizResource[];
}

export interface QuizOption {
  label: string;
  value: string;
  info?: QuizInfo;
  allowUpload?: boolean; // If true, show optional file upload after selection
}

export interface QuizQuestion {
  id: number;
  title: string;
  description?: string;
  type: "single-select" | "county-lookup";
  options: QuizOption[];
  reportSection?: string;
}

export const quizQuestions: QuizQuestion[] = [
  // Q1: Ownership status
  {
    id: 1,
    title: "What best describes your situation?",
    description: "This helps us tailor recommendations to your needs.",
    type: "single-select",
    reportSection: "property-overview",
    options: [
      {
        label: "I currently own land in Texas",
        value: "current-owner",
      },
      {
        label: "I'm looking to buy land in Texas",
        value: "prospective-buyer",
        info: {
          title: "Buying land with an existing exemption?",
          content:
            "If the property you're considering already has an agricultural or wildlife valuation, it's critical to understand the current management plan before closing. Letting it lapse can trigger rollback taxes — up to 5 years of the tax difference plus interest.",
          resources: [
            {
              label: "Texas Comptroller: Ag Valuation Guide",
              url: "https://comptroller.texas.gov/taxes/property-tax/ag-timber/",
            },
          ],
        },
      },
      {
        label: "I recently inherited land in Texas",
        value: "inherited",
        info: {
          title: "Inherited land and tax valuation",
          content:
            "Inherited property may already carry an agricultural or wildlife valuation. If so, the new owner typically needs to continue qualifying activities without interruption to maintain the tax benefit. Check with your county appraisal district about transfer requirements.",
        },
      },
    ],
  },

  // Q2: County lookup via zip code or city
  {
    id: 2,
    title: "Where is your property located?",
    description:
      "Enter a Texas zip code or city name so we can identify your county and provide region-specific guidance.",
    type: "county-lookup",
    reportSection: "property-overview",
    options: [], // Not used for county-lookup type
  },

  // Q3: Property size
  {
    id: 3,
    title: "How large is the property?",
    description: "Approximate acreage is fine.",
    type: "single-select",
    reportSection: "property-overview",
    options: [
      {
        label: "Under 10 acres",
        value: "under-10",
        info: {
          title: "Small acreage and wildlife valuation",
          content:
            "Properties under 10 acres can still qualify for wildlife management valuation in many Texas counties, but the requirements may be stricter. You'll typically need to demonstrate intensive management practices on the available acreage.",
        },
      },
      { label: "10–50 acres", value: "10-50" },
      { label: "50–100 acres", value: "50-100" },
      { label: "100–500 acres", value: "100-500" },
      { label: "500+ acres", value: "500-plus" },
    ],
  },

  // Q4: Primary goal
  {
    id: 4,
    title: "What's your primary goal for the land?",
    type: "single-select",
    reportSection: "land-use",
    options: [
      { label: "Wildlife management tax valuation", value: "wildlife-tax" },
      { label: "Agricultural tax valuation", value: "ag-tax" },
      { label: "Recreational use (hunting, fishing)", value: "recreational" },
      { label: "Conservation or habitat restoration", value: "conservation" },
      { label: "I'm not sure yet", value: "unsure" },
    ],
  },

  // Q5: Secondary goal
  {
    id: 5,
    title: "Are there any secondary goals?",
    description: "Select the most relevant one.",
    type: "single-select",
    reportSection: "land-use",
    options: [
      { label: "Reduce property taxes", value: "reduce-taxes" },
      { label: "Improve habitat and biodiversity", value: "habitat" },
      { label: "Generate income (hunting leases, etc.)", value: "income" },
      { label: "Long-term land investment", value: "investment" },
      { label: "No secondary goal", value: "none" },
    ],
  },

  // Q6: Survey (with optional upload)
  {
    id: 6,
    title: "Do you have a current property survey?",
    description: "A boundary survey showing exact property lines and acreage.",
    type: "single-select",
    reportSection: "property-status",
    options: [
      {
        label: "Yes, I have a recent survey",
        value: "yes",
        allowUpload: true,
      },
      {
        label: "No, I don't have one",
        value: "no",
        info: {
          title: "Why a property survey matters",
          content:
            "A boundary survey is important for wildlife management plans because it defines the exact acreage you're managing. County appraisal districts may require one when applying for or updating your valuation. A survey also helps document habitat types across your property.",
          resources: [
            {
              label: "Texas Society of Professional Surveyors",
              url: "https://www.tsps.org/",
            },
          ],
        },
      },
      { label: "I'm not sure", value: "unsure" },
    ],
  },

  // Q7: Title
  {
    id: 7,
    title: "Is the property title clear?",
    description: "No liens, disputes, or unresolved inheritance issues.",
    type: "single-select",
    reportSection: "property-status",
    options: [
      { label: "Yes, title is clear", value: "clear" },
      {
        label: "There are some issues",
        value: "issues",
        info: {
          title: "Title issues and tax valuation",
          content:
            "Title disputes or liens don't automatically disqualify you from wildlife or ag valuation, but they can complicate filings. It's best to resolve title issues early, especially if you're a new owner or recently inherited the property.",
        },
      },
      { label: "I'm not sure", value: "unsure" },
    ],
  },

  // Q8: Access
  {
    id: 8,
    title: "Does the property have reliable road access?",
    type: "single-select",
    reportSection: "property-status",
    options: [
      { label: "Yes, paved or maintained road", value: "paved" },
      { label: "Yes, but unpaved or seasonal", value: "unpaved" },
      {
        label: "Limited or no direct access",
        value: "limited",
        info: {
          title: "Access and wildlife management",
          content:
            "Limited access doesn't disqualify your property, but it can affect how you conduct and document management activities. Consider access needs for wildlife surveys, habitat management, and any equipment or contractors you may need on-site.",
        },
      },
    ],
  },

  // Q9: Easements
  {
    id: 9,
    title: "Are there any easements on the property?",
    description:
      "Easements grant others rights to use part of your land (utilities, pipelines, access roads).",
    type: "single-select",
    reportSection: "property-status",
    options: [
      { label: "No easements", value: "none" },
      {
        label: "Yes, utility or pipeline easements",
        value: "utility",
        info: {
          title: "Easements and wildlife valuation",
          content:
            "Utility and pipeline easements typically don't affect your wildlife management valuation. However, the easement area may need to be excluded from your managed acreage in some counties. Document the easement boundaries in your management plan.",
        },
      },
      {
        label: "Yes, conservation easement",
        value: "conservation",
        info: {
          title: "Conservation easements",
          content:
            "A conservation easement can actually complement wildlife management valuation. Many conservation easements specifically encourage habitat management. Check your easement terms — they may already require activities that count toward your wildlife plan.",
          resources: [
            {
              label: "Texas Land Trust Council",
              url: "https://www.texaslandtrustcouncil.org/",
            },
          ],
        },
      },
      { label: "I'm not sure", value: "unsure" },
    ],
  },

  // Q10: Previous land use
  {
    id: 10,
    title: "What has the land been used for previously?",
    type: "single-select",
    reportSection: "tax-valuation",
    options: [
      { label: "Cattle ranching or livestock", value: "livestock" },
      { label: "Crops or farming", value: "crops" },
      { label: "Hunting or recreation", value: "hunting" },
      { label: "Undeveloped / natural state", value: "undeveloped" },
      { label: "Mixed use", value: "mixed" },
      { label: "I don't know", value: "unknown" },
    ],
  },

  // Q11: Existing ag/wildlife exemption
  {
    id: 11,
    title: "Does the property currently have an ag or wildlife tax valuation?",
    description:
      "This is sometimes called an 'ag exemption' — it's technically a special valuation, not an exemption.",
    type: "single-select",
    reportSection: "tax-valuation",
    options: [
      {
        label: "Yes, agricultural (1-d-1) valuation",
        value: "ag-valuation",
        info: {
          title: "FieldFile can help you convert to wildlife management",
          content:
            "Your property is currently valued based on its agricultural productivity rather than market value. If you're considering switching to wildlife management, you can do so without a gap in valuation. FieldFile helps landowners through the entire conversion process — from building your wildlife management plan to filing it with your county appraisal district. The conversion typically happens at the start of a new tax year, and we'll guide you through every step.",
          resources: [
            {
              label: "Texas Comptroller: 1-d-1 Appraisal",
              url: "https://comptroller.texas.gov/taxes/property-tax/ag-timber/",
            },
          ],
        },
      },
      {
        label: "Yes, wildlife management valuation",
        value: "wildlife-valuation",
        info: {
          title: "Wildlife management valuation",
          content:
            "Great — your property already qualifies under wildlife management. The key is maintaining compliance with annual activity requirements and filing your report on time each year. FieldFile helps you track activities, store documentation, and generate county-ready reports automatically.",
        },
      },
      {
        label: "No, market value (no special valuation)",
        value: "no-valuation",
        info: {
          title: "Getting started with special valuation",
          content:
            "To qualify for agricultural or wildlife management valuation, Texas requires that the land has been used for agriculture for at least 5 of the past 7 years (for 1-d-1). If the property doesn't have this history, you may need to establish agricultural use first before converting to wildlife management. Talk to your county appraisal district about requirements.",
        },
      },
      {
        label: "I'm not sure",
        value: "unsure",
        info: {
          title: "How to check your property's valuation",
          content:
            "You can check your property's current tax valuation status through your county appraisal district's website. Search by address or owner name. The property record will show whether it has an agricultural or wildlife management special valuation. You can also call your county appraisal district directly.",
        },
      },
    ],
  },

  // Q12: Water features
  {
    id: 12,
    title: "Does the property have any water features?",
    description: "Select the best match.",
    type: "single-select",
    reportSection: "environmental",
    options: [
      { label: "Creek, river, or stream", value: "flowing-water" },
      { label: "Pond or lake", value: "still-water" },
      { label: "Seasonal or intermittent water", value: "seasonal" },
      {
        label: "No natural water sources",
        value: "none",
        info: {
          title: "Supplemental water for wildlife",
          content:
            "No natural water? No problem. Providing supplemental water is actually one of the qualifying wildlife management activities in Texas. Installing and maintaining water sources like troughs, guzzlers, or small ponds can count toward your annual management requirements.",
        },
      },
      { label: "Multiple water features", value: "multiple" },
    ],
  },

  // Q13: Endangered species (info shows region-specific examples)
  {
    id: 13,
    title: "Are you aware of any endangered or threatened species on the property?",
    description:
      "Many Texas properties unknowingly host protected species. Documenting them strengthens your wildlife management plan.",
    type: "single-select",
    reportSection: "environmental",
    options: [
      {
        label: "Yes, documented species present",
        value: "yes",
        // Info will be dynamically enriched with region-specific species in the component
        info: {
          title: "Endangered species and land management",
          content:
            "Having endangered or threatened species on your property can open up additional opportunities. You may qualify for specific conservation programs, grants, or partnerships with organizations like Texas Parks & Wildlife. Documenting these species also strengthens your wildlife management plan.",
          resources: [
            {
              label: "TPWD: Rare, Threatened, and Endangered Species",
              url: "https://tpwd.texas.gov/huntwild/wild/wildlife_diversity/nongame/listed-species/",
            },
          ],
        },
      },
      { label: "No, not that I'm aware of", value: "no" },
      { label: "I'm not sure", value: "unsure" },
    ],
  },

  // Q14: Existing structures
  {
    id: 14,
    title: "What structures exist on the property?",
    description: "Select the best match.",
    type: "single-select",
    reportSection: "infrastructure",
    options: [
      { label: "Home or cabin", value: "home" },
      { label: "Barn, shed, or agricultural buildings", value: "ag-buildings" },
      { label: "Hunting blinds or feeders", value: "hunting-structures" },
      { label: "Fencing only", value: "fencing" },
      { label: "No structures", value: "none" },
      { label: "Multiple types", value: "multiple" },
    ],
  },
];

// ── County / Region lookup data ──────────────────────────────────────────────

export type TexasRegion =
  | "panhandle"
  | "north-central"
  | "west"
  | "east"
  | "central"
  | "south";

export interface CountyResult {
  county: string;
  region: TexasRegion;
}

// Zip code prefix → region mapping (first 3 digits of Texas zip codes)
// Texas zips: 750xx–799xx
const zipPrefixToRegion: Record<string, TexasRegion> = {
  // Panhandle: 790–791, 793
  "790": "panhandle",
  "791": "panhandle",
  "793": "panhandle",
  // West Texas: 792, 797, 798, 799
  "792": "west",
  "797": "west",
  "798": "west",
  "799": "west",
  // North Central: 750–753, 760–764, 766–768
  "750": "north-central",
  "751": "north-central",
  "752": "north-central",
  "753": "north-central",
  "760": "north-central",
  "761": "north-central",
  "762": "north-central",
  "763": "north-central",
  "764": "north-central",
  "766": "north-central",
  "767": "north-central",
  "768": "north-central",
  // East Texas: 754–759, 765, 775
  "754": "east",
  "755": "east",
  "756": "east",
  "757": "east",
  "758": "east",
  "759": "east",
  "765": "east",
  "775": "east",
  // Central Texas: 765, 766, 767, 768, 769, 786–789, 769, 776
  "769": "central",
  "786": "central",
  "787": "central",
  "788": "central",
  "789": "central",
  "776": "central",
  // South Texas: 770–774, 778–785, 794–796
  "770": "south",
  "771": "south",
  "772": "south",
  "773": "south",
  "774": "south",
  "778": "south",
  "779": "south",
  "780": "south",
  "781": "south",
  "782": "south",
  "783": "south",
  "784": "south",
  "785": "south",
  "794": "south",
  "795": "south",
  "796": "south",
};

// City name → { county, region } for common Texas cities
const cityLookup: Record<string, CountyResult> = {
  // Panhandle
  amarillo: { county: "Potter", region: "panhandle" },
  lubbock: { county: "Lubbock", region: "panhandle" },
  canyon: { county: "Randall", region: "panhandle" },
  plainview: { county: "Hale", region: "panhandle" },
  borger: { county: "Hutchinson", region: "panhandle" },
  pampa: { county: "Gray", region: "panhandle" },
  // North Central
  dallas: { county: "Dallas", region: "north-central" },
  "fort worth": { county: "Tarrant", region: "north-central" },
  plano: { county: "Collin", region: "north-central" },
  arlington: { county: "Tarrant", region: "north-central" },
  denton: { county: "Denton", region: "north-central" },
  mckinney: { county: "Collin", region: "north-central" },
  frisco: { county: "Collin", region: "north-central" },
  "wichita falls": { county: "Wichita", region: "north-central" },
  abilene: { county: "Taylor", region: "north-central" },
  waco: { county: "McLennan", region: "north-central" },
  granbury: { county: "Hood", region: "north-central" },
  weatherford: { county: "Parker", region: "north-central" },
  stephenville: { county: "Erath", region: "north-central" },
  // West Texas
  "el paso": { county: "El Paso", region: "west" },
  midland: { county: "Midland", region: "west" },
  odessa: { county: "Ector", region: "west" },
  "san angelo": { county: "Tom Green", region: "west" },
  alpine: { county: "Brewster", region: "west" },
  "fort stockton": { county: "Pecos", region: "west" },
  pecos: { county: "Reeves", region: "west" },
  marfa: { county: "Presidio", region: "west" },
  // East Texas
  tyler: { county: "Smith", region: "east" },
  longview: { county: "Gregg", region: "east" },
  lufkin: { county: "Angelina", region: "east" },
  nacogdoches: { county: "Nacogdoches", region: "east" },
  texarkana: { county: "Bowie", region: "east" },
  marshall: { county: "Harrison", region: "east" },
  palestine: { county: "Anderson", region: "east" },
  huntsville: { county: "Walker", region: "east" },
  conroe: { county: "Montgomery", region: "east" },
  "the woodlands": { county: "Montgomery", region: "east" },
  beaumont: { county: "Jefferson", region: "east" },
  // Central Texas
  austin: { county: "Travis", region: "central" },
  "san marcos": { county: "Hays", region: "central" },
  "new braunfels": { county: "Comal", region: "central" },
  "round rock": { county: "Williamson", region: "central" },
  georgetown: { county: "Williamson", region: "central" },
  temple: { county: "Bell", region: "central" },
  killeen: { county: "Bell", region: "central" },
  "bryan": { county: "Brazos", region: "central" },
  "college station": { county: "Brazos", region: "central" },
  fredericksburg: { county: "Gillespie", region: "central" },
  "johnson city": { county: "Blanco", region: "central" },
  "marble falls": { county: "Burnet", region: "central" },
  "dripping springs": { county: "Hays", region: "central" },
  wimberley: { county: "Hays", region: "central" },
  kerrville: { county: "Kerr", region: "central" },
  boerne: { county: "Kendall", region: "central" },
  llano: { county: "Llano", region: "central" },
  mason: { county: "Mason", region: "central" },
  // South Texas
  houston: { county: "Harris", region: "south" },
  "san antonio": { county: "Bexar", region: "south" },
  "corpus christi": { county: "Nueces", region: "south" },
  laredo: { county: "Webb", region: "south" },
  mcallen: { county: "Hidalgo", region: "south" },
  brownsville: { county: "Cameron", region: "south" },
  harlingen: { county: "Cameron", region: "south" },
  victoria: { county: "Victoria", region: "south" },
  "port aransas": { county: "Nueces", region: "south" },
  kingsville: { county: "Kleberg", region: "south" },
  alice: { county: "Jim Wells", region: "south" },
  "eagle pass": { county: "Maverick", region: "south" },
  uvalde: { county: "Uvalde", region: "south" },
  "del rio": { county: "Val Verde", region: "south" },
  rockport: { county: "Aransas", region: "south" },
  beeville: { county: "Bee", region: "south" },
  seguin: { county: "Guadalupe", region: "south" },
};

export function lookupByZip(zip: string): CountyResult | null {
  const prefix = zip.substring(0, 3);
  const region = zipPrefixToRegion[prefix];
  if (!region) return null;
  return { county: `${zip} area`, region };
}

export function lookupByCity(city: string): CountyResult | null {
  const normalized = city.toLowerCase().trim();
  return cityLookup[normalized] || null;
}

export function lookupLocation(input: string): CountyResult | null {
  const trimmed = input.trim();
  // If it looks like a zip code (5 digits)
  if (/^\d{5}$/.test(trimmed)) {
    return lookupByZip(trimmed);
  }
  // Otherwise try city lookup
  return lookupByCity(trimmed);
}

// ── Region-specific endangered/threatened species ────────────────────────────

export const regionEndangeredSpecies: Record<TexasRegion, string[]> = {
  panhandle: [
    "Lesser Prairie-Chicken",
    "Black-footed Ferret",
    "Arkansas River Shiner",
    "Interior Least Tern",
    "Whooping Crane (migratory)",
  ],
  "north-central": [
    "Black-capped Vireo",
    "Golden-cheeked Warbler",
    "Texas Horned Lizard",
    "Whooping Crane (migratory)",
    "Interior Least Tern",
  ],
  west: [
    "Mexican Long-nosed Bat",
    "Big Bend Gambusia",
    "Pecos Assiminea Snail",
    "Texas Hornshell Mussel",
    "Chisos Mountain Hedgehog Cactus",
  ],
  east: [
    "Red-cockaded Woodpecker",
    "Louisiana Pine Snake",
    "Houston Toad",
    "Texas Trailing Phlox",
    "Rafinesque's Big-eared Bat",
  ],
  central: [
    "Golden-cheeked Warbler",
    "Black-capped Vireo",
    "Barton Springs Salamander",
    "Texas Blind Salamander",
    "Tooth Cave Ground Beetle",
  ],
  south: [
    "Ocelot",
    "Jaguarundi",
    "South Texas Ambrosia",
    "Aplomado Falcon",
    "Kemp's Ridley Sea Turtle",
  ],
};

// ── Region resources ─────────────────────────────────────────────────────────

export interface RegionResource {
  name: string;
  description: string;
  url: string;
}

export const regionResources: Record<string, RegionResource[]> = {
  panhandle: [
    {
      name: "Texas A&M AgriLife Extension — Panhandle",
      description: "Local extension office for land management and wildlife resources.",
      url: "https://agrilifeextension.tamu.edu/",
    },
    {
      name: "Panhandle Groundwater Conservation District",
      description: "Water management resources for the Ogallala Aquifer region.",
      url: "https://www.pgcd.us/",
    },
  ],
  "north-central": [
    {
      name: "Cross Timbers Chapter — Texas Master Naturalist",
      description: "Volunteer-led habitat restoration and education in the DFW region.",
      url: "https://txmn.org/crosstimbers/",
    },
    {
      name: "Texas A&M AgriLife Extension — North Central",
      description: "Agricultural and wildlife extension services.",
      url: "https://agrilifeextension.tamu.edu/",
    },
  ],
  west: [
    {
      name: "Trans-Pecos Wildlife Management",
      description: "TPWD resources for West Texas habitat and species management.",
      url: "https://tpwd.texas.gov/",
    },
    {
      name: "Sul Ross State University — Range Management",
      description: "Academic resources for West Texas land management.",
      url: "https://www.sulross.edu/",
    },
  ],
  east: [
    {
      name: "East Texas Pine Plantation Wildlife",
      description: "TPWD guidance for managing pine forests for wildlife.",
      url: "https://tpwd.texas.gov/",
    },
    {
      name: "Stephen F. Austin State University — Forestry",
      description: "Forestry and habitat management resources for East Texas.",
      url: "https://www.sfasu.edu/",
    },
  ],
  central: [
    {
      name: "Hill Country Alliance",
      description: "Land stewardship and conservation resources for Central Texas.",
      url: "https://www.hillcountryalliance.org/",
    },
    {
      name: "Lady Bird Johnson Wildflower Center",
      description: "Native plant and habitat restoration resources.",
      url: "https://www.wildflower.org/",
    },
  ],
  south: [
    {
      name: "Caesar Kleberg Wildlife Research Institute",
      description: "Leading wildlife research center for South Texas rangelands.",
      url: "https://www.ckwri.tamuk.edu/",
    },
    {
      name: "Rio Grande Valley Nature Coalition",
      description: "Conservation and habitat resources for the Valley region.",
      url: "https://www.rgvnaturecoalition.org/",
    },
  ],
};

export const regionLabels: Record<TexasRegion, string> = {
  panhandle: "Panhandle",
  "north-central": "North Central Texas",
  west: "West Texas",
  east: "East Texas",
  central: "Central Texas",
  south: "South Texas",
};

export interface ReportSectionConfig {
  id: string;
  title: string;
  questionIds: number[];
}

export const reportSections: ReportSectionConfig[] = [
  { id: "property-overview", title: "Property Overview", questionIds: [1, 2, 3] },
  { id: "land-use", title: "Land Use & Goals", questionIds: [4, 5] },
  { id: "property-status", title: "Property Status", questionIds: [6, 7, 8, 9] },
  { id: "tax-valuation", title: "Tax Valuation Status", questionIds: [10, 11] },
  { id: "environmental", title: "Environmental Considerations", questionIds: [12, 13] },
  { id: "infrastructure", title: "Infrastructure", questionIds: [14] },
];
