"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A form-level failure, shown where the user is actually looking.
 *
 * Two audiences, one box. The landowner gets a plain sentence and the
 * reassurance that their typing survived — "invalid input syntax for type
 * uuid" tells them nothing and reads like they broke something. The technical
 * message stays available behind a disclosure, and one tap emails it to us,
 * because the alternative is a user who abandons the form and a bug we never
 * hear about.
 *
 * A long form pushes its heading off screen, so this scrolls itself into view
 * and announces to screen readers. Put one next to the submit button.
 */

interface FormErrorProps {
  /** The technical error. Shown only under "Show technical details". */
  message: string | null;
  /** Plain-language heading, e.g. "Couldn't save this activity". */
  title?: string;
  /** Names the operation in the report email, e.g. "Add activity". */
  action: string;
}

export default function FormError({ message, title, action }: FormErrorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [reportFailed, setReportFailed] = useState(false);

  useEffect(() => {
    if (message) {
      setReported(false);
      setReportFailed(false);
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [message]);

  if (!message) return null;

  const handleReport = async () => {
    setReporting(true);
    setReportFailed(false);
    try {
      const res = await fetch("/api/error-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          message,
          path: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setReported(true);
    } catch {
      setReportFailed(true);
    } finally {
      setReporting(false);
    }
  };

  return (
    <div
      ref={ref}
      role="alert"
      aria-live="assertive"
      className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm"
    >
      <p className="font-medium text-red-800">
        {title ?? "Something went wrong"}
      </p>
      <p className="mt-1 text-red-700">
        This one is on us, not you. Nothing was saved, and everything you
        entered is still here — try again in a moment.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {reported ? (
          <span className="text-red-700">
            Thanks — the details are on their way to Katie.
          </span>
        ) : (
          <button
            type="button"
            onClick={handleReport}
            disabled={reporting}
            className="px-3 py-1.5 bg-white border border-red-300 text-red-800 font-medium rounded-lg hover:bg-red-100 disabled:opacity-50"
          >
            {reporting ? "Sending…" : "Report this problem"}
          </button>
        )}

        <details className="text-red-700">
          <summary className="cursor-pointer hover:underline">
            Show technical details
          </summary>
          <pre className="mt-2 p-2 bg-white border border-red-200 rounded text-xs whitespace-pre-wrap break-words text-red-900">
            {message}
          </pre>
        </details>
      </div>

      {reportFailed && (
        <p className="mt-2 text-xs text-red-700">
          The report couldn&rsquo;t be sent. Copy the technical details above
          and email them to katie@fieldfile.com.
        </p>
      )}
    </div>
  );
}
