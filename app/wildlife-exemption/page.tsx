"use client";

import { useState } from "react";
import { trackConversion } from "@/lib/analytics";

// Standalone, research-focused landing page. No site nav. The single CTA is an
// email capture that writes to the `leads` table via /api/lead-capture. Per
// requirements this is NOT an HTML form submit — inputs live in a plain <div>
// and submission is driven by an onClick handler.
export default function WildlifeExemptionLandingPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [county, setCounty] = useState("");
  const [acreage, setAcreage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          county,
          acreage,
          source: "wildlife_exemption",
        }),
      });

      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }

      // Fire the conversion only after a confirmed successful save.
      trackConversion("email_captured", 20);
      setStatus("done");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <main className="min-h-screen bg-field-cream text-field-ink">
      {/* Minimal brand mark only — no navigation links. */}
      <div className="px-6 pt-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-field-forest rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FF</span>
          </div>
          <span className="font-semibold tracking-tight">FieldFile</span>
        </div>
      </div>

      <section className="mx-auto grid max-w-5xl gap-10 px-6 pb-16 pt-12 sm:pt-16 lg:grid-cols-2 lg:gap-16">
        {/* Research / education column */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-field-hero/10 px-4 py-1.5 text-sm font-medium text-field-hero">
            The landowner&apos;s guide
          </div>

          <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Understand the Texas wildlife tax exemption.
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-field-earth">
            The 1-d-1 wildlife valuation lets Texas landowners keep an
            agricultural-level property tax by actively managing their land for
            native wildlife. Knowing the requirements &mdash; qualifying
            practices, acreage rules, and the annual documentation your county
            expects &mdash; is the difference between keeping your valuation and
            losing it.
          </p>

          <ul className="mt-6 space-y-3 text-field-ink">
            {[
              "Which of the 7 wildlife management practices count in your county",
              "Minimum acreage and prior-use rules that trip landowners up",
              "What documentation appraisal districts actually look for",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-1 h-2 w-2 shrink-0 rounded-full bg-field-forest"
                />
                <span className="text-field-earth">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Email capture column — a card, not an HTML form */}
        <div className="lg:pt-10">
          <div className="rounded-2xl border border-field-wheat bg-white p-6 shadow-sm sm:p-8">
            {status === "done" ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-field-forest/10">
                  <svg
                    className="h-7 w-7 text-field-forest"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">Check your inbox</h2>
                <p className="mt-2 text-field-earth">
                  Thanks, {name.split(" ")[0] || "there"}! We&apos;ll send your
                  wildlife exemption guide shortly.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold">
                  Get the free wildlife exemption guide
                </h2>
                <p className="mt-1 text-sm text-field-earth">
                  Tell us where your land is and we&apos;ll tailor the details to
                  your county.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label
                      htmlFor="lead-name"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Name
                    </label>
                    <input
                      id="lead-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Landowner"
                      className="w-full rounded-lg border border-field-wheat bg-white px-4 py-3 text-field-ink placeholder:text-field-ink/40 focus:border-field-forest focus:outline-none focus:ring-2 focus:ring-field-forest/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lead-email"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Email
                    </label>
                    <input
                      id="lead-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full rounded-lg border border-field-wheat bg-white px-4 py-3 text-field-ink placeholder:text-field-ink/40 focus:border-field-forest focus:outline-none focus:ring-2 focus:ring-field-forest/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="lead-county"
                        className="mb-1.5 block text-sm font-medium"
                      >
                        County
                      </label>
                      <input
                        id="lead-county"
                        type="text"
                        value={county}
                        onChange={(e) => setCounty(e.target.value)}
                        placeholder="Hays"
                        className="w-full rounded-lg border border-field-wheat bg-white px-4 py-3 text-field-ink placeholder:text-field-ink/40 focus:border-field-forest focus:outline-none focus:ring-2 focus:ring-field-forest/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lead-acreage"
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Acreage
                      </label>
                      <input
                        id="lead-acreage"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={acreage}
                        onChange={(e) => setAcreage(e.target.value)}
                        placeholder="50"
                        className="w-full rounded-lg border border-field-wheat bg-white px-4 py-3 text-field-ink placeholder:text-field-ink/40 focus:border-field-forest focus:outline-none focus:ring-2 focus:ring-field-forest/20"
                      />
                    </div>
                  </div>

                  {error && <p className="text-sm text-field-terra">{error}</p>}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={status === "submitting"}
                    className="w-full rounded-lg bg-field-forest px-6 py-3 font-semibold text-white transition-colors hover:bg-field-forest/90 disabled:opacity-50"
                  >
                    {status === "submitting" ? "Sending…" : "Send me the guide"}
                  </button>

                  <p className="text-center text-xs text-field-earth">
                    No spam. Unsubscribe anytime.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
