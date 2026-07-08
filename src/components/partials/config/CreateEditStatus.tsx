import { ColorPicker } from "@/components/ui/ColorPicker"
import { useRef, useState } from "react"

interface DataProps {
   name: string
   color: string
}

interface FilterFormProps {
   onSubmit: (data: DataProps) => void
   onCancel: () => void
   currentStatus: DataProps
}

export default function CreateEditStatus({ onSubmit, onCancel, currentStatus = { name: "", color: "#6366f1" } }: FilterFormProps) {
   const [formData, setFormData] = useState<DataProps>({
      name: currentStatus.name,
      color: currentStatus.color.charAt(0) === "#" ? currentStatus.color : `#${currentStatus.color}`,
   })
   const [errors, setErrors] = useState<{ name?: string; color?: string }>({})

   const colorRef = useRef(null)

   const validateForm = () => {
      const newErrors: { name?: string; color?: string } = {}

      if (!formData.name.trim()) {
         newErrors.name = "El nombre es requerido"
      } else if (formData.name.trim().length < 2) {
         newErrors.name = "El nombre debe tener al menos 2 caracteres"
      }

      if (!formData.color) {
         newErrors.color = "El color es requerido"
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
   }

   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (validateForm()) onSubmit(formData)
   }

   const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setFormData({ ...formData, name: value })
      if (errors.name && value.trim()) {
         setErrors({ ...errors, name: undefined })
      }
   }

   const handleColorChange = (color: string) => {
      setFormData({ ...formData, color })
      if (errors.color && color) {
         setErrors({ ...errors, color: undefined })
      }
   }

   return (
      <div className="space-y-6 p-6">
         <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input - First */}
            <div className="space-y-2">
               <label htmlFor="name" className="block text-[13px] font-medium" style={{ color: "var(--ds-text-secondary)" }}>
                  Nombre del estado
               </label>
               <div className="relative">
                  <input
                     onChange={handleNameChange}
                     className="w-full h-9 px-3 rounded-md text-sm bg-[var(--ds-card)] outline-none transition-shadow duration-150 placeholder:text-[var(--ds-text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                     style={{ color: "var(--ds-text)", boxShadow: errors.name ? "0 0 0 1px var(--red-700)" : "var(--shadow-border)" }}
                     placeholder="Ej: Por hacer, En progreso, Terminado..."
                     value={formData.name}
                     name="name"
                     type="text"
                     id="name"
                  />
                  {errors.name && (
                     <p className="mt-1 text-sm" style={{ color: "var(--red-700)" }}>{errors.name}</p>
                  )}
               </div>
            </div>

            {/* Color Picker - Second */}
            <div className="space-y-2">
               <label className="block text-[13px] font-medium" style={{ color: "var(--ds-text-secondary)" }}>
                  Color del estado
               </label>
               <ColorPicker
                  id="color"
                  inputRef={colorRef}
                  value={formData.color}
                  label=""
                  onChange={handleColorChange}
               />
               {errors.color && (
                  <p className="text-sm" style={{ color: "var(--red-700)" }}>{errors.color}</p>
               )}
            </div>

            {/* Preview - Always visible and centered */}
            <div className="flex flex-col justify-center items-center rounded-md p-4" style={{ background: "var(--gray-alpha-100)" }}>
               <p className="text-xs mb-2" style={{ color: "var(--ds-text-muted)" }}>Vista previa</p>
               <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
               >
                  <div
                     className="w-2 h-2 rounded-full flex-shrink-0"
                     style={{ backgroundColor: formData.color }}
                  />
                  {formData.name || "Nombre del estado"}
               </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
               <button
                  className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--ds-card)] hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                  style={{ color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                  type="button"
                  onClick={() => onCancel()}>
                  Cancelar
               </button>
               <button
                  className="h-9 px-4 rounded-md text-sm font-medium transition-opacity duration-150 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                  style={{ background: "var(--primary-700)", color: "var(--primary-contrast-fg)" }}
                  type="submit">
                  {currentStatus.name ? "Guardar cambios" : "Crear estado"}
               </button>
            </div>
         </form>
      </div>
   )
}
