"use client"

import { useRef, useState } from "react"
import { ImagePlus, X } from "lucide-react"
import type { Dictionary } from "@/lib/landing/i18n"

type DemoDict = Dictionary["hero"]["demo"]

export interface NewIssuePayload {
   title: string
   description: string
   image?: string
}

// Downscale a picked image to a small JPEG data URL so sessionStorage stays
// well under quota (the demo persists the board there).
function resizeToDataUrl(file: File, maxDim: number, quality: number): Promise<string> {
   return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
         const img = new Image()
         img.onload = () => {
            const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
            const w = Math.max(1, Math.round(img.width * scale))
            const h = Math.max(1, Math.round(img.height * scale))
            const canvas = document.createElement("canvas")
            canvas.width = w
            canvas.height = h
            const ctx = canvas.getContext("2d")
            if (!ctx) return resolve(reader.result as string)
            ctx.drawImage(img, 0, 0, w, h)
            resolve(canvas.toDataURL("image/jpeg", quality))
         }
         img.onerror = () => resolve(reader.result as string)
         img.src = reader.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
   })
}

const labelStyle: React.CSSProperties = {
   display: "block",
   fontSize: 13,
   fontWeight: 500,
   color: "var(--ds-text-secondary)",
   marginBottom: 6,
}

const inputReset: React.CSSProperties = {
   flex: 1,
   minWidth: 0,
   border: "none",
   outline: "none",
   background: "transparent",
   color: "var(--ds-text)",
   fontFamily: "var(--font-sans)",
   fontSize: 14,
}

export default function CreateIssueDemoForm({
   demo,
   onCancel,
   onCreate,
}: {
   demo: DemoDict
   onCancel: () => void
   onCreate: (payload: NewIssuePayload) => void
}) {
   const f = demo.form
   const [title, setTitle] = useState("")
   const [description, setDescription] = useState("")
   const [image, setImage] = useState<string | undefined>(undefined)
   const [error, setError] = useState("")
   const fileRef = useRef<HTMLInputElement>(null)

   const handleFile = async (file: File | null | undefined) => {
      if (!file || !file.type.startsWith("image/")) return
      try {
         setImage(await resizeToDataUrl(file, 640, 0.82))
      } catch {
         /* ignore unreadable file */
      }
   }

   const submit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!title.trim()) {
         setError(f.titleRequired)
         return
      }
      onCreate({ title: title.trim(), description: description.trim(), image })
   }

   return (
      <form onSubmit={submit} style={{ padding: 24 }}>
         {/* Title */}
         <label htmlFor="demo-title" style={labelStyle}>
            {f.titleLabel} <span style={{ color: "var(--red-700)" }}>*</span>
         </label>
         <div
            className="focus-within:outline-2 focus-within:outline-[var(--blue-700)] focus-within:outline-offset-2"
            style={{
               display: "flex",
               alignItems: "center",
               height: 44,
               padding: "0 12px",
               borderRadius: "var(--radius-md)",
               background: "var(--ds-card)",
               boxShadow: error ? "0 0 0 1px var(--red-700)" : "var(--shadow-border)",
            }}
         >
            <input
               id="demo-title"
               value={title}
               onChange={(e) => {
                  setTitle(e.target.value)
                  if (error) setError("")
               }}
               placeholder={f.titlePlaceholder}
               autoComplete="off"
               style={inputReset}
            />
         </div>
         {error && <p style={{ color: "var(--red-700)", fontSize: 12, marginTop: 6 }}>{error}</p>}

         {/* Description */}
         <label htmlFor="demo-desc" style={{ ...labelStyle, marginTop: 18 }}>
            {f.descLabel}
         </label>
         <div
            className="focus-within:outline-2 focus-within:outline-[var(--blue-700)] focus-within:outline-offset-2"
            style={{
               padding: "10px 12px",
               borderRadius: "var(--radius-md)",
               background: "var(--ds-card)",
               boxShadow: "var(--shadow-border)",
            }}
         >
            <textarea
               id="demo-desc"
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               placeholder={f.descPlaceholder}
               rows={3}
               style={{ ...inputReset, width: "100%", resize: "vertical", minHeight: 72, lineHeight: 1.5 }}
            />
         </div>

         {/* Image */}
         <label style={{ ...labelStyle, marginTop: 18 }}>{f.imageLabel}</label>
         <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0])}
            style={{ display: "none" }}
         />
         {image ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img
                  src={image}
                  alt=""
                  width={72}
                  height={72}
                  style={{ width: 72, height: 72, objectFit: "cover", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-border)" }}
               />
               <button
                  type="button"
                  onClick={() => {
                     setImage(undefined)
                     if (fileRef.current) fileRef.current.value = ""
                  }}
                  className="hover:bg-[var(--red-100)] hover:text-[var(--red-900)]"
                  style={{
                     display: "inline-flex",
                     alignItems: "center",
                     gap: 6,
                     padding: "6px 10px",
                     borderRadius: "var(--radius-md)",
                     border: "none",
                     background: "transparent",
                     color: "var(--ds-text-secondary)",
                     fontSize: 13,
                     cursor: "pointer",
                  }}
               >
                  <X size={15} strokeWidth={1.75} />
                  {f.imageRemove}
               </button>
            </div>
         ) : (
            <button
               type="button"
               onClick={() => fileRef.current?.click()}
               className="hover:bg-[var(--gray-alpha-100)]"
               style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  height: 60,
                  padding: "0 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px dashed var(--ds-border-strong)",
                  background: "transparent",
                  color: "var(--ds-text-secondary)",
                  cursor: "pointer",
                  textAlign: "left",
               }}
            >
               <ImagePlus size={20} strokeWidth={1.5} style={{ color: "var(--ds-text-muted)" }} />
               <span style={{ fontSize: 14 }}>{f.imageHint}</span>
            </button>
         )}

         {/* Footer */}
         <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
            <button type="button" onClick={onCancel} className="lm-btn lm-btn-secondary lm-btn-sm">
               {f.cancel}
            </button>
            <button type="submit" className="lm-btn lm-btn-primary lm-btn-sm">
               {f.create}
            </button>
         </div>
      </form>
   )
}
