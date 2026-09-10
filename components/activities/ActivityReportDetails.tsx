"use client";

import { useEffect, useState } from "react";
import { fetchSubActivityIdMap } from "@/lib/hooks";
import {
  PRACTICE_DEF_BY_CODE,
  SUB_ACTIVITY_BY_CODE,
  type FieldDef,
} from "@/lib/sub-activities";
import { Activity, FieldValue } from "@/lib/types";

/**
 * Read-only view of what this activity will put on PWD-888 Part IV: the
 * practice, the sub-activity, and the answers to the detail blanks the form
 * prints. Labels come from the same catalog the capture form uses.
 */
export default function ActivityReportDetails({
  activity,
  onEdit,
}: {
  activity: Activity;
  onEdit?: () => void;
}) {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    if (!activity.subActivityId) return;
    let active = true;
    fetchSubActivityIdMap().then((map) => {
      if (!active || !map) return;
      const match = Object.entries(map).find(
        ([, id]) => id === activity.subActivityId
      );
      setCode(match?.[0] ?? null);
    });
    return () => {
      active = false;
    };
  }, [activity.subActivityId]);

  const practice = activity.practiceCode
    ? PRACTICE_DEF_BY_CODE[activity.practiceCode]
    : undefined;
  const sub = code ? SUB_ACTIVITY_BY_CODE[code] : undefined;
  const values = activity.fieldValues ?? {};
  const answered = sub
    ? sub.fields.filter((f) => hasValue(values[f.key]))
    : [];

  return (
    <div className="bg-white border border-field-wheat rounded-lg p-6">
      <div className="flex items-start justify-between gap-4 mb-1">
        <h2 className="text-lg font-semibold text-field-ink">
          On the annual report
        </h2>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-sm font-medium text-field-forest hover:underline shrink-0"
          >
            Edit
          </button>
        )}
      </div>

      {practice ? (
        <p className="text-sm text-field-earth mb-4">
          PWD-888 Part IV, section {practice.formSectionNumber} — {practice.name}
          {sub ? (
            <> &rsaquo; {sub.name}</>
          ) : (
            <>
              {" "}
              &rsaquo;{" "}
              <span className="text-field-terra">
                no activity chosen yet
              </span>
            </>
          )}
        </p>
      ) : (
        <p className="text-sm text-field-terra mb-4">
          Not classified for the annual report yet. Edit to pick its practice
          and activity — the report counts practices, so an unclassified
          activity counts toward nothing.
        </p>
      )}

      {activity.performedOn && (
        <p className="text-sm text-field-ink mb-4">
          <span className="text-field-ink/60">Performed:</span>{" "}
          {activity.performedOn}
          {activity.performedThrough && <> to {activity.performedThrough}</>}
          {activity.locationLabel && <> · {activity.locationLabel}</>}
        </p>
      )}

      {answered.length === 0 ? (
        <p className="text-sm text-field-ink/60">
          No detail recorded for this activity yet.
        </p>
      ) : (
        <dl className="space-y-2 text-sm">
          {answered.map((field) => (
            <div key={field.key} className="flex flex-wrap gap-x-2">
              <dt className="text-field-ink/60">{field.label}:</dt>
              <dd className="text-field-ink font-medium">
                {formatValue(field, values[field.key])}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function hasValue(value: FieldValue | undefined): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function formatValue(field: FieldDef, value: FieldValue | undefined): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    return field.unit ? `${value} ${field.unit}` : String(value);
  }
  if (value && typeof value === "object") {
    return [value.from, value.to].filter(Boolean).join(" to ");
  }
  return String(value ?? "");
}
