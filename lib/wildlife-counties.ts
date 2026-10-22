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
  | "filingDeadline"
  | "minimumAcreage"
  | "reporting"
  | "inspections"
  | "standards"
  | "guidelines";

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
  /** Longer detail behind the snapshot's acreage line. */
  minimumAcreageDetail: string[];
  application: string[];
  uniqueRequirements: string[];
  reporting: string[];
  inspections: string[];
  filing: {
    address: string;
    mailingAddress?: string;
    phone: string;
    fax?: string;
    email?: string;
    website: string;
    hours?: string;
    notes: string[];
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
      "TPWD, Agricultural Land and Wildlife Management (forms PWD 885 and PWD 888, legal summary)",
    url: "https://tpwd.texas.gov/landwater/land/private/agricultural_land/",
  },
  {
    label: "TPWD, Legal Summary of Wildlife Management Use Appraisal",
    url: "https://tpwd.texas.gov/landwater/land/private/agricultural_land/legal-summary.phtml",
  },
  {
    label:
      "34 Tex. Admin. Code 9.2003 (wildlife management plan; CAD may require annual report)",
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
    title: "The land is already appraised as 1-d-1 open space ag land",
    detail:
      "Wildlife management can only take over from an existing 1-d-1 agricultural valuation (Tax Code Chapter 23, Subchapter D). It cannot be the first agricultural use that qualifies the land. Hays and Comal also say the land must have been qualified in the prior year.",
  },
  {
    title: "Wildlife management is the primary use",
    detail:
      "You are managing indigenous wild animals (breeding, migrating, or wintering populations) for human use such as food, medicine, or recreation.",
  },
  {
    title: "At least three of the seven practices, every year",
    detail:
      "Habitat control, erosion control, predator control, supplemental water, supplemental food, supplemental shelter, and census counts. All four counties are in the Edwards Plateau ecoregion (Eastern Edwards Plateau appraisal region), so TPWD's Edwards Plateau planning guidelines set the intensity standards.",
  },
  {
    title: "A written plan on TPWD form PWD 885-W7000",
    detail:
      "File it with your 1-d-1 application (Comptroller Form 50-129). The plan goes to your CAD, not to TPWD.",
  },
  {
    title: "File before May 1",
    detail:
      "In practice, file between January 1 and April 30. Late applications are generally accepted until the appraisal review board approves the appraisal records, with a 10 percent penalty (confirmed in the Hays and Comal guidelines).",
  },
  {
    title: "Be ready for an annual report on PWD 888",
    detail:
      "A CAD may require a report showing how you carried out your plan. Whether it asks, how often, and what to attach varies by county (see the county cards).",
  },
  {
    title: "Keep records of everything",
    detail:
      "A dated log of each activity with its location, cost, and purpose, plus photos, receipts, and a map showing where each practice happened. Keep them even where the CAD says not to send them (Blanco), in case of an audit.",
  },
  {
    title: "Minimum acreage only matters if the tract got smaller",
    detail:
      "The rule applies only when the tract has been reduced in size since January 1 of the preceding tax year (a split, a sale, a new survey). Otherwise there is no minimum. If the rule applies, the CAD's wildlife use requirement sets the minimum acres.",
  },
  {
    title: "Changes can force a new application",
    detail:
      "A change of ownership, a change in acreage, or a change in use can require a new application. Stopping qualifying use can trigger rollback taxes. Comal's 2024 guidelines describe three years of rollback; Hays's older guidelines quote five years.",
    verify:
      "The rollback period under current Tax Code Sec. 23.55, versus the five-year language in Hays's older guidelines and the three years in Comal's 2024 guidelines.",
  },
  {
    title: "The homesite does not count",
    detail:
      "The homesite and non-agricultural structures do not qualify. Do your activities outside the homesite area.",
  },
  {
    title: "Do not rely on the postmark",
    detail:
      "Under Tax Code 1.08 a mailed filing is timely if postmarked or deposited on or before the deadline, but USPS postmarks may now be applied days after mailing. Llano CAD issued a July 2026 notice urging owners to file online, hand-deliver, or get a certificate of mailing. We recommend that approach in every county.",
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
    detail: "The land must be in qualifying use as of this date.",
  },
  {
    when: "Jan 1 to Apr 30",
    title: "Filing window",
    detail:
      "New 1-d-1 wildlife applications, new 5-year plans, and reapplications. The statutory deadline is before May 1. Hays and Comal say that if April 30 or May 1 falls on a weekend, the next Monday applies; confirm with your CAD.",
  },
  {
    when: "Spring",
    title: "Reporting requests go out",
    detail:
      "Counties that send reporting requests (the Blanco update form, the Comal annual report, the Hays annual report letter) typically do so around this time. Each CAD's letter sets its own due date; there is no single date for every county.",
  },
  {
    when: "May to July",
    title: "Review and approval",
    detail:
      "The CAD reviews applications and the appraisal review board approves the appraisal records (Hays lists a target of about July 20). Late applications are still accepted until approval, with a 10 percent penalty.",
  },
  {
    when: "Second half of the year",
    title: "Inspections",
    detail:
      "Hays's wildlife appraiser inspects in this period (per the Hays guidelines). Other counties inspect on a rolling or geographic basis.",
  },
  {
    when: "Year-round",
    title: "Do the work and log it",
    detail:
      "Perform and log your activities, spread across the seasons that suit each one.",
  },
];

