// Locale-aware date/time helpers for the scheduling calendar. Intl formatting
// is only used in the client-only calendar (loaded ssr:false), so there is no
// server/client hydration mismatch on time-dependent output.

export function mondayOf(date: Date): Date {
   const d = new Date(date)
   const dow = (d.getDay() + 6) % 7 // 0 = Monday
   d.setDate(d.getDate() - dow)
   d.setHours(0, 0, 0, 0)
   return d
}

export function addDays(date: Date, n: number): Date {
   const d = new Date(date)
   d.setDate(d.getDate() + n)
   return d
}

export function isSameDay(a: Date, b: Date): boolean {
   return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function formatTime(date: Date, locale: string): string {
   return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hour12: false }).format(date)
}

export function formatDayName(date: Date, locale: string): string {
   return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date)
}

export function formatDayMonth(date: Date, locale: string): string {
   return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(date)
}

export function formatSlotRange(start: Date, end: Date, locale: string): string {
   const day = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(start)
   return `${day}, ${formatTime(start, locale)}–${formatTime(end, locale)}`
}
