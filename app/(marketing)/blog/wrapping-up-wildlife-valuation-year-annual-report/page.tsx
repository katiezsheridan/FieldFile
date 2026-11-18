import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, getPost, postUrl, formatPostDate } from "@/lib/blog";

const SLUG = "wrapping-up-wildlife-valuation-year-annual-report";
const post = getPost(SLUG)!;
const url = postUrl(SLUG);

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

// Structured data: BlogPosting + BreadcrumbList.
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
  ],
};

const LINK =
  "text-field-forest font-medium underline underline-offset-2 hover:text-field-forest/80";

const TIPS: { title: string; body: ReactNode }[] = [
  {
    title: "Start from your plan.",
    body: (
      <>
        Your annual report should line up with the activities you committed to
        in your wildlife management plan. Pull both up side by side.
      </>
    ),
  },
  {
    title: "Document everything.",
    body: (
      <>
        A good report includes dated photos, maps showing where work happened,
        and receipts for expenses. If you only keep one habit, make it this one.
      </>
    ),
  },
  {
    title: "Log time and cost as you go.",
    body: (
      <>
        Hours, dates, and a quick note on what you did take 30 seconds in the
        moment and hours to reconstruct in April.
      </>
    ),
  },
  {
    title: "Check your county’s process.",
    body: (
      <>
        Forms and timing vary by appraisal district, so{" "}
        <Link
          href="/blog/texas-wildlife-valuation-requirements-hays-blanco-llano-comal"
          className={LINK}
        >
          confirm what yours expects
        </Link>
        . Most use the TPWD annual report form, and the main application
        deadline is April 30.
      </>
    ),
  },
  {
    title: "Don’t stop at three.",
    body: (
      <>
        Three is the minimum. Doing and documenting four or five gives you a
        cushion if one activity gets questioned.
      </>
    ),
  },
];

const EASY_WINS: { title: string; body: string }[] = [
  {
    title: "Census count",
    body: "Do a spotlight survey, run trail cameras, or log a feeder count. One evening, and you have data plus photos.",
  },
  {
    title: "Supplemental water",
    body: "Photograph and log your troughs, tanks, or guzzlers, and fix or refill anything that’s low.",
  },
  {
    title: "Supplemental shelter",
    body: "Build brush piles from cleared cedar or install nest boxes in an afternoon.",
  },
  {
    title: "Supplemental food",
    body: "Put out feeders or plant a cool-season food plot, and keep the receipts.",
  },
  {
    title: "Habitat control",
    body: "Do some targeted brush management on a section of the property, and map it.",
  },
];

export default function WrappingUpWildlifeYearPost() {
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
            It&rsquo;s mid-November, which means the calendar year is almost
            done. If you hold a 1-d-1 wildlife valuation in Texas, your
            activities for the year need to be done and documented before the
            ball drops. Your appraisal district can ask for an annual report,
            and many do.
          </p>
          <p>
            The core requirement is simple. You need to perform and document at
            least three of the{" "}
            <Link
              href="/blog/choosing-texas-wildlife-management-practices"
              className={LINK}
            >
              seven qualifying practice categories
            </Link>{" "}
            each year: habitat control, erosion control, predator control,
            supplemental food, supplemental water, supplemental shelter, and
            census counts.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            Tips for building the report
          </h2>
          <ul className="space-y-4">
            {TIPS.map((tip) => (
              <li key={tip.title}>
                <strong className="font-semibold text-field-ink">
                  {tip.title}
                </strong>{" "}
                {tip.body}
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            Easy wins if you&rsquo;re short on time
          </h2>
          <p>
            You still have a few weeks. These are fast and easy to document:
          </p>
          <ul className="space-y-3 list-disc pl-6 marker:text-field-forest">
            {EASY_WINS.map((win) => (
              <li key={win.title}>
                <strong className="font-semibold text-field-ink">
                  {win.title}:
                </strong>{" "}
                {win.body}
              </li>
            ))}
          </ul>
          <p>
            Whatever you choose, take timestamped photos and save the receipts
            the same day.
          </p>

          <p>
            Wildlife valuation reporting doesn&rsquo;t have to be a scramble.
            Keep records as you go, and the report mostly writes itself.
          </p>
        </div>

        {/* CTA */}
        <aside className="mt-12 rounded-2xl border border-field-wheat bg-field-mist p-6 md:p-8">
          <h2 className="text-xl font-semibold text-field-ink">
            Document your practices year-round
          </h2>
          <p className="mt-2 text-field-ink/80">
            FieldFile helps Texas landowners manage wildlife tax valuation
            (1-d-1-w) compliance, from activity documentation to audit-ready
            annual reports.
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
