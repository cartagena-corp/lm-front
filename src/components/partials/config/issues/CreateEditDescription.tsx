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
      <div className="bg-white p-6">
         <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
               {isEditing ? "Editar Descripción" : "Crear Nueva Descripción"}
            </h3>
            <p className="text-sm text-gray-600">
               {isEditing 
                  ? "Modifica el nombre de la descripción" 
                  : "Ingresa el nombre para la nueva descripción de tareas"
               }
            </p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de nombre */}
            <div>
               <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la descripción
               </label>
               <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                     errors.name 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 focus:border-purple-500'
                  }`}
                  placeholder="Ej: Criterios de aceptación, Descripción técnica..."
                  maxLength={50}
               />
               {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
               )}
            </div>

            {/* Preview */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
               <h4 className="text-sm font-medium text-gray-900 mb-2">Vista previa:</h4>
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0" />
                  <span className="font-medium text-sm text-gray-900">
                     {formData.name || "Nombre de la descripción"}
                  </span>
               </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
               <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
               >
                  Cancelar
               </button>
               <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
               >
                  {isEditing ? "Guardar Cambios" : "Crear Descripción"}
               </button>
            </div>
         </form>
      </div>
   )
}
