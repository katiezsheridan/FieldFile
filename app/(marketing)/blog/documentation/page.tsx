import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE_URL, getPost, postUrl, formatPostDate } from "@/lib/blog";

const SLUG = "documentation";
const post = getPost(SLUG)!;
const url = postUrl(SLUG);

// External authority source (opens in a new tab, nofollow-safe for outbound refs).
const TPWD_BIOLOGIST_URL =
  "https://tpwd.texas.gov/landwater/habitat-management/find-a-wildlife-biologist/";

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
          name: "How do you document wildlife management practices in Texas?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Keep a logbook by calendar year. For each activity, record the date, the time or labor spent, the cost, and any census data, and add photos and a note on where it took place. Appraisal districts check whether the practice exists and meets the standard, not how much time or money went into it.",
          },
        },
        {
          "@type": "Question",
          name: "How many wildlife management practices do you need each year?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You need at least three practices from three different categories each year, chosen from your management plan. Planning for four or five covers you if one fails or is rejected.",
          },
        },
      ],
    },
  ],
};

// Before, during and after of a supplemental water bowl cleaning. Same bowl
// each time, which is what makes the sequence read as proof.
const WATER_BOWL_PHOTOS = [
  {
    src: "/images/blog/proving-wildlife-management-practices/water-bowl-before.jpg",
    alt: "A galvanized supplemental water bowl in the brush, half covered by a concrete slab, its water thick with bright green algae",
    caption: "Before: green algae carpeting the bottom of the bowl.",
  },
  {
    src: "/images/blog/proving-wildlife-management-practices/water-bowl-cleaning.jpg",
    alt: "The same water bowl mid-cleaning, with the algae scrubbed loose and still floating in the water before the bowl is dumped",
    caption: "During: scrubbing the algae loose before dumping the water.",
  },
  {
    src: "/images/blog/proving-wildlife-management-practices/water-bowl-after.jpg",
    alt: "The same water bowl after cleaning, the rock that weighs it down in high wind scrubbed clean of algae and fresh water starting to refill it, a scrub brush in the grass beside it",
    caption: "After: algae gone and the bowl refilling. The rock stays in to weigh it down in high wind.",
  },
];

export default function WildlifeManagementDocumentationPost() {
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
            Keeping a wildlife tax valuation takes more than a management plan.
            Each year, you have to show that you carried out the practices it
            describes. I own 14.3 acres in Hays County, and that was the harder
            part for me. I spoke with a biologist from the{" "}
            <a
              href={TPWD_BIOLOGIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-field-forest underline underline-offset-2 hover:text-field-forest/80"
            >
              Texas Parks and Wildlife Department
            </a>{" "}
            about what appraisal districts look for. This is what he told me.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            Completed practices count; effort does not
          </h2>
          <p>
            The most common problem he sees is landowners who do real work but
            have nothing to show for it. Wildflower seeds that never sprouted are
            one example. A water structure still under construction, with no
            water in it, is another. Districts check whether the practice exists
            and meets the standard, not how much time or money went into it.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            Plan for more than the minimum
          </h2>
          <p>
            Each year you need at least three practices from three different
            categories, chosen from your{" "}
            <Link
              href="/how-it-works"
              className="text-field-forest font-medium underline underline-offset-2 hover:text-field-forest/80"
            >
              management plan
            </Link>
            . Plan for four or five so you are covered if one fails or is
            rejected.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            Favor practices that are easy to verify
          </h2>
          <p>
            Supplemental water and nest boxes are the simplest to document
            because anyone can see and confirm them. Practices that depend on
            plantings establishing or meeting acreage thresholds are harder to
            prove.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            Example: cleaning a water source
          </h2>
          <p>
            Cleaning a water source is a maintenance task, and it counts as an
            activity worth logging. Before and after photos are the kind of proof
            that holds up.
          </p>

          <figure className="not-prose my-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {WATER_BOWL_PHOTOS.map((photo) => (
                <div key={photo.src}>
                  {/* Fixed 3:4 box so the mixed source aspect ratios align. */}
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-field-wheat">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 640px) 33vw, 100vw"
                    />
                  </div>
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
            For each activity, record the date, the time or labor spent, the
            cost, and any census data. Add photos and a note on where it took
            place. The standard is roughly the documentation a reasonable person
            would consider sufficient.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            Confirm your county&apos;s process
          </h2>
          <p>
            Counties handle this differently. Some require an annual submission
            and others review records another way. Call your appraisal district
            to ask what they expect.
          </p>

          <p>
            I built FieldFile because assembling this documentation at the end of
            the year was inefficient. It sends reminders so activities happen on
            time, adds GPS coordinates to every entry, and compiles your log into
            a report.
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
