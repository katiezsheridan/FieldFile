import Link from "next/link";
import Image from "next/image";

const steps = [
  {
    number: "1",
    title: "Set up your property",
    description: "Enter your details. We customize for your county.",
  },
  {
    number: "2",
    title: "Track your activities",
    description: "Log activities and upload photos as you go.",
  },
  {
    number: "3",
    title: "We handle the filing",
    description: "We compile and submit to your county.",
  },
];

const testimonials = [
  {
    quote:
      "FieldFile made it so easy to track our wildlife activities. Filing season is now completely hands-off.",
    name: "Sarah Mitchell",
    location: "Gillespie County",
  },
  {
    quote:
      "We switched from doing everything on paper. The reminders alone are worth it — we never miss a deadline now.",
    name: "James Hargrove",
    location: "Hays County",
  },
  {
    quote:
      "Having someone review our filing before it goes to the county gives us real peace of mind.",
    name: "Linda Dawson",
    location: "Blanco County",
  },
];

const previewFaqs = [
  {
    question: "What is a wildlife tax exemption?",
    answer:
      "In Texas, landowners can qualify for reduced property taxes by actively managing their land for wildlife. This requires documenting specific activities and filing an annual report with your county.",
  },
  {
    question: "How much can I save?",
    answer:
      "Savings vary by county and property size, but many Texas landowners save thousands of dollars per year through wildlife management valuation.",
  },
  {
    question: "Do you file in all Texas counties?",
    answer:
      "Yes, we support filing in all 254 Texas counties. Our system is kept up-to-date with each county's specific requirements and deadlines.",
  },
];

