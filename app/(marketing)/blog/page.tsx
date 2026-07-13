import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS, SITE_URL, formatPostDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "FieldFile Blog — Texas Wildlife Management & 1-d-1-w Guides",
  description:
    "Practical guides for Texas landowners on wildlife management practices, 1-d-1-w valuations, documentation, and staying audit-ready.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/blog`,
    siteName: "FieldFile",
    title: "FieldFile Blog — Texas Wildlife Management & 1-d-1-w Guides",
    description:
      "Practical guides for Texas landowners on wildlife management practices, 1-d-1-w valuations, documentation, and staying audit-ready.",
  },
};

// Newest first. String compare is safe for ISO YYYY-MM-DD dates.
const posts = [...BLOG_POSTS].sort((a, b) =>
  b.datePublished.localeCompare(a.datePublished)
);

export default function BlogIndexPage() {
  return (
    <div className="bg-field-cream">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-field-ink">
            FieldFile Blog
          </h1>
          <p className="mt-3 text-lg text-field-earth">
            Practical guides for Texas landowners on wildlife management
            practices, 1-d-1-w valuations, and staying audit-ready.
          </p>
        </header>

        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <article className="bg-white border border-field-wheat rounded-xl p-6 transition-colors hover:border-field-forest/50">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-field-earth">
                  <time dateTime={post.datePublished}>
                    {formatPostDate(post.datePublished)}
                  </time>
                  <span aria-hidden="true">&middot;</span>
                  <span>{post.readingTime}</span>
                </div>
                <h2 className="mt-2 text-xl font-semibold text-field-ink">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-field-forest"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 text-field-ink/80">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-4 inline-block text-sm font-medium text-field-forest hover:underline"
                >
                  Read more &rarr;
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
