"use client";

import { useState } from "react";
import Link from "next/link";

const faqCategories = [
  {
    title: "About Wildlife Tax Exemptions",
    faqs: [
      {
        question: "What is a wildlife tax exemption?",
        answer:
          "In Texas, landowners can qualify for reduced property taxes by actively managing their land for wildlife. This requires documenting specific wildlife management activities and submitting an annual report to your county appraisal district.",
      },
      {
        question: "How much can I save with a wildlife exemption?",
        answer:
          "Savings vary by county and property size, but many Texas landowners save thousands of dollars per year on property taxes through wildlife management valuation. The exact amount depends on your county's tax rates and your property's agricultural value.",
      },
      {
        question: "What activities qualify for wildlife management?",
        answer:
          "Texas recognizes seven categories: habitat control, erosion control, predator management, providing supplemental water, providing supplemental food, providing shelters, and making census counts. You must perform at least three of these activities annually.",
      },
      {
        question: "Do I need to have an existing ag exemption?",
        answer:
          "Yes. Wildlife management valuation is a conversion from an existing agricultural (1-d-1) valuation. Your land must currently have or have recently had an ag exemption to qualify for wildlife management valuation.",
      },
      {
        question: "What's the minimum acreage required?",
        answer:
          "Minimum acreage varies by county. Most counties require at least 10-15 acres, but some may require more. Contact your county appraisal district to confirm requirements for your area.",
      },
    ],
  },
  {
    title: "Using FieldFile",
    faqs: [
      {
        question: "How do I get started with FieldFile?",
        answer:
          "Sign up for a free account, add your property details, and start logging activities. You can upload photos, track GPS locations, and add notes as you complete your wildlife management activities throughout the year.",
      },
      {
        question: "Do I need a wildlife management plan?",
        answer:
          "Yes, a wildlife management plan is required for your exemption. If you don't have one, we can create one for you as an add-on service.",
      },
      {
        question: "Will a real person review my annual report?",
        answer:
          "Yes! With our Annual Report Review add-on, a qualified reviewer checks your report for accuracy and completeness before you submit it to the county.",
      },
      {
        question: "Which counties do you serve?",
        answer:
          "We're primarily focused on Central Texas for now and actively expanding to additional counties. If your county isn't currently supported, you can submit a request at https://www.fieldfile.com/request-availability and we'll notify you when FieldFile is available in your area.",
      },
    ],
  },
  {
    title: "Pricing & Billing",
    faqs: [
      {
        question: "What's the difference between Annual Report Review and Full-Service?",
        answer:
          "Annual Report Review covers a qualified reviewer checking your annual report and supporting documentation for completeness before you submit to the county. Full-Service includes hands-on support executing and documenting your wildlife activities on the ground throughout the year.",
      },
      {
        question: "What's included in a site visit?",
        answer:
          "Our wildlife specialists will visit your property to photograph and document your completed wildlife management activities. This provides professional documentation for your annual report.",
      },
      {
        question: "Is FieldFile really free?",
        answer:
          "Yes! Document storage and annual report preparation are free forever. No credit card required. You can explore the platform, add your property, and start tracking activities at no cost. Paid services like Annual Report Review and Full-Service Management are available when you need them.",
      },
    ],
  },
  {
    title: "Security & Privacy",
    faqs: [
      {
        question: "How is my data protected?",
        answer:
          "All data is encrypted in transit (TLS 1.2+) and at rest. We use Clerk for secure authentication and Supabase for database and file storage, both of which meet industry-standard security certifications.",
      },
      {
        question: "Who can see my property information?",
        answer:
          "Only you and authorized FieldFile team members who review your annual report can access your data. We never sell or share your information with third parties for marketing purposes.",
      },
      {
        question: "Can I delete my account and data?",
        answer:
          "Yes. You can request account deletion at any time by contacting katie@fieldfile.com. We'll remove your personal data within 30 days, except where required for legal compliance.",
      },
    ],
  },
];

export default function FAQPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <div className="py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-field-ink mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-field-ink/60">
            Everything you need to know about FieldFile and wildlife tax
            exemptions.
          </p>
        </div>

        <div className="space-y-10">
          {faqCategories.map((category) => (
            <div key={category.title}>
              <h2 className="text-lg font-semibold text-field-ink mb-4">
                {category.title}
              </h2>
              <div className="space-y-3">
                {category.faqs.map((faq) => {
                  const id = `${category.title}-${faq.question}`;
                  return (
                    <div
                      key={id}
                      className="bg-white rounded-xl border border-field-wheat overflow-hidden"
                    >
                      <button
                        onClick={() => toggle(id)}
                        className="w-full p-4 text-left flex items-center justify-between gap-4"
                      >
                        <span className="font-medium text-field-ink">
                          {faq.question}
                        </span>
                        <svg
                          className={`w-5 h-5 text-field-ink/40 flex-shrink-0 transition-transform ${
                            expanded === id ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {expanded === id && (
                        <div className="px-4 pb-4">
                          <p className="text-field-ink/70">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 bg-field-forest/5 rounded-2xl">
          <h2 className="text-xl font-bold text-field-ink mb-2">
            Still have questions?
          </h2>
          <p className="text-field-ink/60 mb-6">
            Our team is here to help with anything about wildlife tax
            exemptions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:katie@fieldfile.com"
              className="inline-block bg-field-forest text-white px-8 py-3 rounded-lg font-medium hover:bg-field-forest/90 transition-colors"
            >
              Contact support
            </a>
            <Link
              href="/signup"
              className="inline-block bg-field-wheat/50 text-field-ink px-8 py-3 rounded-lg font-medium hover:bg-field-wheat transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
