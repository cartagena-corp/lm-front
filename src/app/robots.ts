import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/landing/i18n"

// Crawlable by default (CSS/JS under /_next is never blocked). The private,
// auth-gated app sections are excluded from crawl; the public landing is open.
export default function robots(): MetadataRoute.Robots {
   return {
      rules: [
         {
            userAgent: "*",
            allow: "/",
            disallow: ["/tableros", "/config", "/factory", "/gemini", "/dev", "/login/callback"],
         },
      ],
      sitemap: `${SITE_URL}/sitemap.xml`,
      host: SITE_URL,
   }
}
