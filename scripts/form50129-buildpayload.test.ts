/**
 * Acceptance test for the Form 50-129 data-assembly layer (Session 2).
 *
 *   npx tsx scripts/form50129-buildpayload.test.ts
 *
 * Drives buildPayload() with an in-memory fake data source (no Supabase, no
 * Clerk) and asserts the three acceptance criteria:
 *   1. Completed plan + filled owner profile → missing contains ONLY Bucket-3
 *      items (never Sec 1/2/5 content).
 *   2. Entity owner → Section 2 populated + owner-type Corporation; individual
 *      owner → Section 2 left N/A (no representative, no Section 2 gaps).
 *   3. buildPayload output feeds straight into fill50129() → a valid PDF, zero
 *      manual glue.
 *
 * Zero-dependency runner: throws on first failure, prints a summary.
 */

import { PDFDocument } from "pdf-lib";
import { buildPayload } from "../lib/forms/form50129/buildPayload";
import { fill50129 } from "../lib/forms/form50129/fill";
import type {
  Form50129DataSource,
  PropertyRecord,
  OwnerProfileRecord,
  PlanRecord,
  FilingRecord,
} from "../lib/forms/form50129/dataSource";

let passed = 0;
const failures: string[] = [];
function check(name: string, cond: boolean, detail = "") {
  if (cond) {
    passed++;
    console.log(`  ok   ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

// --- Fixtures ---------------------------------------------------------------

const property: PropertyRecord = {
  id: "prop-1",
  user_id: "user-1",
  county: "Hays",
  acreage: 78.4,
  legal_description: "ABS 123 SUR 45 J. SMITH, 78.4 ACRES, HAYS COUNTY, TX",
  appraisal_account: "R123456",
  exemption_type: "wildlife",
};

const entityProfile: OwnerProfileRecord = {
  owner_type: "corporation",
  owner_type_other: null,
  owner_name: "Bark Springs LLC",
  date_of_birth: null,
  physical_address: "1200 Ranch Road 12, Wimberley, TX 78676",
  mailing_address: "PO Box 481, Wimberley, TX 78676",
  phone: "(512) 555-0142",
  email: "owner@barksprings.example",
  rep_basis: "officer",
  rep_basis_other: null,
  rep_name: "Dana Whitfield",
  rep_title: "Managing Member",
  rep_phone: "(512) 555-0142",
  rep_email: "dana@barksprings.example",
  rep_mailing_address: "PO Box 481, Wimberley, TX 78676",
};

const individualProfile: OwnerProfileRecord = {
  owner_type: "individual",
  owner_type_other: null,
  owner_name: "Jane Rancher",
  date_of_birth: "1970-05-01",
  physical_address: "980 County Road 7, Dripping Springs, TX 78620",
  mailing_address: null,
  phone: "(512) 555-0199",
  email: "jane@example.com",
  rep_basis: null,
  rep_basis_other: null,
  rep_name: null,
  rep_title: null,
  rep_phone: null,
  rep_email: null,
  rep_mailing_address: null,
};

const completedPlan: PlanRecord = {
  id: "plan-1",
  status: "ready",
  pre_conversion_category: "Native pastureland",
  practices: [
    {
      practice_type: "habitat_control",
      selected: true,
      documentation: { description: "selective brush management, native grass restoration" },
    },
    {
      practice_type: "supplemental_water",
      selected: true,
      documentation: { description: "three wildlife guzzlers maintained year-round" },
    },
    {
      practice_type: "census",
      selected: true,
      documentation: { description: "annual spotlight deer counts, quarterly bird surveys" },
    },
    // An unselected practice must be ignored.
    { practice_type: "predator_control", selected: false, documentation: null },
  ],
};

/** Build a fake data source from explicit records. */
function makeDataSource(over: {
  property?: PropertyRecord | null;
  ownerProfile?: OwnerProfileRecord | null;
  plan?: PlanRecord | null;
  filing?: FilingRecord | null;
  priorFilings?: FilingRecord[];
}): Form50129DataSource {
  return {
    async getProperty() {
      return over.property === undefined ? property : over.property;
    },
    async getOwnerProfile() {
      return over.ownerProfile ?? null;
    },
    async getPlan() {
      return over.plan ?? null;
    },
    async getFiling() {
      return over.filing ?? null;
    },
    async getPriorFilings() {
      return over.priorFilings ?? [];
    },
  };
}

async function main() {
  // === Case A: entity owner + completed plan + filled profile ===
  const a = await buildPayload("prop-1", 2025, {
    userId: "user-1",
    dataSource: makeDataSource({ ownerProfile: entityProfile, plan: completedPlan }),
  });

  check("A: owner type is corporation", a.payload.owner.type === "corporation");
  check("A: Section 2 representative populated", !!a.payload.representative);
  check(
    "A: rep basis = officer, name = Dana Whitfield",
    a.payload.representative?.basis === "officer" &&
      a.payload.representative?.name === "Dana Whitfield",
  );
  check(
    "A: three wildlife practices assembled from plan",
    (a.payload.wildlife?.practices.length ?? 0) === 3 &&
      a.payload.wildlife!.practices[0].startsWith("Habitat Control"),
    JSON.stringify(a.payload.wildlife?.practices),
  );
  check(
    "A: prior-use category from plan",
    a.payload.wildlife?.priorUseCategory === "Native pastureland",
  );
  check("A: hasWmp = true (plan exists)", a.payload.wildlife?.hasWmp === true);

  const nonBucket3 = a.missing.filter((m) => m.bucket !== 3);
  check(
    "A: missing contains ONLY Bucket-3 items",
    nonBucket3.length === 0,
    nonBucket3.map((m) => `${m.key}[b${m.bucket}]`).join(", "),
  );
  check(
    "A: missing includes Section 4 history (Bucket 3)",
    a.missing.some((m) => m.key === "section4.history" && m.bucket === 3),
  );
  check(
    "A: no Section 1/2/5-content gaps",
    !a.missing.some((m) =>
      ["owner.", "rep.", "wildlife."].some((pre) => m.key.startsWith(pre)),
    ),
    a.missing.map((m) => m.key).join(", "),
  );

  // === Case B: individual owner ===
  const b = await buildPayload("prop-1", 2025, {
    userId: "user-1",
    dataSource: makeDataSource({ ownerProfile: individualProfile, plan: completedPlan }),
  });
  check("B: owner type is individual", b.payload.owner.type === "individual");
  check("B: Section 2 left N/A (no representative)", b.payload.representative === undefined);
  check(
    "B: no Section 2 gaps reported for an individual",
    !b.missing.some((m) => m.section === "Section 2"),
    b.missing.filter((m) => m.section === "Section 2").map((m) => m.key).join(", "),
  );
  check(
    "B: missing still only Bucket-3 items",
    b.missing.every((m) => m.bucket === 3),
    b.missing.filter((m) => m.bucket !== 3).map((m) => m.key).join(", "),
  );

  // === Bucket-2 gap surfaces when the profile is incomplete ===
  const c = await buildPayload("prop-1", 2025, {
    userId: "user-1",
    dataSource: makeDataSource({
      ownerProfile: { ...individualProfile, email: null, date_of_birth: null },
      plan: completedPlan,
    }),
  });
  check(
    "C: incomplete profile surfaces Bucket-2 gaps (email + DOB)",
    c.missing.some((m) => m.key === "owner.email" && m.bucket === 2) &&
      c.missing.some((m) => m.key === "owner.dateOfBirth" && m.bucket === 2),
  );

  // === Renewal branch inferred from a prior FILED filing ===
  const d = await buildPayload("prop-1", 2025, {
    userId: "user-1",
    dataSource: makeDataSource({
      ownerProfile: entityProfile,
      plan: completedPlan,
      priorFilings: [{ tax_year: 2024, status: "filed", answers: {} }],
    }),
  });
  check(
    "D: prior FILED filing infers renewal branch (allowedLastYear = true)",
    d.payload.property.allowedLastYear === true,
  );
  check(
    "D: allowedLastYear no longer reported missing after inference",
    !d.missing.some((m) => m.key === "section3.allowedLastYear"),
  );

  // === Clerk fallback seeds Section 1 only before a profile exists ===
  const e = await buildPayload("prop-1", 2025, {
    userId: "user-1",
    dataSource: makeDataSource({ ownerProfile: null, plan: completedPlan }),
    fallbackOwner: { name: "Clerk Account", email: "clerk@example.com" },
  });
  check(
    "E: no profile -> owner name/email seeded from fallback",
    e.payload.owner.name === "Clerk Account" &&
      e.payload.owner.email === "clerk@example.com",
  );
  const f = await buildPayload("prop-1", 2025, {
    userId: "user-1",
    dataSource: makeDataSource({ ownerProfile: individualProfile, plan: completedPlan }),
    fallbackOwner: { name: "Clerk Account", email: "clerk@example.com" },
  });
  check(
    "F: existing profile is NOT overridden by fallback",
    f.payload.owner.name === "Jane Rancher" &&
      f.payload.owner.email === "jane@example.com",
  );

  // === Acceptance criterion 3: payload feeds straight into fill50129 ===
  const pdfBytes = await fill50129(a.payload); // zero manual glue
  const doc = await PDFDocument.load(pdfBytes);
  check("PDF: assembled payload produces a 6-page form", doc.getPageCount() === 6);
  check(
    "PDF: owner name rendered from assembled payload",
    doc.getForm().getTextField("Name of Property Owner").getText() ===
      "Bark Springs LLC",
  );
  check(
    "PDF: signature left blank (never signs)",
    (doc.getForm().getField("Signature of Property Owner or Authorized Representative") as unknown) !==
      undefined,
  );

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length > 0) {
    console.error("\nFAILURES:\n" + failures.map((f) => `  - ${f}`).join("\n"));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
