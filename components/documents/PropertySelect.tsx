"use client";

import { PropertyWithDetails } from "@/lib/types";

interface PropertySelectProps {
  properties: PropertyWithDetails[];
  value: PropertyWithDetails;
  onChange: (property: PropertyWithDetails) => void;
}

// Property picker for the upload flows. With a single property it defaults to
// that property's name (no control). With more than one it renders a dropdown
// so the owner can choose which property an upload is for.
export function PropertySelect({
  properties,
  value,
  onChange,
}: PropertySelectProps) {
  const label = (
    <span className="block text-sm font-medium text-field-ink mb-2">
      Property
    </span>
  );

  if (properties.length <= 1) {
    return (
      <div>
        {label}
        <p className="text-field-ink font-medium">{value.name}</p>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-field-ink mb-2">
        Property
      </label>
      <select
        value={value.id}
        onChange={(e) => {
          const next = properties.find((p) => p.id === e.target.value);
          if (next) onChange(next);
        }}
        className="w-full sm:w-72 p-2 border border-field-wheat rounded-lg bg-white text-field-ink focus:outline-none focus:ring-2 focus:ring-field-forest/20"
      >
        {properties.map((property) => (
          <option key={property.id} value={property.id}>
            {property.name}
            {property.county ? ` — ${property.county} County` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
