import { NextResponse } from "next/server";

/**
 * A landowner pressing "Report this problem" on a failed save. The user sees a
 * plain-English apology; the technical detail comes here and is emailed, so a
 * bug that would otherwise be an abandoned form arrives as something fixable.
 *
 * Deliberately not stored in the database: the failures worth reporting are
 * often database failures.
 */

const MAX_FIELD = 4000;

const clip = (v: unknown): string =>
  typeof v === "string" ? v.slice(0, MAX_FIELD) : "";

const escapeHtml = (v: string): string =>
  v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = clip(body.action) || "unknown action";
    const message = clip(body.message);
    const detail = clip(body.detail);
    const path = clip(body.path);
    const note = clip(body.note);

    if (!process.env.RESEND_API_KEY) {
      console.error("Error report received but RESEND_API_KEY is unset:", {
        action,
        message,
      });
      return NextResponse.json(
        { success: false, error: "Reporting is not configured" },
        { status: 500 }
      );
    }

    const when = new Date().toLocaleString("en-US", {
      timeZone: "America/Chicago",
    });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FieldFile <katie@fieldfile.com>",
        to: process.env.LEAD_NOTIFICATION_EMAIL ?? "katie@fieldfile.com",
        subject: `FieldFile error: ${action}`,
        html: `
          <h2>A user hit an error</h2>
          <p><strong>Action:</strong> ${escapeHtml(action)}</p>
          <p><strong>When:</strong> ${escapeHtml(when)} (Central)</p>
          <p><strong>Page:</strong> ${escapeHtml(path)}</p>
          ${note ? `<p><strong>What they were doing:</strong> ${escapeHtml(note)}</p>` : ""}
          <p><strong>Error:</strong></p>
          <pre style="background:#f5f5f5;padding:12px;border-radius:6px;white-space:pre-wrap">${escapeHtml(message)}</pre>
          ${
            detail
              ? `<p><strong>Detail:</strong></p><pre style="background:#f5f5f5;padding:12px;border-radius:6px;white-space:pre-wrap">${escapeHtml(detail)}</pre>`
              : ""
          }
        `,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`Error report email failed: Resend ${res.status} ${text}`);
      return NextResponse.json(
        { success: false, error: "Could not send the report" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error report route failed:", err);
    return NextResponse.json(
      { success: false, error: "Could not send the report" },
      { status: 500 }
    );
  }
}
