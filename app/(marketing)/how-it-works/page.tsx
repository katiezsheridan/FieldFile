import Link from "next/link";
import Image from "next/image";

const steps = [
  {
    number: "1",
    title: "Create your account & add your property",
    description:
      "Sign up in minutes. Enter your property details, county, and acreage. We'll customize everything to match your county's specific requirements.",
  },
  {
    number: "2",
    title: "Build your wildlife management plan",
    description:
      "Already have a plan? Upload it. Need one? We'll create a comprehensive wildlife management plan tailored to your property for $500.",
  },
  {
    number: "3",
    title: "Track activities year-round",
    description:
      "Log your wildlife management activities as you complete them. Upload photos, add notes, and track GPS locations. We'll send reminders so nothing falls through the cracks.",
  },
  {
    number: "4",
    title: "We prepare & review your annual report",
    description:
      "Our team organizes your documentation into a county-ready annual report. A real person reviews it for accuracy and completeness, so it's ready for you to submit to your county.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="py-12 px-6">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-3xl font-bold text-field-ink mb-3">
          How FieldFile Works
        </h1>
        <p className="text-lg text-field-ink/60 max-w-2xl mx-auto">
          From signup to your annual report, we handle the heavy lifting so you
          can focus on your land.
        </p>
      </div>

      {/* Steps */}
      <div className="max-w-3xl mx-auto mb-16">
        <div className="space-y-12">
          {steps.map((step, index) => (
            <div key={step.number} className="flex gap-6">
              {/* Step number + connector */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-field-forest text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-px flex-1 bg-field-wheat mt-3" />
                )}
              </div>

              {/* Content */}
              <div className="pb-2">
                <h2 className="text-lg font-semibold text-field-ink mb-2">
                  {step.title}
                </h2>
                <p className="text-field-ink/70 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity image showcase */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="bg-white rounded-2xl border border-field-wheat p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-xl font-semibold text-field-ink mb-3">
                Track activities with ease
              </h2>
              <p className="text-field-ink/70 leading-relaxed mb-4">
                Snap a photo, add your notes, and we&apos;ll handle the rest.
                Every activity is organized and ready for your annual report.
              </p>
              <ul className="space-y-2 text-sm text-field-ink/60">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-field-forest rounded-full" />
                  GPS-tagged photo uploads
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-field-forest rounded-full" />
                  Automatic date and activity tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-field-forest rounded-full" />
                  Deadline reminders for each county
                </li>
              </ul>
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src="/images/activities/filling-feeder.jpeg"
                alt="Wildlife management activity tracking"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard placeholder */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="bg-field-wheat/30 border-2 border-dashed border-field-wheat rounded-2xl p-12 text-center">
          <p className="text-field-ink/40 text-sm uppercase tracking-wide mb-2">
            Dashboard Preview
          </p>
          <p className="text-field-ink/60">
            Screenshot of FieldFile dashboard coming soon
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-field-forest/5 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-field-ink mb-2">
            Ready to get started?
          </h2>
          <p className="text-field-ink/60 mb-6">
            Join Texas landowners who trust FieldFile to stay organized and
            prepared for wildlife exemption season.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-field-forest text-white px-8 py-3 rounded-lg font-medium hover:bg-field-forest/90 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </div>
    </div>
  );
}
