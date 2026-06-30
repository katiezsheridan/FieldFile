import { PlanPractice, PracticeType } from "@/lib/types";
import { PLAN_PRACTICES } from "@/lib/plan-practices";
import type { PlanPracticeWrite } from "@/lib/hooks";

// The wizard holds all seven practices in local state (selected or not), each
// with its flat documentation fields, so the step can render and edit them
// directly. Kept separate from the wizard/step to avoid a circular import.

export type PracticeFormState = {
  practiceType: PracticeType;
  selected: boolean;
  description: string;
  plannedActivities: string[];
};

// Build the seven-entry form state from whatever practice rows the plan has.
export function buildPracticeForm(existing: PlanPractice[]): PracticeFormState[] {
  return PLAN_PRACTICES.map((meta) => {
    const row = existing.find((p) => p.practiceType === meta.type);
    return {
      practiceType: meta.type,
      selected: row?.selected ?? false,
      description: row?.documentation?.description ?? "",
      plannedActivities: row?.documentation?.plannedActivities ?? [],
    };
  });
}

// Convert form state to the API/auto-save shape.
export function toPracticeWrites(
  practices: PracticeFormState[]
): PlanPracticeWrite[] {
  return practices.map((p) => ({
    practiceType: p.practiceType,
    selected: p.selected,
    documentation: {
      description: p.description,
      plannedActivities: p.plannedActivities,
    },
  }));
}
