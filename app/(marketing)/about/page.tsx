import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="bg-field-cream">
      {/* Hero with background */}
      <section className="relative py-16 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/sunset-property.jpg"
            alt="Texas sunset over property"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-field-cream/85 via-field-cream/75 to-field-cream/95" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-field-black mb-4 tracking-tight">
            About FieldFile
          </h1>
          <p className="text-lg text-field-black/70 max-w-2xl mx-auto">
            Built for landowners who&apos;d rather be outside than buried in
            paperwork.
          </p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[3/4] max-w-sm mx-auto md:mx-0 rounded-xl overflow-hidden">
              <Image
                src="/images/katie-headshot.jpg"
                alt="Katie Sheridan, founder of FieldFile"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-field-black mb-2">
                Katie Sheridan
              </h2>
              <p className="text-field-green font-medium mb-6">
                Founder
              </p>
              <div className="space-y-4 text-field-black/70 leading-relaxed">
                <p>
                  When I went through the wildlife tax valuation process on my
                  Hays County property, I kept thinking: this should not be this
                  hard. The requirements are manageable. The process around them
                  isn&apos;t. Spreadsheets, scattered notes, annual deadlines,
                  county-specific rules. It&apos;s a system that was never
                  designed with the landowner in mind.
                </p>
                <p>
                  I&apos;ve spent my career building products that make
                  people&apos;s lives genuinely easier. Tools that get out of the
                  way and help you accomplish what you came to do. When I
                  couldn&apos;t find that for managing my own land, I built it.
                </p>
                <p>
                  It&apos;s built around how landowners actually work: tracking
                  activities in the field, generating reports when it&apos;s time
                  to file, and staying organized year over year without starting
                  from scratch every season.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* In the Field */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-field-black text-center mb-10">
            In the Field
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src="/images/team-surveying.jpg"
                alt="Team surveying property terrain"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src="/images/horseback-property.jpg"
                alt="Horseback riding through Texas hill country"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden sm:col-span-2 lg:col-span-1">
              <Image
                src="/images/fieldwork-clearing.jpg"
                alt="Clearing brush on the property"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-field-cream">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-field-black mb-4">
            Ready to simplify your wildlife exemption?
          </h2>
          <p className="text-field-black/60 mb-8">
            Let&apos;s get your property set up and your filing on track.
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
