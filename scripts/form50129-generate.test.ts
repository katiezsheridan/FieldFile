/**
 * Logic test for the Form 50-129 generate path (Session 4).
 *
 *   NEXT_PUBLIC_SUPABASE_URL=http://x SUPABASE_SERVICE_ROLE_KEY=x \
 *     npx tsx scripts/form50129-generate.test.ts
 *
 * Covers the parts of the generate route that don't need Supabase/Clerk:
 *   - The storage path is stable per (user, property, tax year), so
 *     regenerating overwrites rather than orphaning (acceptance #2).
 *   - The generated PDF leaves Signature + certification Date blank
 *     (acceptance #3), even straight out of buildPayload -> fill50129.
 *
 * The Storage upload/sign + DB write are exercised by the user's live smoke
 * test (they need real auth + the `filings` bucket).
 */

import { PDFDocument, PDFName } from "pdf-lib";
import { buildPayload } from "../lib/forms/form50129/buildPayload";
import { fill50129 } from "../lib/forms/form50129/fill";
import { filingPdfPath } from "../lib/forms/form50129/storage";
import type {
  Form50129DataSource,
  PropertyRecord,
  OwnerProfileRecord,
  PlanRecord,
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

const property: PropertyRecord = {
  id: "p1",
  user_id: "u1",
  county: "Hays",
  acreage: 78.4,
  legal_description: "ABS 123, 78.4 ACRES",
  appraisal_account: "R123456",
  exemption_type: "wildlife",
};
const ownerProfile: OwnerProfileRecord = {
  owner_type: "corporation",
  owner_type_other: null,
  owner_name: "Bark Springs LLC",
  date_of_birth: null,
  physical_address: "1200 Ranch Road 12, Wimberley, TX",
  mailing_address: null,
  phone: "(512) 555-0142",
  email: "owner@barksprings.example",
  rep_basis: "officer",
  rep_basis_other: null,
  rep_name: "Dana Whitfield",
  rep_title: "Managing Member",
  rep_phone: "(512) 555-0142",
  rep_email: "dana@barksprings.example",
  rep_mailing_address: null,
};
const plan: PlanRecord = {
  id: "pl1",
  status: "ready",
  pre_conversion_category: "Native pastureland",
  practices: [
    { practice_type: "habitat_control", selected: true, documentation: { description: "brush mgmt" } },
    { practice_type: "supplemental_water", selected: true, documentation: { description: "guzzlers" } },
    { practice_type: "census", selected: true, documentation: { description: "deer counts" } },
  ],
};
const dataSource: Form50129DataSource = {
  async getProperty() { return property; },
  async getOwnerProfile() { return ownerProfile; },
  async getPlan() { return plan; },
  async getFiling() { return null; },
  async getPriorFilings() { return []; },
};

async function main() {
  // --- Stable overwrite path (acceptance #2) ---
  const a = filingPdfPath("u1", "p1", 2025);
  const b = filingPdfPath("u1", "p1", 2025);
  check("path is deterministic (regenerate overwrites same object)", a === b, a);
  check("path is scoped by user + property + year", a === "form50129/u1/p1/2025.pdf", a);
  check(
    "different tax year -> different object (no cross-year clobber)",
    filingPdfPath("u1", "p1", 2024) !== a,
  );
  check(
    "different user -> different object",
    filingPdfPath("u2", "p1", 2025) !== a,
  );

  // --- Generated PDF leaves signature + cert date blank (acceptance #3) ---
  const { payload } = await buildPayload("p1", 2025, { userId: "u1", dataSource });
  const bytes = await fill50129(payload);
  const doc = await PDFDocument.load(bytes);
  const form = doc.getForm();

  const sig = form.getField("Signature of Property Owner or Authorized Representative");
  const sigV = sig.acroField.dict.lookup(PDFName.of("V"));
  check("Signature field has no value (unsigned)", sigV === undefined);

  const certDate = form.getTextField("Date").getText() ?? "";
  check("Certification Date is blank", certDate === "", JSON.stringify(certDate));

  // Sanity: the form is actually populated (owner name present).
  check(
    "owner name populated (form is not empty)",
    form.getTextField("Name of Property Owner").getText() === "Bark Springs LLC",
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
