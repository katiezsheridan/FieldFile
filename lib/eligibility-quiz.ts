// Eligibility quiz config + scoring for the cold-outreach lead flow.
// 5 questions plus an email step. One question per screen.
// See the build spec: qualify the lead, segment for follow-up, capture email.

export type Q1Situation = "own" | "buying" | "inherited";
export type Q3Valuation = "ag" | "wildlife" | "market" | "unsure";
export type Q4Acreage = "lt10" | "10_50" | "50_100" | "100_500" | "500plus";
export type Q5Goal =
  | "maintain_wildlife"
  | "convert_to_wildlife"
  | "new_valuation"
  | "exploring";

export type Segment =
  | "future_buyer"
  | "exploring"
  | "wildlife_maintain"
  | "ag_to_wildlife"
  | "new_valuation";

export type LeadTemp = "hot" | "warm" | "nurture";

export interface QuizAnswers {
  q1?: Q1Situation;
  zip?: string;
  q3?: Q3Valuation;
  q4?: Q4Acreage;
  q5?: Q5Goal;
}

export interface ChoiceOption<V extends string = string> {
  value: V;
  label: string;
}

// ── Questions ────────────────────────────────────────────────────────────────

export const Q1_OPTIONS: ChoiceOption<Q1Situation>[] = [
  { value: "own", label: "I currently own land in Texas" },
  { value: "buying", label: "I'm buying land in Texas" },
  { value: "inherited", label: "I inherited land in Texas" },
];

export const Q3_OPTIONS: ChoiceOption<Q3Valuation>[] = [
  { value: "ag", label: "Yes, agricultural (1-d-1) valuation" },
  { value: "wildlife", label: "Yes, wildlife management (1-d-1w) valuation" },
  { value: "market", label: "No, it's at market value" },
  { value: "unsure", label: "I'm not sure" },
];

export const Q4_OPTIONS: ChoiceOption<Q4Acreage>[] = [
  { value: "lt10", label: "Under 10 acres" },
  { value: "10_50", label: "10 to 50 acres" },
  { value: "50_100", label: "50 to 100 acres" },
  { value: "100_500", label: "100 to 500 acres" },
  { value: "500plus", label: "500+ acres" },
];

export const Q5_OPTIONS: ChoiceOption<Q5Goal>[] = [
  {
    value: "maintain_wildlife",
    label: "Stay compliant on my existing wildlife valuation",
  },
  { value: "convert_to_wildlife", label: "Convert from ag to wildlife valuation" },
  { value: "new_valuation", label: "Get a special valuation for the first time" },
  { value: "exploring", label: "Just exploring for now" },
];

export const ACREAGE_LABELS: Record<Q4Acreage, string> = {
  lt10: "under 10 acres",
  "10_50": "10 to 50 acres",
  "50_100": "50 to 100 acres",
  "100_500": "100 to 500 acres",
  "500plus": "500+ acres",
};

// ── Zip → county ─────────────────────────────────────────────────────────────
// Target counties only. We map the zips that fall (predominantly) in our three
// target counties so `in_target_county` is reliable. Zips outside this map get a
// null county — best-guess is fine for the quiz; the exact appraisal district is
// resolved later, when they become a customer. A few Texas zips span two
// counties; we use the predominant county here.

export const TARGET_COUNTIES = ["Hays", "Comal", "Blanco"] as const;

const ZIP_TO_COUNTY: Record<string, string> = {
  // Hays
  "78610": "Hays", // Buda
  "78619": "Hays", // Driftwood
  "78620": "Hays", // Dripping Springs
  "78640": "Hays", // Kyle
  "78666": "Hays", // San Marcos
  "78667": "Hays", // San Marcos (PO)
  "78676": "Hays", // Wimberley
  "78737": "Hays", // Austin / Belterra (Hays portion)
  // Comal
  "78070": "Comal", // Spring Branch
  "78130": "Comal", // New Braunfels
  "78131": "Comal", // New Braunfels (PO)
  "78132": "Comal", // New Braunfels
  "78133": "Comal", // Canyon Lake
  "78135": "Comal", // New Braunfels (PO)
  "78163": "Comal", // Bulverde
  "78623": "Comal", // Fischer
  // Blanco
  "78606": "Blanco", // Blanco
  "78636": "Blanco", // Johnson City
  "78663": "Blanco", // Round Mountain
};

export interface CountyDerivation {
  county: string | null;
  inTargetCounty: boolean;
}

export function deriveCounty(zip: string): CountyDerivation {
  const county = ZIP_TO_COUNTY[zip] ?? null;
  return {
    county,
    inTargetCounty: county != null && (TARGET_COUNTIES as readonly string[]).includes(county),
  };
}

// A valid Texas zip is 5 digits in the 75xxx–79xxx range (plus the 733xx Austin
// and 885xx El Paso edges). The product is Texas-only, so we validate format here
// and let an unrecognized-but-well-formed zip through with a null county.
export function isValidZip(zip: string): boolean {
  return /^\d{5}$/.test(zip);
}

export function isPlausibleTexasZip(zip: string): boolean {
  if (!/^\d{5}$/.test(zip)) return false;
  const n = Number(zip);
  return (n >= 75000 && n <= 79999) || (n >= 73301 && n <= 73344) || (n >= 88510 && n <= 88595);
}

// ── Segment + lead temperature ───────────────────────────────────────────────
// Evaluate in order, first match wins. Mirrors the spec exactly.

export function computeSegment(a: QuizAnswers): Segment {
  if (a.q1 === "buying") return "future_buyer";
  if (a.q5 === "exploring") return "exploring";
  if (a.q3 === "wildlife" || a.q5 === "maintain_wildlife") return "wildlife_maintain";
  if (a.q3 === "ag" && a.q5 === "convert_to_wildlife") return "ag_to_wildlife";
  if (a.q3 === "ag") return "ag_to_wildlife"; // has ag, not converting — still pitch it
  return "new_valuation"; // market or unsure
}

export function computeLeadTemp(segment: Segment): LeadTemp {
  switch (segment) {
    case "wildlife_maintain":
    case "ag_to_wildlife":
      return "hot";
    case "new_valuation":
      return "warm";
    case "exploring":
    case "future_buyer":
      return "nurture";
  }
}

// ── On-screen confirmation copy (the reward for finishing) ───────────────────
// The detailed follow-up is the email; this is the short on-screen message,
// tailored to their segment. Keep it conversational, no em dashes.

export const SEGMENT_CONFIRMATION: Record<Segment, string> = {
  wildlife_maintain:
    "You're a strong fit. FieldFile keeps your wildlife valuation compliant year-round and generates your annual report when it's due. Full details are on the way to your inbox.",
  ag_to_wildlife:
    "Good news, your land looks like a strong candidate to convert from ag to wildlife valuation. Timing matters here, so check your inbox for the details.",
  new_valuation:
    "There's real potential here. Getting a special valuation in place can meaningfully lower what you owe. We've sent next steps to your inbox.",
  exploring:
    "Happy to help you get oriented. We've sent over a short primer on Texas land valuation to get you started.",
  future_buyer:
    "Smart to plan ahead. We've sent a short guide on what to look for in a property's valuation before you buy.",
};

export const SEGMENT_HEADLINE: Record<Segment, string> = {
  wildlife_maintain: "You're all set",
  ag_to_wildlife: "You look like a strong candidate",
  new_valuation: "There's real potential here",
  exploring: "Let's get you oriented",
  future_buyer: "Smart to plan ahead",
};
