import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Container } from "@/components/landing/primitives"
import { getDictionary, isLocale, defaultLocale, SITE_URL } from "@/lib/landing/i18n"

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
      title: `${dict.legalPage.title} | La Muralla`,
      description: dict.legalPage.intro,
      alternates: { canonical: `${SITE_URL}/${locale}/legal` },
      // Template/legal placeholder — kept out of the index until finalized.
      robots: { index: false, follow: true },
   }
}

export default async function LegalPage({ params }: { params: Promise<{ lang: string }> }) {
   const { lang } = await params
   const locale = isLocale(lang) ? lang : defaultLocale
   const lp = getDictionary(locale).legalPage

   return (
      <main id="contenido" style={{ paddingTop: "clamp(96px, 12vw, 140px)", paddingBottom: "clamp(48px, 8vw, 96px)" }}>
         <Container style={{ maxWidth: 760 }}>
            <Link
               href={`/${locale}`}
               className="hover:text-[var(--ds-text)]"
               style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--ds-text-secondary)", textDecoration: "none", transition: "color var(--duration-fast) var(--ease-standard)" }}
            >
               <ArrowLeft size={16} strokeWidth={1.5} />
               {lp.back}
            </Link>

            <h1 style={{ margin: "24px 0 0", fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.1, letterSpacing: "-0.02em", fontWeight: 600, color: "var(--ds-text)" }}>
               {lp.title}
            </h1>
            <p className="mono-label" style={{ margin: "12px 0 0", color: "var(--ds-text-muted)" }}>
               {lp.updated}
            </p>
            <p style={{ margin: "20px 0 0", fontSize: 17, lineHeight: 1.6, color: "var(--ds-text-secondary)" }}>{lp.intro}</p>

            {lp.sections.map((section) => (
               <section key={section.id} id={section.id} style={{ marginTop: 40, scrollMarginTop: 88 }}>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--ds-text)" }}>{section.heading}</h2>
                  {section.body.map((paragraph, i) => (
                     <p key={i} style={{ margin: "14px 0 0", fontSize: 15, lineHeight: 1.7, color: "var(--ds-text-secondary)" }}>
                        {paragraph}
                     </p>
                  ))}
               </section>
            ))}
         </Container>
      </main>
   )
}
