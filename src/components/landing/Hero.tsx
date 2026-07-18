import { ArrowRight } from "lucide-react"
import { Container } from "./primitives"
import HeroTypingPhrases from "./HeroTypingPhrases"
import KanbanDemoLoader from "./KanbanDemoLoader"
import { SECTIONS } from "@/lib/landing/constants"
import type { Dictionary, Locale } from "@/lib/landing/i18n"

// Server-rendered so the <h1> is in the initial HTML (LCP + main SEO signal).
// The typing phrases and kanban demo are the only client parts.
export default function Hero({ dict, lang }: { dict: Dictionary; lang: Locale }) {
   const h = dict.hero

   return (
      <section
         id={SECTIONS.hero}
         className="lm-hero"
         style={{
            position: "relative",
            overflow: "hidden",
            background: "#0a0a0a",
            color: "#ededed",
            scrollMarginTop: 64,
            // Clear the fixed (overlay) header. The dark background still fills to
            // the very top; only the content is offset below the bar.
            paddingTop: 64,
            backgroundImage:
               "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
         }}
      >
         <div
            aria-hidden
            style={{
               position: "absolute",
               inset: 0,
               background: "radial-gradient(120% 80% at 80% 0%, rgba(0,112,243,0.18), transparent 60%)",
               pointerEvents: "none",
            }}
         />
         <Container style={{ position: "relative", paddingBlock: "clamp(48px, 7vw, 84px)" }}>
            <div className="lm-hero-grid">
               {/* Copy */}
               <div>
                  {/* Rotating "leyenda" (keeps the mono-label styling). */}
                  <HeroTypingPhrases phrases={h.phrases} />
                  <h1
                     style={{
                        margin: "16px 0 0",
                        fontSize: "clamp(30px, 6vw, 56px)",
                        lineHeight: 1.05,
                        letterSpacing: "-0.03em",
                        fontWeight: 600,
                        color: "#f7f7f8",
                        maxWidth: 560,
                        overflowWrap: "break-word",
                     }}
                  >
                     {h.h1}
                  </h1>
                  <p
                     style={{
                        margin: "18px 0 0",
                        maxWidth: 520,
                        fontSize: "clamp(15px, 1.6vw, 17px)",
                        lineHeight: 1.6,
                        color: "rgba(237,237,237,0.66)",
                     }}
                  >
                     {h.directAnswer}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
                     <a href={`/${lang}#${SECTIONS.schedule}`} className="lm-btn lm-btn-lg lm-btn-on-dark">
                        {h.cta}
                        <ArrowRight size={18} strokeWidth={1.75} />
                     </a>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 28, marginTop: 34 }}>
                     {h.stats.map((s) => (
                        <div key={s.label}>
                           <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 600, color: "#f4f4f5" }}>
                              {s.value}
                           </div>
                           <div style={{ fontSize: 13, color: "rgba(237,237,237,0.5)" }}>{s.label}</div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Interactive demo (deferred) */}
               <div>
                  <KanbanDemoLoader demo={h.demo} />
               </div>
            </div>
         </Container>
      </section>
   )
}
