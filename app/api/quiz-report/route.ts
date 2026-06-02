import { NextResponse } from "next/server";

type Segment =
  | "future_buyer"
  | "exploring"
  | "wildlife_maintain"
  | "ag_to_wildlife"
  | "new_valuation";

interface EmailContent {
  subject: string;
  heading: string;
  // Paragraphs and an optional bulleted list. Conversational, no em dashes.
  // Positioning: FieldFile prepares; the landowner submits to the county.
  paragraphs: string[];
  bullets?: string[];
  closing: string;
}

function regionPhrase(county: string | null): string {
  return county ? `${county}-area` : "Texas";
}

function buildContent(
  segment: Segment,
  county: string | null,
  acreageLabel: string,
  isSmallAcreage: boolean
): EmailContent {
  switch (segment) {
    case "wildlife_maintain":
      return {
        subject: "Keeping your wildlife valuation compliant",
        heading: "You're a strong fit for FieldFile",
        paragraphs: [
          `You already have a wildlife management valuation, so the work now is staying compliant year after year. That means doing your qualifying activities, documenting them, and turning in your annual report on time.`,
          `FieldFile is built for exactly this. As a fellow ${regionPhrase(county)} landowner you know how easy it is to let the paperwork slip, and a missed annual report is what puts a valuation at risk.`,
        ],
        bullets: [
          "Log activities as you go, with photos and notes from the field.",
          "Keep every document, survey, and prior filing in one place.",
          "Generate a county-ready annual report ahead of your spring deadline, ready for you to review and submit.",
        ],
        closing:
          "Want a hand getting set up? Just reply to this email and we'll walk you through it.",
      };

    case "ag_to_wildlife":
      return {
        subject: "Converting from ag to wildlife valuation",
        heading: "Your land looks like a strong candidate to convert",
        paragraphs: [
          `You currently have an agricultural valuation, which means you're in a great position to convert to wildlife management without a gap in your special valuation. Converting lets you trade fences and livestock for habitat work while keeping your low tax valuation.`,
          `Timing matters here. In most Texas counties the window to file your wildlife management plan for the year is the April 30 deadline, so it pays to start early rather than scramble.`,
        ],
        bullets: [
          "FieldFile helps you build your wildlife management plan and organize the documentation your appraisal district expects.",
          "You log your qualifying activities through the year so nothing gets lost.",
          "When it's time, you get a county-ready packet to review and submit to your appraisal district.",
        ],
        closing:
          "Reply any time with questions about the conversion. Happy to help you map out the timeline.",
      };

    case "new_valuation": {
      const paragraphs = [
        `A special valuation can meaningfully lower your property taxes by valuing your land on what it produces rather than its market value. The two paths are agricultural (1-d-1) and wildlife management (1-d-1w), and which one fits depends on your land's history and what you want to do with it.`,
        `Most wildlife valuations require a recent history of agricultural use, so the first step is usually understanding where your property stands with your county appraisal district.`,
      ];
      if (isSmallAcreage) {
        paragraphs.push(
          `One honest note: at ${acreageLabel || "under 10 acres"}, requirements can be stricter and some counties set minimum acreage. It's still worth exploring, and we can help you understand what your county allows.`
        );
      }
      return {
        subject: "Getting a special valuation on your Texas land",
        heading: "There's real potential to lower what you owe",
        paragraphs,
        bullets: [
          "FieldFile helps you organize the documentation and build a wildlife management plan.",
          "You track your activities through the year in one place.",
          "You get a county-ready packet to review and submit, and to keep your valuation in good standing afterward.",
        ],
        closing:
          "Reply to this email and we'll point you to the right next step for your county.",
      };
    }

    case "exploring":
      return {
        subject: "A quick primer on Texas land valuation",
        heading: "Here's a friendly place to start",
        paragraphs: [
          `No pressure at all. Here's the short version of how special valuations work in Texas.`,
          `Texas lets qualifying rural land be taxed on its productive use instead of market value, through agricultural (1-d-1) or wildlife management (1-d-1w) valuation. Wildlife valuation usually builds on a prior history of agricultural use, and it's kept up by doing and documenting qualifying activities each year.`,
        ],
        bullets: [
          "Agricultural valuation is based on farming, ranching, or similar use.",
          "Wildlife management valuation is based on habitat and species work, with an annual report.",
          "Both can meaningfully lower property taxes when the land qualifies.",
        ],
        closing:
          "Whenever you want to dig in, just reply to this email. We're happy to help you figure out what fits your land.",
      };

    case "future_buyer":
      return {
        subject: "What to check before you buy Texas land",
        heading: "Smart to plan ahead",
        paragraphs: [
          `Before you close, the valuation already on a property is worth a close look. A special valuation can save thousands a year, but letting one lapse after you buy can trigger rollback taxes, which is up to five years of the tax difference plus interest.`,
          `A few things worth confirming about any property you're considering:`,
        ],
        bullets: [
          "Does it currently have an agricultural or wildlife management valuation?",
          "If wildlife, is there a current management plan and a record of annual reports?",
          "What will you need to do to keep the valuation in place after closing?",
        ],
        closing:
          "Once you close, come back and FieldFile can help you keep the valuation on track from day one. Reply any time with questions.",
      };
  }
}

export async function POST(request: Request) {
  try {
    const { email, segment, county, acreageLabel, answers } = await request.json();

    const seg = (segment as Segment) || "new_valuation";
    const isSmallAcreage = answers?.q4 === "lt10";
    const content = buildContent(seg, county ?? null, acreageLabel ?? "", isSmallAcreage);

    const paragraphsHtml = content.paragraphs
      .map(
        (p: string) =>
          `<p style="color:#322B2A;font-size:15px;line-height:1.6;margin:0 0 16px;">${p}</p>`
      )
      .join("");

    const bulletsHtml = content.bullets
      ? `<ul style="margin:0 0 16px;padding-left:20px;">${content.bullets
          .map(
            (b: string) =>
              `<li style="color:#322B2A;font-size:15px;line-height:1.6;margin-bottom:8px;">${b}</li>`
          )
          .join("")}</ul>`
      : "";

    const html = `
      <div style="max-width:600px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <div style="background:#495336;padding:24px 32px;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:22px;">${content.heading}</h1>
        </div>
        <div style="background:#F7F5EE;padding:32px;border:1px solid #D8D2C9;border-top:none;border-radius:0 0 12px 12px;">
          ${paragraphsHtml}
          ${bulletsHtml}
          <p style="color:#322B2A;font-size:15px;line-height:1.6;margin:0 0 24px;">${content.closing}</p>

          <div style="text-align:center;margin-top:8px;">
            <a href="https://www.fieldfile.com/signup" style="display:inline-block;background:#495336;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
              Get started with FieldFile
            </a>
          </div>

          <p style="color:#6B5E51;font-size:13px;margin-top:28px;text-align:center;">
            Questions? Reply to this email or contact <a href="mailto:katie@fieldfile.com" style="color:#495336;">katie@fieldfile.com</a>
          </p>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FieldFile <katie@fieldfile.com>",
        to: email,
        subject: content.subject,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`Quiz report email failed: Resend ${res.status} ${body}`);
      return NextResponse.json({ success: false }, { status: 200 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quiz report email failed:", error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
