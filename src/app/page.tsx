import { redirect } from "next/navigation"
import { cookies, headers } from "next/headers"
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "@/lib/landing/i18n"

// The root URL is the public landing. It always redirects to a language variant
// (/es or /en) — the effective language is decided by the route. Preference
// order: saved cookie > Accept-Language header > default (es).
export const dynamic = "force-dynamic"

function localeFromAcceptLanguage(header: string): Locale | null {
   for (const part of header.split(",")) {
      const tag = part.trim().split(";")[0].toLowerCase()
      const base = tag.split("-")[0]
      if (isLocale(base)) return base
   }
   return null
}

export default async function Home() {
   const saved = (await cookies()).get(LOCALE_COOKIE)?.value
   if (isLocale(saved)) redirect(`/${saved}`)

   const accept = (await headers()).get("accept-language") ?? ""
   redirect(`/${localeFromAcceptLanguage(accept) ?? defaultLocale}`)
}