// ---------------------------------------------------------------------------
// Counties (alphabetical by display order in the post: Hays, Blanco, Llano, Comal)
// ---------------------------------------------------------------------------

export const WILDLIFE_COUNTIES: WildlifeCounty[] = [
  {
    slug: "hays",
    name: "Hays County",
    cadName: "Hays Central Appraisal District",
    searchAliases: ["hays", "hays cad", "hays county", "hcad"],
    ecoregion: "Edwards Plateau (Eastern Edwards Plateau appraisal region)",
    snapshot: {
      filingDeadline:
        "Plans accepted Jan 1 to Apr 30 (wildlife sheet); ag guidelines say May 1",
      minimumAcreage:
        "Only if tract reduced: 14.29 ac; 12.50 ac per association member; 11.11 ac for listed species",
      planRenewal:
        "TPWD 5-year plan; reapply on ownership name or acreage change, or if the application is over 10 years old",
      reporting: "PWD 888 annual report when requested by letter",
      inspections:
        "Regular, sometimes yearly, in the second half of the year",
      mainContact: "512-268-2522, hayscad.com",
    },
    minimumAcreageDetail: [
      "Applies only if the tract was reduced in size since January 1 of the preceding tax year.",
      "14.29 acres for an individual tract.",
      "12.50 acres per member of a wildlife management property association.",
      "11.11 acres if the target species is candidate, threatened, or endangered.",
      "Hays's older 2010 submission sheet cited a 95 percent requirement (20 acres). The 2015 guidelines figures above are the ones to use.",
    ],
    application: [
      "Form 50-129 plus the TPWD 5-year plan (PWD 885-W7000).",
      "A map showing areas of concentration over the 5-year projection period.",
      "The plan must list all targeted indigenous species.",
      "You may also submit an optional written comprehensive 5-year plan.",
    ],
    uniqueRequirements: [
      "Activities must be performed year-round, spread across the seasons that suit each activity.",
      "One sub-activity cannot count twice under two practices. Reseeding, for example, cannot count as both erosion control and supplemental food.",
      "A mechanical feeder, a water trough, or a salt lick sitting on the property does not count by itself. Backyard bird feeders and birdhouses do not count. Prepping wildlife for hunting season does not count.",
      "Harvest is permitted, and the CAD will compare your census counts to your harvest counts.",
      "If an agent or contractor submits the plan, include a signed letter authorizing them and stating the limits of their representation.",
      "Property owners associations and co-ops are welcome, but each parcel owner also files a \"mini-plan\" and a statement of membership.",
      "If livestock keep grazing, the plan must show a rotation schedule so cattle and deer are not in regular competition. Include any grazing lease.",
      "Converting from traditional ag: during the plan-acceptance window, submit a letter requesting the change, proof of traditional ag use during the previous year, and the TPWD 5-year plan. Keep the traditional ag use going until the wildlife plan is approved.",
      "New owner of land already under wildlife: continue activities under the seller's plan for the rest of the purchase year, then file a new application and new 5-year plan on time after the following January 1.",
      "New owner of traditional ag land who wants wildlife: wait until after the following January 1 to request conversion.",
      "The CAD gives 30 days' notice if it needs more information.",
    ],
    reporting: [
      "The CAD requests an annual report by letter, on PWD 888-W7000, covering the years the letter specifies. Not every landowner gets a letter every year.",
      "Supporting documentation is encouraged.",
    ],
    inspections: [
      "The wildlife appraiser inspects approved properties regularly, sometimes yearly, during the second half of the appraisal year.",
      "Have an activity log and an expense sheet ready at each inspection. You may accompany the appraiser.",
      "Hays recommends logging the time, date, location, and type of every activity, marking activities on a map, and taking progress photos.",
      "Reapplication is triggered by a change of ownership name, a change in acreage, or an application on file older than 10 years.",
    ],
    filing: {
      address: "21001 IH 35, Kyle, TX 78640",
      phone: "512-268-2522",
      website: "https://hayscad.com",
      notes: [
        "Wildlife plans are accepted January 1 to April 30 (Hays wildlife submission sheet).",
        "The Hays ag guidelines state an application deadline of May 1, and that a weekend deadline rolls to the following Monday.",
      ],
      forms: [
        { label: "Comptroller Form 50-129 (1-d-1 application)" },
        {
          label: "TPWD PWD 885-W7000 (wildlife management plan)",
          url: TPWD_FORMS_URL,
        },
        {
          label: "TPWD PWD 888-W7000 (annual report)",
          url: TPWD_FORMS_URL,
        },
        {
          label: "Hays CAD Wildlife Management Plan Recommendations",
          url: "https://hayscad.com/PA/forms/wl%20qual%20and%20subm%20req%20new.pdf",
        },
      ],
    },
    sources: [
      {
        label:
          "Hays CAD 1-d-1 Open Space Guidelines and Standards (adopted 11/02/2015)",
        url: "https://hayscad.com/wp-content/uploads/2019/01/HAYSAG-GUIDELINES-STANDARDS-2019.pdf",
      },
      {
        label: "Hays CAD Wildlife Management Plan Recommendations",
        url: "https://hayscad.com/PA/forms/wl%20qual%20and%20subm%20req%20new.pdf",
      },
    ],
    verifyFlags: [
      {
        target: "filingDeadline",
        note: "The filing deadline: April 30 per the wildlife submission sheet versus May 1 per the ag guidelines.",
      },
      {
        target: "minimumAcreage",
        note: "Whether the 14.29 acre figure is still current (the guidelines PDF is the 2015 version, hosted in 2019).",
      },
      {
        target: "guidelines",
        note: "Whether Hays CAD has updated its guidelines since 2015.",
      },
    ],
  },
  {
    slug: "blanco",
    name: "Blanco County",
    cadName: "Blanco County Appraisal District",
    searchAliases: ["blanco", "blanco cad", "blanco county", "bcad"],
    ecoregion: "Edwards Plateau (Eastern Edwards Plateau appraisal region)",
    snapshot: {
      filingDeadline:
        "Before Apr 30; up to 60 extra days for good cause if asked before Apr 30",
      minimumAcreage:
        "Only if subdivided last year: 20.00 ac; 12.5 ac in a co-op or with endangered species",
      planRenewal: "Not stated in Blanco's guidelines",
      reporting:
        "Wildlife update every 2 years (A to J even years, K to Z odd years)",
      inspections: "Not described in the guidelines",
      mainContact: "830-868-4013, blancocad.com",
    },
    minimumAcreageDetail: [
      "20.00 acres to apply if the property was subdivided during the previous year.",
      "12.5 acres if actively managed in a co-op or if endangered species are present.",
      "Blanco also notes that tracts of 10 acres or less are generally considered primarily residential for ag purposes.",
    ],
    application: [
      "Form 50-129.",
      "An approved written plan and the complete TPWD 9-page worksheet on file (Blanco's phrasing).",
      "A placement map showing the tract and where each practice is located.",
    ],
    uniqueRequirements: [
      "Blanco encourages (does not require) a visit from an independent biologist, a TPWD or NRCS representative, or the local extension agent to help prepare the plan.",
      "The CAD tests for primary use and checks that the plan clearly outlines future objectives that can be met in a timely manner.",
      "Document yearly usage with pictures and receipts, and keep them (see reporting).",
    ],
    reporting: [
      "Blanco asks for a wildlife update every 2 years, on a staggered schedule. In even-numbered years the request goes to owners with last names A through J; in odd-numbered years, K through Z.",
      "The Wildlife Management Activity Report asks for property IDs, target species (deer, songbirds, dove, quail, turkey, other), which of the seven activities you completed, and an activity log with date, completed by, cost, and activity and purpose.",
      "The 2027 form covers 2025 and 2026 information.",
      "The form says not to send pictures, receipts, census reports, or drives, but to keep them in case of an audit or denial.",
      "The due date is set by the CAD's mailed request.",
    ],
    inspections: [
      "Blanco's guidelines do not describe an inspection schedule.",
    ],
    filing: {
      address: "615 N. Nugent Ave, Johnson City, TX 78636",
      mailingAddress: "PO Box 338, Johnson City, TX 78636",
      phone: "830-868-4013",
      email: "info@blancocad.com",
      website: "https://blancocad.com",
      notes: [
        "New owners and land without productivity appraisal apply before April 30 (Blanco resources page).",
        "You may ask for up to 60 extra days for good cause if you ask before April 30. Late applications may be accepted with a penalty.",
      ],
      forms: [
        { label: "Comptroller Form 50-129 (1-d-1 application)" },
        {
          label: "TPWD PWD 885-W7000 (wildlife management plan)",
          url: TPWD_FORMS_URL,
        },
        {
          label: "Blanco CAD Wildlife Update Form (2027)",
          url: "https://blancocad.com/wp-content/uploads/2026/08/WILDLIFE-UPDATE-FORM-2027-1.pdf",
        },
        {
          label: "Blanco CAD resources page",
          url: "https://blancocad.com/resources/",
        },
      ],
    },
    sources: [
      {
        label:
          "Blanco CAD Agricultural/Wildlife Guidelines (amended for the 2026 tax year)",
        url: "https://blancocad.com/wp-content/uploads/2026/08/BCAD-AG-Guidelines-2026-Update.pdf",
      },
      {
        label: "Blanco CAD Wildlife Update Form (2027)",
        url: "https://blancocad.com/wp-content/uploads/2026/08/WILDLIFE-UPDATE-FORM-2027-1.pdf",
      },
      {
        label: "Blanco CAD Wildlife Management Activity Report form (2025 version)",
      },
      {
        label: "Blanco CAD resources page",
        url: "https://blancocad.com/resources/",
      },
    ],
    verifyFlags: [
      {
        target: "reporting",
        note: "The wildlife update due date, which is set by the CAD's mailed request.",
      },
      {
        target: "inspections",
        note: "Blanco's inspection practice, which its guidelines do not describe.",
      },
    ],
  },
  {
    slug: "llano",
    name: "Llano County",
    cadName: "Llano Central Appraisal District",
    searchAliases: ["llano", "llano cad", "llano county", "lcad"],
    ecoregion: "Edwards Plateau (Eastern Edwards Plateau appraisal region)",
    snapshot: {
      filingDeadline: "Before May 1 (state deadline)",
      minimumAcreage: "Not found",
      planRenewal: "No local guideline found; confirm by phone",
      reporting: "Annual update forms sent to wildlife properties",
      inspections:
        "New applications inspected; others on a geographic and as-needed basis",
      mainContact: "325-247-3065, llanocad.net",
    },
    minimumAcreageDetail: [
      "We could not find Llano's wildlife use requirement (minimum acreage). We will not guess a number.",
    ],
    application: [
      "State Form 50-129 plus the PWD 885-W7000 plan, both hosted on llanocad.net/forms.",
      "Llano did not publish a separate local wildlife guideline that we could find. Llano follows the state forms and the Comptroller wildlife guidelines; confirm local specifics by phone.",
    ],
    uniqueRequirements: [
      "July 2026 notice on USPS postmarks: a mailed filing can receive a postmark days after you mail it. Texas law (Tax Code 1.08) accepts a postmark, a receipt mark, or satisfactory proof of deposit (certificate of mailing, certified mail receipt) on or before the deadline.",
      "Llano urges filing online where available, hand delivery or the drop box, mailing early, and getting proof of mailing. Deadlines cannot be extended for postal delays.",
    ],
    reporting: [
      "Llano's 2025 to 2026 reappraisal plan says the district sends annual update forms to existing wildlife management properties, and receives and reviews wildlife applications and annual updates.",
      "The wildlife annual report form (PWD-888-W7000) is on the Llano forms page.",
    ],
    inspections: [
      "The district performs physical inspections of properties with new ag or wildlife applications.",
      "It continues inspecting ag and wildlife properties on a geographic and as-needed basis.",
    ],
    filing: {
      address: "103 E. Sandstone St, Llano, TX 78643",
      phone: "325-247-3065",
      fax: "325-247-4656",
      website: "https://llanocad.net",
      hours: "Mon to Fri, 8 to 12 and 1 to 5. After-hours drop box at the main entrance.",
      notes: [
        "The statutory deadline is before May 1.",
      ],
      forms: [
        {
          label: "Llano CAD forms page (Form 50-129, PWD 885-W7000, PWD-888-W7000)",
          url: "https://llanocad.net/forms/",
        },
      ],
    },
    sources: [
      { label: "Llano CAD home page", url: "https://llanocad.net/" },
      { label: "Llano CAD forms page", url: "https://llanocad.net/forms/" },
      {
        label: "Llano CAD 2025 to 2026 Reappraisal Plan",
        url: "https://llanocad.net/wp-content/uploads/2024/10/2025-2026-Reappraisal-Plan.pdf",
      },
      {
        label: "Llano CAD notice on USPS postmarks (July 2026)",
        url: "https://llanocad.net/wp-content/uploads/2026/07/Important-Notice-Regarding-USPS-Postmarks-and-Property-Tax-Deadlines.pdf",
      },
      { label: "Llano CAD 2025 Appraisal Manual" },
    ],
    verifyFlags: [
      {
        target: "minimumAcreage",
        note: "Llano's minimum acreage (wildlife use requirement).",
      },
      {
        target: "reporting",
        note: "The annual update due date.",
      },
      {
        target: "standards",
        note: "Whether Llano has any local wildlife standards.",
      },
    ],
  },
  {
    slug: "comal",
    name: "Comal County",
    cadName: "Comal Appraisal District",
    searchAliases: ["comal", "comal cad", "comal ad", "comal county", "comalad"],
    ecoregion: "Edwards Plateau (Eastern Edwards Plateau appraisal region)",
    snapshot: {
      filingDeadline:
        "Apr 30 (weekend rolls to Monday); late with 10% penalty until roll certification",
      minimumAcreage:
        "Only if tract reduced: 20 ac individual; 12.5 ac in an association",
      planRenewal:
        "Plan and application re-requested when 5 or more years old",
      reporting: "Annual report every year once approved",
      inspections:
        "Routine and random; access may be requested by letter",
      mainContact: "830-625-8597, comalad.org",
    },
    minimumAcreageDetail: [
      "Applies only if the tract was reduced in size since January 1 of the preceding year.",
      "Wildlife use requirement of 95 percent of the tract (20 acres) for an individual tract.",
      "92 percent (12.5 acres) for an association tract.",
      "Adopted by the board in 2002.",
    ],
    application: [
      "State Form 50-129, plus Comal's required supplement form, plus the state wildlife management plan.",
      "The CAD may request more documents and will notify you by mail within 30 days of receipt.",
      "The burden of proof is on the owner.",
    ],
    uniqueRequirements: [
      "The wildlife plan and application are re-requested when the one on file is 5 or more years old, which effectively makes the plan a 5-year renewal. Ag applications 10 or more years old are also re-requested.",
      "Reapplication is also required for a change in use, a change in acreage, a change in ownership name, or by random selection. If you do not respond by year end, valuation is removed, with certified notice before February.",
      "You must notify the CAD of a change of use; failing to do so draws a penalty. Idle or non-qualifying use can lead to rollback.",
      "Comal publishes a separate document of minimum intensity standards for wildlife management operations. Get it from comalad.org (we did not retrieve it).",
      "Comal's land types for wildlife valuation are Good, Average, Fair, and Poor, based on vegetation, soil depth, and brush cover.",
    ],
    reporting: [
      "Once approved, the property owner or association must submit an annual report. The form is on the comalad.org Forms page: \"Annual Report for Wildlife Management.\"",
    ],
    inspections: [
      "District staff do routine and random field inspections.",
      "The CAD may email or call to request an inspection, or send an Ag Inspection Letter requesting access.",
      "Failing to comply may result in loss of valuation, rollback, or both.",
    ],
    filing: {
      address: "900 S. Seguin Ave, New Braunfels, TX",
      phone: "830-625-8597",
      email: "comalad@co.comal.tx.us",
      website: "https://comalad.org",
      notes: [
        "Applications are accepted until April 30. If April 30 falls on a weekend, the following Monday.",
        "Applications filed after April 30 and before certification of the appraisal roll are late, and are assessed a 10 percent penalty if approved.",
      ],
      forms: [
        { label: "Comptroller Form 50-129 (1-d-1 application)" },
        {
          label: "Comal supplement form and Annual Report for Wildlife Management (Forms page)",
          url: "https://comalad.org/forms/",
        },
        {
          label: "TPWD PWD 885-W7000 (wildlife management plan)",
          url: TPWD_FORMS_URL,
        },
      ],
    },
    sources: [
      {
        label: "Comal Appraisal District Open Space Guidelines and Standards (2024)",
        url: "https://comalad.org/wp-content/uploads/2024/01/2024-OPEN-SPACE-GUIDELINES-STANDARDS.pdf",
      },
      { label: "Comal Appraisal District forms page", url: "https://comalad.org/forms/" },
    ],
    verifyFlags: [
      {
        target: "reporting",
        note: "The annual report due date, which we did not find.",
      },
      {
        target: "standards",
        note: "The separate minimum intensity standards document for wildlife management, which we did not retrieve.",
      },
    ],
  },
];

/** Items we could not confirm that are not tied to a single county. */
export const GENERAL_VERIFY: string[] = [
  "The rollback period under current Tax Code Sec. 23.55, versus the five-year language in Hays's older guidelines (Comal's 2024 guidelines say three years).",
  "Whether any of the four CADs updated their guidelines after the dates above.",
];

// ---------------------------------------------------------------------------
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
