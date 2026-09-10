"use client";

import { useEffect, useState } from "react";
import { createActivity, createDocument, fetchSubActivityIdMap } from "@/lib/hooks";
import { uploadDocument } from "@/lib/supabase";
import {
  PRACTICE_DEF_BY_CODE,
  SUB_ACTIVITY_BY_CODE,
  legacyActivityType,
} from "@/lib/sub-activities";
import { MIGRATION_HINT, describeError, isMissingSchemaError } from "@/lib/errors";
import { EvidenceUploader } from "@/components/documents/EvidenceUploader";
import FormError from "@/components/ui/FormError";
import ActivityContainerFields, {
  ContainerDraft,
  answersToSave,
  emptyDraft,
} from "./ActivityContainerFields";

type PendingDoc = { file: File; type: "photo" | "receipt" | "note"; date?: string };

interface AddActivityFormProps {
  propertyId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddActivityForm({
  propertyId,
  onSuccess,
  onCancel,
}: AddActivityFormProps) {
  const [draft, setDraft] = useState<ContainerDraft>(emptyDraft);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
  const [subActivityIds, setSubActivityIds] = useState<Record<
    string,
    string
  > | null>(null);
  const [catalogMissing, setCatalogMissing] = useState(false);

  useEffect(() => {
    let active = true;
    fetchSubActivityIdMap().then((map) => {
      if (!active) return;
      if (map) setSubActivityIds(map);
      else setCatalogMissing(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleStage = (
    file: File,
    docType: "photo" | "receipt" | "note",
    date?: string
  ) => {
    setPendingDocs((prev) => [...prev, { file, type: docType, date }]);
  };

  const handleRemovePending = (index: number) => {
    setPendingDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const subActivityId = subActivityIds?.[draft.subActivityCode];
      if (!subActivityId) throw new Error(MIGRATION_HINT);

      const sub = SUB_ACTIVITY_BY_CODE[draft.subActivityCode];
      const practice = PRACTICE_DEF_BY_CODE[draft.practiceCode];

      const created = await createActivity(propertyId, {
        type: legacyActivityType(draft.subActivityCode),
        name: name || sub.name,
        description: `${practice.name} — ${sub.name}`,
        status: "in_progress",
        requiredEvidence: [],
        notes,
        dueDate: draft.performedOn,
        completedDate: draft.performedOn,
        practiceCode: draft.practiceCode,
        subActivityId,
        performedOn: draft.performedOn,
        performedThrough:
          draft.multiDay && draft.performedThrough
            ? draft.performedThrough
            : undefined,
        locationLabel: draft.locationLabel || undefined,
        fieldValues: answersToSave(draft),
      });

      if (created?.id && pendingDocs.length > 0) {
        for (const pending of pendingDocs) {
          const result = await uploadDocument(pending.file, created.id);
          if (result) {
            await createDocument(created.id, {
              type: pending.type,
              name: pending.file.name,
              url: result.url,
              storagePath: result.path,
            });
          }
        }
      }
      onSuccess();
    } catch (err: unknown) {
      // The raw object is the only place a PostgrestError's code/details/hint
      // survive intact — keep it in the console for diagnosis.
      console.error("createActivity failed:", err);
      setError(
        isMissingSchemaError(err)
          ? MIGRATION_HINT
          : describeError(err, "Failed to create activity")
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full p-2 border border-field-wheat rounded-lg focus:outline-none focus:ring-2 focus:ring-field-forest/20";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-field-wheat rounded-lg p-6"
    >
      <h3 className="text-lg font-semibold text-field-ink mb-1">Add Activity</h3>
      <p className="text-sm text-field-earth mb-4">
        These are the practices and detail boxes printed on TPWD form PWD-888,
        the wildlife management annual report. Record it once here and it carries
        onto the report.
      </p>

      {catalogMissing && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-sm">
          {MIGRATION_HINT} The form below works, but there is nowhere to store
          the answers.
        </div>
      )}

      <ActivityContainerFields draft={draft} onChange={setDraft} />

      <div className="space-y-4 mt-4">
        <div className="border-t border-field-wheat pt-4">
          <label className="block text-sm font-medium text-field-ink mb-1">
            Name (optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={SUB_ACTIVITY_BY_CODE[draft.subActivityCode]?.name}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-field-ink mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Anything else worth remembering about this work"
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-field-ink mb-2">
          Photos and evidence (optional)
        </label>
        <p className="text-xs text-field-earth mb-2">
          Receipts, photos and maps attach to this activity. PWD-888 Part V asks
          you to attach them to the report.
        </p>
        {pendingDocs.length > 0 && (
          <ul className="mb-3 space-y-2">
            {pendingDocs.map((doc, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm p-2 bg-field-cream/50 rounded"
              >
                <span className="truncate text-field-ink">
                  {doc.file.name}{" "}
                  <span className="text-field-ink/60">({doc.type})</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemovePending(i)}
                  className="text-xs text-red-600 hover:underline ml-3"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <EvidenceUploader onUpload={handleStage} />
      </div>

      <div className="mt-6">
        <FormError message={error} />
      </div>

      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          disabled={saving || (!subActivityIds && !catalogMissing)}
          className="px-4 py-2 bg-field-forest text-white font-medium rounded-lg hover:bg-field-forest/90 disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add Activity"}
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