export default function HomePage() {
  return (
    <div className="bg-field-cream">
      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Image
            src="/images/logo/fieldfile-logo.png"
            alt="FieldFile"
            width={320}
            height={80}
            className="mx-auto mb-8"
            priority
          />
          <h1 className="text-4xl md:text-5xl font-bold text-field-black mb-4 tracking-tight">
            Wildlife reporting,{" "}
            <span className="text-field-green">simplified</span>
          </h1>
          <p className="text-lg text-field-black/70 mb-8 max-w-2xl mx-auto">
            Organize. Document. File. Done.
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
          <Link
            href="/pricing"
            className="inline-block text-sm text-field-forest font-medium mt-4 hover:underline"
          >
            Plans from $350/year
          </Link>
          <p className="text-sm text-field-black/50 mt-2">
            14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* Product Visual */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-field-black mb-4">
            Your wildlife exemption, all in one place
          </h2>
          <p className="text-field-black/70 mb-6 leading-relaxed">
            Track activities, store documents, and generate county-ready
            reports from a single dashboard. No more spreadsheets, lost
            receipts, or missed deadlines.
          </p>
          <ul className="inline-flex flex-col items-start space-y-3 text-field-black/70 text-left">
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-field-green rounded-full flex-shrink-0" />
              Activity logging with photos and GPS
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-field-green rounded-full flex-shrink-0" />
              Automatic report generation
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-field-green rounded-full flex-shrink-0" />
              County-specific deadline reminders
            </li>
          </ul>
        </div>
      </section>

      {/* Services Teaser */}
      <section className="py-16 px-6 bg-field-cream">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-field-black mb-4">
            Our Services
          </h2>
          <p className="text-field-black/60 mb-6">
            From initial property evaluation to annual filing — we handle every
            step of your wildlife tax exemption.
          </p>
          <Link
            href="/services"
            className="text-field-forest font-medium hover:underline"
          >
            View our services &rarr;
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 bg-field-grey/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-field-black text-center mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-10 h-10 bg-field-green text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold text-field-black mb-2">
                  {step.title}
                </h3>
                <p className="text-field-black/60 text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/how-it-works"
              className="text-field-forest font-medium hover:underline"
            >
              Learn more about our process &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-field-black text-center mb-12">
            Trusted by Texas landowners
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-field-cream rounded-xl border border-field-brown/10 p-6"
              >
                <p className="text-field-black/80 italic mb-4 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <p className="font-medium text-field-black text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-field-black/50 text-sm">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 px-6 bg-field-cream">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-field-black text-center mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-field-black/60 text-center mb-10">
            Choose the plan that fits your needs.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Filing Only */}
            <div className="bg-white rounded-xl border border-field-brown/20 p-6">
              <h3 className="font-bold text-field-black text-lg mb-1">
                Filing Only
              </h3>
              <p className="text-2xl font-bold text-field-black mb-3">
                $350<span className="text-sm font-normal text-field-black/50">/year</span>
              </p>
              <ul className="space-y-2 text-sm text-field-black/70 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-field-green">&#10003;</span>
                  Organize photos &amp; receipts into a report
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-field-green">&#10003;</span>
                  Submit to your county appraisal district
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-field-green">&#10003;</span>
                  Human review before submission
                </li>
              </ul>
            </div>
            {/* Full-Service */}
            <div className="bg-white rounded-xl border-2 border-field-forest p-6 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-field-forest text-white text-xs font-medium px-3 py-1 rounded-full">
                Full Service
              </span>
              <h3 className="font-bold text-field-black text-lg mb-1">
                Full-Service Management
              </h3>
              <p className="text-2xl font-bold text-field-black mb-3">
                $500<span className="text-sm font-normal text-field-black/50"> + $1,000/activity</span>
              </p>
              <ul className="space-y-2 text-sm text-field-black/70 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-field-green">&#10003;</span>
                  Everything in Filing Only
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-field-green">&#10003;</span>
                  Support &amp; execution of wildlife activities
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-field-green">&#10003;</span>
                  Dedicated specialist for your property
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/pricing"
              className="text-field-forest font-medium hover:underline"
            >
              View full pricing &amp; add-ons &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-field-black text-center mb-10">
            Common questions
          </h2>
          <div className="space-y-6">
            {previewFaqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-semibold text-field-black mb-2">
                  {faq.question}
                </h3>
                <p className="text-field-black/60 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/faq"
              className="text-field-forest font-medium hover:underline"
            >
              See all FAQs &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Resources Teaser */}
      <section className="py-16 px-6 bg-field-cream">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-field-black text-center mb-4">
            Wildlife Management Resources
          </h2>
          <p className="text-field-black/60 text-center mb-10">
            Guides and articles to help you manage your property.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "5 Common Mistakes Landowners Make During Filing Season",
                description:
                  "Avoid these pitfalls to ensure your annual report is accepted the first time.",
                slug: "common-mistakes",
              },
              {
                title: "Unique County-Specific Requirements in Texas",
                description:
                  "Why filing requirements differ across all 254 Texas counties and what you need to know.",
                slug: "county-requirements",
              },
              {
                title: "How to Create a Wildlife Management Plan",
                description:
                  "Everything you need to build a compliant wildlife management plan from scratch.",
                slug: "wildlife-management-plan",
              },
            ].map((article) => (
              <Link
                key={article.title}
                href={`/resources?article=${article.slug}`}
                className="bg-white rounded-xl border border-field-brown/10 p-6 hover:border-field-green/40 hover:shadow-lg transition-all"
              >
                <span className="inline-block bg-field-green/10 text-field-green text-xs font-medium px-2 py-1 rounded mb-3">
                  New
                </span>
                <h3 className="font-semibold text-field-black mb-2 text-sm">
                  {article.title}
                </h3>
                <p className="text-field-black/50 text-sm leading-relaxed">
                  {article.description}
                </p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/resources"
              className="text-field-forest font-medium hover:underline"
            >
              View all resources &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-field-black mb-4">
            Ready to simplify your wildlife exemption?
          </h2>
          <p className="text-field-black/60 mb-8">
            Join Texas landowners who trust FieldFile.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-field-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-field-green/90 transition-colors"
          >
            Start free trial
          </Link>
        </div>
      </section>
    </div>
  );
}
