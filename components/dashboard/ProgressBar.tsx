"use client";

type ProgressBarProps = {
  completed: number;
  total: number;
};

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-field-wheat p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-medium text-field-ink">Activity Progress</h3>
        <span className="text-sm font-semibold text-field-forest">
          {completed}/{total}
        </span>
      </div>
      <p className="text-xs text-field-earth mb-3">
        {total - completed > 0
          ? `${total - completed} activities remaining`
          : "All activities complete!"}
      </p>
      <div className="w-full h-2.5 bg-field-mist rounded-full overflow-hidden">
        <div
          className="h-full bg-field-gold rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-2 text-right">
        <span className="text-xs text-field-earth">{percentage}%</span>
      </div>
    </div>
  );
}
