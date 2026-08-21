import {
  APP_CAPABILITIES,
  APP_CONFIG,
  APP_DESCRIPTION,
  APP_FAQ,
  APP_NAME,
  APP_TAGLINE,
  GITHUB_URL,
  getSiteUrl,
} from "@/config/app";

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Sitewide entities — safe on every indexed page. */
export function SiteJsonLd() {
  const siteUrl = getSiteUrl();
  const logoUrl = `${siteUrl}/icon-512`;

  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": `${siteUrl}/#website`,
            name: APP_NAME,
            url: siteUrl,
            description: APP_DESCRIPTION,
            inLanguage: "en-US",
            publisher: { "@id": `${siteUrl}/#organization` },
          },
          {
            "@type": "Organization",
            "@id": `${siteUrl}/#organization`,
            name: APP_CONFIG.creator.name,
            url: APP_CONFIG.creator.url,
            description: APP_TAGLINE,
            logo: {
              "@type": "ImageObject",
              url: logoUrl,
            },
            sameAs: [APP_CONFIG.creator.url],
          },
          {
            "@type": "SoftwareApplication",
            "@id": `${siteUrl}/#app`,
            name: APP_NAME,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            url: siteUrl,
            description: APP_DESCRIPTION,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: APP_CAPABILITIES.map((feature) => feature.title),
            browserRequirements:
              "Requires a modern web browser with JavaScript enabled",
            publisher: { "@id": `${siteUrl}/#organization` },
            sameAs: [GITHUB_URL],
          },
        ],
      }}
    />
  );
}

/** Homepage-only FAQ rich results — must match visible FAQ content. */
export function FaqJsonLd() {
  const siteUrl = getSiteUrl();

  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        isPartOf: { "@id": `${siteUrl}/#website` },
        mainEntity: APP_FAQ.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }}
    />
  );
}
