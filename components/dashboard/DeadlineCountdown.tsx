"use client";

type DeadlineCountdownProps = {
  daysRemaining: number;
};

export function DeadlineCountdown({ daysRemaining }: DeadlineCountdownProps) {
  const isUrgent = daysRemaining <= 30;

  return (
    <div
      className={`rounded-xl border p-6 ${
        isUrgent
          ? "bg-field-terra/5 border-field-terra/30"
          : "bg-white border-field-wheat"
      }`}
    >
      <h3 className="text-sm font-medium mb-2 text-field-earth">
        Filing Deadline
      </h3>
      <div className="flex items-baseline gap-2">
        <span
          className={`text-3xl font-bold ${
            isUrgent ? "text-field-terra" : "text-field-hero"
          }`}
        >
          {daysRemaining}
        </span>
        <span className="text-sm text-field-earth">
          {daysRemaining === 1 ? "day" : "days"} remaining
        </span>
      </div>
    </div>
  );
}
