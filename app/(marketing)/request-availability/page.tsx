"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RequestAvailabilityPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [county, setCounty] = useState("");
  const [address, setAddress] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await supabase.from("availability_requests").insert({
        name,
        email,
        county,
        address: address || null,
      });
    } catch {
      // Still show success to user
    }

    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="bg-field-cream">
        <section className="py-20 px-6">
          <div className="max-w-lg mx-auto text-center">
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
            <h1 className="text-2xl font-bold text-field-black mb-4">
              Request Received
            </h1>
            <p className="text-field-black/70 mb-8">
              Thanks, {name}! We&apos;ll reach out when FieldFile is available
              in {county} County.
            </p>
            <Link
              href="/"
              className="inline-block bg-field-forest text-white px-6 py-2 rounded-lg font-medium hover:bg-field-forest/90 transition-colors"
            >
              Back to home
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-field-cream">
      <section className="py-16 px-6">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-field-black mb-4 tracking-tight">
              Request Availability
            </h1>
            <p className="text-field-black/70">
              Don&apos;t see your county on our service map? Let us know where
              you are and we&apos;ll notify you when we expand to your area.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-field-brown/10 p-6 sm:p-8 space-y-5"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-field-ink mb-1.5"
              >
                Name <span className="text-field-red">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-2.5 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:border-field-green transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-field-ink mb-1.5"
              >
                Email <span className="text-field-red">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:border-field-green transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="county"
                className="block text-sm font-medium text-field-ink mb-1.5"
              >
                County <span className="text-field-red">*</span>
              </label>
              <input
                id="county"
                type="text"
                required
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                placeholder="e.g. Williamson"
                className="w-full px-4 py-2.5 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:border-field-green transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-field-ink mb-1.5"
              >
                Property Address{" "}
                <span className="text-field-ink/40 font-normal">(optional)</span>
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Ranch Rd, City, TX 78xxx"
                className="w-full px-4 py-2.5 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:border-field-green transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-field-forest text-white py-3 rounded-lg font-semibold hover:bg-field-forest/90 transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Request Availability"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
