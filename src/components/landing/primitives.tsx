import type { CSSProperties, ReactNode } from "react"

// Shared server-rendered layout primitives for the landing. Keep visual rhythm
// consistent across sections without a client bundle cost.

export const LANDING_MAX = 1200

export function Container({
   children,
   style,
   className,
}: {
   children: ReactNode
   style?: CSSProperties
   className?: string
}) {
   return (
      <div
         className={className}
         style={{ maxWidth: LANDING_MAX, marginInline: "auto", paddingInline: 24, width: "100%", ...style }}
      >
         {children}
      </div>
   )
}

export function Eyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
   return (
      <p className="mono-label" style={{ color: "var(--blue-700)", margin: 0, ...style }}>
         {children}
      </p>
   )
}

export function SectionHeading({
   eyebrow,
   heading,
   subheading,
   align = "center",
}: {
   eyebrow: string
   heading: string
   subheading?: string
   align?: "center" | "left"
}) {
   return (
      <div
         style={{
            textAlign: align,
            maxWidth: align === "center" ? 760 : undefined,
            marginInline: align === "center" ? "auto" : undefined,
         }}
      >
         <Eyebrow>{eyebrow}</Eyebrow>
         <h2
            style={{
               fontSize: "clamp(28px, 4vw, 40px)",
               lineHeight: 1.08,
               letterSpacing: "-0.02em",
               fontWeight: 600,
               margin: "14px 0 0",
               color: "var(--ds-text)",
            }}
         >
            {heading}
         </h2>
         {subheading && (
            <p
               style={{
                  fontSize: "clamp(16px, 2vw, 19px)",
                  lineHeight: 1.55,
                  color: "var(--ds-text-secondary)",
                  margin: "14px 0 0",
               }}
            >
               {subheading}
            </p>
         )}
      </div>
   )
}
