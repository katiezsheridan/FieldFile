"use client";

import Link from "next/link";
import {
  SEGMENT_CONFIRMATION,
  SEGMENT_HEADLINE,
  type Segment,
} from "@/lib/eligibility-quiz";

interface QuizConfirmationProps {
  segment: Segment;
  email: string;
}

export default function QuizConfirmation({ segment, email }: QuizConfirmationProps) {
  return (
    <div className="max-w-xl mx-auto text-center">
      <div className="w-16 h-16 bg-field-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
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
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-field-ink mb-3">
        {SEGMENT_HEADLINE[segment]}
      </h2>
      <p className="text-field-ink/80 text-base leading-relaxed mb-2">
        {SEGMENT_CONFIRMATION[segment]}
      </p>
      <p className="text-sm text-field-ink/60 mb-8">
        Sent to <span className="font-medium text-field-ink/80">{email}</span>.
        Check your spam folder if it doesn&apos;t arrive in a few minutes.
      </p>

      <Link
        href="/signup"
        className="inline-block bg-field-forest text-white px-8 py-3 rounded-lg font-semibold hover:bg-field-forest/90 transition-colors"
      >
        Get started free
      </Link>
    </div>
  );
}
