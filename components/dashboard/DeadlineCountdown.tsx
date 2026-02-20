"use client";

type DeadlineCountdownProps = {
  daysRemaining: number;
};

export function DeadlineCountdown({ daysRemaining }: DeadlineCountdownProps) {
  return (
    <div className="rounded-lg border border-field-wheat bg-white p-6">
      <h3 className="text-sm font-medium mb-2 text-field-ink">
        Filing Deadline
      </h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-field-ink">
          {daysRemaining}
        </span>
        <span className="text-sm text-field-ink/70">
          {daysRemaining === 1 ? "day" : "days"} until filing deadline
        </span>
      </div>
    </div>
  );
}
