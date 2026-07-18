import type { ReactNode } from "react"
import { notFound } from "next/navigation"
import LandingHeader from "@/components/landing/LandingHeader"
import LandingFooter from "@/components/landing/LandingFooter"
import LandingModals from "@/components/landing/LandingModals"
import { getDictionary, isLocale, locales } from "@/lib/landing/i18n"

// Pre-render /es and /en at build; any other single-segment path renders on
// demand and is rejected by the isLocale() guard below with a clean notFound()
// (404). We rely on that guard rather than `dynamicParams = false`, which would
// 404 via an internal NoFallbackError that clutters server logs.
export function generateStaticParams() {
   return locales.map((lang) => ({ lang }))
}

export default async function LandingLayout({
   children,
   params,
}: {
   children: ReactNode
   params: Promise<{ lang: string }>
}) {
   const { lang } = await params
   if (!isLocale(lang)) notFound()
   const dict = getDictionary(lang)

   // The app shell (sidebar/topbar) is disabled for this route in
   // ConditionalLayout; the landing renders its own header/footer. `lang` on the
   // wrapper scopes the language for this subtree (the root <html> stays es).
   return (
      <div
         lang={lang}
         style={{
            background: "var(--ds-background)",
            color: "var(--ds-text)",
            fontFamily: "var(--font-sans)",
         }}
      >
         <a href="#contenido" className="lm-skip-link">
            {dict.nav.skipToContent}
         </a>
         <LandingHeader lang={lang} dict={dict} />
         {children}
         <LandingFooter lang={lang} dict={dict} />
         {/* Own modal renderer (the app's global one lives inside the disabled shell). */}
         <LandingModals />
      </div>
   )
}
