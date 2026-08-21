import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/app";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Dynamic tx result URLs are shareable but intentionally noindex
        // (infinite URL space / thin duplicate content). Keep them out of crawls.
        disallow: ["/api/", "/tx/", "/internal/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
