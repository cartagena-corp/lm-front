"use client"

import dynamic from "next/dynamic"
import type { Dictionary } from "@/lib/landing/i18n"

type DemoDict = Dictionary["hero"]["demo"]

// The kanban demo is interactive and comparatively heavy (native DnD + modal +
// sessionStorage). Defer its hydration so it never blocks the hero LCP/INP; the
// skeleton reserves its footprint to avoid layout shift (CLS).
const KanbanDemo = dynamic(() => import("./KanbanDemo"), {
   ssr: false,
   loading: () => <DemoSkeleton />,
})

function DemoSkeleton() {
   const dot = (c: string) => ({ width: 11, height: 11, borderRadius: 999, background: c, display: "inline-block" }) as const
   return (
      <div
         aria-hidden
         style={{
            background: "var(--ds-card)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 24px 48px -16px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.06)",
            overflow: "hidden",
            width: "100%",
         }}
      >
         <div style={{ display: "flex", alignItems: "center", height: 40, padding: "0 14px", gap: 7, borderBottom: "1px solid var(--ds-border)", background: "var(--ds-background-subtle)" }}>
            <span style={dot("#ff5f57")} />
            <span style={dot("#febc2e")} />
            <span style={dot("#28c840")} />
         </div>
         <div className="lm-demo-board" style={{ display: "flex" }}>
            {[0, 1, 2].map((i) => (
               <div key={i} className="lm-demo-col">
                  <div style={{ height: 12, width: "60%", borderRadius: 6, background: "var(--gray-alpha-200)", margin: "2px 0 10px" }} />
                  <div style={{ minHeight: 320, borderRadius: "var(--radius-lg)", background: "var(--gray-alpha-100)" }} />
               </div>
            ))}
         </div>
      </div>
   )
}

export default function KanbanDemoLoader({ demo }: { demo: DemoDict }) {
   return <KanbanDemo demo={demo} />
}
