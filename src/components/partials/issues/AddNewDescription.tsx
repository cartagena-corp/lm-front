import AutoResizeTextarea from "../../ui/AutoResizeTextarea"
import { useState } from "react"

interface FormProps {
   id?: string
   title: string
   text: string
}

interface AddNewDescriptionProps {
   onSubmit: (data: FormProps) => void
   onCancel: () => void
   desc?: FormProps
}

export default function AddNewDescription({ onSubmit, onCancel, desc = { id: "", title: "", text: "" } }: AddNewDescriptionProps) {
   const [formData, setFormData] = useState<FormProps>({ id: desc.id, title: desc.title, text: desc.text })

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit(formData)
   }

   return (
      <form onSubmit={handleSubmit} className="text-sm py-2">
         <span className="flex flex-col gap-2 mt-4 mb-8">
            <div className="flex flex-col gap-1">
               <label htmlFor="title" className="block text-[13px] font-medium" style={{ color: "var(--ds-text-secondary)" }}>
                  Título de la descripción
               </label>
               <input onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="outline-none rounded-md w-full h-9 px-3 text-sm bg-[var(--ds-card)] transition-shadow duration-150 shadow-[var(--shadow-border)] focus:shadow-[0_0_0_1px_var(--blue-700)] placeholder:text-[var(--ds-text-muted)]"
                  style={{ color: "var(--ds-text)" }}
                  value={formData.title}
                  name="title"
                  type="text"
                  id="title"
                  required
               />
            </div>

            <div>
               <label htmlFor="text" className="block text-[13px] font-medium" style={{ color: "var(--ds-text-secondary)" }}>
                  Contenido de la descripción
               </label>
               <AutoResizeTextarea onChange={(str) => setFormData({ ...formData, text: str })}
                  value={formData.text}
                  required={true}
                  className="border-0! text-sm bg-[var(--ds-card)] text-[var(--ds-text)] transition-shadow duration-150 shadow-[var(--shadow-border)] focus:shadow-[0_0_0_1px_var(--blue-700)] placeholder:text-[var(--ds-text-muted)]"
               />
            </div>
         </span>

         <section className="flex justify-between items-center gap-2">
            <button type="button" onClick={onCancel}
               className="w-full h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--ds-card)] hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
               style={{ color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}>
               Cancelar
            </button>
            <button type="submit"
               className="w-full h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
               style={{ color: "var(--primary-contrast-fg)" }}>
               Añadir Descripción
            </button>
         </section>
      </form>
   )
}