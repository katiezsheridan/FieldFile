import { Plan, PlanPractice, PracticeDocumentation, PracticeType } from "./types";

// Maps raw Supabase rows (snake_case) to the camelCase Plan shape the client
// uses. Pure data mapping, safe to import from server route handlers.

type PracticeRow = {
  id: string;
  plan_id: string;
  practice_type: string;
  selected: boolean;
  documentation: PracticeDocumentation | null;
};

export function mapPracticeRow(row: PracticeRow): PlanPractice {
  return {
    id: row.id,
    planId: row.plan_id,
    practiceType: row.practice_type as PracticeType,
    selected: row.selected,
    documentation: row.documentation ?? {},
  };
}

type PlanRow = {
  id: string;
  property_id: string;
  user_id: string;
  year: number;
  status: string;
  target_species: string[] | null;
  habitat_types: string[] | null;
  property_description: string | null;
  water_sources: string[] | null;
  wildlife_species: string[] | null;
  current_land_use: string | null;
  land_history: string | null;
  created_at: string;
  updated_at: string;
};

export function mapPlanRow(row: PlanRow, practices: PracticeRow[]): Plan {
  return {
    id: row.id,
    propertyId: row.property_id,
    userId: row.user_id,
    year: row.year,
    status: row.status as Plan["status"],
    targetSpecies: row.target_species ?? [],
    habitatTypes: row.habitat_types ?? [],
    propertyDescription: row.property_description ?? undefined,
    waterSources: row.water_sources ?? [],
    wildlifeSpecies: row.wildlife_species ?? [],
    currentLandUse: row.current_land_use ?? undefined,
    landHistory: row.land_history ?? undefined,
    practices: practices.map(mapPracticeRow),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// The identity fields the wizard shows read-only at the top of the plan and
// that the completion calculator needs. Embedded in the plan GET response so
// the wizard loads in one request.
export type PlanPropertySummary = {
  id: string;
  slug?: string;
  name: string;
  county: string;
  acreage: number;
  legalDescription?: string;
  appraisalAccount?: string;
};
