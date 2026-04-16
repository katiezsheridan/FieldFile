import Link from "next/link";

export default function ResourcesPage() {
  return (
    <div className="bg-field-cream min-h-[calc(100vh-200px)]">
      <section className="py-24 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-field-black mb-4 tracking-tight">
            Resources coming soon
          </h1>
          <p className="text-field-black/70 mb-8">
            We&apos;re putting together guides and articles to help Texas
            landowners manage their properties. Check back soon.
          </p>
          <Link
            href="/"
            className="inline-block bg-field-forest text-white px-6 py-2.5 rounded-lg font-medium hover:bg-field-forest/90 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </section>
    </div>
  );
}
