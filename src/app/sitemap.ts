import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/app";

/**
 * Only indexable marketing URLs belong here.
 * `/tx/[chain]/[hash]` pages are noindex + robots-disallowed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return [
    {
      url: siteUrl,
      // Stable signal — avoid churning lastmod on every request.
      lastModified: new Date("2026-08-21"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
