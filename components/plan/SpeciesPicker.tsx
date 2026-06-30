"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SPECIES_OPTIONS } from "@/components/plan/species";

type SpeciesPickerProps = {
  value: string[];
  onChange: (next: string[]) => void;
  ariaLabel?: string;
};

// Visual species picker: tap an illustrated tile to add/remove a common species,
// or type any other species in the field below. Selections (tiles and typed)
// are stored as a flat list of names, so this is a drop-in for the old chip
// input and needs no data change.
export default function SpeciesPicker({
  value,
  onChange,
  ariaLabel,
}: SpeciesPickerProps) {
  const [draft, setDraft] = useState("");

  const has = (label: string) =>
    value.some((v) => v.toLowerCase() === label.toLowerCase());

  const toggle = (label: string) =>
    has(label)
      ? onChange(value.filter((v) => v.toLowerCase() !== label.toLowerCase()))
      : onChange([...value, label]);

  // Typed entries that are not one of the quick-pick tiles, shown as chips.
  const customs = value.filter(
    (v) => !SPECIES_OPTIONS.some((o) => o.label.toLowerCase() === v.toLowerCase())
  );

  const addCustom = () => {
    const trimmed = draft.trim();
    if (trimmed && !has(trimmed)) onChange([...value, trimmed]);
    setDraft("");
  };

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {SPECIES_OPTIONS.map((opt) => {
          const selected = has(opt.label);
          return (
            <button
              key={opt.slug}
              type="button"
              onClick={() => toggle(opt.label)}
              aria-pressed={selected}
              className={cn(
                "relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 transition-colors",
                selected
                  ? "border-field-forest bg-field-forest/5"
                  : "border-field-wheat/60 bg-white hover:border-field-forest/40"
              )}
            >
              <Image
                src={`/images/species/${opt.slug}.svg`}
                alt=""
                width={40}
                height={40}
                unoptimized
                className="h-10 w-10"
              />
              <span className="text-xs font-medium text-field-ink">
                {opt.label}
              </span>
              {selected && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-field-forest flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Typed-in species not in the grid */}
      {customs.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {customs.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full bg-field-forest/10 text-field-forest px-3 py-1 text-sm font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => toggle(tag)}
                aria-label={`Remove ${tag}`}
                className="text-field-forest/60 hover:text-field-forest"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        value={draft}
        aria-label={ariaLabel}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addCustom();
          }
        }}
        onBlur={addCustom}
        placeholder="Type another species and press Enter"
        className="w-full mt-3 rounded-lg border border-field-wheat bg-white px-3 py-2 text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/30 focus:border-field-forest"
      />
    </div>
  );
}
