import { SITE_URL, type Dictionary, type Locale } from "@/lib/landing/i18n"

// Structured data (JSON-LD). Every field mirrors content visible on the page.
// No ratings/offers are fabricated. Injected server-side so it's in the initial
// HTML for crawlers and AI search.
export default function JsonLd({ dict, locale }: { dict: Dictionary; locale: Locale }) {
   const url = `${SITE_URL}/${locale}`

   const graph = [
      {
         "@type": "Organization",
         "@id": `${SITE_URL}/#organization`,
         name: "Cartagena Corporation",
         url: SITE_URL,
         description: dict.jsonLd.orgDescription,
         logo: `${SITE_URL}/logo.png`,
      },
      {
         "@type": "WebSite",
         "@id": `${SITE_URL}/#website`,
         url,
         name: "La Muralla",
         inLanguage: locale,
         publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
         "@type": "SoftwareApplication",
         "@id": `${SITE_URL}/#software`,
         name: dict.jsonLd.appName,
         applicationCategory: dict.jsonLd.appCategory,
         operatingSystem: "Web",
         description: dict.jsonLd.appDescription,
         url,
         inLanguage: locale,
         publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
         "@type": "FAQPage",
         "@id": `${url}#faq`,
         inLanguage: locale,
         mainEntity: dict.faq.items.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
         })),
      },
   ]

   const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
      /</g,
      "\\u003c",
   )

   return (
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
   )
}
