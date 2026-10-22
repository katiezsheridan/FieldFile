// County-by-county wildlife management (1-d-1-w) requirements for the Hill
// Country CADs we cover. Single source of truth for the "Texas Wildlife
// Valuation Requirements" blog post (comparison table, county cards, search),
// kept free of UI concerns so the product can reuse it later.
//
// Content rule: every fact here comes from a listed source. Anything we could
// not confirm is a `verifyFlags` entry, which renders as a visible
// "Confirm with the CAD" badge. Do not upgrade a flagged item to plain fact
// without a source.

/** ISO date (YYYY-MM-DD) the county data below was last checked. */
export const LAST_VERIFIED = "2026-10-22";

export type SourceLink = {
  label: string;
  /** Omitted when we cite a document we could not link to. */
  url?: string;
};

/** Which part of a county's record a verify flag attaches to. */
export type VerifyTarget =
  | "minimumAcreage"
  | "reporting"
  | "inspections"
  | "standards"
  | "sources";

export type VerifyFlag = {
  target: VerifyTarget;
  /** What we could not confirm, in one sentence. */
  note: string;
};

export type WildlifeCounty = {
  slug: "hays" | "blanco" | "llano" | "comal";
  name: string;
  cadName: string;
  /** Extra strings the county search should match (lowercase). */
  searchAliases: string[];
  ecoregion: string;
  /** One short line per comparison-table column. */
  snapshot: {
    filingDeadline: string;
    minimumAcreage: string;
    planRenewal: string;
    reporting: string;
    inspections: string;
    mainContact: string;
  };
  application: string[];
  uniqueRequirements: string[];
  reporting: string[];
  inspections: string[];
  /** How FieldFile's log, map, photos and reports fit this county's asks. */
  fieldfileHelps: string[];
  filing: {
    address: string;
    mailingAddress?: string;
    phone: string;
    fax?: string;
    email?: string;
    website: string;
    hours?: string;
    forms: SourceLink[];
  };
  sources: SourceLink[];
  verifyFlags: VerifyFlag[];
};

// ---------------------------------------------------------------------------
// Shared sources
// ---------------------------------------------------------------------------

export const STATE_SOURCES: SourceLink[] = [
  {
    label:
      "Texas Comptroller, Guidelines for Qualification of Agricultural Land in Wildlife Management Use (July 2023)",
    url: "https://comptroller.texas.gov/taxes/property-tax/docs/96-354.pdf",
  },
  {
    label:
      "TPWD, Agricultural Land and Wildlife Management (forms PWD 885 and PWD 888)",
    url: "https://tpwd.texas.gov/landwater/land/private/agricultural_land/",
  },
  {
    label: "TPWD, Legal Summary of Wildlife Management Use Appraisal",
    url: "https://tpwd.texas.gov/landwater/land/private/agricultural_land/legal-summary.phtml",
  },
  {
    label: "34 Tex. Admin. Code 9.2003 (wildlife management plan, annual report)",
    url: "https://www.law.cornell.edu/regulations/texas/34-Tex-Admin-Code-SS-9-2003",
  },
  {
    label: "34 Tex. Admin. Code 9.2005 (wildlife use requirement)",
    url: "https://law.cornell.edu/regulations/texas/34-Tex-Admin-Code-SS-9-2005",
  },
];

const TPWD_FORMS_URL =
  "https://tpwd.texas.gov/landwater/land/private/agricultural_land/";

// ---------------------------------------------------------------------------
// Requirements common to all four counties
// ---------------------------------------------------------------------------

export type CommonRequirement = {
  title: string;
  detail: string;
  verify?: string;
};

