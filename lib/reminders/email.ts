/**
 * Reminder email content. Pure: takes what to say, returns subject + HTML.
 *
 * Plain and factual. It names the deadline, says where the property stands,
 * and links to the place to act. It never says FieldFile will submit
 * anything — the landowner submits.
 */

import type { DueReminder } from "./schedule";

export const SITE_URL = "https://www.fieldfile.com";

export type ReminderEmailInput = {
  reminder: DueReminder;
  propertyName: string;
  propertySlug: string;
  /** Activities reminders: practices documented so far this year. */
  qualifyingPractices?: number;
  /** Report reminders: the district, when the property's county is known. */
  district?: string | null;
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const longDate = (isoDate: string) =>
  new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

const days = (n: number) => (n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`);

export function reminderEmail(input: ReminderEmailInput): { subject: string; html: string } {
  const { reminder: r, propertyName } = input;
  const name = esc(propertyName);
  const reportUrl = `${SITE_URL}/properties/${encodeURIComponent(input.propertySlug)}/annual-report?year=${r.taxYear}`;
  const propertyUrl = `${SITE_URL}/properties/${encodeURIComponent(input.propertySlug)}`;

  let subject: string;
  let body: string;

  if (r.kind === "activities") {
    const n = input.qualifyingPractices ?? 0;
    subject = `${propertyName}: ${n} of 3 practices documented for ${r.taxYear}`;
    body = `
      <p>Wildlife management work for the ${r.taxYear} tax year has to be completed by
      <strong>${longDate(r.deadline)}</strong> — ${days(r.daysLeft)}.</p>
      <p><strong>${name}</strong> has <strong>${n} of the 3</strong> required practices documented
      for ${r.taxYear} so far. A practice counts once an activity is dated, says what was done,
      and has a photo or receipt attached (or, for a census, its counts recorded).</p>
      <p><a href="${propertyUrl}">See what's missing for ${name} →</a></p>`;
  } else {
    const to = input.district ? esc(input.district) : "your county appraisal district";
    subject = `${propertyName}: ${r.taxYear} wildlife annual report due ${longDate(r.deadline)}`;
    body = `
      <p>Your ${r.taxYear} wildlife management annual report (PWD-888) for <strong>${name}</strong>
      is due to ${to} by <strong>${longDate(r.deadline)}</strong> — ${days(r.daysLeft)}.</p>
      <p>FieldFile has it filled in from your activities and field log. Review it, generate the
      PDF, sign it, and submit it to the appraisal district. Once you have, record the submission
      in FieldFile and these reminders stop.</p>
      <p><a href="${reportUrl}">Review the ${r.taxYear} report →</a></p>`;
  }

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Helvetica, Arial, sans-serif; color: #322B2A; max-width: 560px; line-height: 1.5;">
      ${body}
      <p style="color:#6B5E51; font-size: 13px;">If your appraisal district's letter gives a different
      date, go by the letter.</p>
      <hr style="border:none; border-top:1px solid #D8D2C9; margin: 24px 0 12px;" />
      <p style="color:#6B5E51; font-size: 12px;">You're getting this because you turned on deadline
      reminders. <a href="${SITE_URL}/settings" style="color:#495336;">Turn them off in Settings</a>.</p>
    </div>`;

  // Entities, not raw UTF-8: some mail clients mis-decode an em dash or arrow
  // when a message's charset header is lost on forwarding.
  return { subject, html: html.replace(/—/g, "&mdash;").replace(/→/g, "&rarr;").replace(/’/g, "&rsquo;") };
}
