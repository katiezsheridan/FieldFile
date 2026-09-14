"use client";

import { PRACTICE_CODE_BY_CATEGORY } from "@/lib/practices";
import { subActivitiesFor } from "@/lib/sub-activities";
import type { PracticeCategory } from "@/lib/types";

/**
 * The second tap in the field: which of this practice's PWD-888 line items the
 * landowner just did.
 *
 * This is what lets the server group same-day work into one activity container
 * — practice alone is too coarse, since brush management and prescribed burning
 * are both Habitat Control but are not the same work.
 *
 * The catalog is static TypeScript, so this renders with no network. That
 * matters: capture has to work standing in a pasture with no signal.
 */
export default function SubActivitySelect({
  category,
  value,
  onChange,
  className,
}: {
  category: PracticeCategory | "";
  value: string;
  onChange: (code: string) => void;
  className?: string;
}) {
  if (!category) return null;

  const options = subActivitiesFor(PRACTICE_CODE_BY_CATEGORY[category]);

  return (
    <label className="block">
      <span className="block text-xs font-medium text-field-ink/70 mb-1">
        What did you do? *
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
      >
        <option value="">— Select the activity —</option>
        {options.map((s) => (
          <option key={s.code} value={s.code}>
            {s.name}
          </option>
        ))}
      </select>
      <span className="mt-1 block text-xs text-field-ink/60">
        This is the line item on the annual report. Photos of the same work on
        the same day are filed together.
      </span>
    </label>
  );
}
