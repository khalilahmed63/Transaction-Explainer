import {
  APP_CAPABILITIES,
  APP_CONFIG,
  APP_DESCRIPTION,
  APP_FAQ,
  APP_NAME,
  APP_TAGLINE,
  getSiteUrl,
} from "@/config/app";

export function JsonLd() {
  const siteUrl = getSiteUrl();

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: siteUrl,
    description: APP_DESCRIPTION,
    inLanguage: "en-US",
  };

  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
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
    browserRequirements: "Requires a modern web browser with JavaScript enabled",
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_CONFIG.creator.name,
    url: APP_CONFIG.creator.url,
    description: APP_TAGLINE,
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: APP_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}
