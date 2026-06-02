import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { name, email, propertyAddress, source, answers, segment, leadTemp, county, inTargetCounty } =
      await request.json();

    // Save to Supabase
    const { error: dbError } = await supabaseAdmin.from("signups").insert({
      name,
      email,
      property_address: propertyAddress,
      source: source || "signup",
    });

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to save signup" },
        { status: 500 }
      );
    }

    const isQuiz = source === "quiz";
    const subject = isQuiz
      ? `New Quiz Lead${leadTemp ? ` [${leadTemp.toUpperCase()}]` : ""}: ${county || email}`
      : `New Signup Lead: ${name}`;

    let answersHtml = "";
    if (isQuiz) {
      const tempBadge = leadTemp ? leadTemp.toUpperCase() : "—";
      const targetBadge = inTargetCounty ? "✓ target county" : "outside target counties";
      answersHtml = `
        <p><strong>Segment:</strong> ${segment || "—"}</p>
        <p><strong>Lead temperature:</strong> ${tempBadge}</p>
        <p><strong>County:</strong> ${county || "Unknown"} (${targetBadge})</p>
      `;
      if (answers) {
        const answerEntries = Object.entries(answers)
          .map(([q, a]) => `<li>${q}: ${a}</li>`)
          .join("");
        answersHtml += `<p><strong>Answers:</strong></p><ul>${answerEntries}</ul>`;
      }
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "FieldFile <katie@fieldfile.com>",
          to: process.env.LEAD_NOTIFICATION_EMAIL,
          subject,
          html: `
            <h2>${isQuiz ? "New Quiz Lead" : "New Signup Lead"}</h2>
            <p><strong>Source:</strong> ${isQuiz ? "Eligibility Quiz" : "Get Started Form"}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>${isQuiz ? "Location:" : "Property Address:"}</strong> ${propertyAddress}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })}</p>
            ${answersHtml}
          `,
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error(`Lead notification email failed: Resend ${res.status} ${body}`);
      }
    } catch (emailError) {
      console.error("Lead notification email failed:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signup lead handler failed:", error);
    return NextResponse.json(
      { success: false, error: "Signup failed" },
      { status: 500 }
    );
  }
}
