"use client";

import { useState } from "react";

type TagInputProps = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  ariaLabel?: string;
};

// Simple chip input: type a value, press Enter or comma to add it, click the x
// to remove. Used for wildlife species and target species in the plan wizard.
export default function TagInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    // De-dupe case-insensitively but keep the user's casing.
    if (!value.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  };

  const remove = (tag: string) => onChange(value.filter((v) => v !== tag));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2" aria-live="polite">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full bg-field-forest/10 text-field-forest px-3 py-1 text-sm font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
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
      <input
        type="text"
        value={draft}
        aria-label={ariaLabel}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder={placeholder}
        className="w-full rounded-lg border border-field-wheat bg-white px-3 py-2 text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/30 focus:border-field-forest"
      />
    </div>
  );
}
