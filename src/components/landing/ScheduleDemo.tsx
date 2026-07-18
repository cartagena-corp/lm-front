import { CalendarClock } from "lucide-react"
import { Container, SectionHeading } from "./primitives"
import ScheduleCalendarLoader from "./ScheduleCalendarLoader"
import { SECTIONS } from "@/lib/landing/constants"
import type { Dictionary, Locale } from "@/lib/landing/i18n"

// Server-rendered shell (heading is in the HTML for SEO); the time-dependent
// calendar itself is loaded client-only by ScheduleCalendarLoader.
export default function ScheduleDemo({ dict, lang }: { dict: Dictionary; lang: Locale }) {
   const s = dict.schedule

   return (
      <section id={SECTIONS.schedule} style={{ paddingBlock: "clamp(64px, 9vw, 120px)", scrollMarginTop: 80 }}>
         <Container style={{ maxWidth: 1000 }}>
            <SectionHeading eyebrow={s.eyebrow} heading={s.heading} subheading={s.subheading} />

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 24 }}>
               <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ds-text-secondary)" }}>
                  <CalendarClock size={16} strokeWidth={1.5} style={{ color: "var(--ds-text-muted)" }} />
                  {s.durationNote}
               </span>
               <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ds-text-secondary)" }}>
                  <span style={{ width: 14, height: 14, borderRadius: "var(--radius-sm)", boxShadow: "inset 0 0 0 1px var(--blue-700)" }} />
                  {s.legendFree}
               </span>
               <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ds-text-secondary)" }}>
                  <span style={{ width: 14, height: 14, borderRadius: "var(--radius-sm)", background: "var(--gray-alpha-200)" }} />
                  {s.legendBusy}
               </span>
            </div>

            <div style={{ marginTop: 32 }}>
               <ScheduleCalendarLoader dict={dict} lang={lang} />
            </div>
         </Container>
      </section>
   )
}
