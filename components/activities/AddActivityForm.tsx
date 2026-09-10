"use client";

import { useEffect, useMemo, useState } from "react";
import { createActivity, createDocument, fetchSubActivityIdMap } from "@/lib/hooks";
import { uploadDocument } from "@/lib/supabase";
import {
  PRACTICE_DEFS,
  SUB_ACTIVITY_BY_CODE,
  legacyActivityType,
  subActivitiesFor,
  visibleFields,
} from "@/lib/sub-activities";
import { FieldValue, PracticeCode } from "@/lib/types";
import { EvidenceUploader } from "@/components/documents/EvidenceUploader";
import SubActivityFields from "./SubActivityFields";

type PendingDoc = { file: File; type: "photo" | "receipt" | "note"; date?: string };

interface AddActivityFormProps {
  propertyId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export default function AddActivityForm({
  propertyId,
  onSuccess,
  onCancel,
}: AddActivityFormProps) {
  const [practiceCode, setPracticeCode] = useState<PracticeCode>("HC");
  const [subActivityCode, setSubActivityCode] = useState<string>("HC-01");
  const [fieldValues, setFieldValues] = useState<Record<string, FieldValue>>({});
  const [performedOn, setPerformedOn] = useState(today());
  const [performedThrough, setPerformedThrough] = useState("");
  const [multiDay, setMultiDay] = useState(false);
  const [locationLabel, setLocationLabel] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
  // null while loading; {} means the reference tables aren't there yet.
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

  const subActivities = useMemo(
    () => subActivitiesFor(practiceCode),
    [practiceCode]
  );
  const subActivity = SUB_ACTIVITY_BY_CODE[subActivityCode];
  const practice = PRACTICE_DEFS.find((p) => p.code === practiceCode);

  // Changing practice resets the sub-activity and the answers that belonged to it.
  const handlePracticeChange = (code: PracticeCode) => {
    setPracticeCode(code);
    const first = subActivitiesFor(code)[0];
    setSubActivityCode(first.code);
    setFieldValues({});
  };

  const handleSubActivityChange = (code: string) => {
    setSubActivityCode(code);
    setFieldValues({});
  };

  const handleFieldChange = (key: string, value: FieldValue) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  };

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

  // Answers belonging to fields the user has since hidden must not be saved —
  // a stale "strip width" on a block design would print on the report.
  const answersToSave = useMemo(() => {
    if (!subActivity) return {};
    const visible = new Set(
      visibleFields(subActivity, fieldValues).map((f) => f.key)
    );
    return Object.fromEntries(
      Object.entries(fieldValues).filter(
        ([key, value]) =>
          visible.has(key) &&
          value !== null &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
      )
    );
  }, [subActivity, fieldValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const subActivityId = subActivityIds?.[subActivityCode];
      if (!subActivityId) {
        throw new Error(
          "The activity catalog isn't in the database yet. Apply migrations/add_annual_report_domain.sql to Supabase, then try again."
        );
      }

      const created = await createActivity(propertyId, {
        type: legacyActivityType(subActivityCode),
        name: name || subActivity.name,
        description: practice ? `${practice.name} — ${subActivity.name}` : subActivity.name,
        status: "in_progress",
        requiredEvidence: [],
        notes,
        dueDate: performedOn,
        completedDate: performedOn,
        practiceCode,
        subActivityId,
        performedOn,
        performedThrough: multiDay && performedThrough ? performedThrough : undefined,
        locationLabel: locationLabel || undefined,
        fieldValues: answersToSave,
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
      const message =
        err instanceof Error ? err.message : "Failed to create activity";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const selectClass =
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

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {catalogMissing && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-sm">
          The annual-report tables aren&rsquo;t in this database yet. Apply{" "}
          <code>migrations/add_annual_report_domain.sql</code> to Supabase before
          saving — the form below works, but there is nowhere to store the
          answers.
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-field-ink mb-1">
            Practice (PWD-888 Part IV)
          </label>
          <select
            value={practiceCode}
            onChange={(e) => handlePracticeChange(e.target.value as PracticeCode)}
            className={selectClass}
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
            value={subActivityCode}
            onChange={(e) => handleSubActivityChange(e.target.value)}
            className={selectClass}
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
              value={performedOn}
              onChange={(e) => setPerformedOn(e.target.value)}
              required
              className={selectClass}
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
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              placeholder="North pasture, tank 2…"
              className={selectClass}
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-field-ink">
            <input
              type="checkbox"
              checked={multiDay}
              onChange={(e) => setMultiDay(e.target.checked)}
            />
            <span>This work spanned more than one day</span>
          </label>
          {multiDay && (
            <input
              type="date"
              value={performedThrough}
              onChange={(e) => setPerformedThrough(e.target.value)}
              min={performedOn}
              className={`${selectClass} mt-2`}
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
              values={fieldValues}
              onChange={handleFieldChange}
            />
          </div>
        )}

        <div className="border-t border-field-wheat pt-4">
          <label className="block text-sm font-medium text-field-ink mb-1">
            Name (optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={subActivity?.name}
            className={selectClass}
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
            className={selectClass}
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

      <div className="flex gap-3 mt-6">
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
