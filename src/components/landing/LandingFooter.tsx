import { ArrowRight } from "lucide-react"
import { Container } from "./primitives"
import { robotoCondensed } from "@/lib/landing/fonts"
import { SECTIONS } from "@/lib/landing/constants"
import type { Dictionary, Locale } from "@/lib/landing/i18n"

export default function LandingFooter({ lang, dict }: { lang: Locale; dict: Dictionary }) {
   const year = new Date().getFullYear()
   // In-page anchors are resolved against the landing so they also work from
   // other pages (e.g. /legal) that share this footer.
   const anchor = (href: string) => (href.startsWith("#") ? `/${lang}${href}` : href)

   return (
      <footer
         style={{
            borderTop: "1px solid var(--ds-border)",
            background: "var(--ds-background-subtle)",
            paddingBlock: 64,
         }}
      >
         <Container>
            <div className="lm-footer-grid">
               {/* Brand column */}
               <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src="/favicon-dark.ico" alt="" width={28} height={28} style={{ display: "block", objectFit: "contain" }} />
                     <span className={robotoCondensed.className} style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--ds-text)" }}>
                        LA MURALLA
                     </span>
                  </div>
                  <p style={{ margin: "16px 0 0", maxWidth: 320, fontSize: 14, lineHeight: 1.6, color: "var(--ds-text-secondary)" }}>
                     {dict.footer.tagline}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
                     <a href="/login" className="lm-btn lm-btn-secondary lm-btn-sm">
                        {dict.footer.login}
                     </a>
                     <a href={`#${SECTIONS.schedule}`} className="lm-btn lm-btn-primary lm-btn-sm">
                        {dict.footer.requestDemo}
                        <ArrowRight size={16} strokeWidth={1.5} />
                     </a>
                  </div>
               </div>

               {/* Link columns */}
               {dict.footer.sections.map((section) => (
                  <nav key={section.heading} aria-label={section.heading}>
                     <h3 className="mono-label" style={{ margin: 0, color: "var(--ds-text-muted)" }}>
                        {section.heading}
                     </h3>
                     <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                        {section.links.map((link) => {
                           const external = link.href.startsWith("http")
                           return (
                              <li key={link.label}>
                                 <a
                                    href={anchor(link.href)}
                                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                    className="hover:text-[var(--ds-text)]"
                                    style={{ fontSize: 14, color: "var(--ds-text-secondary)", textDecoration: "none", transition: "color var(--duration-fast) var(--ease-standard)" }}
                                 >
                                    {link.label}
                                 </a>
                              </li>
                           )
                        })}
                     </ul>
                  </nav>
               ))}
            </div>

            {/* Bottom bar */}
            <div
               style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 48,
                  paddingTop: 24,
                  borderTop: "1px solid var(--ds-border)",
               }}
            >
               <p style={{ margin: 0, fontSize: 13, color: "var(--ds-text-muted)" }}>
                  © {year} {dict.footer.rights}
               </p>
               <nav aria-label="Legal" style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                  {dict.footer.legal.map((link) => (
                     <a
                        key={link.href}
                        href={link.href}
                        className="hover:text-[var(--ds-text)]"
                        style={{ fontSize: 13, color: "var(--ds-text-muted)", textDecoration: "none", transition: "color var(--duration-fast) var(--ease-standard)" }}
                     >
                        {link.label}
                     </a>
                  ))}
               </nav>
            </div>
         </Container>
      </footer>
   )
}
