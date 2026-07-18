"use client"

import { useState } from "react"
import { User, Building2, Mail, Phone } from "lucide-react"
import type { Dictionary } from "@/lib/landing/i18n"

export interface DemoFormData {
   fullName: string
   company: string
   email: string
   phone: string
   comment: string
}

const COMMENT_MAX = 500

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

function Field({
   id,
   label,
   icon,
   error,
   children,
}: {
   id: string
   label: string
   icon?: React.ReactNode
   error?: string
   children: React.ReactNode
}) {
   return (
      <div>
         <label htmlFor={id} style={labelStyle}>
            {label} <span style={{ color: "var(--red-700)" }}>*</span>
         </label>
         <div
            className="focus-within:outline-2 focus-within:outline-[var(--blue-700)] focus-within:outline-offset-2"
            style={{
               display: "flex",
               alignItems: "center",
               gap: 8,
               height: 44,
               padding: "0 12px",
               borderRadius: "var(--radius-md)",
               background: "var(--ds-card)",
               boxShadow: error ? "0 0 0 1px var(--red-700)" : "var(--shadow-border)",
            }}
         >
            {icon}
            {children}
         </div>
         {error && <p style={{ color: "var(--red-700)", fontSize: 12, marginTop: 6 }}>{error}</p>}
      </div>
   )
}

export default function DemoRequestModal({
   dict,
   onClose,
   onConfirm,
}: {
   dict: Dictionary
   onClose: () => void
   onConfirm: (data: DemoFormData) => void
}) {
   const m = dict.schedule.modal
   const [form, setForm] = useState<DemoFormData>({ fullName: "", company: "", email: "", phone: "", comment: "" })
   const [errors, setErrors] = useState<Partial<Record<keyof DemoFormData, string>>>({})

   const set = (key: keyof DemoFormData, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }))
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
   }

   const submit = (e: React.FormEvent) => {
      e.preventDefault()
      const next: Partial<Record<keyof DemoFormData, string>> = {}
      if (!form.fullName.trim()) next.fullName = m.required
      if (!form.company.trim()) next.company = m.required
      if (!form.email.trim()) next.email = m.required
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = m.invalidEmail
      if (!form.phone.trim()) next.phone = m.required
      if (Object.keys(next).length) {
         setErrors(next)
         return
      }
      onConfirm({ ...form, fullName: form.fullName.trim(), company: form.company.trim(), email: form.email.trim(), phone: form.phone.trim() })
   }

   const iconProps = { size: 16, strokeWidth: 1.5, style: { color: "var(--ds-text-muted)" } } as const

   return (
      <form onSubmit={submit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
         <div className="lm-modal-fields">
            <Field id="demo-name" label={m.fullName} icon={<User {...iconProps} />} error={errors.fullName}>
               <input id="demo-name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder={m.fullNamePlaceholder} autoComplete="name" style={inputReset} />
            </Field>
            <Field id="demo-company" label={m.company} icon={<Building2 {...iconProps} />} error={errors.company}>
               <input id="demo-company" value={form.company} onChange={(e) => set("company", e.target.value)} placeholder={m.companyPlaceholder} autoComplete="organization" style={inputReset} />
            </Field>
            <Field id="demo-email" label={m.email} icon={<Mail {...iconProps} />} error={errors.email}>
               <input id="demo-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder={m.emailPlaceholder} autoComplete="email" style={inputReset} />
            </Field>
            <Field id="demo-phone" label={m.phone} icon={<Phone {...iconProps} />} error={errors.phone}>
               <input id="demo-phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder={m.phonePlaceholder} autoComplete="tel" style={inputReset} />
            </Field>
         </div>

         {/* Comment */}
         <div>
            <label htmlFor="demo-comment" style={labelStyle}>
               {m.comment}
            </label>
            <div
               className="focus-within:outline-2 focus-within:outline-[var(--blue-700)] focus-within:outline-offset-2"
               style={{ padding: "10px 12px", borderRadius: "var(--radius-md)", background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}
            >
               <textarea
                  id="demo-comment"
                  value={form.comment}
                  maxLength={COMMENT_MAX}
                  onChange={(e) => set("comment", e.target.value)}
                  placeholder={m.commentPlaceholder}
                  rows={3}
                  style={{ ...inputReset, width: "100%", resize: "vertical", minHeight: 72, lineHeight: 1.5 }}
               />
            </div>
            <div style={{ textAlign: "right", marginTop: 6, fontSize: 12, color: "var(--ds-text-muted)", fontFamily: "var(--font-mono)" }}>
               {m.commentCounter.replace("{n}", String(form.comment.length))}
            </div>
         </div>

         {/* Footer */}
         <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} className="lm-btn lm-btn-secondary lm-btn-sm">
               {m.close}
            </button>
            <button type="submit" className="lm-btn lm-btn-primary lm-btn-sm">
               {m.confirm}
            </button>
         </div>
      </form>
   )
}
