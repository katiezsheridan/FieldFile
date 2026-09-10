"use client";

import { useEffect, useState } from "react";
import { fetchSubActivityIdMap, updateActivityContainer } from "@/lib/hooks";
import {
  PRACTICE_DEF_BY_CODE,
  SUB_ACTIVITY_BY_CODE,
  legacyActivityType,
} from "@/lib/sub-activities";
import { Activity } from "@/lib/types";
import { MIGRATION_HINT, describeError, isMissingSchemaError } from "@/lib/errors";
import FormError from "@/components/ui/FormError";
import ActivityContainerFields, {
  ContainerDraft,
  answersToSave,
  draftFromActivity,
} from "./ActivityContainerFields";

/**
 * Correct a container's classification and detail after the fact. Editing here
 * moves the activity's whole evidence set with it — there is no per-photo
 * practice to drift out of sync.
 */
export default function EditActivityForm({
  activity,
  propertyId,
  onSaved,
  onCancel,
}: {
  activity: Activity;
  propertyId: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<ContainerDraft | null>(null);
  const [subActivityIds, setSubActivityIds] = useState<Record<
    string,
    string
  > | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchSubActivityIdMap().then((map) => {
      if (!active) return;
      setSubActivityIds(map ?? {});
      // The activity stores a uuid; the catalog is keyed by code.
      const code =
        map && activity.subActivityId
          ? Object.entries(map).find(([, id]) => id === activity.subActivityId)?.[0]
          : undefined;
      // An unclassified container (a backfilled `census` row) opens on the
      // first sub-activity of its practice rather than guessing which count.
      const fallback = activity.practiceCode
        ? `${activity.practiceCode}-01`
        : "HC-01";
      setDraft(draftFromActivity(activity, code ?? fallback));
    });
    return () => {
      active = false;
    };
  }, [activity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    setError(null);

    try {
      const subActivityId = subActivityIds?.[draft.subActivityCode];
      if (!subActivityId) {
        throw new Error(
          "The activity catalog isn't in this database. Apply migrations/add_annual_report_domain.sql to Supabase, then try again."
        );
      }
      const sub = SUB_ACTIVITY_BY_CODE[draft.subActivityCode];
      const practice = PRACTICE_DEF_BY_CODE[draft.practiceCode];

      await updateActivityContainer(activity.id, propertyId, {
        practiceCode: draft.practiceCode,
        subActivityId,
        performedOn: draft.performedOn,
        performedThrough:
          draft.multiDay && draft.performedThrough
            ? draft.performedThrough
            : undefined,
        locationLabel: draft.locationLabel || undefined,
        fieldValues: answersToSave(draft),
        type: legacyActivityType(draft.subActivityCode),
        name: activity.name || sub.name,
        description: `${practice.name} — ${sub.name}`,
      });
      onSaved();
    } catch (err: unknown) {
      console.error("updateActivityContainer failed:", err);
      setError(
        isMissingSchemaError(err)
          ? MIGRATION_HINT
          : describeError(err, "Failed to save this activity")
      );
    } finally {
      setSaving(false);
    }
  };

  if (!draft) {
    return (
      <div className="bg-white border border-field-wheat rounded-lg p-6">
        <div className="h-4 bg-field-wheat rounded w-40 animate-pulse" />
      </div>
    );
  }

  const yearChanged =
    activity.performedOn &&
    activity.performedOn.slice(0, 4) !== draft.performedOn.slice(0, 4);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-field-wheat rounded-lg p-6"
    >
      <h2 className="text-lg font-semibold text-field-ink mb-1">
        Edit this activity
      </h2>
      <p className="text-sm text-field-earth mb-4">
        Changing the practice or activity reclassifies every photo and receipt
        attached here — they move with it.
      </p>

      {yearChanged && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-sm">
          This moves the activity from the {activity.performedOn?.slice(0, 4)}{" "}
          report to {draft.performedOn.slice(0, 4)}, along with its{" "}
          {activity.documents.length}{" "}
          {activity.documents.length === 1 ? "document" : "documents"}.
        </div>
      )}

      <ActivityContainerFields draft={draft} onChange={setDraft} />

      <div className="mt-6">
        <FormError message={error} />
      </div>

      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-field-forest text-white font-medium rounded-lg hover:bg-field-forest/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-field-wheat text-field-ink font-medium rounded-lg hover:bg-field-cream"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
