"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Save to signups table
      const { error: dbError } = await supabase.from("signups").insert({
        name,
        email,
        property_address: propertyAddress,
      });

      if (dbError) {
        console.error("Signup save error:", dbError);
        setError("Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      // Show success immediately, send email in background
      setSubmitted(true);

      // Fire-and-forget email notification
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, propertyAddress }),
      }).catch(() => {});
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-field-forest/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-field-forest"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-field-ink mb-3">
            You&apos;re all set!
          </h1>
          <p className="text-field-earth leading-relaxed">
            Someone from FieldFile will reach out soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-field-ink">
            Get started with FieldFile
          </h1>
          <p className="mt-2 text-field-earth">
            Tell us a little about yourself and your property.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-field-ink mb-1.5"
            >
              Your Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              className="w-full px-4 py-3 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-field-ink mb-1.5"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full px-4 py-3 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-field-ink mb-1.5"
            >
              Property Address
            </label>
            <input
              id="address"
              type="text"
              required
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              placeholder="1234 Ranch Road, Dripping Springs, TX 78620"
              className="w-full px-4 py-3 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-field-terra">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 bg-field-forest text-white font-medium rounded-lg hover:bg-field-forest/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Get Started"}
          </button>
        </form>
      </div>
    </div>
  );
}
