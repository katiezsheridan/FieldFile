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

// A collapsible section rendered as a white card with a chevron header, matching
// PropertyMapSection so every section on the property page shares the same
// chrome. The body has its own padding; child content cards keep their borders
// so they stay legible inside the panel.
export function CollapsibleSection({
  title,
  summary,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="bg-white border border-field-wheat rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-5 py-4 text-left",
          open && "border-b border-field-wheat/50"
        )}
      >
        <span className="flex items-center gap-2 min-w-0">
          <svg
            className={cn(
              "w-5 h-5 shrink-0 text-field-earth transition-transform duration-200",
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
          <span className="shrink-0 text-sm text-field-ink/60">{summary}</span>
        )}
      </button>
      {open && <div className="p-5">{children}</div>}
    </section>
  );
}
