import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, getPost, postUrl, formatPostDate } from "@/lib/blog";
import {
  COMMON_REQUIREMENTS,
  GENERAL_VERIFY,
  LAST_VERIFIED,
  STATE_SOURCES,
  WILDLIFE_COUNTIES,
  WILDLIFE_YEAR,
  type SourceLink,
  type VerifyTarget,
  type WildlifeCounty,
} from "@/lib/wildlife-counties";
import { CountySearch } from "@/components/blog/CountySearch";

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
    a: "No. The land must already be appraised as 1-d-1 open space agricultural land before you switch to wildlife management. Hays and Comal also say it must have been qualified in the prior year.",
  },
  {
    q: "How many wildlife management practices do I need each year?",
    a: "At least three of the seven: habitat control, erosion control, predator control, supplemental water, supplemental food, supplemental shelter, and census counts. Hays, Blanco, Llano and Comal are all in the Edwards Plateau ecoregion, so TPWD's Edwards Plateau guidelines set the intensity standards.",
  },
  {
    q: "When is the deadline to apply for wildlife valuation?",
    a: "The statutory deadline is before May 1 of the tax year, so in practice file between January 1 and April 30. Late applications are generally accepted until the appraisal review board approves the appraisal records, with a 10 percent penalty.",
  },
  {
    q: "Do I have to file an annual report every year?",
    a: "It depends on the county. Comal requires an annual report every year once approved. Hays asks for a PWD 888 report by letter for the years it specifies. Blanco asks for a wildlife update every 2 years on a staggered schedule. Llano sends annual update forms to existing wildlife properties.",
  },
  {
    q: "Is there a minimum acreage for wildlife valuation?",
    a: "Only if your tract has been reduced in size since January 1 of the preceding tax year, for example by a split, sale, or new survey. If that happened, your CAD's wildlife use requirement sets the minimum acres. Otherwise there is no minimum.",
  },
  {
    q: "Is it safe to mail my application on the last day?",
    a: "It is risky. Tax Code 1.08 counts a filing as timely if it is postmarked or deposited by the deadline, but USPS postmarks may now be applied days after mailing. File online where available, hand-deliver, or get a certificate of mailing.",
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

const TABLE_COLUMNS: { key: keyof WildlifeCounty["snapshot"]; label: string; verify?: VerifyTarget }[] = [
  { key: "filingDeadline", label: "Filing deadline", verify: "filingDeadline" },
  { key: "minimumAcreage", label: "Minimum acreage rule", verify: "minimumAcreage" },
  { key: "planRenewal", label: "Plan renewal" },
  { key: "reporting", label: "Reporting to the CAD", verify: "reporting" },
  { key: "inspections", label: "Inspections", verify: "inspections" },
  { key: "mainContact", label: "Main contact" },
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

function SourceItem({ source }: { source: SourceLink }) {
  return (
    <li>
      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {source.label}
        </a>
      ) : (
        <span>{source.label} (not available online)</span>
      )}
    </li>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-6 text-2xl font-semibold text-field-ink">
      {children}
    </h2>
  );
}

