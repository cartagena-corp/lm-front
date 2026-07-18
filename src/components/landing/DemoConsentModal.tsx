"use client"

import { useState } from "react"
import { ShieldCheck, CalendarCheck, Mail } from "lucide-react"
import type { Dictionary } from "@/lib/landing/i18n"

// Second, stacked modal (opens over the request form). Reuses the app's stacked
// modal system, so the backdrop darkens and it sits above the first modal.
export default function DemoConsentModal({
   dict,
   email,
   onBack,
   onAccept,
}: {
   dict: Dictionary
   email: string
   onBack: () => void
   onAccept: () => Promise<boolean>
}) {
   const c = dict.schedule.consent
   const [loading, setLoading] = useState(false)

   const accept = async () => {
      if (loading) return
      setLoading(true)
      const ok = await onAccept()
      if (!ok) setLoading(false) // on success the modal is closed by the parent
   }

   const point = (icon: React.ReactNode, text: string) => (
      <li style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
         <span style={{ flexShrink: 0, marginTop: 1, color: "var(--blue-700)" }}>{icon}</span>
         <span style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ds-text-secondary)" }}>{text}</span>
      </li>
   )

   return (
      <div style={{ padding: 24 }}>
         <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--ds-text)" }}>{c.intro}</p>

         <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            {point(<ShieldCheck size={18} strokeWidth={1.5} />, c.point1)}
            {point(<CalendarCheck size={18} strokeWidth={1.5} />, c.point2)}
         </ul>

         <div
            style={{
               display: "flex",
               alignItems: "center",
               gap: 10,
               marginTop: 20,
               padding: "10px 12px",
               borderRadius: "var(--radius-md)",
               background: "var(--blue-100)",
               color: "var(--blue-900)",
            }}
         >
            <Mail size={16} strokeWidth={1.5} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>{email}</span>
         </div>

         <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
            <button type="button" onClick={onBack} disabled={loading} className="lm-btn lm-btn-secondary lm-btn-sm">
               {c.back}
            </button>
            <button type="button" onClick={accept} disabled={loading} className="lm-btn lm-btn-primary lm-btn-sm">
               {loading ? c.sending : c.accept}
            </button>
         </div>
      </div>
   )
}
