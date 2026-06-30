import { PracticeDocumentation } from "./types";

// Single source of truth for "how complete is this plan". Used by the wizard
// progress indicator, the review step, and the API's status guard, so the
// number a landowner sees and the rule that gates "ready to file" never drift.
//
// A plan has four required blocks, weighted equally. Overall % is the average
// of the four block fractions. A plan can be saved as a draft at any
// completeness; it can only be marked "ready" when every block is complete.

export type PlanBlockKey =
  | "identity"
  | "landDescription"
  | "practices"
  | "targetSpecies";

export type PlanBlock = {
  key: PlanBlockKey;
  label: string;
  fraction: number; // 0..1
  complete: boolean;
  missing: string[]; // plain-language items still needed
};

export type PlanCompletion = {
  blocks: PlanBlock[];
  overallPct: number; // 0..100
  canSubmit: boolean; // true only when all blocks are complete
};

// The minimum data the calculator needs. Both the live wizard form and the
// server build this shape, so completion is computed identically on each side.
export type PlanCompletionInput = {
  identity: {
    name?: string | null;
    county?: string | null;
    acreage?: number | null;
    legalDescription?: string | null;
    appraisalAccount?: string | null;
  };
  landDescription: {
    habitatTypes: string[];
    propertyDescription?: string | null;
    waterSources: string[];
    wildlifeSpecies: string[];
    currentLandUse?: string | null;
  };
  targetSpecies: string[];
  practices: { selected: boolean; documentation: PracticeDocumentation }[];
};

const MIN_PRACTICES = 3;

const present = (v?: string | null) => typeof v === "string" && v.trim().length > 0;

function fractionOf(items: { ok: boolean; label: string }[]): {
  fraction: number;
  missing: string[];
} {
  const missing = items.filter((i) => !i.ok).map((i) => i.label);
  return { fraction: items.length ? (items.length - missing.length) / items.length : 1, missing };
}

function identityBlock(id: PlanCompletionInput["identity"]): PlanBlock {
  // Legal description and appraisal account number are collected but optional:
  // they do not gate plan completion. Only name, county, and acreage are
  // required here.
  const { fraction, missing } = fractionOf([
    { ok: present(id.name), label: "Property name" },
    { ok: present(id.county), label: "County" },
    { ok: typeof id.acreage === "number" && id.acreage > 0, label: "Acreage" },
  ]);
  return { key: "identity", label: "Property identity", fraction, complete: missing.length === 0, missing };
}

function landDescriptionBlock(ld: PlanCompletionInput["landDescription"]): PlanBlock {
  const { fraction, missing } = fractionOf([
    { ok: ld.habitatTypes.length > 0, label: "At least one habitat type" },
    { ok: present(ld.propertyDescription), label: "Property description" },
    { ok: ld.waterSources.length > 0, label: "Water on the property" },
    { ok: ld.wildlifeSpecies.length > 0, label: "At least one wildlife species" },
    { ok: present(ld.currentLandUse), label: "Current land use" },
  ]);
  return { key: "landDescription", label: "Land description", fraction, complete: missing.length === 0, missing };
}

function practicesBlock(practices: PlanCompletionInput["practices"]): PlanBlock {
  const selected = practices.filter((p) => p.selected);
  const documented = selected.filter(
    (p) =>
      present(p.documentation.description) &&
      (p.documentation.plannedActivities?.length ?? 0) > 0
  );

  // Two halves: enough practices chosen, and each chosen one documented.
  const selectionScore = Math.min(selected.length, MIN_PRACTICES) / MIN_PRACTICES;
  const docScore = selected.length === 0 ? 0 : documented.length / selected.length;
  const fraction = (selectionScore + docScore) / 2;

  const missing: string[] = [];
  if (selected.length < MIN_PRACTICES) {
    const more = MIN_PRACTICES - selected.length;
    missing.push(`Select ${more} more practice${more === 1 ? "" : "s"}`);
  }
  if (selected.length > 0 && documented.length < selected.length) {
    missing.push("Add details to each selected practice");
  }

  const complete = selected.length >= MIN_PRACTICES && documented.length === selected.length;
  return { key: "practices", label: "Practices", fraction, complete, missing };
}

function targetSpeciesBlock(targetSpecies: string[]): PlanBlock {
  const complete = targetSpecies.length > 0;
  return {
    key: "targetSpecies",
    label: "Target species",
    fraction: complete ? 1 : 0,
    complete,
    missing: complete ? [] : ["At least one target species"],
  };
}

export function computePlanCompletion(input: PlanCompletionInput): PlanCompletion {
  const blocks = [
    identityBlock(input.identity),
    landDescriptionBlock(input.landDescription),
    practicesBlock(input.practices),
    targetSpeciesBlock(input.targetSpecies),
  ];

  const overallPct = Math.round(
    (100 * blocks.reduce((sum, b) => sum + b.fraction, 0)) / blocks.length
  );
  const canSubmit = blocks.every((b) => b.complete);

  return { blocks, overallPct, canSubmit };
}
