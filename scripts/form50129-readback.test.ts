/**
 * Read-back acceptance test for the Form 50-129 fill service (Session 1).
 *
 *   npx tsx scripts/form50129-readback.test.ts
 *
 * Fills with the Bark Springs fixture, re-opens the produced bytes, and asserts
 * that text and button values survived the round trip. Notably it re-reads the
 * radio /V values (owner type == Corporation, renewal branch Sect3-4 == Yes) —
 * this catches the checkbox-vs-radio trap regressively. Also verifies
 * setBtnChoice fails loudly on an unknown on-state.
 *
 * Zero-dependency runner (no vitest/jest in the project): throws on first
 * failure, prints a summary, exits non-zero if anything fails.
 */

import { PDFDocument, PDFName, PDFDict } from "pdf-lib";
import { fill50129, setBtnChoice } from "../lib/forms/form50129/fill";
import {
  TEXT_FIELDS,
  BUTTON_FIELDS,
  OWNER_TYPE,
} from "../lib/forms/form50129/fieldMap";
import { barkSpringsPayload } from "./form50129-fixture";

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

/** Read a text field's value back from a re-opened form. */
function textValue(form: ReturnType<PDFDocument["getForm"]>, name: string) {
  return form.getTextField(name).getText() ?? "";
}

/** Read a button field's /V export value (e.g. "Corporation", "Yes"). */
function buttonValue(
  form: ReturnType<PDFDocument["getForm"]>,
  name: string,
): string | null {
  const v = form.getField(name).acroField.dict.lookup(PDFName.of("V"));
  if (v instanceof PDFName) return v.decodeText();
  return null;
}

async function main() {
  // Fill, then re-open the produced bytes (true round trip).
  const bytes = await fill50129(barkSpringsPayload, { flatten: false });
  const doc = await PDFDocument.load(bytes);
  const form = doc.getForm();

  // --- Text: owner block, header, Section 3, Section 5 practices ---
  check(
    "tax year populated",
    textValue(form, TEXT_FIELDS.taxYear) === "2025",
    textValue(form, TEXT_FIELDS.taxYear),
  );
  check(
    "appraisal district populated",
    textValue(form, TEXT_FIELDS.appraisalDistrictCounty) === "Hays",
  );
  check(
    "owner name populated",
    textValue(form, TEXT_FIELDS.ownerName) === "Bark Springs LLC",
  );
  check(
    "owner physical address populated",
    textValue(form, TEXT_FIELDS.ownerPhysicalAddress).includes("Wimberley"),
  );
  check(
    "acres populated",
    textValue(form, TEXT_FIELDS.numberOfAcres) === "78.4",
  );
  check(
    "legal description populated",
    textValue(form, TEXT_FIELDS.legalDescription).includes("ABS 123"),
  );
  check(
    "three Section 5 practices populated",
    textValue(form, TEXT_FIELDS.practice1).length > 0 &&
      textValue(form, TEXT_FIELDS.practice2).length > 0 &&
      textValue(form, TEXT_FIELDS.practice3).length > 0,
  );
  check(
    "authorized rep name populated",
    textValue(form, TEXT_FIELDS.repName) === "Dana Whitfield",
  );

  // --- Buttons: the checkbox-vs-radio regression catch ---
  check(
    "owner type /V == Corporation",
    buttonValue(form, BUTTON_FIELDS.ownerType) === OWNER_TYPE.corporation,
    String(buttonValue(form, BUTTON_FIELDS.ownerType)),
  );
  check(
    "renewal branch (Sect3-1 allowed-last-year) /V == Yes",
    buttonValue(form, BUTTON_FIELDS.sec3AllowedLastYear) === "Yes",
    String(buttonValue(form, BUTTON_FIELDS.sec3AllowedLastYear)),
  );
  check(
    "rep basis /V == Officer of the company",
    buttonValue(form, BUTTON_FIELDS.repBasis) === "Officer of the company",
  );
  check(
    "Section 5 'has WMP' /V == Yes",
    buttonValue(form, BUTTON_FIELDS.sec5HasWmp) === "Yes",
  );
  check(
    "Section 3 ownership-changed (Sect3-2) /V == No",
    buttonValue(form, BUTTON_FIELDS.sec3OwnershipChanged) === "No",
  );

  // --- Widget /AS agrees with /V (a stale /AS renders wrong in viewers) ---
  const ownerField = form.getField(BUTTON_FIELDS.ownerType).acroField;
  const asStates = ownerField.getWidgets().map((w) => {
    const as = w.dict.lookup(PDFName.of("AS"));
    return as instanceof PDFName ? as.decodeText() : null;
  });
  check(
    "exactly one owner-type widget /AS is on (Corporation)",
    asStates.filter((s) => s === OWNER_TYPE.corporation).length === 1 &&
      asStates.filter((s) => s !== "Off" && s !== OWNER_TYPE.corporation)
        .length === 0,
    JSON.stringify(asStates),
  );

  // --- Scope guard: signature + certification Date left empty ---
  const dateEmpty = (() => {
    try {
      return textValue(form, "Date") === "";
    } catch {
      return true; // field absent is also "not filled"
    }
  })();
  check("certification Date left blank", dateEmpty);

  // --- Fail-fast: setBtnChoice throws on an unknown on-state ---
  let threw = false;
  try {
    const blank = await PDFDocument.load(bytes);
    setBtnChoice(blank.getForm(), BUTTON_FIELDS.ownerType, "Nonexistent");
  } catch {
    threw = true;
  }
  check("setBtnChoice throws on missing on-state", threw);

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
