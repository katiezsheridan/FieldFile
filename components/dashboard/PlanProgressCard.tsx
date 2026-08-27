"use client";

import Link from "next/link";
import { PlanSummary } from "@/lib/types";

type PlanProgressCardProps = {
  plan: PlanSummary;
};

// What still needs doing on the plan, in plain language. The percentage alone
// is not actionable — the line under it names the next block to work on.
function statusLine(plan: PlanSummary): string {
  const remaining = plan.remainingBlocks;

  if (plan.status === "submitted") return "Plan submitted";
  if (remaining.length === 0) {
    return plan.status === "ready"
      ? "Plan complete and marked ready"
      : "Plan complete — review and mark it ready";
  }

  const count = `${remaining.length} section${remaining.length === 1 ? "" : "s"}`;
  if (plan.completionPct === 0) return `Not started — ${count} to complete`;
  return `${count} left — next: ${remaining[0]}`;
}

// Plan completion for the property's wildlife plan. The percentage comes from
// the server, which runs the same calculator as the wizard, so this card and
// the wizard can never show different numbers.
export function PlanProgressCard({ plan }: PlanProgressCardProps) {
  return (
    <div className="bg-white rounded-xl border border-field-wheat p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-medium text-field-ink">
          Plan Progress
          <span className="ml-1.5 text-xs font-normal text-field-earth">
            {plan.year}
          </span>
        </h3>
        <span className="text-sm font-semibold text-field-forest">
          {plan.completionPct}%
        </span>
      </div>
      <p className="text-xs text-field-earth mb-3">{statusLine(plan)}</p>
      <div className="w-full h-2.5 bg-field-mist rounded-full overflow-hidden">
        <div
          className="h-full bg-field-forest rounded-full transition-all duration-500 ease-out"
          style={{ width: `${plan.completionPct}%` }}
        />
      </div>
      <div className="mt-3">
        <Link
          href={`/plan/${plan.id}`}
          className="text-xs font-medium text-field-forest hover:text-field-forest/80 transition-colors"
        >
          {plan.completionPct === 0 ? "Start your plan" : "Continue your plan"}{" "}
          &rarr;
        </Link>
      </div>
    </div>
  );
}
