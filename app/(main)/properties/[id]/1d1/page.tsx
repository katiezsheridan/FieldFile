"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Form50129Review from "@/components/filing/Form50129Review";
import { useProperty } from "@/lib/hooks";
import { canApplyFor1d1 } from "@/lib/forms/form50129/eligibility";

export default function Form50129Page() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { property, loading } = useProperty(id);

  // The property page hides the entry card for landowners who already have a
  // valuation; guard the route too, so a bookmark or a typed URL cannot reach
  // an application flow that does not apply to them.
  const eligible = canApplyFor1d1(property?.exemptionType);

  useEffect(() => {
    if (!loading && property && !eligible) {
      router.replace(`/properties/${id}`);
    }
  }, [loading, property, eligible, router, id]);

  if (loading || !property || !eligible) return null;

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
            1-d-1 application (Form 50-129)
          </h1>
          <p className="mt-1 text-sm text-field-earth">
            Review the values assembled from your property, owner profile, and
            wildlife plan, fill in the rest, then generate a PDF to sign and file
            with your county appraisal district.
          </p>
        </div>
        <Form50129Review propertyId={id} />
      </div>
    </div>
  );
}
