"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The signed-in user's settings. For now: opt-in deadline reminders.
 * Off by default — nobody is emailed until they turn it on here.
 */

type Settings = { emailReminders: boolean; available: boolean; note?: string };

export default function SettingsPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(async (r) => (r.ok ? setS(await r.json()) : setError("Could not load settings")))
      .catch(() => setError("Could not load settings"));
  }, []);

  const toggle = async () => {
    if (!s) return;
    const next = !s.emailReminders;
    setSaving(true);
    setError(null);
    try {
      const r = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailReminders: next }),
      });
      const body = await r.json();
      if (!r.ok) setError(body.error ?? "Could not save");
      else setS({ ...s, emailReminders: body.emailReminders });
    } catch {
      setError("Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-field-cream">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-field-ink">Settings</h1>

        <section className="mt-6 rounded-lg border border-field-wheat bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-field-ink">Deadline reminders by email</h2>
              <p className="mt-1 text-sm text-field-earth">
                We&apos;ll email you before the two deadlines that keep a wildlife valuation:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-field-earth">
                <li>
                  <strong className="text-field-ink">December 31</strong> — the year&apos;s wildlife
                  management work must be done. Reminders on Nov 1, Dec 1 and Dec 20, only for
                  properties with fewer than 3 practices documented.
                </li>
                <li>
                  <strong className="text-field-ink">April 30</strong> — the annual report is due to
                  your county appraisal district. Reminders on Mar 1, Apr 1 and Apr 23, until you
                  record that you submitted it.
                </li>
              </ul>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={s?.emailReminders ?? false}
              aria-label="Deadline reminders by email"
              disabled={!s || !s.available || saving}
              onClick={toggle}
              className={cn(
                "relative mt-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
                s?.emailReminders ? "bg-field-forest" : "bg-field-wheat"
              )}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                  s?.emailReminders ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
          <p className="mt-3 text-xs text-field-earth">
            {s?.emailReminders
              ? "On. Emails go to the address on your account."
              : "Off. Turn on to get reminders at the address on your account."}
          </p>
          {s && !s.available && s.note && <p className="mt-3 text-sm text-field-terra">{s.note}</p>}
          {error && <p className="mt-3 text-sm text-field-terra">{error}</p>}
        </section>
      </div>
    </div>
  );
}
