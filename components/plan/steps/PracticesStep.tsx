"use client";

import { cn } from "@/lib/utils";
import TagInput from "@/components/plan/TagInput";
import { PLAN_PRACTICES, practiceSuitabilityWarning } from "@/lib/plan-practices";
import { PracticeType } from "@/lib/types";
import { PracticeFormState } from "@/components/plan/practiceForm";

type PracticesStepProps = {
  practices: PracticeFormState[];
  habitatTypes: string[];
  update: (
    practiceType: PracticeType,
    patch: Partial<PracticeFormState>
  ) => void;
};

const fieldClass =
  "w-full rounded-lg border border-field-wheat bg-white px-3 py-2 text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/30 focus:border-field-forest";

export default function PracticesStep({
  practices,
  habitatTypes,
  update,
}: PracticesStepProps) {
  const selectedCount = practices.filter((p) => p.selected).length;
  const needMore = Math.max(0, 3 - selectedCount);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-field-earth">
          Choose the practices your plan will use. Pick at least three. For each
          one, add a short description and what you plan to do.
        </p>
        <p
          className={cn(
            "text-sm font-medium mt-2",
            selectedCount >= 3 ? "text-field-forest" : "text-field-earth"
          )}
        >
          {selectedCount} selected
          {needMore > 0
            ? ` · ${needMore} more to reach the minimum`
            : " · minimum met"}
        </p>
      </div>

      {practices.map((p) => {
        const meta = PLAN_PRACTICES.find((m) => m.type === p.practiceType)!;
        const warning = p.selected
          ? practiceSuitabilityWarning(p.practiceType, habitatTypes)
          : null;

        return (
          <div
            key={p.practiceType}
            className={cn(
              "rounded-xl border-2 transition-colors",
              p.selected
                ? "border-field-forest bg-field-forest/5"
                : "border-field-wheat/60 bg-white"
            )}
          >
            <button
              type="button"
              onClick={() => update(p.practiceType, { selected: !p.selected })}
              className="w-full text-left p-4 flex items-start gap-3"
            >
              <span
                className={cn(
                  "w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                  p.selected ? "bg-field-forest" : "border-2 border-field-wheat"
                )}
              >
                {p.selected && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span>
                <span className="block font-medium text-field-ink">
                  {meta.label}
                </span>
                <span className="block text-sm text-field-earth mt-0.5">
                  {meta.blurb}
                </span>
              </span>
            </button>

            {p.selected && (
              <div className="px-4 pb-4 pt-1 space-y-3">
                {warning && (
                  <div className="flex items-start gap-2 rounded-lg bg-field-gold/10 border border-field-gold/30 px-3 py-2">
                    <svg className="w-4 h-4 text-field-gold flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <p className="text-sm text-field-earth">{warning}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-field-ink mb-1.5">
                    What will you do, and where?
                  </label>
                  <textarea
                    rows={3}
                    value={p.description}
                    onChange={(e) =>
                      update(p.practiceType, { description: e.target.value })
                    }
                    placeholder="Describe how you will carry out this practice on your land."
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-field-ink mb-1.5">
                    Planned activities
                  </label>
                  <TagInput
                    value={p.plannedActivities}
                    onChange={(next) =>
                      update(p.practiceType, { plannedActivities: next })
                    }
                    ariaLabel={`Planned activities for ${meta.label}`}
                    placeholder="Add a planned activity and press Enter (e.g. install 2 guzzlers)"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
