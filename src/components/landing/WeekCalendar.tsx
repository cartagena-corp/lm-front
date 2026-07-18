"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, CalendarClock, ShieldCheck, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { useModalStore } from "@/lib/hooks/ModalStore"
import {
   BUSINESS,
   SLOTS_PER_DAY,
   getBookedSessions,
   hasWeekAvailability,
   requestDemoBooking,
   type BookedSession,
} from "@/lib/landing/scheduling"
import { addDays, formatDayMonth, formatDayName, formatSlotRange, formatTime, isSameDay, mondayOf } from "@/lib/landing/datetime"
import DemoRequestModal, { type DemoFormData } from "./DemoRequestModal"
import DemoConsentModal from "./DemoConsentModal"
import type { Dictionary, Locale } from "@/lib/landing/i18n"

const MAX_WEEKS = 8
const REQ_ID = "lm-demo-request"
const CONSENT_ID = "lm-demo-consent"
const ROW_H = 40

const border = "1px solid var(--ds-border)"

export default function WeekCalendar({ dict, lang }: { dict: Dictionary; lang: Locale }) {
   const s = dict.schedule
   const openModal = useModalStore((st) => st.openModal)
   const closeModal = useModalStore((st) => st.closeModal)

   const [now] = useState(() => new Date())
   const [sessions, setSessions] = useState<BookedSession[] | null>(null)

   // Only weeks with at least one bookable slot are navigable — fully-booked or
   // fully-past weeks are skipped entirely.
   const availableOffsets = useMemo(() => {
      const base = mondayOf(now)
      const list: number[] = []
      for (let o = 0; o <= MAX_WEEKS; o++) {
         if (hasWeekAvailability(addDays(base, o * 7), now)) list.push(o)
      }
      return list.length ? list : [0]
   }, [now])
   const [ptr, setPtr] = useState(0)
   const safePtr = Math.min(ptr, availableOffsets.length - 1)
   const atFirst = safePtr === 0
   const atLast = safePtr >= availableOffsets.length - 1
   const weekOffset = availableOffsets[safePtr] ?? 0

   const weekStart = useMemo(() => addDays(mondayOf(now), weekOffset * 7), [now, weekOffset])
   const days = useMemo(() => BUSINESS.weekdays.map((_, i) => addDays(weekStart, i)), [weekStart])

   useEffect(() => {
      let alive = true
      setSessions(null)
      getBookedSessions(weekStart.toISOString())
         .then((data) => alive && setSessions(data))
         .catch(() => alive && setSessions([]))
      return () => {
         alive = false
      }
   }, [weekStart])

   const loading = sessions === null

   const slotDate = (day: Date, slotIndex: number) => {
      const minutes = BUSINESS.startHour * 60 + slotIndex * BUSINESS.slotMinutes
      const d = new Date(day)
      d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0)
      return d
   }

   // ---- Stacked modal flow: request form → consent → mock booking ----------
   const openConsent = (form: DemoFormData, start: Date, end: Date) =>
      openModal({
         id: CONSENT_ID,
         title: s.consent.title,
         size: "sm",
         mode: "UPDATE",
         Icon: <ShieldCheck size={20} strokeWidth={1.75} />,
         children: (
            <DemoConsentModal
               dict={dict}
               email={form.email}
               onBack={() => closeModal(CONSENT_ID)}
               onAccept={async () => {
                  const res = await requestDemoBooking({
                     fullName: form.fullName,
                     company: form.company,
                     email: form.email,
                     phone: form.phone,
                     comment: form.comment,
                     slotStart: start.toISOString(),
                     slotEnd: end.toISOString(),
                     locale: lang,
                  })
                  if (res.ok) {
                     toast.success(s.successToast)
                     closeModal(CONSENT_ID)
                     closeModal(REQ_ID)
                     return true
                  }
                  toast.error(s.errorToast)
                  return false
               }}
            />
         ),
      })

   const onSchedule = (start: Date, end: Date) =>
      openModal({
         id: REQ_ID,
         title: s.modal.title,
         desc: `${formatSlotRange(start, end, lang)} · ${s.durationNote}`,
         size: "md",
         mode: "CREATE",
         Icon: <CalendarClock size={20} strokeWidth={1.75} />,
         children: (
            <DemoRequestModal
               dict={dict}
               onClose={() => closeModal(REQ_ID)}
               onConfirm={(form) => openConsent(form, start, end)}
            />
         ),
      })

   // ---- Grid cells ---------------------------------------------------------
   const cornerStyle: React.CSSProperties = { position: "sticky", top: 0, left: 0, zIndex: 3, background: "var(--ds-card)", borderBottom: border }
   const headerStyle: React.CSSProperties = { position: "sticky", top: 0, zIndex: 2, background: "var(--ds-card)", padding: "8px 6px", textAlign: "center", borderBottom: border, borderLeft: border }
   const timeStyle: React.CSSProperties = { height: ROW_H, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 8, paddingTop: 2, fontSize: 11, color: "var(--ds-text-muted)", fontFamily: "var(--font-mono)", borderTop: border }

   const cells: React.ReactNode[] = []
   cells.push(<div key="corner" style={cornerStyle} />)
   days.forEach((day, di) => {
      const today = isSameDay(day, now)
      cells.push(
         <div key={`h-${di}`} style={headerStyle}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ds-text-muted)", fontFamily: "var(--font-mono)" }}>
               {formatDayName(day, lang)}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: today ? "var(--blue-700)" : "var(--ds-text)" }}>{day.getDate()}</div>
         </div>,
      )
   })

   for (let si = 0; si < SLOTS_PER_DAY; si++) {
      cells.push(
         <div key={`t-${si}`} style={timeStyle}>
            {formatTime(slotDate(days[0], si), lang)}
         </div>,
      )
      days.forEach((day, di) => {
         const start = slotDate(day, si)
         const end = new Date(start.getTime() + BUSINESS.slotMinutes * 60_000)
         const busy = sessions?.some((sess) => new Date(sess.start) < end && new Date(sess.end) > start) ?? false
         const key = `c-${si}-${di}`

         if (loading || start < now) {
            cells.push(<div key={key} style={{ height: ROW_H, borderTop: border, borderLeft: border, background: "var(--gray-alpha-100)" }} aria-hidden />)
            return
         }
         if (busy) {
            cells.push(
               <div key={key} style={{ height: ROW_H, borderTop: border, borderLeft: border, padding: 3 }} title={s.busy}>
                  <div style={{ height: "100%", borderRadius: "var(--radius-sm)", background: "var(--gray-alpha-200)", display: "flex", alignItems: "center", gap: 6, padding: "0 8px", overflow: "hidden" }}>
                     <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--gray-700)", flexShrink: 0 }} />
                     <span style={{ fontSize: 11, color: "var(--ds-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.busy}</span>
                  </div>
               </div>,
            )
            return
         }
         cells.push(
            <button
               key={key}
               type="button"
               onClick={() => onSchedule(start, end)}
               className="lm-slot hover:bg-[var(--blue-100)]"
               aria-label={`${s.scheduleHere} · ${formatSlotRange(start, end, lang)}`}
               style={{ position: "relative", height: ROW_H, width: "100%", padding: 0, border: "none", borderTop: border, borderLeft: border, background: "transparent", cursor: "pointer", display: "block" }}
            >
               <span
                  className="lm-slot-cta"
                  style={{
                     position: "absolute",
                     inset: 3,
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     borderRadius: "var(--radius-sm)",
                     boxShadow: "inset 0 0 0 1px var(--blue-700)",
                     background: "var(--ds-card)",
                     color: "var(--blue-700)",
                     fontSize: 11,
                     fontWeight: 500,
                     whiteSpace: "nowrap",
                  }}
               >
                  {s.scheduleHere}
               </span>
            </button>,
         )
      })
   }

   const navBtn = (disabled: boolean): React.CSSProperties => ({
      width: 34,
      height: 34,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-md)",
      border: "none",
      background: "transparent",
      color: "var(--ds-text)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
   })

   return (
      <div style={{ background: "var(--ds-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-border)", overflow: "hidden" }}>
         {/* Nav */}
         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px", borderBottom: border }}>
            <div>
               <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ds-text)" }}>
                  {s.weekLabel} {formatDayMonth(weekStart, lang)} – {formatDayMonth(addDays(weekStart, 6), lang)}
               </div>
               {loading && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, color: "var(--ds-text-muted)" }}>
                     <Loader2 size={13} strokeWidth={1.75} className="animate-spin" />
                     <span style={{ fontSize: 12 }}>{s.loading}</span>
                  </div>
               )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
               <button type="button" aria-label={s.prevWeek} disabled={atFirst} onClick={() => setPtr((p) => Math.max(0, p - 1))} className={atFirst ? undefined : "hover:bg-[var(--gray-alpha-100)]"} style={navBtn(atFirst)}>
                  <ChevronLeft size={18} strokeWidth={1.75} />
               </button>
               <button type="button" disabled={atFirst} onClick={() => setPtr(0)} className="lm-btn lm-btn-secondary lm-btn-sm">
                  {s.today}
               </button>
               <button type="button" aria-label={s.nextWeek} disabled={atLast} onClick={() => setPtr((p) => Math.min(availableOffsets.length - 1, p + 1))} className={atLast ? undefined : "hover:bg-[var(--gray-alpha-100)]"} style={navBtn(atLast)}>
                  <ChevronRight size={18} strokeWidth={1.75} />
               </button>
            </div>
         </div>

         {/* Grid */}
         <div className="custom-scrollbar" style={{ overflow: "auto", maxHeight: 520, overscrollBehavior: "contain" }}>
            <div className="lm-cal-grid">
               {cells}
            </div>
         </div>
      </div>
   )
}
