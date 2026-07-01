/**
 * Fill service for Texas Comptroller Form 50-129.
 *
 * Server-only. Loads the blank AcroForm template, writes the supplied payload,
 * and returns the filled PDF bytes. FieldFile produces a *completed but
 * unsigned* form: the owner reviews, signs, and submits. The signature (/Sig)
 * and the Section 7 certification Date are never touched here.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, PDFName, PDFDict, type PDFForm } from "pdf-lib";
import {
  TEMPLATE,
  TEXT_FIELDS,
  SECTION4_FIELDS,
  BUTTON_FIELDS,
  OWNER_TYPE,
  REP_BASIS,
  YES,
  NO,
  type Form50129Payload,
} from "./fieldMap";

export type Fill50129Options = {
  /**
   * Flatten the form so field values are baked into page content and can no
   * longer be edited. Default false: v1 leaves fields live so the owner can
   * adjust in a PDF viewer before signing.
   */
  flatten?: boolean;
  /**
   * Template bytes. Defaults to reading TEMPLATE.templatePath from disk. Pass
   * explicitly when the template lives in object storage (e.g. Supabase).
   */
  templateBytes?: Uint8Array;
};

/** Read the on-state (the non-"Off" /AP /N appearance key) for one widget. */
function widgetOnState(widget: {
  dict: PDFDict;
}): string | null {
  const ap = widget.dict.lookup(PDFName.of("AP"), PDFDict);
  if (!ap) return null;
  const normal = ap.lookup(PDFName.of("N"), PDFDict);
  if (!normal) return null;
  for (const key of normal.keys()) {
    const text = key.decodeText();
    if (text !== "Off") return text;
  }
  return null;
}

/**
 * Resolve a desired choice to one of a field's actual on-states.
 * Exact match wins; for Yes/No we tolerate export-value suffixes such as
 * "Yes_17"/"No_17" by normalized prefix match. Returns null if nothing fits.
 */
function resolveOnState(available: string[], desired: string): string | null {
  if (available.includes(desired)) return desired;
  const d = desired.trim().toLowerCase();
  if (d === "yes" || d === "no") {
    const match = available.find((a) =>
      a.replace(/[^a-z]/gi, "").toLowerCase().startsWith(d),
    );
    if (match) return match;
  }
  return null;
}

/**
 * Set a button (radio/checkbox) group to a chosen on-state at the low-level
 * API: field /V plus each widget /AS. We deliberately avoid PDFRadioGroup
 * .select() / PDFCheckBox — derived copies of this form are typed as
 * PDFCheckBox by pdf-lib, where .select() throws. This path works regardless
 * of how pdf-lib classifies the field.
 *
 * Throws loudly if no widget offers the requested on-state, so a bad mapping
 * fails fast instead of silently leaving the box blank.
 */
export function setBtnChoice(
  form: PDFForm,
  fieldName: string,
  desired: string,
): void {
  const field = form.getField(fieldName);
  const acroField = field.acroField;
  const widgets = acroField.getWidgets();

  const available = widgets
    .map((w) => widgetOnState(w))
    .filter((s): s is string => s !== null);

  const target = resolveOnState(available, desired);
  if (target === null) {
    throw new Error(
      `Form 50-129: field "${fieldName}" has no on-state matching "${desired}". ` +
        `Available on-states: [${available.join(", ")}]`,
    );
  }

  const targetName = PDFName.of(target);
  const off = PDFName.of("Off");

  // Field value.
  acroField.dict.set(PDFName.of("V"), targetName);
  // Per-widget appearance state: the matching widget shows its on-state, the
  // rest go Off. This references appearance streams already in the template,
  // so no appearance regeneration is needed for the box itself.
  for (const widget of widgets) {
    widget.dict.set(
      PDFName.of("AS"),
      widgetOnState(widget) === target ? targetName : off,
    );
  }
}

/** Set a text field only when a value is present; leaves it blank otherwise. */
function setText(
  form: PDFForm,
  fieldName: string,
  value: string | number | undefined | null,
): void {
  if (value === undefined || value === null) return;
  const str = String(value);
  if (str.length === 0) return;
  form.getTextField(fieldName).setText(str);
}

