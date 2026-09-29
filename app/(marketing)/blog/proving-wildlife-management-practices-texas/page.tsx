import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE_URL, getPost, postUrl, formatPostDate } from "@/lib/blog";

const SLUG = "proving-wildlife-management-practices-texas";
const post = getPost(SLUG)!;
const url = postUrl(SLUG);

// External authority sources (open in a new tab, nofollow-safe for outbound refs).
const TPWD_URL =
  "https://tpwd.texas.gov/landwater/land/private/agricultural_land/wildlife_management/";

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
          name: "How do you prove you completed a wildlife management practice in Texas?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Appraisal districts check whether the practice exists and meets the standard, not how much time or money went into it. Keep a logbook by calendar year recording the date, time or labor spent, what you spent, and any census data for each activity, along with photos and a note about where on the property it happened.",
          },
        },
        {
          "@type": "Question",
          name: "How many wildlife management practices do you need each year?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You need at least three practices from three different categories each year, and you can pick and choose from the practices in your management plan. Planning for four or five gives you a buffer if one falls through or gets rejected.",
          },
        },
      ],
    },
  ],
};

// Before/during/after of a supplemental water bowl cleaning.
const WATER_BOWL_PHOTOS = [
  {
    src: "/images/blog/proving-wildlife-management-practices/water-bowl-before.jpg",
    alt: "A supplemental water bowl coated in green algae before cleaning",
    caption: "Before: algae built up in the bowl.",
  },
  {
    src: "/images/blog/proving-wildlife-management-practices/water-bowl-cleaning.jpg",
    alt: "Scrubbing algae out of the supplemental water bowl",
    caption: "The work itself: scrubbing the bowl out.",
  },
  {
    src: "/images/blog/proving-wildlife-management-practices/water-bowl-after.jpg",
    alt: "The same supplemental water bowl, clean and refilled with water",
    caption: "After: clean and full.",
  },
];

export default function ProvingPracticesPost() {
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
            When I bought my 14.3 acres in Hays County, I assumed the hard part
            of keeping my wildlife tax valuation was writing the{" "}
            <Link
              href="/how-it-works"
              className="text-field-forest font-medium underline underline-offset-2 hover:text-field-forest/80"
            >
              management plan
            </Link>
            . It wasn&apos;t. The hard part is proving, every year, that you did
            what your plan says. I recently sat down with a wildlife biologist
            from the{" "}
            <a
              href={TPWD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-field-forest underline underline-offset-2 hover:text-field-forest/80"
            >
              Texas Parks and Wildlife Department
            </a>{" "}
            to find out what appraisal districts actually look for. Here&apos;s
            what I learned.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            Effort isn&apos;t the standard. Results are.
          </h2>
          <p>
            The biggest mistake he sees is landowners who put in real work but
            end up with nothing to show for it, then assume it counted.
            Wildflower seeds that never sprouted are a classic example. An
            elaborate water structure that&apos;s still under construction, with
            no water in it, is another. Districts check whether the practice
            exists and meets the standard, not how much time or money went in.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            You need less than you think, plus a buffer
          </h2>
          <p>
            Each year you need at least three practices from three different
            categories, and you can pick and choose from your plan. Plan for four
            or five, so you&apos;re covered if one falls through or gets
            rejected.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            Visual practices are the safest
          </h2>
          <p>
            Supplemental water and nest boxes are the easiest to document because
            anyone can see and verify them. Practices that depend on plantings
            growing or hitting acreage thresholds are harder to prove.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            A practice in action: cleaning a water source
          </h2>
          <p>
            Here&apos;s my supplemental water bowl before I cleaned it. Cleaning
            it is a maintenance task, and it counts as an activity worth logging.
            And here it is afterward, clean and full. Before and after photos
            like these are exactly the kind of proof that holds up.
          </p>

          <figure className="not-prose my-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {WATER_BOWL_PHOTOS.map((photo) => (
                <div key={photo.src}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={600}
                    height={800}
                    className="w-full h-auto rounded-xl border border-field-wheat object-cover"
                    sizes="(min-width: 640px) 33vw, 100vw"
                  />
                  <figcaption className="mt-2 text-sm text-field-earth">
                    {photo.caption}
                  </figcaption>
                </div>
              ))}
            </div>
          </figure>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            Keep a logbook by calendar year
          </h2>
          <p>
            For every activity, record the date, time or labor spent, what you
            spent, and any census data. Add photos and a note about where it
            happened. The standard is roughly what a reasonable person would
            consider enough documentation.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            Know your county&apos;s process
          </h2>
          <p>
            Counties handle this differently. Some want an annual submission,
            others review records another way. It&apos;s worth calling your
            appraisal district to ask what they expect.
          </p>

          <p>
            I built FieldFile because I got tired of piecing this together at the
            end of the year. It sends reminders so activities happen on time,
            adds GPS coordinates to every entry, and turns your log into a
            report.
          </p>
        </div>

        {/* CTA */}
        <aside className="mt-12 rounded-2xl border border-field-wheat bg-field-mist p-6 md:p-8">
          <h2 className="text-xl font-semibold text-field-ink">
            Stop piecing it together in December
          </h2>
          <p className="mt-2 text-field-ink/80">
            FieldFile helps Texas landowners manage wildlife tax valuation
            (1-d-1-w) compliance, from activity documentation to audit-ready
            annual reports. Built by a landowner, for landowners.
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
