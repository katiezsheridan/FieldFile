"use client";

import { useState } from "react";
import { createActivity } from "@/lib/hooks";
import { ActivityType } from "@/lib/types";

interface AddActivityFormProps {
  propertyId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const activityTypes: { value: ActivityType; label: string; description: string }[] = [
  { value: "birdhouses", label: "Nest Boxes", description: "Install and monitor nest boxes for cavity-nesting birds" },
  { value: "feeders", label: "Supplemental Feeding", description: "Maintain feeders for wildlife during stress periods" },
  { value: "water_sources", label: "Water Sources", description: "Maintain and improve water availability" },
  { value: "brush_management", label: "Brush Management", description: "Selective clearing to improve habitat" },
  { value: "native_planting", label: "Native Planting", description: "Plant native grasses and wildflowers" },
  { value: "census", label: "Wildlife Census", description: "Document wildlife populations on the property" },
];

function getDefaultDueDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed, so September = 8

  // If past September (month > 8), use end of December
  // Otherwise use end of September
  if (month > 8) {
    return `${year}-12-31`;
  }
  return `${year}-09-30`;
}

export default function AddActivityForm({ propertyId, onSuccess, onCancel }: AddActivityFormProps) {
  const [type, setType] = useState<ActivityType>("birdhouses");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(getDefaultDueDate());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedActivity = activityTypes.find(a => a.value === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await createActivity(propertyId, {
        type,
        name: name || selectedActivity?.label || "",
        description: description || selectedActivity?.description || "",
        status: "not_started",
        requiredEvidence: [],
        notes: "",
        dueDate: dueDate || new Date(new Date().getFullYear() + 1, 1, 1).toISOString().split("T")[0],
      });
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create activity";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-field-wheat rounded-lg p-6">
      <h3 className="text-lg font-semibold text-field-ink mb-4">Add Activity</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-field-ink mb-1">
            Activity Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ActivityType)}
            className="w-full p-2 border border-field-wheat rounded-lg focus:outline-none focus:ring-2 focus:ring-field-forest/20"
          >
            {activityTypes.map((activity) => (
              <option key={activity.value} value={activity.value}>
                {activity.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-field-ink mb-1">
            Name (optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={selectedActivity?.label}
            className="w-full p-2 border border-field-wheat rounded-lg focus:outline-none focus:ring-2 focus:ring-field-forest/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-field-ink mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={selectedActivity?.description}
            rows={2}
            className="w-full p-2 border border-field-wheat rounded-lg focus:outline-none focus:ring-2 focus:ring-field-forest/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-field-ink mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full p-2 border border-field-wheat rounded-lg focus:outline-none focus:ring-2 focus:ring-field-forest/20"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={saving}
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
