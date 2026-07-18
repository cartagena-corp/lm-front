"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Quote } from "lucide-react"
import { Container, SectionHeading } from "./primitives"
import { STORY_PEOPLE } from "@/lib/landing/stories"
import { SECTIONS } from "@/lib/landing/constants"
import type { Dictionary } from "@/lib/landing/i18n"

const SPEED = 0.4 // px per frame (~24px/s)

export default function CustomerStories({ dict }: { dict: Dictionary }) {
   const items = STORY_PEOPLE.map((person, i) => ({ ...person, ...dict.stories.items[i] }))
   const loop = [...items, ...items] // duplicated for a seamless marquee

   const viewportRef = useRef<HTMLDivElement>(null)
   const trackRef = useRef<HTMLDivElement>(null)
   const offset = useRef(0)
   const setWidth = useRef(0)
   const dragging = useRef(false)
   const paused = useRef(false)
   const raf = useRef<number | null>(null)
   const dragStartX = useRef(0)
   const dragStartOffset = useRef(0)

   useEffect(() => {
      const track = trackRef.current
      if (!track) return

      const apply = () => {
         track.style.transform = `translate3d(${offset.current}px,0,0)`
      }
      const wrap = () => {
         const w = setWidth.current
         if (w <= 0) return
         while (-offset.current >= w) offset.current += w
         while (offset.current > 0) offset.current -= w
      }
      const measure = () => {
         const kids = track.children
         if (kids.length > items.length) {
            const first = kids[0] as HTMLElement
            const mid = kids[items.length] as HTMLElement
            setWidth.current = mid.offsetLeft - first.offsetLeft
         }
      }

      measure()
      apply()
      const ro = new ResizeObserver(measure)
      ro.observe(track)

      const reduce =
         typeof window !== "undefined" &&
         !!window.matchMedia &&
         window.matchMedia("(prefers-reduced-motion: reduce)").matches

      if (!reduce) {
         const step = () => {
            if (!dragging.current && !paused.current) {
               offset.current -= SPEED
               wrap()
               apply()
            }
            raf.current = requestAnimationFrame(step)
         }
         raf.current = requestAnimationFrame(step)
      }

      return () => {
         if (raf.current) cancelAnimationFrame(raf.current)
         ro.disconnect()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   const onPointerDown = (e: React.PointerEvent) => {
      dragging.current = true
      dragStartX.current = e.clientX
      dragStartOffset.current = offset.current
      viewportRef.current?.setPointerCapture(e.pointerId)
   }
   const onPointerMove = (e: React.PointerEvent) => {
      if (!dragging.current) return
      let next = dragStartOffset.current + (e.clientX - dragStartX.current)
      const w = setWidth.current
      if (w > 0) {
         while (-next >= w) next += w
         while (next > 0) next -= w
      }
      offset.current = next
      if (trackRef.current) trackRef.current.style.transform = `translate3d(${next}px,0,0)`
   }
   const endDrag = (e: React.PointerEvent) => {
      dragging.current = false
      try {
         viewportRef.current?.releasePointerCapture(e.pointerId)
      } catch {
         /* pointer already released */
      }
   }

   return (
      <section
         id={SECTIONS.stories}
         style={{
            paddingBlock: "clamp(64px, 9vw, 120px)",
            background: "var(--ds-background-subtle)",
            scrollMarginTop: 80,
            overflow: "hidden",
         }}
      >
         <Container>
            <SectionHeading eyebrow={dict.stories.eyebrow} heading={dict.stories.heading} subheading={dict.stories.subheading} />
         </Container>

         <div
            ref={viewportRef}
            role="region"
            aria-label={dict.stories.heading}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onMouseEnter={() => (paused.current = true)}
            onMouseLeave={() => (paused.current = false)}
            onDragStart={(e) => e.preventDefault()}
            style={{
               marginTop: 40,
               overflow: "hidden",
               cursor: "grab",
               touchAction: "pan-y",
               WebkitMaskImage: "linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)",
               maskImage: "linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)",
            }}
         >
            <div
               ref={trackRef}
               style={{ display: "flex", gap: 20, width: "max-content", userSelect: "none", willChange: "transform", paddingInline: 24 }}
            >
               {loop.map((story, i) => (
                  <article
                     key={i}
                     style={{
                        flex: "0 0 340px",
                        maxWidth: "82vw",
                        background: "var(--ds-card)",
                        boxShadow: "var(--shadow-border)",
                        borderRadius: "var(--radius-xl)",
                        padding: 24,
                     }}
                  >
                     <Quote size={22} strokeWidth={1.5} style={{ color: "var(--blue-600)" }} aria-hidden />
                     <p style={{ margin: "14px 0 0", fontSize: 15, lineHeight: 1.6, color: "var(--ds-text)" }}>{story.quote}</p>
                     <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
                        <Image
                           src={story.face}
                           alt=""
                           width={48}
                           height={48}
                           draggable={false}
                           style={{ width: 48, height: 48, borderRadius: "var(--radius-full)", objectFit: "cover", flexShrink: 0 }}
                        />
                        <div style={{ minWidth: 0 }}>
                           <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ds-text)" }}>{story.name}</div>
                           <div style={{ fontSize: 13, color: "var(--ds-text-muted)" }}>{story.role}</div>
                        </div>
                     </div>
                  </article>
               ))}
            </div>
         </div>
      </section>
   )
}
