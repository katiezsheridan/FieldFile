"use client";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export default function StepIndicator({
  steps,
  currentStep,
}: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={index} className="flex items-center flex-1 last:flex-none">
              {/* Step circle and label */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                    ${
                      isCompleted
                        ? "bg-field-forest text-white"
                        : isCurrent
                        ? "bg-field-forest text-white ring-4 ring-field-forest/20"
                        : "bg-field-wheat/50 text-field-ink/50"
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-xs font-medium text-center max-w-[80px] hidden sm:block
                    ${isCurrent ? "text-field-forest" : isCompleted ? "text-field-ink" : "text-field-ink/50"}
                  `}
                >
                  {step}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div
                    className={`h-1 rounded-full transition-colors ${
                      stepNumber < currentStep
                        ? "bg-field-forest"
                        : "bg-field-wheat/50"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
