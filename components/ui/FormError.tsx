"use client";

import { useEffect, useRef } from "react";

/**
 * A form-level failure, shown where the user is actually looking.
 *
 * A long form pushes its heading off screen, so an error rendered only at the
 * top is invisible: the button returns to its normal state and nothing appears
 * to have happened. This scrolls itself into view and announces to screen
 * readers, so put one next to the submit button.
 */
export default function FormError({ message }: { message: string | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [message]);

  if (!message) return null;

  return (
    <div
      ref={ref}
      role="alert"
      aria-live="assertive"
      className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm"
    >
      <p className="font-medium">Couldn&rsquo;t save this activity</p>
      <p className="mt-1 break-words">{message}</p>
      <p className="mt-2 text-xs text-red-700/80">
        Nothing was saved. Your answers are still here — fix the problem above
        and press save again.
      </p>
    </div>
  );
}
