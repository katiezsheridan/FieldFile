import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog";
import { cn } from "@/lib/utils";

// Newest first. String compare is safe for ISO YYYY-MM-DD dates.
const posts = [...BLOG_POSTS].sort((a, b) =>
  b.datePublished.localeCompare(a.datePublished)
);

/**
 * Compact list of all article titles for cross-navigation. Rendered in a
 * sidebar on /blog and (optionally) alongside article pages. Pass the active
 * article's `currentSlug` to highlight it.
 */
export function BlogSidebar({ currentSlug }: { currentSlug?: string }) {
  return (
    <nav
      aria-label="All articles"
      className="rounded-xl border border-field-wheat bg-white p-5"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-field-earth">
        All articles
      </h2>
      <ul className="mt-4 space-y-3">
        {posts.map((post) => {
          const isCurrent = post.slug === currentSlug;
          return (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "block text-sm leading-snug transition-colors hover:text-field-forest",
                  isCurrent
                    ? "font-semibold text-field-forest"
                    : "text-field-ink/80"
                )}
              >
                {post.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
