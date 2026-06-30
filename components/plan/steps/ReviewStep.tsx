"use client";

import { cn } from "@/lib/utils";
import { PlanCompletion } from "@/lib/plan-completion";

type ReviewStepProps = {
  completion: PlanCompletion;
  submitting: boolean;
  submitError: string | null;
  onSubmit: () => void;
};

export default function ReviewStep({
  completion,
  submitting,
  submitError,
  onSubmit,
}: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <p className="text-field-earth">
        Here is where your plan stands. Each part needs to be filled in before
        you can mark the plan ready to file. You can keep saving and come back
        any time.
      </p>

      <ul className="space-y-3">
        {completion.blocks.map((block) => (
          <li
            key={block.key}
            className="rounded-lg border border-field-wheat/70 bg-white px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                  block.complete
                    ? "bg-field-forest text-white"
                    : "bg-field-wheat/60 text-field-earth"
                )}
              >
                {block.complete ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-xs font-semibold">
                    {Math.round(block.fraction * 100)}%
                  </span>
                )}
              </span>
              <span className="font-medium text-field-ink">{block.label}</span>
            </div>
            {block.missing.length > 0 && (
              <ul className="mt-2 ml-9 list-disc list-inside text-sm text-field-earth space-y-0.5">
                {block.missing.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {submitError && (
        <p className="text-sm text-field-terra">{submitError}</p>
      )}

      <div className="pt-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!completion.canSubmit || submitting}
          className="w-full sm:w-auto px-8 py-3 bg-field-forest text-white font-medium rounded-lg hover:bg-field-forest/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : "Mark plan ready to file"}
        </button>
        {!completion.canSubmit && (
          <p className="text-sm text-field-earth mt-2">
            Finish the items above to unlock this. Your work is saved as a draft
            in the meantime.
          </p>
        )}
      </div>
    </div>
  );
}
