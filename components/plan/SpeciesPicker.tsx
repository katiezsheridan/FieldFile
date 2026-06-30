"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  SPECIES_GROUPS,
  SPECIES_OPTIONS,
  SpeciesOption,
  speciesMatches,
  findSpeciesOption,
} from "@/components/plan/species";

type SpeciesPickerProps = {
  value: string[];
  onChange: (next: string[]) => void;
  ariaLabel?: string;
};

// Visual species picker: tap an illustrated tile to add/remove a species, or
// type any other species below. Typed terms resolve to a tile when they match
// its name or a known alias (e.g. "duck" or "mallard" select the Ducks tile),
// otherwise they become a custom chip. Selections are stored as a flat list of
// names, so this is a drop-in for the old chip input with no data change.
export default function SpeciesPicker({
  value,
  onChange,
  ariaLabel,
}: SpeciesPickerProps) {
  const [draft, setDraft] = useState("");
  // Slugs whose illustration failed to load, so we can fall back to text.
  const [brokenArt, setBrokenArt] = useState<Set<string>>(new Set());

  const isSelected = (option: SpeciesOption) =>
    value.some((v) => speciesMatches(v, option));

  const toggle = (option: SpeciesOption) =>
    isSelected(option)
      ? onChange(value.filter((v) => !speciesMatches(v, option)))
      : onChange([...value, option.label]);

  // Typed entries that do not map to any tile, shown as chips.
  const customs = value.filter(
    (v) => !SPECIES_OPTIONS.some((o) => speciesMatches(v, o))
  );

  const addDraft = () => {
    const term = draft.trim();
    setDraft("");
    if (!term) return;
    const match = findSpeciesOption(term);
    if (match) {
      if (!isSelected(match)) onChange([...value, match.label]);
      return;
    }
    if (!value.some((v) => v.toLowerCase() === term.toLowerCase())) {
      onChange([...value, term]);
    }
  };

  const removeCustom = (tag: string) =>
    onChange(value.filter((v) => v !== tag));

  return (
    <div>
      <div className="space-y-4">
        {SPECIES_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-field-earth/70 mb-2">
              {group.label}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {group.species.map((opt) => {
                const selected = isSelected(opt);
                return (
                  <button
                    key={opt.slug}
                    type="button"
                    onClick={() => toggle(opt)}
                    aria-pressed={selected}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 transition-colors",
                      selected
                        ? "border-field-forest bg-field-forest/5"
                        : "border-field-wheat/60 bg-white hover:border-field-forest/40"
                    )}
                  >
                    {brokenArt.has(opt.slug) ? (
                      <span className="h-10 w-10 rounded-full bg-field-mist flex items-center justify-center text-sm font-semibold text-field-earth">
                        {opt.label.charAt(0)}
                      </span>
                    ) : (
                      <Image
                        src={`/images/species/${opt.slug}.svg`}
                        alt=""
                        width={40}
                        height={40}
                        unoptimized
                        onError={() =>
                          setBrokenArt((prev) => new Set(prev).add(opt.slug))
                        }
                        className="h-10 w-10"
                      />
                    )}
                    <span className="text-xs font-medium text-field-ink text-center">
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
          </div>
        ))}
      </div>

      {/* Typed-in species not in the grid */}
      {customs.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {customs.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full bg-field-forest/10 text-field-forest px-3 py-1 text-sm font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeCustom(tag)}
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
            addDraft();
          }
        }}
        onBlur={addDraft}
        placeholder="Type another species and press Enter"
        className="w-full mt-4 rounded-lg border border-field-wheat bg-white px-3 py-2 text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/30 focus:border-field-forest"
      />
    </div>
  );
}
