"use client";

import { cn } from "@/lib/utils";
import { PlanCompletion } from "@/lib/plan-completion";

type PlanProgressProps = {
  steps: string[];
  currentStep: number; // 1-based
  completion: PlanCompletion;
  onStepClick: (step: number) => void;
};

// Wizard progress: clickable step dots plus the live completion % from the
// completion model. Navigation is always safe because the draft auto-saves.
export default function PlanProgress({
  steps,
  currentStep,
  completion,
  onStepClick,
}: PlanProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isCurrent = stepNumber === currentStep;
          const isPast = stepNumber < currentStep;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => onStepClick(stepNumber)}
                className="flex flex-col items-center group"
              >
                <span
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    isCurrent
                      ? "bg-field-forest text-white ring-4 ring-field-forest/20"
                      : isPast
                      ? "bg-field-forest text-white"
                      : "bg-field-wheat/50 text-field-ink/50 group-hover:bg-field-wheat"
                  )}
                >
                  {stepNumber}
                </span>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center max-w-[90px] hidden sm:block",
                    isCurrent ? "text-field-forest" : "text-field-earth"
                  )}
                >
                  {label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div
                    className={cn(
                      "h-1 rounded-full transition-colors",
                      isPast ? "bg-field-forest" : "bg-field-wheat/50"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Live completion bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-field-ink">Plan completion</span>
          <span className="text-sm font-semibold text-field-forest">
            {completion.overallPct}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-field-wheat/50 overflow-hidden">
          <div
            className="h-full bg-field-forest rounded-full transition-all duration-300"
            style={{ width: `${completion.overallPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
