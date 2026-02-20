"use client";

import { useState, useEffect } from "react";
import { Activity, ActivityStatus } from "@/lib/types";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks";
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
  const [notes, setNotes] = useState(activity.notes);
  const [status, setStatus] = useState<ActivityStatus>(activity.status);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const debouncedNotes = useDebounce(notes, 1000);

  // Auto-save notes when they change
  useEffect(() => {
    if (debouncedNotes === activity.notes) return;

    const saveNotes = async () => {
      setIsSaving(true);
      const { error } = await supabase
        .from("activities")
        .update({ notes: debouncedNotes, updated_at: new Date().toISOString() })
        .eq("id", activity.id);

      setIsSaving(false);
      if (!error) {
        setLastSaved(new Date());
        onUpdate?.({ ...activity, notes: debouncedNotes });
      }
    };

    saveNotes();
  }, [debouncedNotes, activity, onUpdate]);

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
    { value: "evidence_uploaded", label: "Evidence Uploaded" },
    { value: "needs_followup", label: "Needs Follow-up" },
    { value: "complete", label: "Complete" },
  ];

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
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-field-ink/60">Due date:</span>{" "}
            <span className="text-field-ink font-medium">
              {formatDate(activity.dueDate)}
            </span>
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
              <div
                key={doc.id}
                className="flex items-center justify-between py-3 border-b border-field-wheat last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-field-cream rounded flex items-center justify-center">
                    {doc.type === "photo" ? (
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
                          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                        />
                      </svg>
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes - Editable */}
      <div className="bg-white border border-field-wheat rounded-lg p-6">
        <h2 className="text-lg font-semibold text-field-ink mb-4">Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this activity..."
          className="w-full min-h-[120px] p-3 border border-field-wheat rounded-lg text-field-ink/80 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest"
        />
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