export const COMMON_REQUIREMENTS: CommonRequirement[] = [
  {
    title: "Start from 1-d-1 ag valuation",
    detail:
      "Wildlife cannot be the first use that qualifies the land. Hays and Comal want it qualified the prior year.",
  },
  {
    title: "Wildlife is the primary use",
    detail:
      "You manage native wildlife populations for food, medicine, or recreation.",
  },
  {
    title: "3 of 7 practices, every year",
    detail:
      "Habitat, erosion, and predator control; water, food, and shelter; census. Edwards Plateau intensity standards apply in all four counties.",
  },
  {
    title: "A TPWD plan (PWD 885-W7000)",
    detail: "Filed with Form 50-129, to the CAD, not to TPWD.",
  },
  {
    title: "File by April 30",
    detail:
      "Late filings are generally accepted until the appraisal records are approved, with a 10 percent penalty.",
  },
  {
    title: "Reports vary by county",
    detail: "A CAD may ask for a PWD 888 annual report. How often depends on the county.",
  },
  {
    title: "Keep records",
    detail:
      "A dated log with location, cost, and purpose, plus photos, receipts, and a map.",
  },
  {
    title: "Minimum acreage only if the tract shrank",
    detail:
      "It applies only after a split, sale, or resurvey since January 1 of the prior year.",
  },
  {
    title: "Changes can mean reapplying",
    detail:
      "A new owner, acreage, or use can require a new application. Stopping qualifying use can trigger rollback taxes (Comal says 3 years; older Hays guidelines say 5).",
    verify: "The rollback period under current Tax Code Sec. 23.55.",
  },
  {
    title: "The homesite does not count",
    detail: "Do your activities outside the homesite area.",
  },
  {
    title: "Do not rely on the postmark",
    detail:
      "USPS postmarks can lag days behind mailing. File online, hand-deliver, or get a certificate of mailing.",
  },
];

// ---------------------------------------------------------------------------
// Year at a glance
// ---------------------------------------------------------------------------

export type TimelineEntry = { when: string; title: string; detail: string };

export const WILDLIFE_YEAR: TimelineEntry[] = [
  {
    when: "Jan 1",
    title: "Qualification date",
    detail: "Land must be in qualifying use.",
  },
  {
    when: "Jan 1 to Apr 30",
    title: "Filing window",
    detail: "Applications, new 5-year plans, and reapplications.",
  },
  {
    when: "Spring",
    title: "Report requests",
    detail: "Each CAD's letter sets its own due date.",
  },
  {
    when: "May to July",
    title: "Review",
    detail:
      "Late filings accepted with a 10 percent penalty until the appraisal records are approved.",
  },
  {
    when: "Second half",
    title: "Inspections",
    detail: "Hays inspects now. Others inspect on a rolling basis.",
  },
  {
    when: "Year-round",
    title: "Do the work, log it",
    detail: "Spread activities across the seasons.",
  },
];

// ---------------------------------------------------------------------------
// Counties (display order: Hays, Blanco, Llano, Comal)
// ---------------------------------------------------------------------------

