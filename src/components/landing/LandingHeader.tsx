"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ArrowRight } from "lucide-react"
import LangSwitcher from "./LangSwitcher"
import { Container } from "./primitives"
import { robotoCondensed } from "@/lib/landing/fonts"
import { SECTIONS } from "@/lib/landing/constants"
import type { Dictionary, Locale } from "@/lib/landing/i18n"

const HEADER_H = 64
const T = "0.32s cubic-bezier(0.4, 0, 0.2, 1)"

export default function LandingHeader({ lang, dict }: { lang: Locale; dict: Dictionary }) {
   const pathname = usePathname()
   const [menuOpen, setMenuOpen] = useState(false)
   const [active, setActive] = useState<string>(SECTIONS.hero)
   const [scrolled, setScrolled] = useState(false)

   // Only the landing root has the dark hero under the header. On other pages
   // (e.g. /legal) the header is always the light bar.
   const isLandingRoot = /^\/(es|en)$/.test(pathname)
   // Transparent, white-on-dark treatment only at the very top of the hero.
   const onDark = isLandingRoot && !scrolled && !menuOpen

   const nav = [
      { id: SECTIONS.hero, label: dict.nav.hero },
      { id: SECTIONS.timeline, label: dict.nav.timeline },
      { id: SECTIONS.stories, label: dict.nav.stories },
      { id: SECTIONS.schedule, label: dict.nav.schedule },
   ]

   // Toggle the transparent/solid state on scroll.
   useEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > 24)
      onScroll()
      window.addEventListener("scroll", onScroll, { passive: true })
      return () => window.removeEventListener("scroll", onScroll)
   }, [])

   // Smooth in-page scrolling, scoped to while the landing is mounted.
   useEffect(() => {
      const prev = document.documentElement.style.scrollBehavior
      document.documentElement.style.scrollBehavior = "smooth"
      return () => {
         document.documentElement.style.scrollBehavior = prev
      }
   }, [])

   // Highlight the nav item for the section currently in view.
   useEffect(() => {
      const ids = Object.values(SECTIONS)
      const els = ids
         .map((id) => document.getElementById(id))
         .filter((el): el is HTMLElement => el !== null)
      if (!els.length) return
      const observer = new IntersectionObserver(
         (entries) => {
            entries.forEach((entry) => {
               if (entry.isIntersecting) setActive(entry.target.id)
            })
         },
         { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
      )
      els.forEach((el) => observer.observe(el))
      return () => observer.disconnect()
   }, [])

   const closeMenu = () => setMenuOpen(false)

   const textActive = onDark ? "#ffffff" : "var(--ds-text)"
   const textInactive = onDark ? "rgba(255,255,255,0.72)" : "var(--ds-text-secondary)"
   const navHoverClass = onDark ? "hover:bg-[rgba(255,255,255,0.10)]" : "hover:bg-[var(--gray-alpha-100)]"
   const btnTransition = `background-color ${T}, color ${T}, box-shadow ${T}`

   return (
      <header
         style={{
            // Fixed (overlay) so the dark hero can extend to the very top of the
            // page behind the transparent bar — no reserved white band. z-index
            // stays below the modal layer (40+) so scheduling modals cover it.
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 30,
            backgroundColor: onDark ? "transparent" : "color-mix(in srgb, var(--ds-background) 82%, transparent)",
            backdropFilter: onDark ? "blur(6px)" : "blur(10px)",
            WebkitBackdropFilter: onDark ? "blur(6px)" : "blur(10px)",
            borderBottom: "1px solid",
            borderBottomColor: onDark ? "rgba(255,255,255,0.08)" : "var(--ds-border)",
            transition: `background-color ${T}, border-color ${T}, backdrop-filter ${T}, -webkit-backdrop-filter ${T}`,
         }}
      >
         <Container>
            <div style={{ height: HEADER_H, display: "flex", alignItems: "center", gap: 16 }}>
               {/* Brand */}
               <Link
                  href={`/${lang}`}
                  aria-label={dict.nav.brandAlt}
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}
               >
                  <span style={{ position: "relative", width: 28, height: 28, flexShrink: 0 }}>
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src="/favicon-light.ico" alt="" width={28} height={28} style={{ position: "absolute", inset: 0, objectFit: "contain", opacity: onDark ? 1 : 0, transition: `opacity ${T}` }} />
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src="/favicon-dark.ico" alt="" width={28} height={28} style={{ position: "absolute", inset: 0, objectFit: "contain", opacity: onDark ? 0 : 1, transition: `opacity ${T}` }} />
                  </span>
                  <span className={robotoCondensed.className} style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em", color: textActive, transition: `color ${T}` }}>
                     LA MURALLA
                  </span>
               </Link>

               {/* Desktop nav */}
               <nav aria-label={dict.nav.brandAlt} className="hidden lg:flex" style={{ alignItems: "center", gap: 4, marginLeft: 12 }}>
                  {nav.map((item) => (
                     <a
                        key={item.id}
                        href={`/${lang}#${item.id}`}
                        className={navHoverClass}
                        style={{
                           padding: "8px 12px",
                           borderRadius: "var(--radius-md)",
                           fontSize: 14,
                           fontWeight: 500,
                           textDecoration: "none",
                           color: active === item.id ? textActive : textInactive,
                           transition: `background-color ${T}, color ${T}`,
                        }}
                     >
                        {item.label}
                     </a>
                  ))}
               </nav>

               <div style={{ flex: 1 }} />

               {/* Desktop actions */}
               <div className="hidden md:flex" style={{ alignItems: "center", gap: 10 }}>
                  <LangSwitcher lang={lang} dict={dict} onDark={onDark} />
                  <Link
                     href="/login"
                     className={`lm-btn lm-btn-sm ${onDark ? "lm-btn-outline-dark" : "lm-btn-secondary"}`}
                     style={{ transition: btnTransition }}
                  >
                     {dict.nav.login}
                  </Link>
                  <a
                     href={`/${lang}#${SECTIONS.schedule}`}
                     className={`lm-btn lm-btn-sm ${onDark ? "lm-btn-on-dark" : "lm-btn-primary"}`}
                     style={{ transition: btnTransition }}
                  >
                     {dict.nav.requestDemo}
                     <ArrowRight size={16} strokeWidth={1.5} />
                  </a>
               </div>

               {/* Mobile toggle */}
               <button
                  type="button"
                  className={`inline-flex md:hidden ${navHoverClass}`}
                  aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}
                  style={{
                     alignItems: "center",
                     justifyContent: "center",
                     width: 40,
                     height: 40,
                     borderRadius: "var(--radius-md)",
                     background: "transparent",
                     border: "none",
                     color: textActive,
                     cursor: "pointer",
                     transition: `color ${T}, background-color ${T}`,
                  }}
               >
                  {menuOpen ? <X size={22} strokeWidth={1.75} /> : <Menu size={22} strokeWidth={1.75} />}
               </button>
            </div>
         </Container>

         {/* Mobile menu panel (always the light solid panel). Animated open/close. */}
         <AnimatePresence initial={false}>
            {menuOpen && (
               <motion.div
                  key="mobile-menu"
                  className="md:hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: "hidden" }}
               >
                  <div style={{ borderTop: "1px solid var(--ds-border)", background: "var(--ds-background)" }}>
                     <Container style={{ paddingBlock: 16 }}>
                        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }} aria-label={dict.nav.brandAlt}>
                           {nav.map((item) => (
                              <a
                                 key={item.id}
                                 href={`/${lang}#${item.id}`}
                                 onClick={closeMenu}
                                 className="hover:bg-[var(--gray-alpha-100)]"
                                 style={{
                                    padding: "12px 12px",
                                    borderRadius: "var(--radius-md)",
                                    fontSize: 15,
                                    fontWeight: 500,
                                    textDecoration: "none",
                                    color: active === item.id ? "var(--ds-text)" : "var(--ds-text-secondary)",
                                 }}
                              >
                                 {item.label}
                              </a>
                           ))}
                        </nav>
                        <div style={{ marginTop: 16 }}>
                           <LangSwitcher lang={lang} dict={dict} full />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                           <Link href="/login" onClick={closeMenu} className="lm-btn lm-btn-secondary" style={{ width: "100%" }}>
                              {dict.nav.login}
                           </Link>
                           <a href={`/${lang}#${SECTIONS.schedule}`} onClick={closeMenu} className="lm-btn lm-btn-primary" style={{ width: "100%" }}>
                              {dict.nav.requestDemo}
                              <ArrowRight size={16} strokeWidth={1.5} />
                           </a>
                        </div>
                     </Container>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </header>
   )
}
