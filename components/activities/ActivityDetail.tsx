"use client";

import { useState, useEffect } from "react";
import { Activity, ActivityStatus } from "@/lib/types";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import ActivityChecklist from "./ActivityChecklist";

interface ActivityDetailProps {
  activity: Activity;
  propertyId: string;
  onUpdate?: (activity: Activity) => void;
}

export default function ActivityDetail({
  activity,
  propertyId,
  onUpdate,
}: ActivityDetailProps) {
  // Parse notes as dated entries (JSON array) or migrate from plain string
  const parseNotes = (raw: string): { date: string; text: string }[] => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Legacy plain text — migrate to a single dated entry
      if (raw.trim()) {
        return [{ date: new Date().toISOString().split("T")[0], text: raw }];
      }
    }
    return [];
  };

  const [noteEntries, setNoteEntries] = useState(parseNotes(activity.notes));
  const [newNote, setNewNote] = useState("");
  const [status, setStatus] = useState<ActivityStatus>(activity.status);
  const [dueDate, setDueDate] = useState(activity.dueDate || `${new Date().getFullYear()}-12-31`);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const saveNote = async () => {
    if (!newNote.trim()) return;

    const entry = {
      date: new Date().toISOString().split("T")[0],
      text: newNote.trim(),
    };
    const updated = [entry, ...noteEntries];
    setNoteEntries(updated);
    setNewNote("");

    setIsSaving(true);
    const { error } = await supabase
      .from("activities")
      .update({
        notes: JSON.stringify(updated),
        updated_at: new Date().toISOString(),
      })
      .eq("id", activity.id);

    setIsSaving(false);
    if (!error) {
      setLastSaved(new Date());
      onUpdate?.({ ...activity, notes: JSON.stringify(updated) });
    }
  };

  // Save status changes immediately
  const handleStatusChange = async (newStatus: ActivityStatus) => {
    setStatus(newStatus);
    setIsSaving(true);

    const updates: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // Set completed_date when marking as complete
    if (newStatus === "complete") {
      updates.completed_date = new Date().toISOString().split("T")[0];
    } else if (activity.status === "complete") {
      // Clear completed_date when changing away from complete
      updates.completed_date = null;
    }

    const { error } = await supabase
      .from("activities")
      .update(updates)
      .eq("id", activity.id);

    setIsSaving(false);
    if (!error) {
      setLastSaved(new Date());
      onUpdate?.({
        ...activity,
        status: newStatus,
        completedDate:
          newStatus === "complete"
            ? new Date().toISOString().split("T")[0]
            : undefined,
      });
    }
  };

  const handleDueDateChange = async (newDate: string) => {
    setDueDate(newDate);
    setIsSaving(true);

    const { error } = await supabase
      .from("activities")
      .update({ due_date: newDate, updated_at: new Date().toISOString() })
      .eq("id", activity.id);

    setIsSaving(false);
    if (!error) {
      setLastSaved(new Date());
      onUpdate?.({ ...activity, dueDate: newDate });
    }
  };

  const getDocumentTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      photo: "Photo",
      receipt: "Receipt",
      note: "Note",
    };
    return labels[type] || type;
  };

  const statusOptions: { value: ActivityStatus; label: string }[] = [
    { value: "not_started", label: "Not Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "complete", label: "Complete" },
  ];

  // Auto-compute status based on evidence completion
  useEffect(() => {
    if (activity.requiredEvidence.length === 0) return;

    const requiredItems = activity.requiredEvidence.filter((r) => r.required);
    const hasAnyDoc = activity.documents.length > 0;

    const allRequiredMet = requiredItems.every((req) => {
      if (req.type === "photo") return activity.documents.some((d) => d.type === "photo");
      if (req.type === "receipt") return activity.documents.some((d) => d.type === "receipt");
      if (req.type === "gps") return activity.documents.some((d) => d.metadata?.gpsCoordinates);
      if (req.type === "date") return activity.documents.some((d) => d.metadata?.timestamp || d.uploadedAt);
      return false;
    });

    let newStatus: ActivityStatus = "not_started";
    if (allRequiredMet && requiredItems.length > 0) {
      newStatus = "complete";
    } else if (hasAnyDoc) {
      newStatus = "in_progress";
    }

    if (newStatus !== status) {
      handleStatusChange(newStatus);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity.documents.length]);

  return (
    <div className="space-y-8">
      {/* Save indicator */}
      {(isSaving || lastSaved) && (
        <div className="fixed top-4 right-4 bg-white border border-field-wheat rounded-lg px-3 py-2 shadow-sm text-sm">
          {isSaving ? (
            <span className="text-field-ink/60">Saving...</span>
          ) : lastSaved ? (
            <span className="text-field-forest">Saved</span>
          ) : null}
        </div>
      )}

      {/* Header with status */}
      <div className="bg-white border border-field-wheat rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-field-ink mb-2">
              {activity.name}
            </h1>
            <p className="text-field-ink/70">{activity.description}</p>
          </div>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as ActivityStatus)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border-0 cursor-pointer ${getStatusColor(
              status
            )}`}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-field-ink/60">Due date:</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => handleDueDateChange(e.target.value)}
              className="px-2 py-1 border border-field-wheat rounded-lg text-field-ink font-medium text-sm focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest"
            />
          </div>
          {activity.completedDate && (
            <div>
              <span className="text-field-ink/60">Completed:</span>{" "}
              <span className="text-field-ink font-medium">
                {formatDate(activity.completedDate)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Evidence Checklist */}
      <div className="bg-white border border-field-wheat rounded-lg p-6">
        <h2 className="text-lg font-semibold text-field-ink mb-4">
          Evidence Requirements
        </h2>
        <ActivityChecklist
          requiredEvidence={activity.requiredEvidence}
          documents={activity.documents}
          propertyId={propertyId}
          hasLocations={!!(activity.locations && activity.locations.length > 0)}
        />
      </div>

      {/* Documents */}
      <div className="bg-white border border-field-wheat rounded-lg p-6">
        <h2 className="text-lg font-semibold text-field-ink mb-4">
          Uploaded Documents
        </h2>
        {activity.documents.length === 0 ? (
          <p className="text-field-ink/60 text-sm">
            No documents uploaded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {activity.documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-3 border-b border-field-wheat last:border-b-0 hover:bg-field-cream/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-field-cream rounded flex items-center justify-center overflow-hidden">
                    {doc.type === "photo" && doc.url ? (
                      <img
                        src={doc.url}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-5 h-5 text-field-forest"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-field-ink">
                      {doc.name}
                    </p>
                    <p className="text-xs text-field-ink/60">
                      {getDocumentTypeLabel(doc.type)} - Uploaded{" "}
                      {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white border border-field-wheat rounded-lg p-6">
        <h2 className="text-lg font-semibold text-field-ink mb-4">
          Activity Notes
        </h2>

        {/* New note input */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-field-ink/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span className="text-sm text-field-ink/50">{today}</span>
          </div>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) {
                e.preventDefault();
                saveNote();
              }
            }}
            placeholder="Add a note about what you did today..."
            className="w-full min-h-[80px] p-3 border border-field-wheat rounded-lg text-field-ink/80 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-field-ink/40">
              This note will be saved with today&apos;s date
            </span>
            <button
              onClick={saveNote}
              disabled={!newNote.trim()}
              className="px-4 py-1.5 bg-field-forest text-white text-sm font-medium rounded-lg hover:bg-field-forest/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Save note
            </button>
          </div>
        </div>

        {/* Previous notes */}
        {noteEntries.length > 0 ? (
          <div className="space-y-4 border-t border-field-wheat pt-4">
            {noteEntries.map((entry, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-1 bg-field-forest/20 rounded-full" />
                <div>
                  <p className="text-xs font-medium text-field-ink/50 mb-1">
                    {new Date(entry.date + "T12:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-field-ink/80 whitespace-pre-wrap">
                    {entry.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-field-ink/40 border-t border-field-wheat pt-4">
            No notes yet. Add your first note above.
          </p>
        )}
      </div>

      {/* Locations */}
      {activity.locations && activity.locations.length > 0 && (
        <div className="bg-white border border-field-wheat rounded-lg p-6">
          <h2 className="text-lg font-semibold text-field-ink mb-4">
            Locations
          </h2>
          <div className="space-y-3">
            {activity.locations.map((location, index) => (
              <div
                key={index}
                className="flex items-center gap-3 py-2 border-b border-field-wheat last:border-b-0"
              >
                <div className="w-8 h-8 bg-field-cream rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-field-forest"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                    />
                  </svg>
                </div>
                <div>
                  {location.label && (
                    <p className="text-sm font-medium text-field-ink">
                      {location.label}
                    </p>
                  )}
                  <p className="text-xs text-field-ink/60">
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