export const WILDLIFE_COUNTIES: WildlifeCounty[] = [
  {
    slug: "hays",
    name: "Hays County",
    cadName: "Hays Central Appraisal District",
    searchAliases: ["hays", "hays cad", "hays county", "hcad"],
    ecoregion: "Edwards Plateau",
    snapshot: {
      filingDeadline: "Apr 30",
      minimumAcreage:
        "If tract reduced: 14.29 ac (12.50 in an association, 11.11 for listed species)",
      planRenewal:
        "Reapply after an ownership or acreage change, or after 10 years",
      reporting: "PWD 888 when Hays sends a letter",
      inspections: "Regular, in the second half of the year",
      mainContact: "512-268-2522",
    },
    application: [
      "Form 50-129 and the TPWD 5-year plan (PWD 885-W7000).",
      "A map of activity areas over the 5 years.",
      "Every native species you are targeting, listed in the plan.",
    ],
    uniqueRequirements: [
      "Spread activities year-round, in the seasons that suit them.",
      "A sub-activity counts once. Reseeding is erosion control or food, not both.",
      "A feeder, trough, or salt lick sitting there does not count. Neither do backyard bird feeders, birdhouses, or prepping for hunting season.",
      "Harvest is fine. The CAD compares census counts to harvest counts.",
      "An agent filing for you needs a signed authorization letter.",
      "Associations and co-ops: each owner also files a mini-plan and a membership statement.",
      "Still grazing? Show a rotation schedule and any grazing lease.",
      "Converting from ag: send a request letter, proof of last year's ag use, and the plan. Keep ag going until approved.",
      "Bought land under wildlife: follow the seller's plan this year, then file your own after January 1.",
    ],
    reporting: [
      "PWD 888 annual report only when Hays sends a letter, for the years it names.",
    ],
    inspections: [
      "Regular, sometimes yearly, in the second half of the year. Have your activity log and expense sheet ready. You can come along.",
    ],
    fieldfileHelps: [
      "Your log records the date, location, type, and cost of every activity: the log and expense sheet Hays asks for at inspection.",
      "Pin each activity on your property map, the way Hays recommends.",
      "When the letter comes, FieldFile prepares your PWD 888 from what you logged.",
    ],
    filing: {
      address: "21001 IH 35, Kyle, TX 78640",
      phone: "512-268-2522",
      website: "https://hayscad.com",
      forms: [
        { label: "PWD 885 and PWD 888 (TPWD)", url: TPWD_FORMS_URL },
        {
          label: "Hays wildlife plan recommendations",
          url: "https://hayscad.com/PA/forms/wl%20qual%20and%20subm%20req%20new.pdf",
        },
      ],
    },
    sources: [
      {
        label: "Hays CAD 1-d-1 Open Space Guidelines and Standards (2015)",
        url: "https://hayscad.com/wp-content/uploads/2019/01/HAYSAG-GUIDELINES-STANDARDS-2019.pdf",
      },
      {
        label: "Hays CAD Wildlife Management Plan Recommendations",
        url: "https://hayscad.com/PA/forms/wl%20qual%20and%20subm%20req%20new.pdf",
      },
    ],
    verifyFlags: [
      {
        target: "minimumAcreage",
        note: "Whether the 14.29 acre figure is still current (the guidelines are the 2015 version).",
      },
      {
        target: "sources",
        note: "Whether Hays CAD has updated its guidelines since 2015.",
      },
    ],
  },
  {
    slug: "blanco",
    name: "Blanco County",
    cadName: "Blanco County Appraisal District",
    searchAliases: ["blanco", "blanco cad", "blanco county", "bcad"],
    ecoregion: "Edwards Plateau",
    snapshot: {
      filingDeadline: "Apr 30 (ask by then for up to 60 more days)",
      minimumAcreage:
        "If subdivided last year: 20 ac (12.5 in a co-op or with endangered species)",
      planRenewal: "Not stated",
      reporting: "Update every 2 years: A to J even years, K to Z odd",
      inspections: "Not described",
      mainContact: "830-868-4013",
    },
    application: [
      "Form 50-129.",
      "An approved plan with the complete TPWD 9-page worksheet.",
      "A placement map showing where each practice happens.",
    ],
    uniqueRequirements: [
      "Tracts of 10 acres or less are generally treated as residential.",
      "A visit from a biologist, TPWD, NRCS, or the extension agent is encouraged, not required.",
      "The CAD checks primary use and that your plan's goals are realistic.",
    ],
    reporting: [
      "The update form asks for target species, the practices you did, and a log (date, who, cost, purpose). The 2027 form covers 2025 and 2026.",
      "Do not send photos or receipts, but keep them for an audit.",
      "The due date is set by the mailed request.",
    ],
    inspections: ["Blanco's guidelines do not describe inspections."],
    fieldfileHelps: [
      "Your log already has the date, who did it, cost, and purpose columns the update form asks for.",
      "Map pins give you the placement map.",
      "Photos and receipts stay stored with each activity, ready for an audit.",
    ],
    filing: {
      address: "615 N. Nugent Ave, Johnson City, TX 78636",
      mailingAddress: "PO Box 338, Johnson City, TX 78636",
      phone: "830-868-4013",
      email: "info@blancocad.com",
      website: "https://blancocad.com",
      forms: [
        {
          label: "Wildlife update form (2027)",
          url: "https://blancocad.com/wp-content/uploads/2026/08/WILDLIFE-UPDATE-FORM-2027-1.pdf",
        },
        { label: "Blanco CAD resources", url: "https://blancocad.com/resources/" },
      ],
    },
    sources: [
      {
        label: "Blanco CAD Agricultural/Wildlife Guidelines (2026)",
        url: "https://blancocad.com/wp-content/uploads/2026/08/BCAD-AG-Guidelines-2026-Update.pdf",
      },
      {
        label: "Blanco CAD Wildlife Update Form (2027)",
        url: "https://blancocad.com/wp-content/uploads/2026/08/WILDLIFE-UPDATE-FORM-2027-1.pdf",
      },
      { label: "Blanco CAD resources page", url: "https://blancocad.com/resources/" },
    ],
    verifyFlags: [
      {
        target: "reporting",
        note: "The update due date, set by the CAD's mailed request.",
      },
      {
        target: "inspections",
        note: "Blanco's inspection practice.",
      },
    ],
  },
  {
    slug: "llano",
    name: "Llano County",
    cadName: "Llano Central Appraisal District",
    searchAliases: ["llano", "llano cad", "llano county", "lcad"],
    ecoregion: "Edwards Plateau",
    snapshot: {
      filingDeadline: "Apr 30",
      minimumAcreage: "Not found",
      planRenewal: "No local guideline; call",
      reporting: "Annual update forms",
      inspections: "New applications, then as needed",
      mainContact: "325-247-3065",
    },
    application: [
      "Form 50-129 and PWD 885-W7000, both on llanocad.net/forms.",
      "We found no local wildlife guideline. Llano uses the state forms and Comptroller guidelines; confirm local details by phone.",
    ],
    uniqueRequirements: [
      "July 2026 notice: postmarks can lag, and deadlines will not be extended for postal delays. File online, hand-deliver, use the drop box, or get proof of mailing.",
    ],
    reporting: [
      "Annual update forms go to existing wildlife properties. PWD 888 is on the forms page.",
    ],
    inspections: [
      "New ag and wildlife applications get a physical inspection. Others are inspected by area and as needed.",
    ],
    fieldfileHelps: [
      "Have a dated log, photos, and receipts ready for the inspection of a new application.",
      "FieldFile prepares a PWD 888 from your log, the state report form Llano posts.",
    ],
    filing: {
      address: "103 E. Sandstone St, Llano, TX 78643",
      phone: "325-247-3065",
      fax: "325-247-4656",
      website: "https://llanocad.net",
      hours: "Mon to Fri, 8 to 12 and 1 to 5. Drop box at the main entrance.",
      forms: [{ label: "Llano CAD forms", url: "https://llanocad.net/forms/" }],
    },
    sources: [
      { label: "Llano CAD forms page", url: "https://llanocad.net/forms/" },
      {
        label: "Llano CAD 2025 to 2026 Reappraisal Plan",
        url: "https://llanocad.net/wp-content/uploads/2024/10/2025-2026-Reappraisal-Plan.pdf",
      },
      {
        label: "Llano CAD notice on USPS postmarks (July 2026)",
        url: "https://llanocad.net/wp-content/uploads/2026/07/Important-Notice-Regarding-USPS-Postmarks-and-Property-Tax-Deadlines.pdf",
      },
    ],
    verifyFlags: [
      {
        target: "minimumAcreage",
        note: "Llano's minimum acreage (wildlife use requirement).",
      },
      { target: "reporting", note: "The annual update due date." },
      { target: "standards", note: "Any local wildlife standards." },
    ],
  },
  {
    slug: "comal",
    name: "Comal County",
    cadName: "Comal Appraisal District",
    searchAliases: ["comal", "comal cad", "comal ad", "comal county", "comalad"],
    ecoregion: "Edwards Plateau",
    snapshot: {
      filingDeadline: "Apr 30 (weekend rolls to Monday)",
      minimumAcreage: "If tract reduced: 20 ac (12.5 in an association)",
      planRenewal: "Every 5 years",
      reporting: "Annual report every year",
      inspections: "Routine and random",
      mainContact: "830-625-8597",
    },
    application: [
      "Form 50-129, Comal's supplement form, and the state plan.",
      "The CAD may ask for more within 30 days. The burden of proof is yours.",
    ],
    uniqueRequirements: [
      "Your plan is re-requested at 5 years (ag applications at 10), and after a change of use, acreage, or ownership, or by random selection. No response by year end means losing the valuation.",
      "Report a change of use or face a penalty.",
      "Comal publishes separate wildlife intensity standards on comalad.org.",
      "Land is graded Good, Average, Fair, or Poor by vegetation, soil depth, and brush.",
    ],
    reporting: [
      "Annual Report for Wildlife Management, every year, on the comalad.org Forms page.",
    ],
    inspections: [
      "Routine and random. The CAD may call, email, or send an Ag Inspection Letter. Refusing can cost your valuation or trigger rollback.",
    ],
    fieldfileHelps: [
      "A full year of dated activities, photos, and receipts in one place for the annual report.",
      "Records ready to show on short notice for a random inspection.",
      "FieldFile's PWD 888 draft gives you the details to copy onto Comal's form.",
    ],
    filing: {
      address: "900 S. Seguin Ave, New Braunfels, TX",
      phone: "830-625-8597",
      email: "comalad@co.comal.tx.us",
      website: "https://comalad.org",
      forms: [{ label: "Comal forms (supplement, annual report)", url: "https://comalad.org/forms/" }],
    },
    sources: [
      {
        label: "Comal Appraisal District Open Space Guidelines and Standards (2024)",
        url: "https://comalad.org/wp-content/uploads/2024/01/2024-OPEN-SPACE-GUIDELINES-STANDARDS.pdf",
      },
      { label: "Comal Appraisal District forms page", url: "https://comalad.org/forms/" },
    ],
    verifyFlags: [
      { target: "reporting", note: "The annual report due date." },
      {
        target: "standards",
        note: "The separate wildlife intensity standards document, which we did not retrieve.",
      },
    ],
  },
];

