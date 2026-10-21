/**
 * GET /api/cron/reminders — the daily deadline-reminder job (vercel.json).
 *
 * For every user who turned reminders ON in Settings, and each of their
 * wildlife-valuation properties, send whichever reminder is due today
 * (lib/reminders/schedule.ts) — but only when it still applies:
 *
 *   activities  this year has fewer than 3 documented practices
 *   report      last year's report is not recorded as submitted
 *
 * Each (user, property, kind, year, step) is sent once (reminder_log).
 *
 * Two switches, both off by default:
 *   * per user — user_settings.email_reminders (Settings page);
 *   * global   — REMINDER_EMAILS_ENABLED=true in the environment. Without it
 *     the job is a DRY RUN: it works out and returns who would be emailed,
 *     sends nothing, and logs nothing.
 * `?dryRun=1` forces a dry run even when enabled.
 *
 * Called by Vercel Cron with `Authorization: Bearer $CRON_SECRET`; anything
 * else is refused, and the job will not run at all without CRON_SECRET set.
 */

import { createClient } from "@supabase/supabase-js";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { analyzePropertyYear } from "@/lib/annual-report/gap-analysis-server";
import { getPeriodState } from "@/lib/annual-report/pwd888/period-server";
import { describeError, isMissingSchemaError } from "@/lib/errors";
import { dueReminders, texasToday, type DueReminder } from "@/lib/reminders/schedule";
import { reminderEmail } from "@/lib/reminders/email";

export const runtime = "nodejs";
export const maxDuration = 60;

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FROM = "FieldFile <katie@fieldfile.com>";

type Planned = {
  userId: string;
  email: string | null;
  propertyId: string;
  property: string;
  reminder: DueReminder;
  subject: string;
  status: "sent" | "would_send" | "no_email" | "failed";
  error?: string;
};

const districtFor = (county: string | null) =>
  county ? `${county.trim().replace(/\b\w/g, (c) => c.toUpperCase())} CAD` : null;

async function primaryEmail(userId: string): Promise<string | null> {
  try {
    const u = await (await clerkClient()).users.getUser(userId);
    return (
      u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)?.emailAddress ??
      u.emailAddresses[0]?.emailAddress ??
      null
    );
  } catch {
    return null;
  }
}

async function send(to: string, subject: string, html: string): Promise<string | null> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (res.ok) return null;
  return `Resend ${res.status} ${(await res.text().catch(() => "")).slice(0, 200)}`;
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const today = url.searchParams.get("today") ?? texasToday(); // ?today= for testing a date
  const enabled = process.env.REMINDER_EMAILS_ENABLED === "true";
  const dryRun = !enabled || url.searchParams.get("dryRun") === "1";

  const due = dueReminders(today);
  if (due.length === 0) {
    return NextResponse.json({ today, dryRun, due: [], planned: [] });
  }

  try {
    const { data: optedIn, error } = await db
      .from("user_settings")
      .select("user_id")
      .eq("email_reminders", true);
    if (error) {
      if (isMissingSchemaError(error)) {
        return NextResponse.json({ today, dryRun, note: "user_settings not migrated yet", planned: [] });
      }
      throw error;
    }

    const planned: Planned[] = [];
    for (const { user_id: userId } of optedIn ?? []) {
      const { data: properties } = await db
        .from("properties")
        .select("id, name, slug, county, exemption_type")
        .eq("user_id", userId)
        .eq("exemption_type", "wildlife");
      if (!properties?.length) continue;

      const { data: sentRows } = await db
        .from("reminder_log")
        .select("property_id, kind, tax_year, step")
        .eq("user_id", userId);
      const sent = new Set(
        (sentRows ?? []).map((r) => `${r.property_id}:${r.kind}:${r.tax_year}:${r.step}`)
      );

      let email: string | undefined | null;
      for (const p of properties) {
        for (const r of due) {
          if (sent.has(`${p.id}:${r.kind}:${r.taxYear}:${r.step}`)) continue;

          let qualifyingPractices: number | undefined;
          if (r.kind === "activities") {
            const a = await analyzePropertyYear(p.id, r.taxYear);
            if (a.meetsMinimum) continue; // already covered for the year
            qualifyingPractices = a.qualifyingPractices;
          } else {
            const period = await getPeriodState(userId, p.id, r.taxYear);
            if (period.status === "submitted") continue; // already handed in
          }

          const { subject, html } = reminderEmail({
            reminder: r,
            propertyName: p.name,
            propertySlug: p.slug ?? p.id,
            qualifyingPractices,
            district: districtFor(p.county),
          });

          if (email === undefined) email = await primaryEmail(userId);
          const item: Planned = {
            userId, email, propertyId: p.id, property: p.name, reminder: r, subject,
            status: !email ? "no_email" : dryRun ? "would_send" : "sent",
          };
          if (email && !dryRun) {
            const err = await send(email, subject, html);
            if (err) {
              item.status = "failed";
              item.error = err;
            } else {
              await db.from("reminder_log").insert({
                user_id: userId, property_id: p.id, kind: r.kind, tax_year: r.taxYear, step: r.step,
              });
            }
          }
          planned.push(item);
        }
      }
    }

    console.log(
      `[reminders] ${today} ${dryRun ? "DRY RUN" : "LIVE"}: ` +
        planned.map((x) => `${x.status} ${x.reminder.kind}/${x.reminder.step} ${x.property}`).join("; ")
    );
    // Emails are not echoed back: the response carries user ids, not addresses.
    return NextResponse.json({
      today,
      dryRun,
      due,
      planned: planned.map(({ email, ...rest }) => ({ ...rest, hasEmail: Boolean(email) })),
    });
  } catch (err) {
    const message = describeError(err, "Reminder job failed");
    console.error("[reminders]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
