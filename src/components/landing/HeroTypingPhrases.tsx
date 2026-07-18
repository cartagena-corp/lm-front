"use client"

import { useEffect, useRef, useState } from "react"

// Rotating type/delete headline — same mechanism as the /login TypingHeadline,
// with landing copy. Decorative (the real <h1> is static, server-rendered).
// Respects prefers-reduced-motion by swapping phrases discretely.
const TYPE_MS = 45
const DELETE_MS = 22
const HOLD_MS = 2600

export default function HeroTypingPhrases({ phrases }: { phrases: string[] }) {
   const [index, setIndex] = useState(0)
   const [text, setText] = useState("")
   const [deleting, setDeleting] = useState(false)
   const reduced = useRef(false)

   // Detect reduced-motion once; if set, cycle whole phrases on a timer.
   useEffect(() => {
      reduced.current =
         typeof window !== "undefined" &&
         !!window.matchMedia &&
         window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (reduced.current) {
         setText(phrases[0])
         const id = setInterval(() => setIndex((i) => (i + 1) % phrases.length), 3600)
         return () => clearInterval(id)
      }
   }, [phrases])

   useEffect(() => {
      if (reduced.current) {
         setText(phrases[index])
         return
      }
      const full = phrases[index]
      let timeout: ReturnType<typeof setTimeout>

      if (!deleting) {
         if (text.length < full.length) {
            timeout = setTimeout(() => setText(full.slice(0, text.length + 1)), TYPE_MS)
         } else {
            timeout = setTimeout(() => setDeleting(true), HOLD_MS)
         }
      } else {
         if (text.length > 0) {
            timeout = setTimeout(() => setText(full.slice(0, text.length - 1)), DELETE_MS)
         } else {
            timeout = setTimeout(() => {
               setDeleting(false)
               setIndex((i) => (i + 1) % phrases.length)
            }, 220)
         }
      }
      return () => clearTimeout(timeout)
   }, [text, deleting, index, phrases])

   // Rendered in the eyebrow slot: keeps the mono-label "leyenda" styling
   // (uppercase, tracked, mono) but cycles the phrases like a typewriter.
   return (
      <p
         aria-live="polite"
         className="mono-label"
         style={{
            display: "block",
            margin: 0,
            color: "var(--blue-600)",
            minHeight: "2.6em",
            maxWidth: 520,
         }}
      >
         <span>{text}</span>
         <span className="lm-caret" aria-hidden style={{ color: "var(--blue-600)", fontWeight: 400 }}>
            |
         </span>
      </p>
   )
}