/** Set a yes/no radio from a boolean, skipping when undefined. */
function setYesNo(
  form: PDFForm,
  fieldName: string,
  value: boolean | undefined,
): void {
  if (value === undefined) return;
  setBtnChoice(form, fieldName, value ? YES : NO);
}

async function loadTemplateBytes(
  provided?: Uint8Array,
): Promise<Uint8Array> {
  if (provided) return provided;
  const abs = path.isAbsolute(TEMPLATE.templatePath)
    ? TEMPLATE.templatePath
    : path.join(process.cwd(), TEMPLATE.templatePath);
  return readFile(abs);
}

export async function fill50129(
  payload: Form50129Payload,
  options: Fill50129Options = {},
): Promise<Uint8Array> {
  const templateBytes = await loadTemplateBytes(options.templateBytes);
  const doc = await PDFDocument.load(templateBytes);
  const form = doc.getForm();

  // --- Header ---
  setText(form, TEXT_FIELDS.taxYear, payload.taxYear);
  setText(
    form,
    TEXT_FIELDS.appraisalDistrictCounty,
    payload.appraisalDistrictCounty,
  );
  setText(form, TEXT_FIELDS.headerAccountNumber, payload.accountNumber);

  // --- Section 1: Owner ---
  const { owner } = payload;
  setBtnChoice(form, BUTTON_FIELDS.ownerType, OWNER_TYPE[owner.type]);
  if (owner.type === "other") {
    setText(form, TEXT_FIELDS.ownerTypeOther, owner.typeOther);
  }
  setText(form, TEXT_FIELDS.ownerName, owner.name);
  setText(form, TEXT_FIELDS.ownerDateOfBirth, owner.dateOfBirth);
  setText(form, TEXT_FIELDS.ownerPhysicalAddress, owner.physicalAddress);
  setText(form, TEXT_FIELDS.ownerMailingAddress, owner.mailingAddress);
  setText(form, TEXT_FIELDS.ownerPhone, owner.phone);
  setText(form, TEXT_FIELDS.ownerEmail, owner.email);

  // --- Section 2: Authorized Representative (non-individual owners) ---
  const rep = payload.representative;
  if (rep) {
    setBtnChoice(form, BUTTON_FIELDS.repBasis, REP_BASIS[rep.basis]);
    if (rep.basis === "other") {
      setText(form, TEXT_FIELDS.repBasisOther, rep.basisOther);
    }
    setText(form, TEXT_FIELDS.repName, rep.name);
    setText(form, TEXT_FIELDS.repTitle, rep.title);
    setText(form, TEXT_FIELDS.repPhone, rep.phone);
    setText(form, TEXT_FIELDS.repEmail, rep.email);
    setText(form, TEXT_FIELDS.repMailingAddress, rep.mailingAddress);
  }

  // --- Section 3: Property Description and Information ---
  const { property } = payload;
  setText(form, TEXT_FIELDS.numberOfAcres, property.numberOfAcres);
  setText(form, TEXT_FIELDS.legalDescription, property.legalDescription);
  setText(
    form,
    TEXT_FIELDS.accountNumber,
    property.accountNumber ?? payload.accountNumber,
  );
  setYesNo(form, BUTTON_FIELDS.sec3AllowedLastYear, property.allowedLastYear);
  setYesNo(
    form,
    BUTTON_FIELDS.sec3OwnershipChanged,
    property.ownershipChangedSinceLastYear,
  );
  setYesNo(
    form,
    BUTTON_FIELDS.sec3DeceasedSurvivingSpouse,
    property.deceasedSurvivingSpouse,
  );
  setYesNo(form, BUTTON_FIELDS.sec3NewOwnerSameUse, property.newOwnerSameUse);
  setYesNo(form, BUTTON_FIELDS.sec3WithinCityLimits, property.withinCityLimits);

  // --- Section 4: Property Use (optional) ---
  const s4 = payload.section4;
  if (s4) {
    (s4.history ?? []).forEach((row, i) => {
      if (i >= SECTION4_FIELDS.agUseCategory.length) return;
      setText(form, SECTION4_FIELDS.agUseCategory[i], row.category);
      setText(form, SECTION4_FIELDS.agUseAcres[i], row.acres);
    });
    (s4.livestock ?? []).forEach((row, i) => {
      const f = SECTION4_FIELDS.livestock[i];
      if (!f) return;
      setText(form, f.name, row.name);
      setText(form, f.acres, row.acres);
    });
    (s4.livestockHead ?? []).forEach((row, i) => {
      const f = SECTION4_FIELDS.livestockHead[i];
      if (!f) return;
      setText(form, f.name, row.name);
      setText(form, f.head, row.head);
    });
    (s4.crops ?? []).forEach((row, i) => {
      const f = SECTION4_FIELDS.crops[i];
      if (!f) return;
      setText(form, f.name, row.name);
      setText(form, f.acres, row.acres);
    });
    (s4.govPrograms ?? []).forEach((row, i) => {
      const f = SECTION4_FIELDS.govPrograms[i];
      if (!f) return;
      setText(form, f.name, row.name);
      setText(form, f.acres, row.acres);
    });
    (s4.nonAgUses ?? []).forEach((row, i) => {
      const f = SECTION4_FIELDS.nonAgUses[i];
      if (!f) return;
      setText(form, f.name, row.name);
      setText(form, f.acres, row.acres);
    });
  }

  // --- Section 5: Wildlife Management Use ---
  const wildlife = payload.wildlife;
  if (wildlife) {
    const [p1, p2, p3] = wildlife.practices;
    setText(form, TEXT_FIELDS.practice1, p1);
    setText(form, TEXT_FIELDS.practice2, p2);
    setText(form, TEXT_FIELDS.practice3, p3);
    setText(form, TEXT_FIELDS.priorUseCategory, wildlife.priorUseCategory);
    setYesNo(form, BUTTON_FIELDS.sec5HasWmp, wildlife.hasWmp);
    setYesNo(
      form,
      BUTTON_FIELDS.sec5PartOfLargerTract,
      wildlife.partOfLargerTract,
    );
    setYesNo(
      form,
      BUTTON_FIELDS.sec5ManagedByAssociation,
      wildlife.managedByAssociation,
    );
    setYesNo(
      form,
      BUTTON_FIELDS.sec5EndangeredHabitat,
      wildlife.endangeredHabitat,
    );
    setYesNo(form, BUTTON_FIELDS.sec5EsaPermit, wildlife.esaPermit);
    setYesNo(
      form,
      BUTTON_FIELDS.sec5HabitatPreserveEasement,
      wildlife.habitatPreserveEasement,
    );
    const cp = wildlife.conservationProject;
    if (cp) {
      setYesNo(form, BUTTON_FIELDS.sec5Cercla, cp.cercla);
      setYesNo(form, BUTTON_FIELDS.sec5OilPollutionAct, cp.oilPollutionAct);
      setYesNo(
        form,
        BUTTON_FIELDS.sec5WaterPollutionControl,
        cp.waterPollutionControl,
      );
      setYesNo(form, BUTTON_FIELDS.sec5TexasNrc40, cp.texasNrc40);
    }
  }

  // --- Section 6: Conversion to Timber Production ---
  const timber = payload.timber;
  if (timber) {
    setYesNo(form, BUTTON_FIELDS.sec6ConvertedToTimber, timber.convertedAfter1997);
    setText(form, TEXT_FIELDS.timberConversionDate, timber.conversionDate);
    setYesNo(form, BUTTON_FIELDS.sec6ContinueAs1d1, timber.continueAs1d1);
  }

  // --- Section 7: Certification (printed name only; never sign or date) ---
  setText(
    form,
    TEXT_FIELDS.certPrintedName,
    payload.certification?.printedName ?? owner.name,
  );

  if (options.flatten) {
    form.flatten();
  }

  return doc.save();
}
