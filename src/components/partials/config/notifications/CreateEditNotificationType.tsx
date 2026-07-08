"use client"

import { useState } from "react"
import { Plus, Pencil } from "lucide-react"

interface CreateEditNotificationTypeProps {
   onSubmit: (data: { name: string }) => void
   onCancel: () => void
   currentType?: { id?: string, name: string }
}

export default function CreateEditNotificationType({ onSubmit, onCancel, currentType }: CreateEditNotificationTypeProps) {
   const [name, setName] = useState(currentType?.name || "")
   const [errors, setErrors] = useState<{ name?: string }>({})

   const isEdit = !!currentType?.id

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      const newErrors: { name?: string } = {}

      if (!name.trim()) {
         newErrors.name = "El nombre es requerido"
      }

      if (Object.keys(newErrors).length > 0) {
         setErrors(newErrors)
         return
      }

      onSubmit({ name: name.trim() })
   }

   return (
      <div className="p-6 max-w-md mx-auto">
         <div className="flex items-center gap-4 mb-6">
            <div className="p-3" style={{ borderRadius: "var(--radius-md)", background: "var(--blue-200)", color: "var(--blue-900)" }}>
               {isEdit ? <Pencil size={24} strokeWidth={1.5} /> : <Plus size={24} strokeWidth={1.5} />}
            </div>
            <div>
               <h3 className="text-lg font-semibold" style={{ color: "var(--ds-text)" }}>
                  {isEdit ? "Editar Tipo de Notificación" : "Crear Tipo de Notificación"}
               </h3>
               <p className="text-sm" style={{ color: "var(--ds-text-secondary)" }}>
                  {isEdit ? "Actualiza la información del tipo" : "Crea un nuevo tipo de notificación"}
               </p>
            </div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: "var(--ds-text-secondary)" }}>
                  Nombre del Tipo *
               </label>
               <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => {
                     setName(e.target.value)
                     if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
                  }}
                  className="w-full h-10 px-3 rounded-md text-sm bg-[var(--ds-card)] outline-none transition-shadow duration-150 placeholder:text-[var(--ds-text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                  style={{ color: "var(--ds-text)", boxShadow: errors.name ? "0 0 0 1px var(--red-700)" : "var(--shadow-border)" }}
                  placeholder="Ej: Tareas, Recordatorios, Alertas..."
                  maxLength={50}
               />
               {errors.name && (
                  <p className="text-xs mt-1" style={{ color: "var(--red-700)" }}>{errors.name}</p>
               )}
            </div>

            <div className="flex gap-3 pt-4">
               <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--ds-card)] hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                  style={{ color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
               >
                  Cancelar
               </button>
               <button
                  type="submit"
                  className="flex-1 h-9 px-4 rounded-md text-sm font-medium transition-opacity duration-150 hover:opacity-90 flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                  style={{ background: "var(--primary-700)", color: "var(--primary-contrast-fg)" }}
               >
                  {isEdit ? <Pencil size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />}
                  {isEdit ? "Actualizar" : "Crear"}
               </button>
            </div>
         </form>
      </div>
   )
}
