import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, propertyAddress, source, answers } = await request.json();

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

    await resend.emails.send({
      from: "FieldFile <onboarding@resend.dev>",
      to: process.env.LEAD_NOTIFICATION_EMAIL!,
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
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead notification email failed:", error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
