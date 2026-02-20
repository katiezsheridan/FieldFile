"use client";

import { FilingStatus } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export type TimelineEvent = {
  status: string;
  date: string;
  note?: string;
};

type FilingTimelineProps = {
  currentStatus: FilingStatus;
  events: TimelineEvent[];
};

const TIMELINE_STEPS = [
  { key: "draft", label: "Draft Created" },
  { key: "evidence_collected", label: "Evidence Collected" },
  { key: "ready_to_file", label: "Ready to File" },
  { key: "filed", label: "Filed" },
  { key: "accepted", label: "Accepted" },
] as const;

const STATUS_ORDER: Record<string, number> = {
  draft: 0,
  evidence_collected: 1,
  ready_to_file: 2,
  filed: 3,
  accepted: 4,
  needs_followup: 3, // Same level as filed
};

export function FilingTimeline({ currentStatus, events }: FilingTimelineProps) {
  const currentStepIndex = STATUS_ORDER[currentStatus] ?? 0;

  // Create a map of events by status for easy lookup
  const eventMap = new Map<string, TimelineEvent>();
  events.forEach((event) => {
    eventMap.set(event.status, event);
  });

  return (
    <div className="bg-white rounded-lg border border-field-wheat p-6">
      <h3 className="text-lg font-semibold text-field-ink mb-6">
        Filing Timeline
      </h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-field-wheat" />

        <div className="space-y-6">
          {TIMELINE_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const event = eventMap.get(step.key);

            return (
              <div key={step.key} className="relative flex items-start gap-4">
                {/* Step indicator */}
                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white transition-colors",
                    isCompleted
                      ? "border-field-forest bg-field-forest"
                      : isCurrent
                      ? "border-field-forest"
                      : "border-field-wheat"
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : isCurrent ? (
                    <div className="h-2.5 w-2.5 rounded-full bg-field-forest" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-field-wheat" />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0 pt-1">
                  <p
                    className={cn(
                      "font-medium",
                      isCompleted || isCurrent
                        ? "text-field-ink"
                        : "text-field-ink/40"
                    )}
                  >
                    {step.label}
                  </p>
                  {event && (
                    <div className="mt-1">
                      <p className="text-sm text-field-ink/60">
                        {formatDate(event.date)}
                      </p>
                      {event.note && (
                        <p className="text-sm text-field-ink/50 mt-0.5">
                          {event.note}
                        </p>
                      )}
                    </div>
                  )}
                  {isCurrent && !event && (
                    <p className="text-sm text-field-forest mt-1">
                      Current step
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Needs follow-up indicator */}
      {currentStatus === "needs_followup" && (
        <div className="mt-6 p-4 bg-status-followup/10 border border-status-followup/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-status-followup flex items-center justify-center">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-status-followup">
                Follow-up Required
              </p>
              <p className="text-sm text-field-ink/70 mt-0.5">
                Your filing requires additional information. Check your email for details.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
