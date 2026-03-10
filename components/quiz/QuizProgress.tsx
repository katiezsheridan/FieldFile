"use client";

interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function QuizProgress({
  currentStep,
  totalSteps,
}: QuizProgressProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-field-ink/70">
          Question {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-field-ink/50">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-field-wheat/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-field-forest rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
