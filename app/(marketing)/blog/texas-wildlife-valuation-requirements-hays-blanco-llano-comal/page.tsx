import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, getPost, postUrl, formatPostDate } from "@/lib/blog";
import {
  COMMON_REQUIREMENTS,
  LAST_VERIFIED,
  STATE_SOURCES,
  WILDLIFE_COUNTIES,
  WILDLIFE_YEAR,
  type SourceLink,
  type VerifyTarget,
  type WildlifeCounty,
} from "@/lib/wildlife-counties";
import { CountySearch } from "@/components/blog/CountySearch";
import { BackToTop } from "@/components/blog/BackToTop";

const SLUG = "texas-wildlife-valuation-requirements-hays-blanco-llano-comal";
const post = getPost(SLUG)!;
const url = postUrl(SLUG);

// The H1 is too long for a <title>; search results get this shorter one.
const SEO_TITLE = "Texas Wildlife Valuation Rules: Hays, Blanco, Llano, Comal";

const CORRECTION_MAILTO =
  "mailto:katie@fieldfile.com?subject=" +
  encodeURIComponent("Correction: wildlife valuation county requirements");

const linkClass =
  "text-field-forest underline underline-offset-2 hover:text-field-forest/80";

type Faq = { q: string; a: string };

const FAQS: Faq[] = [
  {
    q: "Can wildlife management be the first use that qualifies my land?",
    a: "No. The land must already have 1-d-1 agricultural valuation. Hays and Comal also want it qualified the prior year.",
  },
  {
    q: "How many practices do I need each year?",
    a: "At least three of the seven. All four counties use TPWD's Edwards Plateau intensity standards.",
  },
  {
    q: "When is the deadline?",
    a: "April 30. Late filings are generally accepted until the appraisal records are approved, with a 10 percent penalty.",
  },
  {
    q: "Do I file an annual report every year?",
    a: "Depends on the county. Comal: every year. Hays: when it sends a letter. Blanco: every 2 years by last name. Llano: annual update forms.",
  },
  {
    q: "Is there a minimum acreage?",
    a: "Only if your tract got smaller (split, sale, or resurvey) since January 1 of the prior year. Then the CAD's wildlife use requirement sets the minimum.",
  },
  {
    q: "Can I mail my application on the last day?",
    a: "It is risky. Postmarks can lag days behind mailing. File online, hand-deliver, or get a certificate of mailing.",
  },
];

