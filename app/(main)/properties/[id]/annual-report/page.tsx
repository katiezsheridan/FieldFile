"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import AnnualReportReview from "@/components/annual-report/AnnualReportReview";

export default function AnnualReportPage() {
  const params = useParams();
  const search = useSearchParams();
  const id = params.id as string;
  const year = Number(search.get("year")) || new Date().getFullYear();

  return (
    <div className="min-h-full bg-field-cream">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href={`/properties/${id}`}
          className="inline-flex items-center text-sm font-medium text-field-forest hover:text-field-forest/80"
        >
          <svg
            className="mr-1 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to property
        </Link>
        <div className="mb-6 mt-4">
          <h1 className="text-2xl font-bold text-field-ink">
            Wildlife management annual report (PWD-888)
          </h1>
          <p className="mt-1 text-sm text-field-earth">
            Filled in from your activities, field log, census counts and owner
            details. Answer what is still open, then review the preview.
          </p>
        </div>
        <AnnualReportReview propertyId={id} initialYear={year} />
      </div>
    </div>
  );
}
