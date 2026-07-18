"use client"

import dynamic from "next/dynamic"
import type { Dictionary, Locale } from "@/lib/landing/i18n"

// Client-only (ssr:false): the calendar depends on the current date, so keeping
// it off the server avoids any hydration mismatch, and defers this heavier chunk.
const WeekCalendar = dynamic(() => import("./WeekCalendar"), {
   ssr: false,
   loading: () => <CalendarSkeleton />,
})

function CalendarSkeleton() {
   return (
      <div aria-hidden style={{ background: "var(--ds-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-border)", overflow: "hidden", minHeight: 480 }}>
         <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--ds-border)" }}>
            <div style={{ height: 14, width: 180, borderRadius: 6, background: "var(--gray-alpha-200)" }} />
            <div style={{ height: 28, width: 120, borderRadius: 6, background: "var(--gray-alpha-100)" }} />
         </div>
         <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 8 }).map((_, i) => (
               <div key={i} style={{ height: 32, borderRadius: 6, background: "var(--gray-alpha-100)" }} />
            ))}
         </div>
      </div>
   )
}

export default function ScheduleCalendarLoader({ dict, lang }: { dict: Dictionary; lang: Locale }) {
   return <WeekCalendar dict={dict} lang={lang} />
}
