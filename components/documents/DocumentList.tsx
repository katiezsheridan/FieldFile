"use client";

import { useState } from "react";
import { Document } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";

interface DocumentListProps {
  documents: Document[];
  onRename?: (doc: Document, name: string) => Promise<void> | void;
  onDelete?: (doc: Document) => Promise<void> | void;
}

function getTypeBadgeStyles(type: Document["type"]): string {
  switch (type) {
    case "photo":
      return "bg-field-sage/30 text-field-forest";
    case "receipt":
      return "bg-field-wheat text-field-earth";
    case "note":
      return "bg-field-cream text-field-ink";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getTypeLabel(type: Document["type"]): string {
  switch (type) {
    case "photo":
      return "Photo";
    case "receipt":
      return "Receipt";
    case "note":
      return "Note";
    default:
      return type;
  }
}

export function DocumentList({ documents, onRename, onDelete }: DocumentListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-field-ink/60">
        No documents uploaded yet.
      </div>
    );
  }

  const startEdit = (doc: Document) => {
    setEditingId(doc.id);
    setDraftName(doc.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftName("");
  };

  const saveEdit = async (doc: Document) => {
    if (!onRename || !draftName.trim() || draftName === doc.name) {
      cancelEdit();
      return;
    }
    setBusyId(doc.id);
    try {
      await onRename(doc, draftName.trim());
      cancelEdit();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!onDelete) return;
    if (!confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;
    setBusyId(doc.id);
    try {
      await onDelete(doc);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-field-wheat">
            <th className="text-left py-3 px-4 text-sm font-medium text-field-ink/70">
              File Name
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-field-ink/70">
              Type
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-field-ink/70">
              Upload Date
            </th>
            {(onRename || onDelete) && (
              <th className="text-right py-3 px-4 text-sm font-medium text-field-ink/70">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => {
            const isEditing = editingId === doc.id;
            const isBusy = busyId === doc.id;
            return (
              <tr
                key={doc.id}
                className="border-b border-field-wheat/50 hover:bg-field-cream/50"
              >
                <td className="py-3 px-4">
                  {isEditing ? (
                    <input
                      autoFocus
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(doc);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="border border-field-sage rounded px-2 py-1 text-sm w-full max-w-xs"
                    />
                  ) : (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={doc.name}
                      className="text-field-forest hover:underline"
                    >
                      {doc.name}
                    </a>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      "inline-block px-2 py-1 rounded text-xs font-medium",
                      getTypeBadgeStyles(doc.type)
                    )}
                  >
                    {getTypeLabel(doc.type)}
                  </span>
                </td>
                <td className="py-3 px-4 text-field-ink/70 text-sm">
                  {formatDate(doc.uploadedAt)}
                </td>
                {(onRename || onDelete) && (
                  <td className="py-3 px-4 text-right text-sm">
                    {isEditing ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => saveEdit(doc)}
                          disabled={isBusy}
                          className="text-field-forest hover:underline disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={isBusy}
                          className="text-field-ink/60 hover:underline disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-3 justify-end">
                        {onRename && (
                          <button
                            onClick={() => startEdit(doc)}
                            disabled={isBusy}
                            className="text-field-ink/70 hover:text-field-forest disabled:opacity-50"
                          >
                            Rename
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => handleDelete(doc)}
                            disabled={isBusy}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
