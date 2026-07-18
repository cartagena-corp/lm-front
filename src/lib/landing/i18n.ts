import type { Metadata } from "next"
import type { Dictionary } from "./dictionaries/types"
import { es } from "./dictionaries/es"
import { en } from "./dictionaries/en"

// ---- Locales -------------------------------------------------------------
export const locales = ["es", "en"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "es"

export function isLocale(value: string | undefined): value is Locale {
   return !!value && (locales as readonly string[]).includes(value)
}

export function otherLocale(locale: Locale): Locale {
   return locale === "es" ? "en" : "es"
}

// ---- Dictionaries --------------------------------------------------------
const dictionaries: Record<Locale, Dictionary> = { es, en }

export function getDictionary(locale: Locale): Dictionary {
   return dictionaries[locale]
}

export type { Dictionary }

// ---- SEO / URLs ----------------------------------------------------------
// Production domain — used for absolute canonical/hreflang/OG URLs.
export const SITE_URL = "https://cartagenacorporation.com"

// The BCP-47 / OpenGraph locale codes for each supported language.
export const ogLocale: Record<Locale, string> = {
   es: "es_ES",
   en: "en_US",
}

// Cookie that persists the visitor's language preference (read by the root
// redirect in app/page.tsx, written by the header LangSwitcher).
export const LOCALE_COOKIE = "NEXT_LOCALE"

/**
 * Reciprocal hreflang alternates for the Metadata API. Every language declares
 * every alternative (including itself) plus x-default, with absolute URLs.
 */
export function getAlternates(locale: Locale): Metadata["alternates"] {
   return {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
         es: `${SITE_URL}/es`,
         en: `${SITE_URL}/en`,
         "x-default": `${SITE_URL}/${defaultLocale}`,
      },
   }
}
