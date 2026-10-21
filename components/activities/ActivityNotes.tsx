"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { texasDate } from "@/lib/dates";
import { formatDate } from "@/lib/utils";
import type { Activity } from "@/lib/types";

/**
 * Notes about the activity as a whole — where the feeders are, what the plan
 * is, anything worth remembering. Added or edited any time after the activity
 * is saved. Each time the work was DONE is a visit in the work log, not a note.
 *
 * Stored on activities.notes as a JSON array of { date, text }, newest first —
 * the same shape the earlier notes box wrote, so existing notes carry over.
 */

type Note = { date: string; text: string };

function parse(raw: string | undefined): Note[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Legacy plain text: one undated-today note.
    return raw.trim() ? [{ date: texasDate(), text: raw }] : [];
  }
}

const inputCls =
  "w-full rounded-md border border-field-wheat bg-white p-3 text-sm text-field-ink focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest";

export default function ActivityNotes({ activity }: { activity: Activity }) {
  const [notes, setNotes] = useState<Note[]>(() => parse(activity.notes));
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persist = async (next: Note[]) => {
    setSaving(true);
    setError(null);
    const { error: err } = await supabase
      .from("activities")
      .update({ notes: JSON.stringify(next), updated_at: new Date().toISOString() })
      .eq("id", activity.id);
    setSaving(false);
    if (err) {
      setError("Could not save the note");
      return false;
    }
    setNotes(next);
    return true;
  };

  const add = async () => {
    const text = draft.trim();
    if (!text) return;
    if (await persist([{ date: texasDate(), text }, ...notes])) setDraft("");
  };

  const saveEdit = async (i: number) => {
    const text = editText.trim();
    if (!text) return;
    if (await persist(notes.map((n, j) => (j === i ? { ...n, text } : n)))) setEditing(null);
  };

  const remove = async (i: number) => {
    if (await persist(notes.filter((_, j) => j !== i))) setConfirmDelete(null);
  };

  return (
    <div className="rounded-lg border border-field-wheat bg-white p-6">
      <h2 className="mb-1 text-lg font-semibold text-field-ink">Notes</h2>
      <p className="mb-4 text-sm text-field-earth">
        Anything about this activity as a whole. Each time you did the work goes in the work log
        above.
      </p>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.metaKey) {
            e.preventDefault();
            add();
          }
        }}
        placeholder="e.g. Lower feeder is by the creek crossing; switched to mixed seed in spring"
        className={`${inputCls} min-h-[70px] resize-y`}
      />
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim() || saving}
          className="rounded-lg bg-field-forest px-4 py-1.5 text-sm font-medium text-white hover:bg-field-forest/90 disabled:opacity-40"
        >
          {saving && editing === null ? "Saving…" : "Add note"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-field-terra">{error}</p>}

      {notes.length > 0 && (
        <ul className="mt-4 space-y-4 border-t border-field-wheat pt-4">
          {notes.map((n, i) => (
            <li key={`${n.date}-${i}`} className="flex gap-3">
              <div className="w-1 shrink-0 rounded-full bg-field-forest/20" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xs font-medium text-field-ink/50">{formatDate(n.date)}</p>
                  {editing !== i && (
                    <div className="flex gap-3 text-xs">
                      <button
                        type="button"
                        className="text-field-forest hover:underline"
                        onClick={() => {
                          setEditing(i);
                          setEditText(n.text);
                        }}
                      >
                        Edit
                      </button>
                      {confirmDelete === i ? (
                        <span className="flex gap-2">
                          <button type="button" className="font-medium text-field-terra hover:underline" onClick={() => remove(i)}>
                            Delete note
                          </button>
                          <button type="button" className="text-field-earth hover:underline" onClick={() => setConfirmDelete(null)}>
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button type="button" className="text-field-earth hover:underline" onClick={() => setConfirmDelete(i)}>
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {editing === i ? (
                  <div className="mt-1">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className={`${inputCls} min-h-[60px] resize-y`}
                    />
                    <div className="mt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() => saveEdit(i)}
                        disabled={!editText.trim() || saving}
                        className="rounded-lg bg-field-forest px-3 py-1.5 text-sm font-medium text-white hover:bg-field-forest/90 disabled:opacity-40"
                      >
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button type="button" className="text-sm text-field-earth hover:underline" onClick={() => setEditing(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-0.5 whitespace-pre-wrap text-sm text-field-ink/80">{n.text}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
