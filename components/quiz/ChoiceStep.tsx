"use client";

import { cn } from "@/lib/utils";
import type { ChoiceOption } from "@/lib/eligibility-quiz";

interface ChoiceStepProps {
  title: string;
  description?: string;
  options: ChoiceOption[];
  selectedValue: string | undefined;
  // Selecting an answer auto-advances to the next step (good on mobile).
  onSelect: (value: string) => void;
}

export default function ChoiceStep({
  title,
  description,
  options,
  selectedValue,
  onSelect,
}: ChoiceStepProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-field-ink">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-field-ink/70 text-base">{description}</p>
        )}
      </div>

      <div className="grid gap-3">
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={cn(
                "w-full text-left px-5 py-4 rounded-lg border-2 transition-all duration-200",
                "hover:border-field-green/40 hover:shadow-sm",
                isSelected
                  ? "border-field-green bg-field-green/5"
                  : "border-field-wheat bg-white"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors",
                    isSelected
                      ? "border-field-green bg-field-green"
                      : "border-field-wheat"
                  )}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={cn(
                    "font-medium text-sm sm:text-base",
                    isSelected ? "text-field-ink" : "text-field-ink/80"
                  )}
                >
                  {option.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
