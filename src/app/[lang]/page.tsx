import type { Metadata } from "next"
import {
   getAlternates,
   getDictionary,
   isLocale,
   defaultLocale,
   ogLocale,
   otherLocale,
   SITE_URL,
} from "@/lib/landing/i18n"
import JsonLd from "@/components/landing/JsonLd"
import Hero from "@/components/landing/Hero"
import Timeline from "@/components/landing/Timeline"
import CustomerStories from "@/components/landing/CustomerStories"
import ScheduleDemo from "@/components/landing/ScheduleDemo"
import FaqSection from "@/components/landing/FaqSection"

export async function generateMetadata({
   params,
}: {
   params: Promise<{ lang: string }>
}): Promise<Metadata> {
   const { lang } = await params
   const locale = isLocale(lang) ? lang : defaultLocale
   const dict = getDictionary(locale)

   return {
      metadataBase: new URL(SITE_URL),
      title: dict.meta.title,
      description: dict.meta.description,
      keywords: dict.meta.keywords,
      alternates: getAlternates(locale),
      openGraph: {
         type: "website",
         siteName: "La Muralla",
         locale: ogLocale[locale],
         alternateLocale: ogLocale[otherLocale(locale)],
         url: `${SITE_URL}/${locale}`,
         title: dict.meta.ogTitle,
         description: dict.meta.ogDescription,
         images: [{ url: "/logo.png", width: 600, height: 600, alt: "La Muralla" }],
      },
      twitter: {
         card: "summary_large_image",
         title: dict.meta.ogTitle,
         description: dict.meta.ogDescription,
         images: ["/logo.png"],
      },
      robots: { index: true, follow: true },
   }
}

export default async function LandingPage({
   params,
}: {
   params: Promise<{ lang: string }>
}) {
   const { lang } = await params
   const locale = isLocale(lang) ? lang : defaultLocale
   const dict = getDictionary(locale)

   return (
      <main id="contenido">
         <JsonLd dict={dict} locale={locale} />
         <Hero dict={dict} lang={locale} />
         <Timeline dict={dict} />
         <CustomerStories dict={dict} />
         <ScheduleDemo dict={dict} lang={locale} />
         <FaqSection dict={dict} />
      </main>
   )
}
