"use client"

import { useRouter, usePathname } from "next/navigation"
import { setCookie } from "cookies-next/client"
import { Languages } from "lucide-react"
import { LOCALE_COOKIE, locales, type Dictionary, type Locale } from "@/lib/landing/i18n"

const T = "0.32s cubic-bezier(0.4, 0, 0.2, 1)"

// ES/EN segmented control. Persists the choice (cookie + localStorage) and
// swaps the locale segment of the route, preserving any in-page hash. Adapts to
// a light bar or a transparent-over-dark header via `onDark`.
export default function LangSwitcher({
   lang,
   dict,
   onDark = false,
   full = false,
}: {
   lang: Locale
   dict: Dictionary
   onDark?: boolean
   /** Full-width segmented control with full language names (mobile menu). */
   full?: boolean
}) {
   const router = useRouter()
   const pathname = usePathname()

   const switchTo = (target: Locale) => {
      if (target === lang) return
      setCookie(LOCALE_COOKIE, target, {
         path: "/",
         sameSite: "lax",
         maxAge: 60 * 60 * 24 * 365,
      })
      try {
         localStorage.setItem(LOCALE_COOKIE, target)
      } catch {
         /* private mode — cookie is enough */
      }
      const hash = typeof window !== "undefined" ? window.location.hash : ""
      const rest = pathname.replace(/^\/(es|en)(?=\/|$)/, "")
      router.push(`/${target}${rest}${hash}`)
   }

   // Full-width variant: two equal segments the width of the CTA buttons, with
   // the full language name of each locale (in the current locale's language).
   if (full) {
      return (
         <div
            role="group"
            aria-label={dict.nav.language}
            style={{
               display: "flex",
               alignItems: "center",
               width: "100%",
               gap: 4,
               padding: 4,
               borderRadius: "var(--radius-md)",
               background: "var(--ds-card)",
               boxShadow: "var(--shadow-border)",
            }}
         >
            <Languages
               size={16}
               strokeWidth={1.5}
               style={{ flexShrink: 0, color: "var(--ds-text-muted)", margin: "0 4px 0 8px" }}
               aria-hidden
            />
            {locales.map((code) => {
               const isActive = code === lang
               const label = code === "es" ? dict.nav.switchToEs : dict.nav.switchToEn
               return (
                  <button
                     key={code}
                     type="button"
                     onClick={() => switchTo(code)}
                     aria-pressed={isActive}
                     className={isActive ? undefined : "hover:bg-[var(--gray-alpha-100)]"}
                     style={{
                        flex: 1,
                        height: 36,
                        borderRadius: "var(--radius-sm)",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        background: isActive ? "var(--primary-700)" : "transparent",
                        color: isActive ? "var(--primary-contrast-fg)" : "var(--ds-text-secondary)",
                        transition: `background-color ${T}, color ${T}`,
                     }}
                  >
                     {label}
                  </button>
               )
            })}
         </div>
      )
   }

   return (
      <div
         role="group"
         aria-label={dict.nav.language}
         style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            padding: 3,
            borderRadius: "var(--radius-full)",
            background: onDark ? "rgba(255,255,255,0.08)" : "var(--ds-card)",
            boxShadow: onDark ? "inset 0 0 0 1px rgba(255,255,255,0.18)" : "var(--shadow-border)",
            transition: `background-color ${T}, box-shadow ${T}`,
         }}
      >
         <Languages
            size={15}
            strokeWidth={1.5}
            style={{ color: onDark ? "rgba(255,255,255,0.7)" : "var(--ds-text-muted)", margin: "0 3px 0 5px", transition: `color ${T}` }}
            aria-hidden
         />
         {locales.map((code) => {
            const isActive = code === lang
            const hoverClass = isActive ? undefined : onDark ? "hover:bg-[rgba(255,255,255,0.12)]" : "hover:bg-[var(--gray-alpha-100)]"
            const bg = isActive ? (onDark ? "#ffffff" : "var(--primary-700)") : "transparent"
            const color = isActive
               ? onDark
                  ? "var(--primary-700)"
                  : "var(--primary-contrast-fg)"
               : onDark
                  ? "rgba(255,255,255,0.75)"
                  : "var(--ds-text-secondary)"
            return (
               <button
                  key={code}
                  type="button"
                  onClick={() => switchTo(code)}
                  aria-pressed={isActive}
                  title={code === "es" ? dict.nav.switchToEs : dict.nav.switchToEn}
                  className={hoverClass}
                  style={{
                     height: 26,
                     padding: "0 10px",
                     borderRadius: "var(--radius-full)",
                     border: "none",
                     cursor: "pointer",
                     fontFamily: "var(--font-mono)",
                     fontSize: 12,
                     fontWeight: 500,
                     letterSpacing: "0.02em",
                     textTransform: "uppercase",
                     background: bg,
                     color,
                     transition: `background-color ${T}, color ${T}`,
                  }}
               >
                  {code}
               </button>
            )
         })}
      </div>
   )
}
