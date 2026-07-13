import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/blog";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated app areas — no useful content for crawlers.
      disallow: [
        "/api/",
        "/dashboard",
        "/setup",
        "/properties",
        "/plan",
        "/file",
        "/sign-in",
        "/sign-up",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
