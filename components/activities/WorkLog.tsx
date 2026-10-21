"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createDocument } from "@/lib/hooks";
import { uploadDocument } from "@/lib/supabase";
import { texasDate } from "@/lib/dates";
import { cn, formatDate } from "@/lib/utils";
import type { Activity } from "@/lib/types";

/**
 * The work log: every time this activity's work was done, with its own date,
 * notes, time, cost, amount, who did it, and photos.
 *
 * The activity's dates follow the log (first visit → Date performed, last →
 * through), server-side in lib/activity-visits-server.ts. Visits must fall in
 * the activity's tax year; "Continue in <next year>" starts next year's copy.
 */

type Visit = {
  id: string;
  visitedOn: string;
  notes: string | null;
  timeSpent: string | null;
  cost: number | null;
  amount: string | null;
  performedBy: string | null;
};

type Draft = {
  visitedOn: string;
  notes: string;
  timeSpent: string;
  cost: string;
  amount: string;
  performedBy: string;
};

const blankDraft = (date: string): Draft => ({
  visitedOn: date,
  notes: "",
  timeSpent: "",
  cost: "",
  amount: "",
  performedBy: "",
});

const toDraft = (v: Visit): Draft => ({
  visitedOn: v.visitedOn,
  notes: v.notes ?? "",
  timeSpent: v.timeSpent ?? "",
  cost: v.cost === null ? "" : String(v.cost),
  amount: v.amount ?? "",
  performedBy: v.performedBy ?? "",
});

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const inputCls =
  "w-full rounded-md border border-field-wheat bg-white px-3 py-2 text-sm text-field-ink focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest";

