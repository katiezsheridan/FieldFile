import type { Metadata } from "next";
import Link from "next/link";
import {
  SITE_URL,
  getPost,
  postUrl,
  formatPostDate,
} from "@/lib/blog";

const SLUG = "choosing-texas-wildlife-management-practices";
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
          name: "How many wildlife management practices does Texas require?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Texas requires you to perform a minimum of three of the seven approved wildlife management practices annually to maintain a 1-d-1-w valuation: habitat control, erosion control, predator control, supplemental water, supplemental food, supplemental shelter, and census counts.",
          },
        },
      ],
    },
  ],
};

const PRACTICES = [
  "Habitat control (habitat management)",
  "Erosion control",
  "Predator control (predator management)",
  "Supplemental water",
  "Supplemental food",
  "Supplemental shelter",
  "Census counts (wildlife surveys)",
];

export default function ChoosingPracticesPost() {
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
            If your Texas property carries a wildlife management valuation
            (1-d-1-w), you have to carry out at least three of the seven approved
            wildlife management practices every year to keep it in good standing.
            Which practices you choose determines whether your compliance year
            runs smoothly or turns into a scramble at audit time.
          </p>
          <p>
            This guide walks through how to choose practices that protect your
            valuation, fit your land, and are easy to prove you actually did.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            How many wildlife management practices does Texas require?
          </h2>
          <p>
            Texas requires you to perform a minimum of three of the seven wildlife
            management practices annually. The seven practices are:
          </p>
          <ul className="list-disc pl-6 space-y-1 marker:text-field-forest">
            {PRACTICES.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p>
            You submit a{" "}
            <Link
              href="/how-it-works"
              className="text-field-forest font-medium underline underline-offset-2 hover:text-field-forest/80"
            >
              wildlife management plan
            </Link>{" "}
            to your County Appraisal District identifying your target species and
            the practices you intend to implement, then carry out at least three
            of them each calendar year. For the official rules, see the{" "}
            <a
              href={TPWD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-field-forest underline underline-offset-2 hover:text-field-forest/80"
            >
              Texas Parks &amp; Wildlife Department
            </a>{" "}
            and{" "}
            <a
              href={COMPTROLLER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-field-forest underline underline-offset-2 hover:text-field-forest/80"
            >
              Texas Comptroller ag valuation
            </a>{" "}
            guidelines.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            1. Choose four practices, not three
          </h2>
          <p className="font-medium text-field-ink">
            The minimum is three. Plan for four.
          </p>
          <p>
            Land management doesn&apos;t always cooperate. If everything goes to
            plan, you&apos;ve done a little extra for your land and your wildlife.
            If one practice doesn&apos;t happen for any reason, you still clear the
            minimum of three and your valuation stays protected.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            2. Choose practices that are obvious and easy to document
          </h2>
          <p>
            Take wildflower planting. You can spend a weekend spreading seed to
            improve habitat &mdash; real work, real intent &mdash; but then the
            seeds don&apos;t germinate, or the deer eat the seedlings before they
            establish. Months later, there&apos;s little on the ground to
            photograph. You made the effort, but the evidence is thin, and thin
            evidence is hard to defend if your plan is ever questioned.
          </p>
          <p>
            Now compare supplemental water. You install a trough or a guzzler and
            it just sits there, year-round, obvious and photographable. Nobody has
            to take your word that the project happened, because the proof is on
            the landscape.
          </p>
          <p>
            When you&apos;re weighing two practices, favor the ones that leave
            durable, visible, easy-to-document evidence:
          </p>
          <ul className="list-disc pl-6 space-y-2 marker:text-field-forest">
            <li>
              <strong className="font-semibold text-field-ink">
                Supplemental water
              </strong>{" "}
              (troughs, guzzlers, spring developments) stays visible year-round.
            </li>
            <li>
              <strong className="font-semibold text-field-ink">
                Supplemental shelter
              </strong>{" "}
              (brush piles, nest boxes, half-cuts) is physical and countable.
            </li>
            <li>
              <strong className="font-semibold text-field-ink">
                Erosion control structures
              </strong>{" "}
              (rock check dams, gully plugs) don&apos;t disappear, and many count
              for years.
            </li>
          </ul>
          <p>
            This doesn&apos;t mean you must avoid harder-to-see practices. It means
            your core set should be weighted toward projects that speak for
            themselves.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            3. Match your practices to your property&apos;s features
          </h2>
          <p>
            The best practices aren&apos;t pulled from a checklist. They&apos;re
            the ones that fit the land you actually have.
          </p>
          <ul className="list-disc pl-6 space-y-2 marker:text-field-forest">
            <li>
              Got a creek, seep, or low spot? Water-related practices are a
              natural, lower-cost fit.
            </li>
            <li>
              Managing cedar or heavy brush? Habitat control through selective
              clearing does double duty.
            </li>
            <li>
              Rolling terrain with washing gullies? Erosion control is a perfect
              activity.
            </li>
            <li>
              Thin cover? Supplemental shelter and habitat work complement each
              other.
            </li>
          </ul>
          <p>
            When a practice complements your property&apos;s existing features,
            three good things happen: it costs less, it&apos;s easier to maintain
            year after year, and it produces better outcomes for the wildlife
            you&apos;re supporting. You&apos;re working with the land instead of
            forcing a practice that doesn&apos;t belong there just to check a box.
          </p>
          <p className="font-medium text-field-ink">
            Walk your property first. Then choose.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            4. Make census counts one of your four
          </h2>
          <p>
            Census counts are the most rewarding practice on the list, and one of
            the smartest to include.
          </p>
          <p>
            Where most practices ask you to do work and then prove it, a census
            asks you to go out and observe: spotlight deer surveys, game-camera
            counts, quail call counts, dove or turkey observations. You pick a
            method suited to your target species and record what you see.
          </p>
          <p>Two reasons to make it part of almost any four-practice plan:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-field-forest">
            <li>
              <strong className="font-semibold text-field-ink">
                You get to watch your work pay off.
              </strong>{" "}
              After a few years of good habitat and water management, the results
              start showing up in your numbers &mdash; more individuals, more
              variety of species, healthier populations season over season. Census
              counts turn an abstract compliance obligation into something you can
              actually see improve.
            </li>
            <li>
              <strong className="font-semibold text-field-ink">
                It ties your whole plan together.
              </strong>{" "}
              Your census data becomes the story connecting your other practices:
              you added water and shelter, and here&apos;s the documented wildlife
              response. That&apos;s exactly the kind of narrative that makes an
              annual report stronger.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            A sample four-practice plan
          </h2>
          <p>
            For many Texas landowners, a solid, defensible plan looks like:
          </p>
          <ul className="list-disc pl-6 space-y-2 marker:text-field-forest">
            <li>
              One practice that fits your land&apos;s features and is easy to
              maintain (often water or habitat control).
            </li>
            <li>
              One that leaves obvious physical evidence (supplemental shelter or an
              erosion control structure).
            </li>
            <li>
              One that complements the first two and supports your target species.
            </li>
            <li>
              Census counts, both as your rewarding &ldquo;watch it improve&rdquo;
              practice and your reporting backbone.
            </li>
          </ul>
          <p>
            Four practices, weighted toward the obvious, matched to your property,
            with a built-in cushion so a single setback never threatens your
            valuation.
          </p>

          <h2 className="text-2xl font-semibold text-field-ink pt-6">
            The part landowners underestimate: documentation
          </h2>
          <p>
            Choosing the right practices is only half the job. Proving you carried
            them out is the other half, and it&apos;s where valuations most often
            get shaky. Dated and located photos, receipts, GPS-tagged field
            evidence, and observation logs are what turn &ldquo;we did the
            work&rdquo; into a record that holds up under review.
          </p>
          <p>
            That&apos;s exactly why we built FieldFile: to make logging your
            activities, storing your evidence, and generating your annual report
            the easy part, so choosing good practices is the only decision you
            really have to think hard about.
          </p>
        </div>

        {/* CTA */}
        <aside className="mt-12 rounded-2xl border border-field-wheat bg-field-mist p-6 md:p-8">
          <h2 className="text-xl font-semibold text-field-ink">
            Make documentation the easy part
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
