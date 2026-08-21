import type { MetadataRoute } from "next";
import { EXAMPLE_GALLERY, getSiteUrl } from "@/config/app";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  // Arbitrary /tx/[chain]/[hash] pages stay out of the index — anyone can
  // generate one from any hash, and indexing all of them would look like
  // thin, auto-generated content. The curated gallery examples are
  // permanent, useful, and worth the SEO value, so allow just those.
  // Longest-match-wins in the robots.txt spec, so these specific Allow
  // entries take priority over the broader "/tx/" Disallow below.

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          ...EXAMPLE_GALLERY.map((item) => `/tx/${item.chain}/${item.hash}`),
        ],
        // Dynamic tx result URLs are shareable but intentionally noindex
        // (infinite URL space / thin duplicate content). Keep them out of crawls.
        disallow: ["/api/", "/tx/", "/internal/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
