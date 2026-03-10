"use client";

import { useState } from "react";
import Link from "next/link";

const pricingTiers = [
  {
    id: "filing-only",
    name: "Filing Only",
    description: "We organize and submit your report to the county",
    price: 350,
    priceLabel: "$350/year",
    features: [
      { name: "Organize photos and receipts into a report", included: true },
      { name: "Submit to your county appraisal district", included: true },
      { name: "Reminders to submit documentation", included: true },
      { name: "Human review before submission", included: true },
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    id: "full-service",
    name: "Full-Service Management & Filing",
    description: "We handle filing plus support and execution of wildlife activities",
    price: null,
    priceLabel: "$500 to file + $1,000/activity + supplies",
    features: [
      { name: "Everything in Filing Only", included: true },
      { name: "Support and execution of wildlife activities", included: true },
      { name: "Dedicated specialist for your property", included: true },
      { name: "Human review before submission", included: true },
    ],
    cta: "Get started",
    highlighted: true,
    badge: "Full Service",
  },
];

const addOns = [
  {
    name: "Creation of Wildlife Plan",
    price: "$500",
    description: "We'll create a comprehensive wildlife management plan tailored to your property",
  },
  {
    name: "Site Visit",
    price: "$250/visit",
    description: "On-site documentation of your completed wildlife activities",
  },
];

const faqs = [
  {
    question: "What is a wildlife tax exemption?",
    answer: "In Texas, landowners can qualify for reduced property taxes by actively managing their land for wildlife. This requires documenting specific wildlife management activities and filing an annual report with your county appraisal district.",
  },
  {
    question: "What's the difference between Filing Only and Full-Service?",
    answer: "Filing Only covers organizing your documentation and submitting to the county. Full-Service includes everything in Filing Only plus hands-on support executing your wildlife activities throughout the year.",
  },
  {
    question: "What's included in a site visit?",
    answer: "Our wildlife specialists will visit your property to photograph and document your completed wildlife management activities. This provides professional documentation for your filing.",
  },
  {
    question: "Do you file in all Texas counties?",
    answer: "Yes, we support filing in all 254 Texas counties. Our system is kept up-to-date with each county's specific requirements and deadlines.",
  },
  {
    question: "Do I need a wildlife management plan?",
    answer: "Yes, a wildlife management plan is required for your exemption. If you don't have one, we can create one for you as an add-on service for $500.",
  },
  {
    question: "Will a real person review my filing?",
    answer: "Yes! Every filing is reviewed by a human before submission to ensure accuracy and completeness. You'll have a chance to review and approve the final version before we submit.",
  },
];

export default function PricingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-field-ink mb-3">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-field-ink/60 max-w-2xl mx-auto">
          Choose the plan that fits your needs.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
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
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-field-ink text-center mb-8">
          Add-ons
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
          Let us handle your wildlife exemption filing.
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
