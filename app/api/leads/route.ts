import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { name, email, propertyAddress, source, answers } = await request.json();

    // Save to Supabase
    const { error: dbError } = await supabaseAdmin.from("signups").insert({
      name,
      email,
      property_address: propertyAddress,
      source: source || "signup",
    });

    if (dbError) {
      console.error("Supabase insert error:", dbError);
    }

    const isQuiz = source === "quiz";
    const subject = isQuiz
      ? `New Quiz Lead: ${name}`
      : `New Signup Lead: ${name}`;

    let answersHtml = "";
    if (isQuiz && answers) {
      const answerEntries = Object.entries(answers)
        .map(([q, a]) => `<li>Q${q}: ${a}</li>`)
        .join("");
      answersHtml = `<p><strong>Quiz Answers:</strong></p><ul>${answerEntries}</ul>`;
    }

    await fetch("https://api.resend.com/emails", {
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
          <p><strong>${isQuiz ? "Phone:" : "Property Address:"}</strong> ${propertyAddress}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })}</p>
          ${answersHtml}
        `,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead notification email failed:", error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
