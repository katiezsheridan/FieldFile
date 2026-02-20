"use client";

import { cn } from "@/lib/utils";

type ProgressBarProps = {
  completed: number;
  total: number;
};

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-white rounded-lg border border-field-wheat p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-field-ink">Activity Progress</h3>
        <span className="text-sm text-field-ink/70">
          {completed} of {total} activities complete
        </span>
      </div>
      <div className="w-full h-3 bg-field-wheat/50 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full bg-field-forest rounded-full transition-all duration-500 ease-out"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-2 text-right">
        <span className="text-xs text-field-ink/60">{percentage}%</span>
      </div>
    </div>
  );
}
