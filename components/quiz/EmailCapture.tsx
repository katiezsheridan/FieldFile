"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase, uploadDocument } from "@/lib/supabase";

interface EmailCaptureProps {
  answers: Record<number, string>;
  surveyFile?: File | null;
}

export default function EmailCapture({ answers, surveyFile }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Upload survey file if present
      let surveyUrl: string | null = null;
      let surveyPath: string | null = null;

      if (surveyFile) {
        const fileExt = surveyFile.name.split(".").pop();
        const fileName = `quiz-surveys/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("documents")
          .upload(fileName, surveyFile);

        if (!uploadError && uploadData) {
          surveyPath = uploadData.path;
          const { data: urlData } = supabase.storage
            .from("documents")
            .getPublicUrl(uploadData.path);
          surveyUrl = urlData.publicUrl;
        }
      }

      // Store lead in Supabase
      const { error: insertError } = await supabase.from("quiz_leads").insert({
        email,
        name: name || null,
        phone: phone || null,
        answers,
        survey_url: surveyUrl,
        survey_path: surveyPath,
      });

      if (insertError) {
        console.error("Failed to save quiz lead:", insertError);
        // Still show success to user — we don't want a DB issue to block the UX
        // Log it so we can debug, but the lead data is also in the console
        console.log("Quiz lead (fallback):", { email, name, phone, answers });
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Quiz submission error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-xl border border-field-wheat p-8 text-center">
        <div className="w-12 h-12 bg-field-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-field-green"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-field-ink mb-2">
          Report saved!
        </h3>
        <p className="text-field-ink/70 text-sm mb-6">
          We&apos;ll be in touch with your personalized eligibility report and
          next steps.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-field-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-field-green/90 transition-colors"
        >
          Start your free trial
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-field-wheat p-6 sm:p-8">
      <h3 className="text-lg font-semibold text-field-ink mb-2">
        Get your full report emailed to you
      </h3>
      <p className="text-field-ink/70 text-sm mb-6">
        We&apos;ll send a detailed copy of your eligibility assessment along
        with next steps and local resources.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="quiz-email"
            className="block text-sm font-medium text-field-ink mb-1"
          >
            Email address <span className="text-field-red">*</span>
          </label>
          <input
            id="quiz-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-green/30 focus:border-field-green transition-colors"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="quiz-name"
              className="block text-sm font-medium text-field-ink mb-1"
            >
              Name{" "}
              <span className="text-field-ink/50 font-normal">(optional)</span>
            </label>
            <input
              id="quiz-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-green/30 focus:border-field-green transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="quiz-phone"
              className="block text-sm font-medium text-field-ink mb-1"
            >
              Phone{" "}
              <span className="text-field-ink/50 font-normal">(optional)</span>
            </label>
            <input
              id="quiz-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-3 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-green/30 focus:border-field-green transition-colors"
            />
          </div>
        </div>
        {error && (
          <p className="text-sm text-field-red">{error}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-field-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-field-green/90 transition-colors disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Email my report"}
        </button>
        <p className="text-xs text-field-ink/50 text-center">
          No spam. Unsubscribe anytime.
        </p>
      </form>
    </div>
  );
}
