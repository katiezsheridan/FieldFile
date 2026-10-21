/**
 * When annual-report reminders are due. Pure — the date comes in.
 *
 * Two deadlines, as the landowner's county applies them:
 *   * activities for tax year Y must be COMPLETED by December 31 of Y;
 *   * the Y annual report is DUE to the county appraisal district by
 *     April 30 of Y + 1.
 *
 * Each has three steps. On any day, only the latest step already reached is
 * due — someone who turns reminders on in mid-December gets the December 20
 * nudge, not a backlog of three emails.
 */

export type ReminderKind = "activities" | "report";

export type DueReminder = {
  kind: ReminderKind;
  taxYear: number;
  /** Stable id of the step, for the sent log: "nov1", "apr23"… */
  step: string;
  /** The deadline the reminder is about, YYYY-MM-DD. */
  deadline: string;
  daysLeft: number;
};

const STEPS: Record<ReminderKind, { step: string; month: number; day: number }[]> = {
  activities: [
    { step: "nov1", month: 11, day: 1 },
    { step: "dec1", month: 12, day: 1 },
    { step: "dec20", month: 12, day: 20 },
  ],
  report: [
    { step: "mar1", month: 3, day: 1 },
    { step: "apr1", month: 4, day: 1 },
    { step: "apr23", month: 4, day: 23 },
  ],
};

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

/** Today's calendar date in Texas (America/Chicago), YYYY-MM-DD. */
export function texasToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(now);
}

/** The reminders due on `today` (YYYY-MM-DD), before any per-property check. */
export function dueReminders(today: string): DueReminder[] {
  const year = Number(today.slice(0, 4));
  const out: DueReminder[] = [];

  const latest = (kind: ReminderKind, stepYear: number, deadline: string, taxYear: number) => {
    if (today > deadline) return;
    const reached = STEPS[kind].filter((s) => iso(stepYear, s.month, s.day) <= today);
    const step = reached[reached.length - 1];
    if (step) out.push({ kind, taxYear, step: step.step, deadline, daysLeft: daysBetween(today, deadline) });
  };

  // This year's work, due Dec 31.
  latest("activities", year, iso(year, 12, 31), year);
  // Last year's report, due Apr 30 this year.
  latest("report", year, iso(year, 4, 30), year - 1);
  return out;
}
