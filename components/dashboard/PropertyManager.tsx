"use client";

import { useState } from "react";
import { PropertyWithDetails } from "@/lib/types";
import { PropertyCard } from "./PropertyCard";
import { PropertyFormModal } from "./PropertyFormModal";

type PropertyManagerProps = {
  properties: PropertyWithDetails[];
  // Refetch the property list after a create, edit, or photo change.
  onChanged: () => void;
};

// Renders the landowner's properties as a responsive grid of cards with
// add / edit / photo controls. All writes go through the Session 1 data layer
// (createProperty / updateProperty / updatePropertyPhoto) via the children.
export function PropertyManager({
  properties,
  onChanged,
}: PropertyManagerProps) {
  // null + open = add; a property + open = edit.
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PropertyWithDetails | null>(null);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (property: PropertyWithDetails) => {
    setEditing(property);
    setModalOpen(true);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-field-ink">Your properties</h2>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-field-forest text-white text-sm font-medium hover:bg-field-forest/90 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add property
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onEdit={openEdit}
          />
        ))}
      </div>

      {modalOpen && (
        <PropertyFormModal
          property={editing}
          onClose={() => setModalOpen(false)}
          onSaved={onChanged}
        />
      )}
    </section>
  );
}
