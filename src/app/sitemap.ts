import type { MetadataRoute } from "next"
import { locales, SITE_URL } from "@/lib/landing/i18n"

// Only canonical, indexable, 200 URLs (the /es and /en landing variants), each
// declaring its language alternates.
export default function sitemap(): MetadataRoute.Sitemap {
   const lastModified = new Date()
   return locales.map((lang) => ({
      url: `${SITE_URL}/${lang}`,
      lastModified,
      changeFrequency: "monthly",
      priority: lang === "es" ? 1 : 0.9,
      alternates: {
         languages: {
            es: `${SITE_URL}/es`,
            en: `${SITE_URL}/en`,
         },
      },
   }))
}
