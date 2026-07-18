import { LayoutDashboard, CalendarRange, ListChecks, LineChart, type LucideIcon } from "lucide-react"
import { Container, SectionHeading } from "./primitives"
import { SECTIONS } from "@/lib/landing/constants"
import type { Dictionary } from "@/lib/landing/i18n"

const STEP_ICONS: LucideIcon[] = [LayoutDashboard, CalendarRange, ListChecks, LineChart]
const STEP_TONES = [
   { bg: "var(--blue-100)", fg: "var(--blue-900)" },
   { bg: "var(--purple-100)", fg: "var(--purple-900)" },
   { bg: "var(--teal-100)", fg: "var(--teal-900)" },
   { bg: "var(--green-100)", fg: "var(--green-900)" },
]

export default function Timeline({ dict }: { dict: Dictionary }) {
   const t = dict.timeline

   return (
      <section id={SECTIONS.timeline} style={{ paddingBlock: "clamp(64px, 9vw, 120px)", scrollMarginTop: 80 }}>
         <Container>
            <SectionHeading eyebrow={t.eyebrow} heading={t.heading} subheading={t.subheading} />

            <ol className="lm-timeline-grid" style={{ listStyle: "none", margin: "56px 0 0", padding: 0 }}>
               {t.steps.map((step, i) => {
                  const Icon = STEP_ICONS[i % STEP_ICONS.length]
                  const tone = STEP_TONES[i % STEP_TONES.length]
                  return (
                     <li
                        key={step.title}
                        className="lm-lift"
                        style={{
                           background: "var(--ds-card)",
                           boxShadow: "var(--shadow-border)",
                           borderRadius: "var(--radius-xl)",
                           padding: 24,
                        }}
                     >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                           <span
                              style={{
                                 display: "grid",
                                 placeItems: "center",
                                 width: 44,
                                 height: 44,
                                 borderRadius: "var(--radius-lg)",
                                 background: tone.bg,
                                 color: tone.fg,
                              }}
                           >
                              <Icon size={22} strokeWidth={1.5} />
                           </span>
                           <span className="mono-label" style={{ color: "var(--ds-text-muted)" }}>
                              {String(i + 1).padStart(2, "0")}
                           </span>
                        </div>
                        <h3 style={{ margin: "18px 0 0", fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--ds-text)" }}>
                           {step.title}
                        </h3>
                        <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.6, color: "var(--ds-text-secondary)" }}>
                           {step.description}
                        </p>
                     </li>
                  )
               })}
            </ol>
         </Container>
      </section>
   )
}
