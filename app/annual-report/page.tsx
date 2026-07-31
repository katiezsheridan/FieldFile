import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Don't Miss Your Wildlife Annual Report Deadline | FieldFile",
  description:
    "Keep your Texas 1-d-1 wildlife valuation. FieldFile helps you prepare the annual wildlife management report your county appraisal district expects — you submit, we prepare.",
};

// Standalone, deadline-focused landing page. Intentionally NO site nav — a single
// CTA to start an account. Mobile-first: single column that widens at md/lg.
export default function AnnualReportLandingPage() {
  return (
    <main className="min-h-screen bg-field-cream text-field-ink">
      {/* Brand mark only — still no nav links, but the logo goes home so the
          page isn't a dead end. Same asset and dimensions as MarketingHeader. */}
      <div className="px-6 pt-6">
        <Link
          href="/"
          aria-label="FieldFile home"
          className="inline-flex flex-shrink-0 items-center"
        >
          <Image
            src="/images/logo/fieldfile-logo.png"
            alt="FieldFile"
            width={140}
            height={35}
            priority
          />
        </Link>
      </div>

      <section className="mx-auto max-w-2xl px-6 pt-12 pb-16 sm:pt-16">
        {/* Deadline banner */}
        <div className="inline-flex items-center gap-2 rounded-full bg-field-terra/10 px-4 py-1.5 text-sm font-medium text-field-terra">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-field-terra/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-field-terra" />
          </span>
          Report season is here
        </div>

        <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
          Your wildlife exemption depends on{" "}
          <span className="text-field-terra">one report a year.</span>
        </h1>

        <p className="mt-5 text-lg leading-relaxed text-field-earth">
          Texas counties expect an annual wildlife management report to keep your
          1-d-1 valuation in good standing. Miss it, and you risk losing the
          exemption &mdash; and a much larger tax bill. FieldFile helps you get it
          done in time.
        </p>

        {/* Single CTA — start an account */}
        <div className="mt-8">
          <Link
            href="/sign-up"
            className="inline-flex w-full items-center justify-center rounded-xl bg-field-forest px-8 py-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-field-forest/90 sm:w-auto"
          >
            Start your account &rarr;
          </Link>
          <p className="mt-3 text-sm text-field-earth">
            Free to start &middot; No credit card required
          </p>
        </div>

        {/* Reassurance / what you get */}
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-field-wheat bg-white p-5">
            <div className="text-2xl font-bold text-field-forest">1</div>
            <h3 className="mt-2 font-semibold">Log your activities</h3>
            <p className="mt-1 text-sm text-field-earth">
              Capture the wildlife management practices you already do throughout
              the year.
            </p>
          </div>
          <div className="rounded-xl border border-field-wheat bg-white p-5">
            <div className="text-2xl font-bold text-field-forest">2</div>
            <h3 className="mt-2 font-semibold">Prepare the report</h3>
            <p className="mt-1 text-sm text-field-earth">
              FieldFile organizes your documentation into the annual report your
              county expects.
            </p>
          </div>
          <div className="rounded-xl border border-field-wheat bg-white p-5">
            <div className="text-2xl font-bold text-field-forest">3</div>
            <h3 className="mt-2 font-semibold">You submit</h3>
            <p className="mt-1 text-sm text-field-earth">
              Review, then submit to your appraisal district with confidence and
              time to spare.
            </p>
          </div>
        </div>

        {/* Repeat CTA at the bottom for the long-scroll case */}
        <div className="mt-14 rounded-2xl bg-field-ink px-6 py-8 text-center">
          <h2 className="text-xl font-semibold text-field-cream sm:text-2xl">
            Don&apos;t let the deadline decide for you.
          </h2>
          <Link
            href="/sign-up"
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-field-terra px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-field-terra/90 sm:w-auto"
          >
            Start your account &rarr;
          </Link>
        </div>

        {/* Way home from the bottom of the scroll — the logo is far offscreen
            by this point. Still not nav: one link, no menu. */}
        <p className="mt-10 text-center text-sm text-field-earth">
          <Link href="/" className="underline hover:text-field-ink">
            Back to FieldFile
          </Link>
        </p>
      </section>
    </main>
  );
}
