import type { MetadataRoute } from "next";
import { BLOG_POSTS, SITE_URL } from "@/lib/blog";

// Public marketing routes worth surfacing to search engines.
const MARKETING_ROUTES = [
  "",
  "/services",
  "/pricing",
  "/how-it-works",
  "/faq",
  "/about",
  "/blog",
  "/request-availability",
  "/quiz",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const marketing: MetadataRoute.Sitemap = MARKETING_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const posts: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.dateModified ?? post.datePublished,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...marketing, ...posts];
}
