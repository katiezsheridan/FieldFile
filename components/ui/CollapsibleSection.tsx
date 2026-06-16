"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  // Optional right-aligned summary (e.g. a count) shown in the header.
  summary?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

// A section with a chevron header that toggles its body open/closed. Kept
// visually light (no card background) so existing white content cards sit
// inside it the same way they did before.
export function CollapsibleSection({
  title,
  summary,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 mb-4 text-left"
      >
        <span className="flex items-center gap-2">
          <svg
            className={cn(
              "w-5 h-5 text-field-earth transition-transform duration-200",
              open && "rotate-90"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
          <span className="text-xl font-semibold text-field-ink">{title}</span>
        </span>
        {summary != null && (
          <span className="text-sm text-field-ink/60">{summary}</span>
        )}
      </button>
      {open && <div>{children}</div>}
    </section>
  );
}
