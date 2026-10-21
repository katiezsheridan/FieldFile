"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, ActivityStatus } from "@/lib/types";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { updateDocumentName, deleteDocumentRecord } from "@/lib/hooks";
import ActivityChecklist from "./ActivityChecklist";
import ActivityReportDetails from "./ActivityReportDetails";
import EditActivityForm from "./EditActivityForm";
import WorkLog from "./WorkLog";
import ActivityNotes from "./ActivityNotes";
import { texasDate } from "@/lib/dates";

interface ActivityDetailProps {
  activity: Activity;
  /**
   * The route's property param — a slug OR a uuid. For building URLs only;
   * never write it to a uuid column (use `activity.propertyId` / `property.id`).
   */
  propertyId: string;
  onUpdate?: (activity: Activity) => void;
  onDocsChange?: () => void;
}

export default function ActivityDetail({
  activity,
  propertyId,
  onUpdate,
  onDocsChange,
}: ActivityDetailProps) {
  const [editingContainer, setEditingContainer] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [docDraftName, setDocDraftName] = useState("");
  const [docBusyId, setDocBusyId] = useState<string | null>(null);

  const saveDocName = async (docId: string, currentName: string) => {
    const name = docDraftName.trim();
    if (!name || name === currentName) {
      setEditingDocId(null);
      return;
    }
    setDocBusyId(docId);
    try {
      await updateDocumentName(docId, name);
      setEditingDocId(null);
      onDocsChange?.();
    } finally {
      setDocBusyId(null);
    }
  };

  const deleteDoc = async (docId: string, name: string, storagePath?: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDocBusyId(docId);
    try {
      await deleteDocumentRecord(docId, storagePath);
      onDocsChange?.();
    } finally {
      setDocBusyId(null);
    }
  };

  const [status, setStatus] = useState<ActivityStatus>(activity.status);
  const [dueDate, setDueDate] = useState(activity.dueDate || `${new Date().getFullYear()}-12-31`);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);



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
      updates.completed_date = texasDate();
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
            ? texasDate()
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

        {activity.type === "census" && (
          <div className="mb-4">
            <Link
              href={`/properties/${propertyId}/census/new`}
              className="inline-flex items-center px-4 py-2 bg-field-forest text-white text-sm font-medium rounded-lg hover:bg-field-forest/90"
            >
              Start census count →
            </Link>
          </div>
        )}

        {/* Dates */}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          {activity.completedDate && (
            <div>
              <span className="text-field-ink/60">Last done:</span>{" "}
              <span className="text-field-ink font-medium">
                {formatDate(activity.completedDate)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* What this activity puts on PWD-888 Part IV */}
      {editingContainer ? (
        <EditActivityForm
          activity={activity}
          datesFromWorkLog={visitCount > 0}
          onSaved={() => {
            setEditingContainer(false);
            onDocsChange?.();
          }}
          onCancel={() => setEditingContainer(false)}
        />
      ) : (
        <ActivityReportDetails
          activity={activity}
          onEdit={() => setEditingContainer(true)}
        />
      )}

      {/* Every time the work was done — the activity's dates follow this. */}
      <WorkLog
        activity={activity}
        propertyId={propertyId}
        onChanged={() => onDocsChange?.()}
        onCountChange={setVisitCount}
      />

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
            {activity.documents.map((doc) => {
              const isEditing = editingDocId === doc.id;
              const isBusy = docBusyId === doc.id;
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between py-3 border-b border-field-wheat last:border-b-0 hover:bg-field-cream/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-field-cream rounded flex items-center justify-center overflow-hidden flex-shrink-0">
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
                    <div className="min-w-0">
                      {isEditing ? (
                        <input
                          autoFocus
                          value={docDraftName}
                          onChange={(e) => setDocDraftName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveDocName(doc.id, doc.name);
                            if (e.key === "Escape") setEditingDocId(null);
                          }}
                          className="border border-field-sage rounded px-2 py-1 text-sm w-full"
                        />
                      ) : (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={doc.name}
                          className="text-sm font-medium text-field-ink hover:text-field-forest hover:underline block truncate"
                        >
                          {doc.name}
                        </a>
                      )}
                      <p className="text-xs text-field-ink/60">
                        {getDocumentTypeLabel(doc.type)} - Uploaded{" "}
                        {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-sm flex-shrink-0 ml-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveDocName(doc.id, doc.name)}
                          disabled={isBusy}
                          className="text-field-forest hover:underline disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingDocId(null)}
                          disabled={isBusy}
                          className="text-field-ink/60 hover:underline disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingDocId(doc.id);
                            setDocDraftName(doc.name);
                          }}
                          disabled={isBusy}
                          className="text-field-ink/70 hover:text-field-forest disabled:opacity-50"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => deleteDoc(doc.id, doc.name, doc.storagePath)}
                          disabled={isBusy}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes about the activity as a whole, editable any time. */}
      <ActivityNotes activity={activity} />

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