export const metadata: Metadata = {
  title: SEO_TITLE,
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

// Structured data: BlogPosting (an Article subtype) + BreadcrumbList + FAQPage.
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
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

const TABLE_COLUMNS: {
  key: keyof WildlifeCounty["snapshot"];
  label: string;
  verify?: VerifyTarget;
}[] = [
  { key: "filingDeadline", label: "Filing deadline" },
  { key: "minimumAcreage", label: "Minimum acreage", verify: "minimumAcreage" },
  { key: "planRenewal", label: "Plan renewal" },
  { key: "reporting", label: "Reporting", verify: "reporting" },
  { key: "inspections", label: "Inspections", verify: "inspections" },
  { key: "mainContact", label: "Phone" },
];

function hasFlag(county: WildlifeCounty, target: VerifyTarget) {
  return county.verifyFlags.some((f) => f.target === target);
}

function VerifyBadge() {
  return (
    <span className="ml-1 inline-flex items-center whitespace-nowrap rounded-full border border-field-terra/60 bg-white px-2 py-0.5 align-middle text-xs font-semibold text-field-terra">
      Confirm with the CAD
    </span>
  );
}

function ExternalLink({ source }: { source: SourceLink }) {
  return source.url ? (
    <a href={source.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {source.label}
    </a>
  ) : (
    <span>{source.label}</span>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-6 text-2xl font-semibold text-field-ink">
      {children}
    </h2>
  );
}

function CardSubheading({ children, verify }: { children: React.ReactNode; verify?: boolean }) {
  return (
    <h4 className="mt-6 text-base font-semibold text-field-ink">
      {children}
      {verify && <VerifyBadge />}
    </h4>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 list-disc space-y-1.5 pl-5 marker:text-field-forest">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Chevron({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CountyCard({ county }: { county: WildlifeCounty }) {
  const shortName = county.name.replace(" County", "");
  return (
    <details
      id={county.slug}
      data-print-expand
      className="group scroll-mt-6 rounded-xl border border-field-wheat bg-white transition-shadow duration-500 data-[highlight=true]:ring-4 data-[highlight=true]:ring-field-gold"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-field-forest [&::-webkit-details-marker]:hidden">
        <h3 className="text-xl font-semibold text-field-ink">
          {county.name}
          <span className="block text-sm font-normal text-field-earth">{county.cadName}</span>
        </h3>
        <Chevron className="h-5 w-5 shrink-0 text-field-ink/40 transition-transform group-open:rotate-180" />
      </summary>

      <div className="border-t border-field-wheat/60 px-5 pb-6 pt-1 text-base leading-relaxed text-field-ink/90">
        <CardSubheading>What to file</CardSubheading>
        <Bullets items={county.application} />

        <CardSubheading verify={hasFlag(county, "standards")}>
          Unique to {shortName}
        </CardSubheading>
        <Bullets items={county.uniqueRequirements} />

        <CardSubheading verify={hasFlag(county, "reporting")}>Reporting</CardSubheading>
        <Bullets items={county.reporting} />

        <CardSubheading verify={hasFlag(county, "inspections")}>Inspections</CardSubheading>
        <Bullets items={county.inspections} />

        <div className="mt-6 rounded-lg border border-field-forest/20 bg-field-forest/5 p-4">
          <h4 className="font-semibold text-field-ink">How FieldFile helps in {shortName}</h4>
          <Bullets items={county.fieldfileHelps} />
        </div>

        <CardSubheading>Contact and forms</CardSubheading>
        <dl className="mt-2 grid gap-x-4 gap-y-1 rounded-lg bg-field-mist p-4 text-sm sm:grid-cols-[6rem_1fr]">
          <dt className="font-medium text-field-ink">Address</dt>
          <dd>
            {county.filing.address}
            {county.filing.mailingAddress && (
              <span className="block">Mail: {county.filing.mailingAddress}</span>
            )}
          </dd>
          <dt className="font-medium text-field-ink">Phone</dt>
          <dd>
            <a href={`tel:+1${county.filing.phone.replace(/\D/g, "")}`} className={linkClass}>
              {county.filing.phone}
            </a>
            {county.filing.fax && <span> (fax {county.filing.fax})</span>}
          </dd>
          {county.filing.email && (
            <>
              <dt className="font-medium text-field-ink">Email</dt>
              <dd className="break-all">
                <a href={`mailto:${county.filing.email}`} className={linkClass}>
                  {county.filing.email}
                </a>
              </dd>
            </>
          )}
          {county.filing.hours && (
            <>
              <dt className="font-medium text-field-ink">Hours</dt>
              <dd>{county.filing.hours}</dd>
            </>
          )}
          <dt className="font-medium text-field-ink">Online</dt>
          <dd>
            <a href={county.filing.website} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {county.filing.website.replace(/^https?:\/\//, "")}
            </a>
            {county.filing.forms.map((f) => (
              <span key={f.label}>
                {" · "}
                <ExternalLink source={f} />
              </span>
            ))}
          </dd>
        </dl>

        <p className="mt-4 text-sm text-field-earth">
          Sources{hasFlag(county, "sources") && <VerifyBadge />}:{" "}
          {county.sources.map((s, i) => (
            <span key={s.label}>
              {i > 0 && "; "}
              <ExternalLink source={s} />
            </span>
          ))}
        </p>
      </div>
    </details>
  );
}

export default function WildlifeCountyRequirementsPost() {
  const lastVerified = formatPostDate(LAST_VERIFIED);

  return (
    <article className="wildlife-guide bg-field-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-field-earth print:hidden">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-field-forest hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/blog" className="hover:text-field-forest hover:underline">
                Blog
              </Link>
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <header>
          <h1 tabIndex={-1} className="text-3xl font-bold leading-tight text-field-ink focus:outline-none md:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-field-earth">
            What each county appraisal district asks for to get and keep
            wildlife valuation.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-field-earth">
            <span>
              Last verified:{" "}
              <time dateTime={LAST_VERIFIED} className="font-medium text-field-ink">
                {lastVerified}
              </time>
            </span>
            <span aria-hidden="true">&middot;</span>
            <span>{post.readingTime}</span>
            <span aria-hidden="true">&middot;</span>
            <a href={CORRECTION_MAILTO} className={linkClass}>
              Report a correction
            </a>
          </div>
          <p className="mt-6 text-lg leading-relaxed text-field-ink/90">
            Texas sets the rules, but each county appraisal district applies
            them its own way. FieldFile was built by a Texas landowner who went
            through this herself in Hays County. Start with what every county
            requires, then find yours.
          </p>
        </header>

        <div className="mt-12 space-y-14 text-lg leading-relaxed text-field-ink/90">
          {/* Common requirements */}
          <section aria-labelledby="common-requirements">
            <SectionHeading id="common-requirements">What every county requires</SectionHeading>
            <ul className="mt-5 grid gap-x-8 gap-y-4 md:grid-cols-2">
              {COMMON_REQUIREMENTS.map((req) => (
                <li key={req.title} className="flex gap-3">
                  <svg
                    aria-hidden="true"
                    className="mt-1 h-5 w-5 shrink-0 text-field-forest"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div className="text-base">
                    <p className="font-semibold text-field-ink">
                      {req.title}
                      {req.verify && <VerifyBadge />}
                    </p>
                    <p className="mt-0.5">{req.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <CountySearch />

          {/* At a glance */}
          <section aria-labelledby="at-a-glance">
            <SectionHeading id="at-a-glance">Compare counties</SectionHeading>
            <div
              role="region"
              aria-labelledby="at-a-glance"
              tabIndex={0}
              className="mt-4 overflow-x-auto rounded-xl border border-field-wheat bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-field-forest"
            >
              <table className="w-full min-w-[52rem] border-collapse text-left text-sm print:min-w-0">
                <caption className="sr-only">Wildlife valuation requirements by county</caption>
                <thead className="bg-field-mist text-field-ink">
                  <tr>
                    <th scope="col" className="sticky left-0 z-10 bg-field-mist px-4 py-3 font-semibold">
                      County
                    </th>
                    {TABLE_COLUMNS.map((col) => (
                      <th key={col.key} scope="col" className="px-4 py-3 font-semibold">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {WILDLIFE_COUNTIES.map((county) => (
                    <tr key={county.slug} className="border-t border-field-wheat align-top">
                      <th
                        scope="row"
                        className="sticky left-0 z-10 w-24 bg-white px-4 py-3 font-semibold shadow-[1px_0_0_theme(colors.field.wheat)]"
                      >
                        <a href={`#${county.slug}`} className={linkClass}>
                          {county.name.replace(" County", "")}
                        </a>
                      </th>
                      {TABLE_COLUMNS.map((col) => (
                        <td key={col.key} className="min-w-[9rem] px-4 py-3 text-field-ink/90">
                          {county.snapshot[col.key]}
                          {col.verify && hasFlag(county, col.verify) && (
                            <span className="mt-1 block">
                              <VerifyBadge />
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* County cards */}
          <section aria-labelledby="counties">
            <SectionHeading id="counties">County by county</SectionHeading>
            <div className="mt-6 space-y-6">
              {WILDLIFE_COUNTIES.map((county) => (
                <CountyCard key={county.slug} county={county} />
              ))}
            </div>
          </section>

          {/* Timeline */}
          <section aria-labelledby="timeline">
            <SectionHeading id="timeline">Your year</SectionHeading>
            <ol className="mt-6 border-l-2 border-field-wheat text-base">
              {WILDLIFE_YEAR.map((entry) => (
                <li key={entry.when} className="relative pb-6 pl-6 last:pb-0">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-field-cream bg-field-forest"
                  />
                  <p>
                    <span className="font-semibold text-field-ink">
                      {entry.when}: {entry.title}.
                    </span>{" "}
                    {entry.detail}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* CTA */}
          <aside className="rounded-2xl border border-field-wheat bg-field-mist p-6 md:p-8 print:hidden">
            <h2 className="text-xl font-semibold text-field-ink">Keep it all in one place</h2>
            <p className="mt-2 text-base text-field-ink/80">
              Log activities, pin them on a map, attach photos and receipts, and
              let FieldFile prepare your annual report. You review, sign, and
              submit it to your CAD.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-lg bg-field-forest px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-field-forest/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-field-forest focus-visible:ring-offset-2"
              >
                Get Started
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-lg border border-field-forest px-5 py-2.5 text-sm font-medium text-field-forest transition-colors hover:bg-field-forest/10"
              >
                See how it works
              </Link>
            </div>
          </aside>

          {/* FAQ: same card + chevron look as /faq, as native <details> so
              answers stay in the server-rendered HTML for crawlers. */}
          <section aria-labelledby="faq">
            <SectionHeading id="faq">FAQ</SectionHeading>
            <div className="mt-5 space-y-3">
              {FAQS.map((f) => (
                <details
                  key={f.q}
                  data-print-expand
                  className="group overflow-hidden rounded-xl border border-field-wheat bg-white"
                >
                  <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-field-forest [&::-webkit-details-marker]:hidden">
                    <span className="text-base font-medium text-field-ink">{f.q}</span>
                    <Chevron className="h-5 w-5 flex-shrink-0 text-field-ink/40 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-base text-field-ink/70">{f.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Sources and disclaimer */}
          <section aria-labelledby="sources">
            <SectionHeading id="sources">State sources</SectionHeading>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-base marker:text-field-forest">
              {STATE_SOURCES.map((s) => (
                <li key={s.label}>
                  <ExternalLink source={s} />
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-field-earth">County sources are listed in each county card.</p>
            <p className="mt-8 rounded-lg border border-field-wheat bg-field-mist px-5 py-4 text-sm text-field-ink/80">
              General information, not legal or tax advice. Rules change, so
              confirm with your county appraisal district before you file. Last
              verified {lastVerified}.{" "}
              <a href={CORRECTION_MAILTO} className={linkClass}>
                Report a correction
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-10 print:hidden">
          <Link href="/blog" className="text-sm text-field-forest hover:underline">
            &larr; Back to all articles
          </Link>
        </div>
      </div>

      <BackToTop />
    </article>
  );
}
