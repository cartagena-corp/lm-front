"use client"

import { useState } from "react"
import { BellIcon, PlusIcon, EditIcon } from "@/assets/Icon"

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
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
               {isEdit ? <EditIcon size={24} /> : <PlusIcon size={24} />}
            </div>
            <div>
               <h3 className="text-lg font-semibold text-gray-900">
                  {isEdit ? "Editar Tipo de Notificación" : "Crear Tipo de Notificación"}
               </h3>
               <p className="text-sm text-gray-600">
                  {isEdit ? "Actualiza la información del tipo" : "Crea un nuevo tipo de notificación"}
               </p>
            </div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                     errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Tareas, Recordatorios, Alertas..."
                  maxLength={50}
               />
               {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
               )}
            </div>

            <div className="flex gap-3 pt-4">
               <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium"
               >
                  Cancelar
               </button>
               <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center gap-2"
               >
                  {isEdit ? <EditIcon size={16} /> : <PlusIcon size={16} />}
                  {isEdit ? "Actualizar" : "Crear"}
               </button>
            </div>
         </form>
      </div>
   )
}
