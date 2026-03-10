"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Responsibility {
  owner: string;
  fieldfile: string;
}

interface Service {
  title: string;
  description: string;
  image: string;
  detail: string;
  responsibilities: Responsibility[];
}

const services: Service[] = [
  {
    title: "Wildlife Surveys",
    description:
      "Comprehensive on-site surveys to document species and habitat across your property.",
    image: "/images/products/wildlife-surveys.png",
    detail:
      "Wildlife surveys are the foundation of your management plan. They document which species are present, their population levels, and how they use your property throughout the year.",
    responsibilities: [
      {
        owner: "Walk your property and observe wildlife",
        fieldfile: "GPS-tagged photo documentation",
      },
      {
        owner: "Note seasonal patterns and species",
        fieldfile: "Compile into county-ready survey report",
      },
      {
        owner: "Report any unusual sightings",
        fieldfile: "Track species counts and trends over time",
      },
    ],
  },
  {
    title: "Habitat Assessment",
    description:
      "Professional evaluation of vegetation, cover, and habitat quality for your management plan.",
    image: "/images/products/habitat-assessment.png",
    detail:
      "A habitat assessment evaluates your property's vegetation, water sources, cover, and food sources to determine its capacity to support target wildlife species.",
    responsibilities: [
      {
        owner: "Provide property access and share land history",
        fieldfile: "Professional vegetation and cover analysis",
      },
      {
        owner: "Identify areas of concern or interest",
        fieldfile: "Habitat quality scoring and mapping",
      },
      {
        owner: "Share goals for the property",
        fieldfile: "Documented assessment with improvement recommendations",
      },
    ],
  },
  {
    title: "Wildlife Census",
    description:
      "Annual species counts and population monitoring to satisfy county requirements.",
    image: "/images/products/wildlife-census.png",
    detail:
      "Annual census counts are required to demonstrate active wildlife management. We help you set up monitoring systems and compile the data into compliant reports.",
    responsibilities: [
      {
        owner: "Set up and check trail cameras",
        fieldfile: "Species identification and population analysis",
      },
      {
        owner: "Conduct visual observations during peak hours",
        fieldfile: "Annual census report generation",
      },
      {
        owner: "Record dates and locations of sightings",
        fieldfile: "Year-over-year trend tracking and comparisons",
      },
    ],
  },
  {
    title: "Field Documentation",
    description:
      "Detailed field notes, GPS-tagged photos, and activity logs ready for filing.",
    image: "/images/products/field-documentation.png",
    detail:
      "Every wildlife management activity needs proper documentation. We make it easy to capture, organize, and store the evidence your county requires.",
    responsibilities: [
      {
        owner: "Take photos during activities",
        fieldfile: "Automatic GPS tagging and organization",
      },
      {
        owner: "Write brief notes about what you did",
        fieldfile: "Format notes into structured activity logs",
      },
      {
        owner: "Save receipts for supplies and equipment",
        fieldfile: "Compile all evidence into filing-ready packages",
      },
    ],
  },
  {
    title: "Property Evaluation",
    description:
      "Initial assessment of your land to build a custom wildlife management plan.",
    image: "/images/products/property-evaluation.png",
    detail:
      "Before starting a management plan, we evaluate your property's current condition, history, and potential to develop a customized strategy that meets county requirements.",
    responsibilities: [
      {
        owner: "Provide property access and historical info",
        fieldfile: "Full property condition assessment",
      },
      {
        owner: "Share current land use and goals",
        fieldfile: "Custom wildlife management plan development",
      },
      {
        owner: "Review and approve the proposed plan",
        fieldfile: "File management plan with county appraisal district",
      },
    ],
  },
  {
    title: "Water Source Management",
    description:
      "Setup and documentation of water features to support wildlife on your property.",
    image: "/images/products/water-management.png",
    detail:
      "Providing supplemental water is one of the qualifying wildlife management activities. We help you set up, maintain, and document water sources that satisfy county requirements.",
    responsibilities: [
      {
        owner: "Maintain water troughs and check levels",
        fieldfile: "Water source setup documentation and mapping",
      },
      {
        owner: "Report any issues or damage",
        fieldfile: "Maintenance schedule tracking and reminders",
      },
      {
        owner: "Refill as needed during dry periods",
        fieldfile: "Photo logs and compliance documentation",
      },
    ],
  },
  {
    title: "Supplemental Feeding",
    description:
      "Feeding station installation, maintenance, and compliance documentation.",
    image: "/images/products/supplemental-feeding.png",
    detail:
      "Supplemental feeding supports wildlife populations and counts as a qualifying management activity. Proper documentation of feeding stations is critical for compliance.",
    responsibilities: [
      {
        owner: "Fill feeders and maintain feeding stations",
        fieldfile: "Installation records and GPS mapping",
      },
      {
        owner: "Monitor wildlife use at feeding stations",
        fieldfile: "Maintenance logs with dates and quantities",
      },
      {
        owner: "Report equipment issues or damage",
        fieldfile: "Compliance documentation and filing",
      },
    ],
  },
  {
    title: "Wildlife Monitoring",
    description:
      "Trail cameras, traps, and monitoring equipment to track species activity.",
    image: "/images/products/wildlife-monitoring.png",
    detail:
      "Ongoing monitoring provides the data needed to demonstrate active management. We help you set up and manage monitoring equipment and turn the data into actionable reports.",
    responsibilities: [
      {
        owner: "Check cameras and collect SD cards",
        fieldfile: "Equipment placement planning and mapping",
      },
      {
        owner: "Note any wildlife activity or tracks",
        fieldfile: "Photo sorting, species identification, and analysis",
      },
      {
        owner: "Maintain equipment and batteries",
        fieldfile: "Monitoring reports ready for county filing",
      },
    ],
  },
];

