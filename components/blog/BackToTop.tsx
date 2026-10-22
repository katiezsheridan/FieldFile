"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Floating "Back to top" button that appears once the reader scrolls down. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toTop() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    history.replaceState(null, "", window.location.pathname);
    document.querySelector("h1")?.focus({ preventScroll: true });
  }

  return (
    <button
      type="button"
      onClick={toTop}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed bottom-24 right-4 z-30 flex items-center gap-1.5 rounded-full border border-field-wheat bg-white px-4 py-2 text-sm font-medium text-field-forest shadow-lg transition-opacity hover:bg-field-mist focus:outline-none focus-visible:ring-2 focus-visible:ring-field-forest print:hidden",
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
      Back to top
    </button>
  );
}
