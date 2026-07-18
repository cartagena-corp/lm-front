import { ChevronDown } from "lucide-react"
import { Container, SectionHeading } from "./primitives"
import { SECTIONS } from "@/lib/landing/constants"
import type { Dictionary } from "@/lib/landing/i18n"

// Native <details> accordion: accessible, JS-free, and the answers stay in the
// server-rendered HTML (so they back the FAQPage JSON-LD and are crawlable/GEO).
export default function FaqSection({ dict }: { dict: Dictionary }) {
   const f = dict.faq

   return (
      <section id={SECTIONS.faq} style={{ paddingBlock: "clamp(64px, 9vw, 120px)", scrollMarginTop: 80 }}>
         <Container style={{ maxWidth: 820 }}>
            <SectionHeading eyebrow={f.eyebrow} heading={f.heading} subheading={f.subheading} />

            <div className="lm-faq" style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 48 }}>
               {f.items.map((item, i) => (
                  <details
                     key={item.q}
                     open={i === 0}
                     style={{
                        background: "var(--ds-card)",
                        boxShadow: "var(--shadow-border)",
                        borderRadius: "var(--radius-lg)",
                        padding: "4px 20px",
                     }}
                  >
                     <summary
                        style={{
                           display: "flex",
                           alignItems: "center",
                           justifyContent: "space-between",
                           gap: 16,
                           padding: "16px 0",
                           fontSize: 16,
                           fontWeight: 500,
                           color: "var(--ds-text)",
                        }}
                     >
                        {item.q}
                        <ChevronDown
                           className="lm-faq-chevron"
                           size={18}
                           strokeWidth={1.75}
                           style={{ flexShrink: 0, color: "var(--ds-text-muted)" }}
                           aria-hidden
                        />
                     </summary>
                     <p
                        style={{
                           margin: 0,
                           padding: "0 0 18px",
                           fontSize: 15,
                           lineHeight: 1.65,
                           color: "var(--ds-text-secondary)",
                           maxWidth: 680,
                        }}
                     >
                        {item.a}
                     </p>
                  </details>
               ))}
            </div>
         </Container>
      </section>
   )
}
