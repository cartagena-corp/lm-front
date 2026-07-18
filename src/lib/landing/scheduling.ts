// ============================================================================
// Demo-scheduling data layer.
//
// ⚠️  THIS IS A MOCK. The real calendar backend already exists (it returns the
//     already-booked sessions and exposes endpoints to schedule on Google
//     Calendar + Google Meet) but wiring it up is a SEPARATE upcoming session.
//
// Everything here is shaped so that plugging the real endpoints in later is
// trivial: the two async functions below are the ONLY integration points. Each
// has a `// TODO(backend)` block with the exact fetch call to enable. The rest
// of the landing (WeekCalendar, DemoRequestModal, DemoConsentModal) already
// consumes these Promises and never touches mock internals directly.
// ============================================================================

/** Business hours + slot length used by both the calendar grid and the mock. */
export const BUSINESS = {
   startHour: 8, // 08:00
   endHour: 18, // 18:00 (last slot starts 17:30)
   slotMinutes: 30, // demos are half an hour
   /** Day columns shown — Monday through Sunday (full week). Length is what
       matters; each entry is a weekday index for readability. */
   weekdays: [1, 2, 3, 4, 5, 6, 7] as const,
}

export const SLOTS_PER_DAY =
   ((BUSINESS.endHour - BUSINESS.startHour) * 60) / BUSINESS.slotMinutes

// Base URL of the (future) calendar service. When it's configured, swap the
// mock bodies below for the real fetch calls.
const API_BASE = process.env.NEXT_PUBLIC_SERVICE_CALENDAR

// ---- Types (the shape the real backend should map onto) ------------------

export interface BookedSession {
   id: string
   /** ISO 8601 instant. */
   start: string
   /** ISO 8601 instant. */
   end: string
   title?: string
}

export interface DemoBookingRequest {
   fullName: string
   company: string
   email: string
   phone: string
   comment?: string
   /** ISO 8601 instant of the chosen slot. */
   slotStart: string
   slotEnd: string
   locale: string
}

export interface DemoBookingResult {
   ok: boolean
   sessionId?: string
   /** Google Meet link returned by the backend on success. */
   meetLink?: string
   message?: string
}

// ---- Public API (integration points) ------------------------------------

/**
 * Returns the sessions already booked for the week that starts at `weekStartISO`
 * (Monday, local midnight). The calendar renders these as blocked, non-bookable
 * slots.
 */
export async function getBookedSessions(weekStartISO: string): Promise<BookedSession[]> {
   // TODO(backend): replace the mock below with the real endpoint, e.g.
   //
   //   const res = await fetch(
   //     `${API_BASE}/sessions?weekStart=${encodeURIComponent(weekStartISO)}`,
   //     { headers: { Accept: "application/json" }, cache: "no-store" },
   //   )
   //   if (!res.ok) throw new Error(`getBookedSessions failed: ${res.status}`)
   //   return (await res.json()) as BookedSession[]
   //
   void API_BASE // referenced so the env wiring is obvious; remove when enabling the fetch.

   await simulateLatency(220)
   return buildMockBusySessions(new Date(weekStartISO))
}

/**
 * Requests a demo booking. On success the backend schedules the Google Calendar
 * event + Google Meet room and emails the invitation to `request.email`.
 */
export async function requestDemoBooking(
   request: DemoBookingRequest,
): Promise<DemoBookingResult> {
   // TODO(backend): replace the mock below with the real endpoint, e.g.
   //
   //   const res = await fetch(`${API_BASE}/bookings`, {
   //     method: "POST",
   //     headers: { "Content-Type": "application/json" },
   //     body: JSON.stringify(request),
   //   })
   //   if (!res.ok) return { ok: false, message: `HTTP ${res.status}` }
   //   return (await res.json()) as DemoBookingResult
   //
   await simulateLatency(900)

   // Basic shape validation so the mock behaves like a real endpoint would.
   if (!request.fullName || !request.email || !request.company || !request.phone) {
      return { ok: false, message: "MISSING_FIELDS" }
   }

   return {
      ok: true,
      sessionId: `demo-${Date.parse(request.slotStart)}`,
      meetLink: "https://meet.google.com/lookup/la-muralla-demo",
   }
}

/**
 * Whether a week has at least one bookable slot (free AND in the future). Used
 * by the calendar to skip weeks that are fully booked or entirely in the past.
 *
 * TODO(backend): when the real service is wired, derive availability from it
 * (e.g. an endpoint returning per-week availability, or by inspecting the
 * sessions returned by getBookedSessions) instead of the mock below.
 */
export function hasWeekAvailability(weekStart: Date, now: Date): boolean {
   const busy = buildMockBusySessions(weekStart)
   for (let d = 0; d < BUSINESS.weekdays.length; d++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + d)
      day.setHours(0, 0, 0, 0)
      for (let si = 0; si < SLOTS_PER_DAY; si++) {
         const minutes = BUSINESS.startHour * 60 + si * BUSINESS.slotMinutes
         const start = new Date(day)
         start.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0)
         if (start <= now) continue
         const end = new Date(start.getTime() + BUSINESS.slotMinutes * 60_000)
         const isBusy = busy.some((s) => new Date(s.start) < end && new Date(s.end) > start)
         if (!isBusy) return true
      }
   }
   return false
}

// ---- Mock internals (delete once the backend is wired) -------------------

function simulateLatency(ms: number): Promise<void> {
   return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Deterministic PRNG so a given week always shows the same busy slots. */
function mulberry32(seed: number): () => number {
   let a = seed
   return function () {
      a |= 0
      a = (a + 0x6d2b79f5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
   }
}

const MOCK_TITLES = [
   "Demo — Equipo de producto",
   "Onboarding cliente",
   "Sesión de seguimiento",
   "Demo — Ingeniería",
   "Revisión de cuenta",
]

/**
 * Generates a stable-per-week set of busy 30-minute sessions across Mon–Fri,
 * so the calendar has realistic "occupied" gaps to route around.
 */
function buildMockBusySessions(weekStart: Date): BookedSession[] {
   const sessions: BookedSession[] = []

   BUSINESS.weekdays.forEach((_, dayIndex) => {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + dayIndex)
      day.setHours(0, 0, 0, 0)

      const seed = Math.floor(day.getTime() / 86_400_000)
      const rand = mulberry32(seed)
      const count = 2 + Math.floor(rand() * 3) // 2–4 busy slots per day
      const chosen = new Set<number>()

      while (chosen.size < count) {
         chosen.add(Math.floor(rand() * SLOTS_PER_DAY))
      }

      Array.from(chosen).forEach((slotIndex, i) => {
         const start = new Date(day)
         start.setHours(
            BUSINESS.startHour + Math.floor((slotIndex * BUSINESS.slotMinutes) / 60),
            (slotIndex * BUSINESS.slotMinutes) % 60,
            0,
            0,
         )
         const end = new Date(start.getTime() + BUSINESS.slotMinutes * 60_000)
         sessions.push({
            id: `${seed}-${slotIndex}`,
            start: start.toISOString(),
            end: end.toISOString(),
            title: MOCK_TITLES[(seed + i) % MOCK_TITLES.length],
         })
      })
   })

   return sessions
}