function CardSubheading({
  children,
  verify,
}: {
  children: React.ReactNode;
  verify?: boolean;
}) {
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

function CountyCard({ county }: { county: WildlifeCounty }) {
  const websiteLabel = county.filing.website.replace(/^https?:\/\//, "");
  return (
    <details
      id={county.slug}
      open
      data-print-expand
      className="group scroll-mt-6 rounded-xl border border-field-wheat bg-white transition-shadow duration-500 data-[highlight=true]:ring-4 data-[highlight=true]:ring-field-gold"
    >
      <summary className="flex cursor-pointer list-none items-start gap-3 rounded-xl px-5 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-field-forest [&::-webkit-details-marker]:hidden">
        <svg
          aria-hidden="true"
          className="mt-1 h-5 w-5 shrink-0 text-field-earth transition-transform duration-200 group-open:rotate-90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <h3 className="text-xl font-semibold text-field-ink">
          {county.name}
          <span className="block text-sm font-normal text-field-earth">
            {county.cadName}
          </span>
        </h3>
      </summary>

      <div className="border-t border-field-wheat/60 px-5 pb-6 pt-2 text-base leading-relaxed text-field-ink/90">
        <CardSubheading>Snapshot</CardSubheading>
        <dl className="mt-2 grid gap-x-4 gap-y-2 sm:grid-cols-[11rem_1fr]">
          <div className="contents">
            <dt className="font-medium text-field-ink">Ecoregion</dt>
            <dd>{county.ecoregion}</dd>
          </div>
          {TABLE_COLUMNS.filter((c) => c.key !== "mainContact").map((col) => (
            <div key={col.key} className="contents">
              <dt className="font-medium text-field-ink">{col.label}</dt>
              <dd>
                {county.snapshot[col.key]}
                {col.verify && hasFlag(county, col.verify) && <VerifyBadge />}
              </dd>
            </div>
          ))}
        </dl>

        <CardSubheading verify={hasFlag(county, "minimumAcreage")}>
          Minimum acreage
        </CardSubheading>
        <Bullets items={county.minimumAcreageDetail} />

        <CardSubheading>What to file</CardSubheading>
        <Bullets items={county.application} />

        <CardSubheading verify={hasFlag(county, "standards")}>
          What is unique here
        </CardSubheading>
        <Bullets items={county.uniqueRequirements} />

        <CardSubheading verify={hasFlag(county, "reporting")}>
          Reporting
        </CardSubheading>
        <Bullets items={county.reporting} />

        <CardSubheading verify={hasFlag(county, "inspections")}>
          Inspections
        </CardSubheading>
        <Bullets items={county.inspections} />

        <CardSubheading verify={hasFlag(county, "filingDeadline")}>
          Where and how to file
        </CardSubheading>
        <Bullets items={county.filing.notes} />
        <dl className="mt-3 grid gap-x-4 gap-y-1 rounded-lg bg-field-mist p-4 text-sm sm:grid-cols-[8rem_1fr]">
          <dt className="font-medium text-field-ink">Address</dt>
          <dd>{county.filing.address}</dd>
          {county.filing.mailingAddress && (
            <>
              <dt className="font-medium text-field-ink">Mailing</dt>
              <dd>{county.filing.mailingAddress}</dd>
            </>
          )}
          <dt className="font-medium text-field-ink">Phone</dt>
          <dd>
            <a href={`tel:+1${county.filing.phone.replace(/\D/g, "")}`} className={linkClass}>
              {county.filing.phone}
            </a>
          </dd>
          {county.filing.fax && (
            <>
              <dt className="font-medium text-field-ink">Fax</dt>
              <dd>{county.filing.fax}</dd>
            </>
          )}
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
          <dt className="font-medium text-field-ink">Website</dt>
          <dd>
            <a href={county.filing.website} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {websiteLabel}
            </a>
          </dd>
        </dl>
        <p className="mt-3 text-sm font-medium text-field-ink">Forms</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm marker:text-field-forest">
          {county.filing.forms.map((f) =>
            f.url ? (
              <li key={f.label}>
                <a href={f.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {f.label}
                </a>
              </li>
            ) : (
              <li key={f.label}>{f.label}</li>
            )
          )}
        </ul>

        {county.verifyFlags.length > 0 && (
          <div className="mt-6 rounded-lg border border-field-terra/40 bg-field-cream p-4 text-sm">
            <p className="font-semibold text-field-ink">Verify with the CAD</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-field-terra">
              {county.verifyFlags.map((f) => (
                <li key={f.note}>{f.note}</li>
              ))}
            </ul>
          </div>
        )}

        <CardSubheading>Sources</CardSubheading>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm marker:text-field-forest">
          {county.sources.map((s) => (
            <SourceItem key={s.label} source={s} />
          ))}
        </ul>
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
        {/* Breadcrumb */}
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
        <header className="mb-8">
          <h1 className="text-3xl font-bold leading-tight text-field-ink md:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-field-earth">
            What each county appraisal district asks for to get and keep
            wildlife management valuation, with every source linked.
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
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-field-ink/90">
            <p>
              The state sets the wildlife valuation rules, but your county
              appraisal district decides how to apply them, so a neighbor one
              county over may file different paperwork on a different schedule.
              FieldFile was built by a Texas landowner who went through this
              process herself in Hays County, and this is the guide we wish we
              had. Find your county below, see what it asks for, and check
              anything we flagged with the CAD directly.
            </p>
          </div>
        </header>

        <CountySearch />

        <div className="mt-12 space-y-14 text-lg leading-relaxed text-field-ink/90">
          {/* At a glance */}
          <section aria-labelledby="at-a-glance">
            <SectionHeading id="at-a-glance">At a glance</SectionHeading>
            <p className="mt-3 text-base text-field-earth">
              Tap a county name to jump to its full card. On a phone, swipe the
              table sideways.
            </p>
            <div
              role="region"
              aria-labelledby="at-a-glance"
              tabIndex={0}
              className="mt-4 overflow-x-auto rounded-xl border border-field-wheat bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-field-forest"
            >
              <table className="w-full min-w-[56rem] border-collapse print:min-w-0 text-left text-sm">
                <caption className="sr-only">
                  Wildlife valuation requirements by county
                </caption>
                <thead className="bg-field-mist text-field-ink">
                  <tr>
                    <th
                      scope="col"
                      className="sticky left-0 z-10 bg-field-mist px-4 py-3 font-semibold"
                    >
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
                        className="sticky left-0 z-10 w-28 bg-white px-4 py-3 font-semibold shadow-[1px_0_0_theme(colors.field.wheat)]"
                      >
                        <a href={`#${county.slug}`} className={linkClass}>
                          {county.name.replace(" County", "")}
                        </a>
                      </th>
                      {TABLE_COLUMNS.map((col) => (
                        <td key={col.key} className="min-w-[10rem] px-4 py-3 text-field-ink/90">
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

          {/* Common requirements */}
          <section aria-labelledby="common-requirements">
            <SectionHeading id="common-requirements">
              Requirements that apply in every county
            </SectionHeading>
            <p className="mt-3">
              These come from state law and apply in Hays, Blanco, Llano and
              Comal alike.
            </p>
            <ul className="mt-5 space-y-4">
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
                  <div>
                    <p className="font-semibold text-field-ink">
                      {req.title}
                      {req.verify && <VerifyBadge />}
                    </p>
                    <p className="mt-1 text-base">{req.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Timeline */}
          <section aria-labelledby="timeline">
            <SectionHeading id="timeline">Your year at a glance</SectionHeading>
            <ol className="mt-6 border-l-2 border-field-wheat">
              {WILDLIFE_YEAR.map((entry) => (
                <li key={entry.when} className="relative pb-8 pl-6 last:pb-0">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-field-cream bg-field-forest"
                  />
                  <p className="text-sm font-semibold uppercase tracking-wide text-field-earth">
                    {entry.when}
                  </p>
                  <p className="mt-1 font-semibold text-field-ink">{entry.title}</p>
                  <p className="mt-1 text-base">{entry.detail}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* County cards */}
          <section aria-labelledby="counties">
            <SectionHeading id="counties">County by county</SectionHeading>
            <p className="mt-3">
              Each card collapses if you want a shorter page. Items marked{" "}
              <VerifyBadge /> are things we could not confirm from the CAD&apos;s
              published documents.
            </p>
            <div className="mt-6 space-y-6">
              {WILDLIFE_COUNTIES.map((county) => (
                <CountyCard key={county.slug} county={county} />
              ))}
            </div>
          </section>

          {/* How FieldFile helps */}
          <section aria-labelledby="how-fieldfile-helps">
            <SectionHeading id="how-fieldfile-helps">How FieldFile helps</SectionHeading>
            <div className="mt-3 space-y-4">
              <p>
                Every county above asks some version of the same question: what
                did you do, where, and when, and can you prove it. FieldFile is
                built around that question.
              </p>
              <ul className="list-disc space-y-2 pl-6 marker:text-field-forest">
                <li>
                  <strong className="font-semibold text-field-ink">Activity log.</strong>{" "}
                  Record each activity under the practice it counts toward, with
                  the date, cost, and notes. That is the dated log Hays asks for
                  at inspection and Blanco asks for on its update form.
                </li>
                <li>
                  <strong className="font-semibold text-field-ink">Map.</strong>{" "}
                  Pin where each practice happened on your property map, the
                  placement map Blanco requires and Hays recommends.
                </li>
                <li>
                  <strong className="font-semibold text-field-ink">Photos and receipts.</strong>{" "}
                  Attach them to the activity they prove, so they are ready for an
                  audit even in a county that tells you not to send them.
                </li>
                <li>
                  <strong className="font-semibold text-field-ink">Annual report.</strong>{" "}
                  FieldFile prepares a PWD 888 annual report from what you
                  logged, for the years your CAD asks about.
                </li>
              </ul>
              <p>
                FieldFile prepares the paperwork. You review it, sign it, and
                submit it to your CAD. It does not replace checking your
                county&apos;s current rules.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 print:hidden">
              <Link
                href="/signup"
                className="rounded-lg bg-field-forest px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-field-forest/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-field-forest focus-visible:ring-offset-2"
              >
                Get Started
              </Link>
              <Link
                href="/how-it-works"
                className="px-2 py-2.5 text-sm font-medium text-field-forest hover:underline"
              >
                See how it works
              </Link>
              <Link
                href="/pricing"
                className="px-2 py-2.5 text-sm font-medium text-field-forest hover:underline"
              >
                Pricing
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section aria-labelledby="faq">
            <SectionHeading id="faq">Frequently asked questions</SectionHeading>
            <dl className="mt-5 space-y-6">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <dt className="font-semibold text-field-ink">{f.q}</dt>
                  <dd className="mt-1 text-base">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* What we could not confirm */}
          <section
            aria-labelledby="not-confirmed"
            className="rounded-2xl border border-field-terra/40 bg-white p-6"
          >
            <h2 id="not-confirmed" className="scroll-mt-6 text-xl font-semibold text-field-ink">
              What we could not confirm
            </h2>
            <p className="mt-2 text-base">
              Call or check with the CAD before relying on these.
            </p>
            <ul className="mt-4 space-y-3 text-base">
              {WILDLIFE_COUNTIES.filter((c) => c.verifyFlags.length > 0).map((c) => (
                <li key={c.slug}>
                  <a href={`#${c.slug}`} className="font-semibold text-field-ink hover:text-field-forest hover:underline">
                    {c.name}
                  </a>
                  <ul className="mt-1 list-disc space-y-1 pl-5 marker:text-field-terra">
                    {c.verifyFlags.map((f) => (
                      <li key={f.note}>{f.note}</li>
                    ))}
                  </ul>
                </li>
              ))}
              <li>
                <span className="font-semibold text-field-ink">All counties</span>
                <ul className="mt-1 list-disc space-y-1 pl-5 marker:text-field-terra">
                  {GENERAL_VERIFY.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </li>
            </ul>
            <p className="mt-4 text-base">
              Know something we missed?{" "}
              <a href={CORRECTION_MAILTO} className={linkClass}>
                Report a correction
              </a>
              .
            </p>
          </section>

          {/* Sources and disclaimer */}
          <section aria-labelledby="sources">
            <SectionHeading id="sources">Sources</SectionHeading>
            <h3 className="mt-4 font-semibold text-field-ink">State</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-base marker:text-field-forest">
              {STATE_SOURCES.map((s) => (
                <SourceItem key={s.label} source={s} />
              ))}
            </ul>
            {WILDLIFE_COUNTIES.map((c) => (
              <div key={c.slug}>
                <h3 className="mt-5 font-semibold text-field-ink">{c.name}</h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-base marker:text-field-forest">
                  {c.sources.map((s) => (
                    <SourceItem key={s.label} source={s} />
                  ))}
                </ul>
              </div>
            ))}
            <p className="mt-8 rounded-lg border border-field-wheat bg-field-mist px-5 py-4 text-sm text-field-ink/80">
              This is general information, not legal or tax advice. Appraisal
              district rules change, and each CAD can update its guidelines at
              any time. Confirm your requirements with your county appraisal
              district before you file. Last verified {lastVerified}.
            </p>
          </section>
        </div>

        <div className="mt-10 print:hidden">
          <Link href="/blog" className="text-sm text-field-forest hover:underline">
            &larr; Back to all articles
          </Link>
        </div>
      </div>
    </article>
  );
}
