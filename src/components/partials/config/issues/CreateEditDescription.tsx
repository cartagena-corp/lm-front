import { useRef, useState } from "react"

interface DataProps {
   name: string
}

interface CreateEditDescriptionProps {
   onSubmit: (data: DataProps) => void
   onCancel: () => void
   currentDescription: DataProps
}

export default function CreateEditDescription({
   onSubmit,
   onCancel,
   currentDescription = { name: "" }
}: CreateEditDescriptionProps) {
   const [formData, setFormData] = useState<DataProps>({
      name: currentDescription.name,
   })
   const [errors, setErrors] = useState<{ name?: string }>({})

   const validateForm = () => {
      const newErrors: { name?: string } = {}

      if (!formData.name.trim()) {
         newErrors.name = "El nombre es requerido"
      } else if (formData.name.trim().length < 2) {
         newErrors.name = "El nombre debe tener al menos 2 caracteres"
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
   }

   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (validateForm()) {
         onSubmit(formData)
      }
   }

   const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setFormData({ ...formData, name: value })
      if (errors.name) {
         setErrors({ ...errors, name: undefined })
      }
   }

   const isEditing = currentDescription.name !== ""

   return (
      <div className="bg-[var(--ds-card)] p-6">
         <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de nombre */}
            <div>
               <label htmlFor="name" className="block text-sm font-medium text-[var(--ds-text-secondary)] mb-2">
                  Nombre de la descripción
               </label>
               <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 rounded-md outline-none transition-shadow duration-150 focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                  style={{ boxShadow: errors.name ? "0 0 0 1px var(--red-700)" : "var(--shadow-border)", background: errors.name ? "var(--red-100)" : "var(--ds-card)" }}
                  placeholder="Ej: Criterios de aceptación, Descripción técnica..."
                  maxLength={50}
               />
               {errors.name && (
                  <p className="mt-1 text-sm text-[var(--red-700)]">{errors.name}</p>
               )}
            </div>

            {/* Preview */}
            <div className="p-4 bg-[var(--gray-alpha-100)] rounded-md" style={{ boxShadow: "var(--shadow-border)" }}>
               <h4 className="text-sm font-medium text-[var(--ds-text-muted)] mb-2">Vista previa:</h4>
               <div className="flex items-center gap-3">
                  <div className={`${isEditing ? "bg-[var(--purple-500)]" : "bg-[var(--blue-500)]"} w-3 h-3 rounded-full flex-shrink-0`} />
                  <span className="font-medium text-sm text-[var(--ds-text)]">
                     {formData.name || "Nombre de la descripción"}
                  </span>
               </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3">
               <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-[var(--ds-text)] bg-[var(--ds-card)] rounded-md hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2 transition-all duration-200 text-sm font-medium"
                  style={{ boxShadow: "var(--shadow-border)" }}
               >
                  Cancelar
               </button>
               <button
                  type="submit"
                  className="bg-[var(--primary-700)] hover:bg-[var(--primary-800)] px-4 py-2 text-[var(--primary-contrast-fg)] rounded-md focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2 transition-all duration-200 text-sm font-medium"
               >
                  {isEditing ? "Guardar Cambios" : "Crear Descripción"}
               </button>
            </div>
         </form>
      </div>
   )
}
