import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Readable labels for quiz answers
const questionLabels: Record<number, string> = {
  1: "Ownership Status",
  2: "Location",
  3: "Property Size",
  4: "Primary Goal",
  5: "Secondary Goal",
  6: "Property Survey",
  7: "Title Status",
  8: "Road Access",
  9: "Easements",
  10: "Previous Land Use",
  11: "Current Valuation",
  12: "Water Features",
  13: "Endangered Species",
  14: "Existing Structures",
};

function getNextSteps(answers: Record<string, string>): string[] {
  const steps: string[] = [];

  if (answers["11"] === "no-valuation") {
    steps.push("Contact your county appraisal district to understand ag history requirements");
  }
  if (answers["11"] === "ag-valuation") {
    steps.push("FieldFile can help you build and file a wildlife management plan and convert your valuation");
  }
  if (answers["11"] === "wildlife-valuation") {
    steps.push("Use FieldFile to track your annual activities and file on time");
  }
  if (answers["6"] === "no") {
    steps.push("Get a boundary survey to document your exact acreage");
  }
  if (answers["7"] === "issues") {
    steps.push("Consult a real estate attorney to resolve title issues");
  }
  if (answers["12"] === "none") {
    steps.push("Plan supplemental water sources — this counts as a qualifying activity");
  }
  if (answers["13"] === "yes" || answers["13"] === "unsure") {
    steps.push("Request a species survey from Texas Parks & Wildlife or a certified biologist");
  }
  steps.push("Start with FieldFile to organize your documentation and reports");

  return steps;
}

export async function POST(request: Request) {
  try {
    const { email, name, answers } = await request.json();

    // Build answer rows
    const answerRows = Object.entries(answers)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([qNum, answer]) => {
        const label = questionLabels[Number(qNum)] || `Question ${qNum}`;
        return `<tr><td style="padding:8px 12px;border-bottom:1px solid #D8D2C9;color:#6B5E51;font-size:14px;">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #D8D2C9;color:#322B2A;font-size:14px;">${answer}</td></tr>`;
      })
      .join("");

    // Build next steps
    const nextSteps = getNextSteps(answers);
    const stepsHtml = nextSteps
      .map((step) => `<li style="margin-bottom:8px;color:#322B2A;font-size:14px;">${step}</li>`)
      .join("");

    const html = `
      <div style="max-width:600px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <div style="background:#495336;padding:24px 32px;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:22px;">Your FieldFile Eligibility Report</h1>
        </div>
        <div style="background:#F7F5EE;padding:32px;border:1px solid #D8D2C9;border-top:none;border-radius:0 0 12px 12px;">
          <p style="color:#322B2A;font-size:16px;margin-top:0;">
            Hi${name ? ` ${name}` : ""},
          </p>
          <p style="color:#6B5E51;font-size:14px;">
            Here's your personalized eligibility assessment based on the information you provided.
          </p>

          <h2 style="color:#322B2A;font-size:18px;margin-top:28px;margin-bottom:12px;">Your Answers</h2>
          <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;border:1px solid #D8D2C9;">
            ${answerRows}
          </table>

          <h2 style="color:#322B2A;font-size:18px;margin-top:28px;margin-bottom:12px;">Recommended Next Steps</h2>
          <ol style="padding-left:20px;margin:0;">
            ${stepsHtml}
          </ol>

          <div style="margin-top:32px;text-align:center;">
            <a href="https://www.fieldfile.com/signup" style="display:inline-block;background:#495336;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
              Get Started with FieldFile
            </a>
          </div>

          <p style="color:#6B5E51;font-size:13px;margin-top:28px;text-align:center;">
            Questions? Reply to this email or contact <a href="mailto:katie@fieldfile.com" style="color:#495336;">katie@fieldfile.com</a>
          </p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "FieldFile <onboarding@resend.dev>",
      to: email,
      subject: "Your FieldFile Eligibility Report",
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quiz report email failed:", error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