const features = [
  {
    title: "Track Activities",
    description: "Log with photos, dates, and GPS.",
  },
  {
    title: "Store Documents",
    description: "Receipts and photos in one place.",
  },
  {
    title: "Get Reminders",
    description: "Automatic deadline alerts.",
  },
  {
    title: "Generate Reports",
    description: "County-ready, auto-generated.",
  },
  {
    title: "We File For You",
    description: "We submit to your county.",
  },
  {
    title: "Expert Support",
    description:
      "Help from certified wildlife biologists and Texas land specialists.",
  },
];

export default function ServicesPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  function toggleService(index: number) {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }

  return (
    <div className="bg-field-cream">
      {/* Hero */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-field-black mb-4 tracking-tight">
            Our Services
          </h1>
          <p className="text-lg text-field-black/70 max-w-2xl mx-auto">
            From initial property evaluation to annual filing, we handle every
            step of your wildlife tax exemption. Click any service to see
            what&apos;s involved.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <div key={service.title} className="contents">
                  <button
                    onClick={() => toggleService(index)}
                    className={cn(
                      "group bg-white rounded-xl overflow-hidden border text-left transition-all duration-300",
                      isExpanded
                        ? "border-field-green shadow-lg"
                        : "border-field-brown/10 hover:border-field-green/40 hover:shadow-lg"
                    )}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Expand indicator */}
                      <div className="absolute bottom-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
                        <svg
                          className={cn(
                            "w-4 h-4 text-field-green transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-field-black mb-1.5">
                        {service.title}
                      </h3>
                      <p className="text-field-black/60 text-sm leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </button>

                  {/* Expanded detail — spans full row */}
                  {isExpanded && (
                    <div
                      className="col-span-full bg-white rounded-xl border border-field-green p-6 sm:p-8"
                      style={{ animation: "fadeIn 200ms ease-out" }}
                    >
                      <style jsx>{`
                        @keyframes fadeIn {
                          from {
                            opacity: 0;
                            transform: translateY(-8px);
                          }
                          to {
                            opacity: 1;
                            transform: translateY(0);
                          }
                        }
                      `}</style>
                      <h3 className="text-lg font-bold text-field-black mb-2">
                        {service.title}
                      </h3>
                      <p className="text-field-black/70 text-sm leading-relaxed mb-6">
                        {service.detail}
                      </p>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-field-wheat">
                              <th className="text-left py-3 pr-4 font-semibold text-field-black">
                                What you do
                              </th>
                              <th className="text-left py-3 pl-4 font-semibold text-field-green">
                                What FieldFile handles
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {service.responsibilities.map((row, i) => (
                              <tr
                                key={i}
                                className="border-b border-field-wheat/50 last:border-0"
                              >
                                <td className="py-3 pr-4 text-field-black/70 align-top">
                                  {row.owner}
                                </td>
                                <td className="py-3 pl-4 text-field-ink align-top">
                                  {row.fieldfile}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-field-black text-center mb-12">
            Everything you need to stay compliant
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-field-cream rounded-lg border border-field-brown/20 p-6 hover:border-field-green/40 transition-colors"
              >
                <h3 className="font-semibold text-field-black mb-2">
                  {feature.title}
                </h3>
                <p className="text-field-black/60 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-field-cream">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-field-black mb-4">
            Ready to get started?
          </h2>
          <p className="text-field-black/60 mb-8">
            Take our free eligibility quiz or start your trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-field-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-field-green/90 transition-colors"
            >
              Start free trial
            </Link>
            <Link
              href="/quiz"
              className="bg-white text-field-green px-8 py-3 rounded-lg font-semibold border border-field-brown/30 hover:border-field-green transition-colors"
            >
              Check your eligibility
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
