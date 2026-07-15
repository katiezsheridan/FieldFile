import type { Metadata } from "next";
import Link from "next/link";
import {
  SITE_URL,
  getPost,
  postUrl,
  formatPostDate,
} from "@/lib/blog";

const SLUG = "new-landowner-texas-ag-valuation-checklist";
const post = getPost(SLUG)!;
const url = postUrl(SLUG);

// External authority sources (open in a new tab, nofollow-safe for outbound refs).
const TPWD_URL =
  "https://tpwd.texas.gov/landwater/land/private/agricultural_land/wildlife_management/";
const COMPTROLLER_URL =
  "https://comptroller.texas.gov/taxes/property-tax/ag-timber/";

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  keywords: post.keywords,
  alternates: { canonical: url },
  openGraph: {
    type: "article",
    url,
    title: post.title,
    description: post.description,
    siteName: "FieldFile",
    publishedTime: post.datePublished,
    modifiedTime: post.dateModified ?? post.datePublished,
    images: [{ url: `${SITE_URL}/images/logo/fieldfile-logo.png` }],
  },
  twitter: {
    card: "summary_large_image",
    title: post.title,
    description: post.description,
    images: [`${SITE_URL}/images/logo/fieldfile-logo.png`],
  },
};

// Structured data: BlogPosting + BreadcrumbList + FAQPage (rich-result eligible).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: post.title,
      description: post.description,
      keywords: post.keywords.join(", "),
      datePublished: post.datePublished,
      dateModified: post.dateModified ?? post.datePublished,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      image: `${SITE_URL}/images/logo/fieldfile-logo.png`,
      author: { "@type": "Organization", name: "FieldFile", url: SITE_URL },
      publisher: {
        "@type": "Organization",
        name: "FieldFile",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/images/logo/fieldfile-logo.png`,
        },
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: `${SITE_URL}/blog`,
        },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "When is the Texas ag valuation application due?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Applications for a Texas 1-d-1 agricultural or wildlife management valuation are generally due by April 30, but each county appraisal district administers its own rules and degree-of-intensity standards, so confirm the exact deadline with your local CAD.",
          },
        },
        {
          "@type": "Question",
          name: "What is the rollback tax on Texas ag land?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "If qualifying agricultural or wildlife use stops, the county assesses a rollback tax that recaptures three years of tax savings plus five percent interest. The rollback follows the land, not the previous owner, so a new owner can inherit the exposure.",
          },
        },
      ],
    },
  ],
};

export default function NewLandownerChecklistPost() {
  return (
    <article className="bg-field-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-field-earth">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-field-forest hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/blog"
                className="hover:text-field-forest hover:underline"
              >
                Blog
              </Link>
            </li>
          </ol>
        </nav>

        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-field-ink leading-tight">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-field-earth">
            <time dateTime={post.datePublished}>
              {formatPostDate(post.datePublished)}
            </time>
            <span aria-hidden="true">&middot;</span>
            <span>{post.readingTime}</span>
          </div>
        </header>

        <div className="space-y-6 text-lg leading-relaxed text-field-ink/90">
          <p>
            You just bought rural land in Texas, and buried in the closing
            packet is a line that saved the previous owner thousands a year: an
            agricultural or wildlife valuation. Here&apos;s what nobody tells you
            at the table. That valuation is now yours to keep, and the clock
            started the day you signed. This new landowner ag valuation checklist
            covers the first 90 days, and FieldFile is built to run it with you.
          </p>

          <p className="rounded-lg border border-field-wheat bg-field-mist px-5 py-4 text-base text-field-ink/80">
            <strong className="font-semibold text-field-ink">Quick note:</strong>{" "}
            Texas calls it the &ldquo;ag exemption,&rdquo; but it&apos;s really a
            valuation. That difference matters, because valuations come with
            ongoing obligations that exemptions don&apos;t.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            Days 1 to 30: Verify what you actually have
          </h2>
          <p>
            Confirm your exact status with the county appraisal district (CAD),
            in writing: 1-d-1 agricultural, wildlife management, timber, or none.
            Ask how long the land has been in qualifying use (Texas wants five of
            the last seven years), and if it&apos;s a wildlife valuation, get the
            previous owner&apos;s management plan and last annual report.
          </p>
          <p>
            Then understand your biggest risk. If the qualifying use stops, the
            county assesses a rollback tax recapturing three years of savings plus
            five percent interest, and that rollback follows the land, not the
            previous owner. FieldFile gives you one place to store your valuation
            records, plan, and prior reports from day one, so nothing important
            lives in a seller&apos;s inbox or a closing folder you&apos;ll never
            open again.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            Days 31 to 60: Learn your county&apos;s rules and deadlines
          </h2>
          <p>
            Ag valuation is state law administered county by county, so the
            details live at your local CAD. Applications are generally due by
            April 30, and every county publishes its own{" "}
            <a
              href={COMPTROLLER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-field-forest underline underline-offset-2 hover:text-field-forest/80"
            >
              degree-of-intensity standards
            </a>{" "}
            (how many animal units, what counts as a real operation versus a
            hobby). Wildlife valuations require{" "}
            <Link
              href="/blog/choosing-texas-wildlife-management-practices"
              className="text-field-forest font-medium underline underline-offset-2 hover:text-field-forest/80"
            >
              at least three of seven approved practices
            </Link>{" "}
            for your ecoregion, filed on{" "}
            <a
              href={TPWD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-field-forest underline underline-offset-2 hover:text-field-forest/80"
            >
              TPWD form PWD-885
            </a>
            .
          </p>
          <p>
            Missing a deadline or falling below the intensity bar is how new
            owners lose a valuation in year one. FieldFile tracks your
            county&apos;s key dates and maps your required practices to the
            activities you&apos;re actually logging, so you always know whether
            you&apos;re on track before the CAD does.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            Days 61 to 90: Document from day one
          </h2>
          <p>
            Your land stays qualified because you keep doing the work and can
            prove it. When the CAD inspects or requests your annual report,
            contemporaneous records are the difference between a routine renewal
            and a change-of-use determination.
          </p>
          <p>
            This is the core of what FieldFile does. Log each activity the day it
            happens (predator control, brush management, a census count, a food
            plot), attach a timestamped, geotagged photo, and tie it to the
            qualifying practice it satisfies. When your report is due, FieldFile
            assembles an audit-ready record and generates the annual report for
            you. No shoebox of receipts, no reconstructing a year from memory the
            night before it&apos;s due.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            The 90-day recap
          </h2>
          <ol className="list-decimal pl-6 space-y-2 marker:text-field-forest marker:font-semibold">
            <li>Verify your status and use history with the CAD, in writing.</li>
            <li>
              Know your rollback exposure so a lapse never surprises you.
            </li>
            <li>
              Learn your deadlines and intensity standards, and treat April 30 as
              a hard line.
            </li>
            <li>
              Document from day one, with dated, photographed, receipt-backed
              records.
            </li>
          </ol>
          <p>
            Do these four things and the years that follow get a lot easier.
            Start your first 90 days with FieldFile.
          </p>
        </div>

        {/* CTA */}
        <aside className="mt-12 rounded-2xl border border-field-wheat bg-field-mist p-6 md:p-8">
          <h2 className="text-xl font-semibold text-field-ink">
            Keep your valuation exactly where it belongs
          </h2>
          <p className="mt-2 text-field-ink/80">
            FieldFile helps Texas landowners document wildlife and agricultural
            activity, generate annual reports, and keep audit-ready records so
            their valuation stays exactly where it belongs.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="bg-field-forest text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-field-forest/90 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/how-it-works"
              className="border border-field-forest text-field-forest px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-field-forest/10 transition-colors"
            >
              See how it works
            </Link>
          </div>
        </aside>

        <p className="mt-6 text-sm text-field-earth">
          This is general information, not legal or tax advice; confirm specifics
          with your county appraisal district or a qualified professional.
        </p>

        <div className="mt-10">
          <Link
            href="/blog"
            className="text-sm text-field-forest hover:underline"
          >
            &larr; Back to all articles
          </Link>
        </div>
      </div>
    </article>
  );
}