// County search
// ---------------------------------------------------------------------------

// Words people add around a county name that should not affect matching:
// "Hays County", "hays cad", "Comal Appraisal District", "llano tx".
const NOISE_WORDS = new Set([
  "county",
  "cad",
  "ad",
  "central",
  "appraisal",
  "district",
  "tx",
  "texas",
]);

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function stripNoise(s: string): string {
  return s
    .split(" ")
    .filter((w) => w && !NOISE_WORDS.has(w))
    .join(" ");
}

/** True when `q` starts at a word boundary somewhere in `h`. */
function hasWordPrefix(h: string, q: string): boolean {
  return ` ${h}`.includes(` ${q}`);
}

/**
 * Case-insensitive word-prefix match over county names, CAD names and
 * aliases. "lla", "Hays County" and "hays cad" all match.
 * A query made only of noise words ("cad", "county") matches every county.
 * Counties whose own name starts with the query sort first.
 */
export function searchCounties(query: string): WildlifeCounty[] {
  const q = normalize(query);
  if (!q) return [];
  const core = stripNoise(q);
  const matches = WILDLIFE_COUNTIES.filter((c) => {
    const haystack = [c.slug, c.name, c.cadName, ...c.searchAliases].map(
      normalize
    );
    if (!core) return haystack.some((h) => hasWordPrefix(h, q));
    return haystack.some(
      (h) => hasWordPrefix(h, q) || hasWordPrefix(stripNoise(h), core)
    );
  });
  const nameHit = (c: WildlifeCounty) => (c.slug.startsWith(core || q) ? 0 : 1);
  return matches.sort((a, b) => nameHit(a) - nameHit(b));
}
