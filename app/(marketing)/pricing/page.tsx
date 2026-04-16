"use client";

import { useState } from "react";
import Link from "next/link";

const pricingTiers = [
  {
    id: "free",
    name: "Free Document Storage",
    description: "Get started at no cost — forever.",
    priceLabel: "Free",
    features: [
      { name: "Store and organize photos, receipts, and activity logs", included: true },
      { name: "Log wildlife activities year-round", included: true },
      { name: "Deadline reminders and tracking", included: true },
      { name: "Secure document storage for plans, timber records, and more", included: true },
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    id: "annual-report-review",
    name: "Annual Report Review",
    description: "Peace of mind before you submit.",
    priceLabel: "$99",
    features: [
      { name: "A qualified reviewer checks your annual report and documents for completeness", included: true },
      { name: "Catches gaps before you submit to the county", included: true },
      { name: "Written findings summary delivered within 3 business days", included: true },
    ],
    cta: "Get started",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "full-service",
    name: "Full-Service Management",
    description: "We handle your activities on the ground.",
    priceLabel: "$750/activity + supplies",
    features: [
      { name: "We execute and document your wildlife or timber activities", included: true },
      { name: "You receive an organized documentation package ready for your annual report", included: true },
      { name: "Annual report review included at no extra charge", included: true },
    ],
    cta: "Get started",
    highlighted: false,
  },
];

const addOns = [
  {
    name: "Wildlife Plan Creation",
    price: "$1,000",
    description: "We'll create a comprehensive wildlife management plan tailored to your property",
  },
  {
    name: "Site Visit for Documentation",
    price: "$250/visit",
    description: "On-site documentation of your completed wildlife activities",
  },
];

const bundles = [
  {
    name: "New Landowner Bundle",
    price: "$1,100",
    savings: "save $348",
    description: "Best for first-time owners who need a plan and two years of compliance covered.",
    includes: [
      "Wildlife plan creation",
      "Annual report review for year 1 and year 2",
      "1 site visit",
    ],
  },
  {
    name: "Comprehensive Care Bundle",
    price: "$3,000",
    savings: "save $500",
    description: "Best for owners with an existing plan who want full hands-on management.",
    includes: [
      "Full-service management for 4 activities",
      "2 site visits for documentation",
    ],
  },
];

const faqs = [
  {
    question: "What is a wildlife tax exemption?",
    answer: "In Texas, landowners can qualify for reduced property taxes by actively managing their land for wildlife. This requires documenting specific wildlife management activities and submitting an annual report to your county appraisal district.",
  },
  {
    question: "What's the difference between Annual Report Review and Full-Service?",
    answer: "Annual Report Review checks your report and supporting documentation for completeness before you submit to the county. Full-Service means we actually execute and document the wildlife activities on the ground, delivering an organized documentation package ready for your annual report.",
  },
  {
    question: "What's included in a site visit?",
    answer: "Our wildlife specialists will visit your property to photograph and document your completed wildlife management activities. This provides professional documentation for your annual report.",
  },
  {
    question: "Which counties do you serve?",
    answer: "We're primarily focused on Central Texas for now and expanding to additional counties. If your county isn't currently supported, submit a request at fieldfile.com/request-availability and we'll notify you when we're available in your area.",
  },
  {
    question: "Do I need a wildlife management plan?",
    answer: "Yes, a wildlife management plan is required for your exemption. If you don't have one, we can create one for you as an add-on service for $1,000.",
  },
  {
    question: "Will a real person review my annual report?",
    answer: "Yes! With the Annual Report Review add-on, a qualified reviewer checks your report for accuracy and completeness, so you can submit to the county with confidence.",
  },
];

export default function PricingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-field-ink mb-3">
          Plans & Pricing
        </h1>
        <p className="text-lg text-field-ink/60 max-w-2xl mx-auto">
          Choose the plan that fits your needs.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
        {pricingTiers.map((tier) => (
          <div
            key={tier.id}
            className={`
              relative rounded-2xl p-6 transition-all
              ${
                tier.highlighted
                  ? "bg-white border-2 border-field-forest shadow-lg"
                  : "bg-white border-2 border-field-wheat"
              }
            `}
          >
            {/* Badge */}
            {tier.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-field-forest text-white text-xs font-medium px-3 py-1 rounded-full">
                  {tier.badge}
                </span>
              </div>
            )}

            {/* Tier header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-field-ink mb-1">{tier.name}</h2>
              <p className="text-sm text-field-ink/60 mb-4">{tier.description}</p>

              {/* Price */}
              <div className="text-center">
                <span className="text-2xl font-bold text-field-ink">
                  {tier.priceLabel}
                </span>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-6">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-field-forest flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-field-ink">{feature.name}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              href="/signup"
              className={`
                block w-full py-3 rounded-lg font-medium text-center transition-all
                ${
                  tier.highlighted
                    ? "bg-field-forest text-white hover:bg-field-forest/90"
                    : "bg-field-wheat/50 text-field-ink hover:bg-field-wheat"
                }
              `}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* Add-ons */}
      <div className="max-w-5xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-field-ink text-center mb-8">
          Add-Ons
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {addOns.map((addon, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-field-wheat p-6"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-field-ink">{addon.name}</h3>
                <span className="text-lg font-bold text-field-forest">{addon.price}</span>
              </div>
              <p className="text-sm text-field-ink/60">{addon.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bundles */}
      <div className="max-w-5xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-field-ink text-center mb-8">
          Bundles
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {bundles.map((bundle, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border-2 border-field-forest/20 p-6"
            >
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-bold text-lg text-field-ink">{bundle.name}</h3>
                <div className="text-right flex-shrink-0 ml-4">
                  <span className="text-lg font-bold text-field-forest">{bundle.price}</span>
                  <span className="block text-xs text-field-forest/70">{bundle.savings}</span>
                </div>
              </div>
              <p className="text-sm text-field-ink/60 mb-4">{bundle.description}</p>
              <ul className="space-y-2">
                {bundle.includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-field-forest flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-field-ink">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-field-ink text-center mb-8">
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-field-wheat overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full p-4 text-left flex items-center justify-between gap-4"
              >
                <span className="font-medium text-field-ink">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-field-ink/40 flex-shrink-0 transition-transform ${
                    expandedFaq === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedFaq === index && (
                <div className="px-4 pb-4">
                  <p className="text-field-ink/70">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-16 p-8 bg-field-forest/5 rounded-2xl max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-field-ink mb-2">Ready to get started?</h2>
        <p className="text-field-ink/60 mb-6">
          Keep your wildlife exemption organized, documented, and ready.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-field-forest text-white px-8 py-3 rounded-lg font-medium hover:bg-field-forest/90 transition-colors"
        >
          Get started
        </Link>
      </div>
    </div>
  );
}
