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
    image: "/images/products/wildlife-surveys.jpg",
    detail:
      "Wildlife surveys are the foundation of your management plan. They document which species are present, their population levels, and how they use your property throughout the year.",
    responsibilities: [
      {
        owner: "Walk your property and observe wildlife",
        fieldfile: "GPS-tagged photo documentation",
      },
      {
        owner: "Note seasonal patterns and species",
        fieldfile: "Compile into a county-ready survey summary",
      },
      {
        owner: "Report any unusual sightings",
        fieldfile: "Track species counts and trends over time",
      },
    ],
  },
  {
    title: "Predator Control",
    description:
      "Fire ant treatment and predator management to protect wildlife populations on your property.",
    image: "/images/products/predator-control.jpg",
    detail:
      "Predator control is a qualifying wildlife management activity. Fire ant treatment and other predator management help protect ground-nesting birds and other vulnerable species on your property.",
    responsibilities: [
      {
        owner: "Identify fire ant mounds and problem areas",
        fieldfile: "GPS-tagged documentation of treatment sites",
      },
      {
        owner: "Apply treatments as recommended",
        fieldfile: "Treatment schedule tracking and reminders",
      },
      {
        owner: "Monitor results and report changes",
        fieldfile: "Compliance documentation for your annual report",
      },
    ],
  },
  {
    title: "Wildlife Census",
    description:
      "Annual species counts and population monitoring to satisfy county requirements.",
    image: "/images/products/wildlife-census.jpg",
    detail:
      "Annual census counts are required to demonstrate active wildlife management. We help you set up monitoring systems and compile the data into compliant documentation.",
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
    title: "Water Source Management",
    description:
      "Setup and documentation of water features to support wildlife on your property.",
    image: "/images/products/water-management.jpg",
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
    image: "/images/products/supplemental-feeding.jpg",
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
        fieldfile: "Compliance documentation for your annual report",
      },
    ],
  },
  {
    title: "Bird Houses",
    description:
      "Installation, monitoring, and documentation of nesting structures for native bird species.",
    image: "/images/products/wildlife-monitoring.jpg",
    detail:
      "Providing shelter structures like bird houses is a qualifying wildlife management activity. We help you install, monitor, and document nesting boxes to support native bird populations.",
    responsibilities: [
      {
        owner: "Install and maintain bird houses",
        fieldfile: "GPS mapping of all shelter structure locations",
      },
      {
        owner: "Monitor for nesting activity and species use",
        fieldfile: "Photo documentation and species tracking",
      },
      {
        owner: "Clean and repair structures seasonally",
        fieldfile: "Compliance documentation for your annual report",
      },
    ],
  },
  {
    title: "Brush Piles",
    description:
      "Creating and documenting brush pile cover to provide wildlife habitat on your property.",
    image: "/images/products/brush-piles.jpg",
    detail:
      "Brush piles provide essential cover for small mammals, reptiles, and ground-nesting birds. Building and maintaining brush piles is a qualifying wildlife management activity.",
    responsibilities: [
      {
        owner: "Build and maintain brush piles in designated areas",
        fieldfile: "GPS-tagged location mapping and documentation",
      },
      {
        owner: "Monitor wildlife use of brush pile areas",
        fieldfile: "Photo logs and activity tracking",
      },
      {
        owner: "Add material as piles settle over time",
        fieldfile: "Compliance documentation for your annual report",
      },
    ],
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
            From property setup to annual report preparation, we help you
            manage every step of your wildlife tax exemption. Click any service
            to see what&apos;s involved.
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

      {/* Service Area Map */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-field-black mb-4">
              Where We Serve
            </h2>
            <p className="text-field-black/70 max-w-2xl mx-auto">
              FieldFile currently supports landowners across dozens of Texas
              counties, with more being added every month.
            </p>
          </div>

          <div className="bg-field-cream rounded-xl border border-field-brown/10 p-6 sm:p-8">
            <div className="relative w-full max-w-3xl mx-auto">
              <Image
                src="/images/service-area-map.png"
                alt="Map of Texas counties serviced by FieldFile"
                width={1000}
                height={900}
                className="w-full h-auto rounded-lg"
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-field-forest flex-shrink-0" />
                <span className="text-sm text-field-black/70">
                  Currently servicing
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-[#D4A843] flex-shrink-0" />
                <span className="text-sm text-field-black/70">
                  Expanding to
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-field-black/50 mt-4">
              Don&apos;t see your county?{" "}
              <Link
                href="/request-availability"
                className="text-field-forest font-medium hover:underline"
              >
                Request availability in your county
              </Link>
            </p>
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
              Get started free
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
