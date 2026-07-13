// Blog post metadata. Single source of truth for the index, article pages,
// and sitemap. To add a post: append an entry here and create a matching
// `app/(marketing)/blog/<slug>/page.tsx`.

export const SITE_URL = "https://www.fieldfile.com";

export type BlogPost = {
  slug: string;
  /** H1 and <title> */
  title: string;
  /** meta description */
  description: string;
  /** short summary shown on the /blog index card */
  excerpt: string;
  /** primary keyword this post targets */
  primaryKeyword: string;
  keywords: string[];
  /** ISO date (YYYY-MM-DD) */
  datePublished: string;
  dateModified?: string;
  readingTime: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "choosing-texas-wildlife-management-practices",
    title:
      "How to Choose Your Texas Wildlife Management Practices (1-d-1-w Guide)",
    description:
      "Learn how to choose the right wildlife management practices for your Texas 1-d-1-w valuation, how many you need each year, and how to stay audit-ready.",
    excerpt:
      "Texas requires at least three of the seven wildlife management practices every year. Here's how to pick ones that protect your valuation, fit your land, and are easy to prove at audit time.",
    primaryKeyword: "Texas wildlife management practices",
    keywords: [
      "Texas wildlife management practices",
      "1-d-1-w",
      "wildlife exemption Texas",
      "how many wildlife management practices",
      "wildlife management plan Texas",
      "wildlife tax valuation",
    ],
    datePublished: "2026-07-13",
    dateModified: "2026-07-13",
    readingTime: "6 min read",
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** Absolute canonical URL for a post. */
export function postUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}

/** Human-readable date, e.g. "July 13, 2026". Deterministic (UTC) for SSR. */
export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
