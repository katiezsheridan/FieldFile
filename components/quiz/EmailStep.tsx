"use client";

import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { supabase } from "@/lib/supabase";
import type {
  QuizAnswers,
  Segment,
  LeadTemp,
} from "@/lib/eligibility-quiz";

interface EmailStepProps {
  answers: QuizAnswers;
  segment: Segment;
  leadTemp: LeadTemp;
  county: string | null;
  inTargetCounty: boolean;
  acreageLabel: string;
  onSubmitted: (email: string) => void;
}

// Pragmatic email format check. Real validation is the confirmation email landing.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailStep({
  answers,
  segment,
  leadTemp,
  county,
  inTargetCounty,
  acreageLabel,
  onSubmitted,
}: EmailStepProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { executeRecaptcha } = useGoogleReCaptcha();

  const valid = EMAIL_RE.test(email.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      // Verify reCAPTCHA
      if (!executeRecaptcha) {
        setError("Verification isn't ready yet. Please try again in a moment.");
        setSubmitting(false);
        return;
      }
      const captchaToken = await executeRecaptcha("quiz_submit");
      const captchaRes = await fetch("/api/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken }),
      });
      const captchaData = await captchaRes.json();
      if (!captchaData.success) {
        setError("We couldn't verify your submission. Please try again.");
        setSubmitting(false);
        return;
      }

      const cleanEmail = email.trim();

      // Store the lead. Typed columns for segmentation, raw answers kept too.
      const { error: insertError } = await supabase.from("quiz_leads").insert({
        email: cleanEmail,
        answers, // raw jsonb, for safety/debugging
        q1_situation: answers.q1 ?? null,
        zip_raw: answers.zip ?? null,
        county,
        in_target_county: inTargetCounty,
        q3_valuation: answers.q3 ?? null,
        q4_acreage: answers.q4 ?? null,
        q5_goal: answers.q5 ?? null,
        segment,
        lead_temp: leadTemp,
      });

      if (insertError) {
        // Don't block the UX on a DB hiccup; log so we can recover the lead.
        console.error("Failed to save quiz lead:", insertError);
        console.log("Quiz lead (fallback):", { email: cleanEmail, answers, segment, leadTemp });
      }

      // Show the confirmation immediately; emails are fire-and-forget.
      onSubmitted(cleanEmail);

      // Send the segment-tailored results email to the user.
      fetch("/api/quiz-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, segment, county, acreageLabel, answers }),
      }).catch(() => {});

      // Notify the FieldFile team about the new lead.
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Quiz lead",
          email: cleanEmail,
          propertyAddress: county ? `${county} County (${answers.zip})` : `Zip ${answers.zip}`,
          source: "quiz",
          segment,
          leadTemp,
          county,
          inTargetCounty,
          acreageLabel,
          answers,
        }),
      }).catch(() => {});
    } catch (err) {
      console.error("Quiz submission error:", err);
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-field-ink">
          Where should we send your personalized eligibility results?
        </h2>
        <p className="mt-2 text-field-ink/70 text-base">
          We&apos;ll email your full results and next steps. No spam, unsubscribe anytime.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          id="quiz-email"
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          placeholder="you@example.com"
          aria-invalid={!!error}
          className="w-full px-4 py-3 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-green/30 focus:border-field-green transition-colors"
        />

        {error && <p className="text-sm text-field-terra">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !valid}
          className="w-full bg-field-forest text-white px-6 py-3 rounded-lg font-semibold hover:bg-field-forest/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "Sending..." : "Send my results"}
        </button>
      </form>
    </div>
  );
}
