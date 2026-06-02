"use client";

import Link from "next/link";
import EmailCapture from "./EmailCapture";

interface WildlifeFastTrackProps {
  answers: Record<number, string>;
  surveyFile?: File | null;
}

export default function WildlifeFastTrack({
  answers,
  surveyFile,
}: WildlifeFastTrackProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-field-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-field-green"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-field-ink mb-2">
          You&rsquo;re already qualified
        </h2>
        <p className="text-field-ink/70">
          Your property has a 1-d-1 wildlife management valuation. The key now
          is staying compliant year after year.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-field-wheat p-6 sm:p-8 mb-6">
        <h3 className="font-semibold text-field-ink mb-4">
          How FieldFile keeps you compliant
        </h3>
        <ul className="space-y-3 text-sm text-field-ink/80">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 bg-field-green text-white text-xs rounded-full flex items-center justify-center font-medium mt-0.5">
              1
            </span>
            <span>
              <strong className="text-field-ink">Log activities as you go.</strong>{" "}
              Census counts, supplemental feed, predator control, habitat work
              &mdash; capture photos and notes from the field.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 bg-field-green text-white text-xs rounded-full flex items-center justify-center font-medium mt-0.5">
              2
            </span>
            <span>
              <strong className="text-field-ink">Store every document.</strong>{" "}
              Surveys, management plans, prior filings &mdash; one place, easy
              to find when the appraisal district asks.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 bg-field-green text-white text-xs rounded-full flex items-center justify-center font-medium mt-0.5">
              3
            </span>
            <span>
              <strong className="text-field-ink">Generate your annual report.</strong>{" "}
              We pull your activities into a county-ready PFD-1 packet you can
              review and submit each year.
            </span>
          </li>
        </ul>

        <div className="mt-6 pt-6 border-t border-field-wheat">
          <Link
            href="/signup"
            className="inline-block w-full text-center bg-field-forest text-white px-6 py-3 rounded-lg font-semibold hover:bg-field-forest/90 transition-colors"
          >
            Start your free FieldFile account
          </Link>
        </div>
      </div>

      <EmailCapture answers={answers} surveyFile={surveyFile} />
    </div>
  );
}
