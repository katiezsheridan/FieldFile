"use client";

import { ReactNode } from "react";

interface WizardStepProps {
  title: string;
  description?: string;
  children: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  nextLabel?: string;
  nextDisabled?: boolean;
}

export default function WizardStep({
  title,
  description,
  children,
  onNext,
  onBack,
  isFirst = false,
  isLast = false,
  nextLabel,
  nextDisabled = false,
}: WizardStepProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-field-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-field-ink/70 text-lg">
            {description}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-8 mt-8 border-t border-field-wheat">
        <div>
          {!isFirst && onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 text-field-ink/70 hover:text-field-ink font-medium transition-colors"
            >
              Back
            </button>
          )}
        </div>
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="px-8 py-3 bg-field-forest text-white font-medium rounded-lg hover:bg-field-forest/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {nextLabel || (isLast ? "Complete" : "Continue")}
        </button>
      </div>
    </div>
  );
}