export default function WorkLog({
  activity,
  propertyId,
  onChanged,
  onCountChange,
}: {
  activity: Activity;
  /** Route param, for links only. */
  propertyId: string;
  /** Re-read the activity: its dates and documents follow the log. */
  onChanged: () => void;
  onCountChange?: (count: number) => void;
}) {
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const today = texasDate();
  const year =
    visits?.[0]?.visitedOn.slice(0, 4) ?? activity.performedOn?.slice(0, 4) ?? today.slice(0, 4);
  const minDate = `${year}-01-01`;
  const maxDate = `${year}-12-31` < today ? `${year}-12-31` : today;
  const defaultDate = today.startsWith(year) ? today : maxDate;

  const load = useCallback(async () => {
    const r = await fetch(`/api/activities/${activity.id}/visits`);
    const body = await r.json().catch(() => ({}));
    if (r.status === 503) {
      setUnavailable(body.error ?? "The work log isn't available yet.");
      setVisits([]);
      return;
    }
    if (!r.ok) {
      setError(body.error ?? "Could not load the work log");
      return;
    }
    setVisits(body.visits);
    onCountChange?.(body.visits.length);
  }, [activity.id, onCountChange]);

  useEffect(() => {
    load();
  }, [load]);

  /** Save the visit, then upload any files picked in the form onto it. */
  const save = async (draft: Draft, visitId: string | undefined, files: File[]) => {
    setBusy(visitId ?? "new");
    setError(null);
    try {
      const r = await fetch(
        `/api/activities/${activity.id}/visits${visitId ? `/${visitId}` : ""}`,
        {
          method: visitId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...draft,
            cost: draft.cost.trim() === "" ? null : Number(draft.cost.replace(/[$,]/g, "")),
          }),
        }
      );
      const body = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(body.error ?? "Could not save the visit");
        return false;
      }
      if (files.length) await uploadTo(body.visit.id, files);
      await load();
      onChanged();
      return true;
    } finally {
      setBusy(null);
    }
  };

  const remove = async (visitId: string) => {
    setBusy(visitId);
    setError(null);
    try {
      const r = await fetch(`/api/activities/${activity.id}/visits/${visitId}`, { method: "DELETE" });
      if (!r.ok) setError((await r.json().catch(() => ({}))).error ?? "Could not delete the visit");
      await load();
      onChanged();
    } finally {
      setBusy(null);
      setConfirmDelete(null);
    }
  };

  const uploadTo = async (visitId: string, files: File[]) => {
    try {
      for (const file of files) {
        const up = await uploadDocument(file, activity.id);
        if (!up) continue;
        await createDocument(activity.id, {
          type: file.type === "application/pdf" ? "receipt" : "photo",
          name: file.name,
          url: up.url,
          storagePath: up.path,
          visitId,
        });
      }
    } catch {
      setError("The visit saved, but a file could not be attached. Try adding it again.");
    }
  };

  const attach = async (visitId: string, files: FileList | null) => {
    if (!files?.length) return;
    setBusy(`photo:${visitId}`);
    setError(null);
    try {
      await uploadTo(visitId, Array.from(files));
      onChanged();
    } finally {
      setBusy(null);
    }
  };

  const continueNextYear = async () => {
    setBusy("continue");
    setError(null);
    try {
      const r = await fetch(`/api/activities/${activity.id}/continue`, { method: "POST" });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) setError(body.error ?? "Could not start next year's activity");
      else router.push(`/properties/${propertyId}/activities/${body.id}`);
    } finally {
      setBusy(null);
    }
  };

  const totalCost = (visits ?? []).reduce((n, v) => n + (v.cost ?? 0), 0);
  const ordered = [...(visits ?? [])].sort((a, b) => b.visitedOn.localeCompare(a.visitedOn));
  const unlinkedDocs = activity.documents.filter((d) => !d.visitId).length;

  return (
    <div className="rounded-lg border border-field-wheat bg-white p-6">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-field-ink">Work log</h2>
        {visits && visits.length > 0 && (
          <span className="text-sm text-field-earth">
            {year} · {visits.length} visit{visits.length === 1 ? "" : "s"}
            {totalCost > 0 && ` · ${money(totalCost)}`}
          </span>
        )}
      </div>
      <p className="mb-4 text-sm text-field-earth">
        Log each time you did this work. The activity&apos;s dates on the annual report come from
        these visits.
      </p>

      {unavailable && <p className="mb-4 text-sm text-field-terra">{unavailable}</p>}
      {error && <p className="mb-4 text-sm text-field-terra">{error}</p>}

      {!unavailable &&
        (adding ? (
          <VisitForm
            initial={blankDraft(defaultDate)}
            min={minDate}
            max={maxDate}
            saving={busy === "new"}
            submitLabel="Save visit"
            onCancel={() => setAdding(false)}
            onSubmit={async (d, files) => {
              if (await save(d, undefined, files)) setAdding(false);
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mb-2 rounded-lg bg-field-forest px-4 py-2 text-sm font-medium text-white hover:bg-field-forest/90"
          >
            + Log a visit
          </button>
        ))}

      {visits === null ? (
        <div className="mt-4 h-16 animate-pulse rounded-md bg-field-mist" />
      ) : ordered.length === 0 ? (
        !unavailable && <p className="mt-3 text-sm text-field-ink/50">No visits logged yet.</p>
      ) : (
        <ol className="mt-4 space-y-4 border-t border-field-wheat pt-4">
          {ordered.map((v) => {
            const docs = activity.documents.filter((d) => d.visitId === v.id);
            if (editingId === v.id) {
              return (
                <li key={v.id}>
                  <VisitForm
                    initial={toDraft(v)}
                    min={minDate}
                    max={maxDate}
                    saving={busy === v.id}
                    submitLabel="Save changes"
                    onCancel={() => setEditingId(null)}
                    onSubmit={async (d, files) => {
                      if (await save(d, v.id, files)) setEditingId(null);
                    }}
                  />
                </li>
              );
            }
            const facts = [
              v.amount,
              v.cost !== null ? money(v.cost) : null,
              v.timeSpent,
              v.performedBy ? `by ${v.performedBy}` : null,
            ].filter(Boolean);
            return (
              <li key={v.id} className="flex gap-3">
                <div className="w-1 shrink-0 rounded-full bg-field-forest/30" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-field-ink">{formatDate(v.visitedOn)}</p>
                    <div className="flex gap-3 text-xs">
                      <button type="button" className="text-field-forest hover:underline" onClick={() => setEditingId(v.id)}>
                        Edit
                      </button>
                      {confirmDelete === v.id ? (
                        <span className="flex gap-2">
                          <button type="button" className="font-medium text-field-terra hover:underline" disabled={busy === v.id} onClick={() => remove(v.id)}>
                            Delete visit
                          </button>
                          <button type="button" className="text-field-earth hover:underline" onClick={() => setConfirmDelete(null)}>
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button type="button" className="text-field-earth hover:underline" onClick={() => setConfirmDelete(v.id)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  {v.notes && <p className="mt-0.5 whitespace-pre-wrap text-sm text-field-ink/80">{v.notes}</p>}
                  {facts.length > 0 && <p className="mt-1 text-xs text-field-earth">{facts.join(" · ")}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {docs.map((d) =>
                      d.type === "photo" ? (
                        <a
                          key={d.id}
                          href={d.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative block h-14 w-14 overflow-hidden rounded-md border border-field-wheat"
                        >
                          <Image src={d.url} alt={d.name} fill sizes="56px" className="object-cover" />
                        </a>
                      ) : (
                        <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-field-wheat px-2 py-1 text-xs text-field-earth hover:underline">
                          {d.name}
                        </a>
                      )
                    )}
                    <label className={cn("cursor-pointer rounded-md border border-dashed border-field-wheat px-2 py-1 text-xs text-field-forest hover:border-field-forest", busy === `photo:${v.id}` && "opacity-50")}>
                      {busy === `photo:${v.id}` ? "Uploading…" : docs.length ? "+ Add" : "+ Add photos"}
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        multiple
                        className="hidden"
                        disabled={busy === `photo:${v.id}`}
                        onChange={(e) => {
                          attach(v.id, e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {unlinkedDocs > 0 && ordered.length > 0 && (
        <p className="mt-4 text-xs text-field-earth">
          {unlinkedDocs} photo{unlinkedDocs === 1 ? " is" : "s are"} on the activity but not on a
          visit — still counted as evidence.
        </p>
      )}

      {ordered.length > 0 && !unavailable && (
        <div className="mt-5 border-t border-field-wheat pt-4">
          <button
            type="button"
            onClick={continueNextYear}
            disabled={busy === "continue"}
            className="text-sm font-medium text-field-forest hover:underline disabled:opacity-50"
          >
            {busy === "continue" ? "Starting…" : `Continue in ${Number(year) + 1} →`}
          </button>
          <p className="mt-1 text-xs text-field-earth">
            Starts next year&apos;s copy of this activity, same details, empty work log.
          </p>
        </div>
      )}
    </div>
  );
}

function VisitForm({
  initial,
  min,
  max,
  saving,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: Draft;
  min: string;
  max: string;
  saving: boolean;
  submitLabel: string;
  onSubmit: (d: Draft, files: File[]) => void;
  onCancel: () => void;
}) {
  const [d, setD] = useState(initial);
  const [files, setFiles] = useState<File[]>([]);
  const set = (k: keyof Draft) => (e: { target: { value: string } }) => setD((x) => ({ ...x, [k]: e.target.value }));
  return (
    <div className="mb-2 rounded-md border border-field-wheat bg-field-cream/50 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-field-earth">Date</span>
          <input type="date" className={inputCls} value={d.visitedOn} min={min} max={max} onChange={set("visitedOn")} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-field-earth">Done by</span>
          <input className={inputCls} value={d.performedBy} placeholder="Self" onChange={set("performedBy")} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-field-earth">What you did</span>
          <textarea className={cn(inputCls, "min-h-[70px]")} value={d.notes} placeholder="Filled the lower feeder" onChange={set("notes")} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-field-earth">Amount</span>
          <input className={inputCls} value={d.amount} placeholder="175 lbs, 305 gallons…" onChange={set("amount")} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-field-earth">Cost</span>
            <input className={inputCls} value={d.cost} inputMode="decimal" placeholder="$78.95" onChange={set("cost")} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-field-earth">Time spent</span>
            <input className={inputCls} value={d.timeSpent} placeholder="2 hours" onChange={set("timeSpent")} />
          </label>
        </div>
        <div className="sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-field-earth">Photos or receipts</span>
          <label className="inline-flex cursor-pointer items-center rounded-md border border-dashed border-field-wheat bg-white px-3 py-2 text-sm text-field-forest hover:border-field-forest">
            + Choose files
            <input
              type="file"
              accept="image/*,application/pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []);
                setFiles((f) => [...f, ...picked]);
                e.target.value = "";
              }}
            />
          </label>
          {files.length > 0 && (
            <ul className="mt-2 space-y-1">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded bg-white px-2 py-1 text-xs text-field-ink">
                  <span className="truncate">{f.name}</span>
                  <button type="button" className="ml-3 text-field-terra hover:underline" onClick={() => setFiles((x) => x.filter((_, j) => j !== i))}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          disabled={saving || !d.visitedOn}
          onClick={() => onSubmit(d, files)}
          className="rounded-lg bg-field-forest px-4 py-2 text-sm font-medium text-white hover:bg-field-forest/90 disabled:opacity-50"
        >
          {saving ? (files.length ? "Saving and uploading…" : "Saving…") : files.length ? `${submitLabel} + ${files.length} file${files.length === 1 ? "" : "s"}` : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-field-earth hover:underline">
          Cancel
        </button>
      </div>
      <p className="mt-2 text-xs text-field-earth">
        Dates must be in {min.slice(0, 4)}, this activity&apos;s tax year.
      </p>
    </div>
  );
}
