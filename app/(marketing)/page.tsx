import Link from "next/link";
import Image from "next/image";

const services = [
  {
    title: "Wildlife Surveys",
    description:
      "Comprehensive on-site surveys to document species and habitat across your property.",
    image: "/images/products/wildlife-surveys.png",
  },
  {
    title: "Habitat Assessment",
    description:
      "Professional evaluation of vegetation, cover, and habitat quality for your management plan.",
    image: "/images/products/habitat-assessment.png",
  },
  {
    title: "Wildlife Census",
    description:
      "Annual species counts and population monitoring to satisfy county requirements.",
    image: "/images/products/wildlife-census.png",
  },
  {
    title: "Field Documentation",
    description:
      "Detailed field notes, GPS-tagged photos, and activity logs ready for filing.",
    image: "/images/products/field-documentation.png",
  },
  {
    title: "Property Evaluation",
    description:
      "Initial assessment of your land to build a custom wildlife management plan.",
    image: "/images/products/property-evaluation.png",
  },
  {
    title: "Water Source Management",
    description:
      "Setup and documentation of water features to support wildlife on your property.",
    image: "/images/products/water-management.png",
  },
  {
    title: "Supplemental Feeding",
    description:
      "Feeding station installation, maintenance, and compliance documentation.",
    image: "/images/products/supplemental-feeding.png",
  },
  {
    title: "Wildlife Monitoring",
    description:
      "Trail cameras, traps, and monitoring equipment to track species activity.",
    image: "/images/products/wildlife-monitoring.png",
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
    description: "Help from Texas specialists.",
  },
];

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

export default function HomePage() {
  return (
    <div className="bg-field-cream">
      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Image
            src="/images/logo/fieldfile-logo-mono.svg"
            alt="FieldFile"
            width={320}
            height={60}
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
              href="/pricing"
              className="bg-white text-field-green px-8 py-3 rounded-lg font-semibold border border-field-brown/30 hover:border-field-green transition-colors"
            >
              View pricing
            </Link>
          </div>
          <p className="text-sm text-field-black/50 mt-4">
            14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* Services / Products */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-field-black text-center mb-4">
            Our Services
          </h2>
          <p className="text-field-black/60 text-center mb-12 max-w-2xl mx-auto">
            From initial property evaluation to annual filing, we handle every
            step of your wildlife tax exemption.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="group bg-field-cream rounded-xl overflow-hidden border border-field-brown/10 hover:border-field-green/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-field-black mb-1.5">
                    {service.title}
                  </h3>
                  <p className="text-field-black/60 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-field-cream">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-field-black text-center mb-12">
            Everything you need to stay compliant
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-field-brown/20 p-6 hover:border-field-green/40 transition-colors"
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
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-field-black/80 italic mb-4">
            &ldquo;FieldFile made it so easy to track our wildlife activities.
            Filing season is now completely hands-off.&rdquo;
          </p>
          <p className="text-field-black/60 text-sm">
            — Ranch owner, Gillespie County
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-field-cream">
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
