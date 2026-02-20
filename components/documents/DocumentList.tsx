"use client";

import { Document } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";

interface DocumentListProps {
  documents: Document[];
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

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-field-ink/60">
        No documents uploaded yet.
      </div>
    );
  }

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
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr
              key={doc.id}
              className="border-b border-field-wheat/50 hover:bg-field-cream/50"
            >
              <td className="py-3 px-4">
                <span className="text-field-ink">{doc.name}</span>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
