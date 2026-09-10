"use client";

import { useMemo } from "react";
import {
  PRACTICE_DEFS,
  SUB_ACTIVITY_BY_CODE,
  subActivitiesFor,
  visibleFields,
} from "@/lib/sub-activities";
import { Activity, FieldValue, PracticeCode } from "@/lib/types";
import SubActivityFields from "./SubActivityFields";

/**
 * The container's own fields — practice, sub-activity, when and where, and the
 * PWD-888 detail blanks. Shared by Add and Edit so the two cannot drift: a
 * landowner correcting a classification must see exactly the form they filled.
 */

export type ContainerDraft = {
  practiceCode: PracticeCode;
  subActivityCode: string;
  fieldValues: Record<string, FieldValue>;
  performedOn: string;
  performedThrough: string;
  multiDay: boolean;
  locationLabel: string;
};

export function emptyDraft(): ContainerDraft {
  return {
    practiceCode: "HC",
    subActivityCode: "HC-01",
    fieldValues: {},
    performedOn: new Date().toISOString().split("T")[0],
    performedThrough: "",
    multiDay: false,
    locationLabel: "",
  };
}

/** Rebuild the draft from a saved activity, for editing. */
export function draftFromActivity(
  activity: Activity,
  subActivityCode: string
): ContainerDraft {
  return {
    practiceCode: activity.practiceCode ?? "HC",
    subActivityCode,
    fieldValues: activity.fieldValues ?? {},
    performedOn:
      activity.performedOn ??
      activity.completedDate ??
      activity.dueDate ??
      new Date().toISOString().split("T")[0],
    performedThrough: activity.performedThrough ?? "",
    multiDay: Boolean(activity.performedThrough),
    locationLabel: activity.locationLabel ?? "",
  };
}

/**
 * The answers worth storing: only fields currently visible, only non-empty.
 * A stale strip width must not survive a switch to a block design and print on
 * the report.
 */
export function answersToSave(
  draft: ContainerDraft
): Record<string, FieldValue> {
  const sub = SUB_ACTIVITY_BY_CODE[draft.subActivityCode];
  if (!sub) return {};
  const visible = new Set(
    visibleFields(sub, draft.fieldValues).map((f) => f.key)
  );
  return Object.fromEntries(
    Object.entries(draft.fieldValues).filter(
      ([key, value]) =>
        visible.has(key) &&
        value !== null &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
    )
  );
}

const inputClass =
  "w-full p-2 border border-field-wheat rounded-lg focus:outline-none focus:ring-2 focus:ring-field-forest/20";

export default function ActivityContainerFields({
  draft,
  onChange,
}: {
  draft: ContainerDraft;
  onChange: (next: ContainerDraft) => void;
}) {
  const subActivities = useMemo(
    () => subActivitiesFor(draft.practiceCode),
    [draft.practiceCode]
  );
  const subActivity = SUB_ACTIVITY_BY_CODE[draft.subActivityCode];
  const practice = PRACTICE_DEFS.find((p) => p.code === draft.practiceCode);

  // Changing the classification clears answers: the blanks belong to the
  // sub-activity, and a key that means acres here can mean feet there.
  const handlePracticeChange = (code: PracticeCode) => {
    onChange({
      ...draft,
      practiceCode: code,
      subActivityCode: subActivitiesFor(code)[0].code,
      fieldValues: {},
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-field-ink mb-1">
          Practice (PWD-888 Part IV)
        </label>
        <select
          value={draft.practiceCode}
          onChange={(e) => handlePracticeChange(e.target.value as PracticeCode)}
          className={inputClass}
        >
          {PRACTICE_DEFS.map((p) => (
            <option key={p.code} value={p.code}>
              {p.formSectionNumber}. {p.name}
            </option>
          ))}
        </select>
        {practice && (
          <p className="mt-1 text-xs text-field-earth">{practice.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-field-ink mb-1">
          Activity
        </label>
        <select
          value={draft.subActivityCode}
          onChange={(e) =>
            onChange({
              ...draft,
              subActivityCode: e.target.value,
              fieldValues: {},
            })
          }
          className={inputClass}
        >
          {subActivities.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-field-ink mb-1">
            Date performed
          </label>
          <input
            type="date"
            value={draft.performedOn}
            onChange={(e) => onChange({ ...draft, performedOn: e.target.value })}
            required
            className={inputClass}
          />
          <p className="mt-1 text-xs text-field-earth">
            The date the work happened — this is the year it counts toward.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-field-ink mb-1">
            Location on the property (optional)
          </label>
          <input
            type="text"
            value={draft.locationLabel}
            onChange={(e) =>
              onChange({ ...draft, locationLabel: e.target.value })
            }
            placeholder="North pasture, tank 2…"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-field-ink">
          <input
            type="checkbox"
            checked={draft.multiDay}
            onChange={(e) =>
              onChange({
                ...draft,
                multiDay: e.target.checked,
                performedThrough: e.target.checked ? draft.performedThrough : "",
              })
            }
          />
          <span>This work spanned more than one day</span>
        </label>
        {draft.multiDay && (
          <input
            type="date"
            value={draft.performedThrough}
            onChange={(e) =>
              onChange({ ...draft, performedThrough: e.target.value })
            }
            min={draft.performedOn}
            className={`${inputClass} mt-2`}
          />
        )}
      </div>

      {subActivity && (
        <div className="border-t border-field-wheat pt-4">
          <h4 className="text-sm font-semibold text-field-ink mb-3">
            What the report asks for
          </h4>
          <SubActivityFields
            subActivity={subActivity}
            values={draft.fieldValues}
            onChange={(key, value) =>
              onChange({
                ...draft,
                fieldValues: { ...draft.fieldValues, [key]: value },
              })
            }
          />
        </div>
      )}
    </div>
  );
}
