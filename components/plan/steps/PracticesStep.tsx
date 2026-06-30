"use client";

import { PLAN_PRACTICES } from "@/lib/plan-practices";

// Placeholder for Session 3. The real step lets the landowner choose at least
// three of these seven practices, fill a short documentation sub-form for each,
// and see soft warnings when a practice does not fit their habitat. For now we
// show the seven so the shape of the step is clear; selection is not wired yet.
export default function PracticesStep() {
  return (
    <div className="space-y-6">
      <p className="text-field-earth">
        Next you will choose the wildlife management practices for your plan.
        You need at least three. Each one gets a short write-up of what you plan
        to do. This step is coming in the next update.
      </p>

      <div className="rounded-lg border border-dashed border-field-wheat bg-field-mist/40 px-4 py-3">
        <p className="text-sm font-medium text-field-ink">
          Coming soon: practice selection
        </p>
        <p className="text-sm text-field-earth mt-1">
          The seven qualifying practices you will choose from:
        </p>
      </div>

      <ul className="space-y-2">
        {PLAN_PRACTICES.map((p) => (
          <li
            key={p.type}
            className="rounded-lg border border-field-wheat/60 bg-white px-4 py-3"
          >
            <p className="font-medium text-field-ink">{p.label}</p>
            <p className="text-sm text-field-earth mt-0.5">{p.blurb}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
