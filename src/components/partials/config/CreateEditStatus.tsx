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
      if (validateForm()) {
         onSubmit(formData)
      }
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
      <div className="space-y-6">
         {/* Header */}
         <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
               {currentStatus.name ? "Editar Estado" : "Crear Estado"}
            </h3>
            <p className="text-sm text-gray-500">
               {currentStatus.name ? "Modifica la información del estado" : "Define un nuevo estado para las tareas"}
            </p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input - First */}
            <div className="space-y-2">
               <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre del estado
               </label>
               <div className="relative">
                  <input
                     onChange={handleNameChange}
                     className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 ${
                        errors.name 
                           ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                           : 'border-gray-300 hover:border-gray-400'
                     }`}
                     placeholder="Ej: Por hacer, En progreso, Terminado..."
                     value={formData.name}
                     name="name"
                     type="text"
                     id="name"
                  />
                  {errors.name && (
                     <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
               </div>
            </div>

            {/* Color Picker - Second */}
            <div className="space-y-2">
               <label className="block text-sm font-medium text-gray-700">
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
                  <p className="text-sm text-red-600">{errors.color}</p>
               )}
            </div>

            {/* Preview - Always visible and centered */}
            <div className="bg-gray-100 flex flex-col justify-center items-center rounded-lg p-4">
               <p className="text-gray-400 text-xs mb-2">Vista previa</p>
               <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{
                     backgroundColor: `${formData.color}15`,
                     color: formData.color,
                     border: `1px solid ${formData.color}30`
                  }}
               >
                  <div
                     className="w-2 h-2 rounded-full"
                     style={{ backgroundColor: formData.color }}
                  />
                  {formData.name || "Nombre del estado"}
               </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
               <button
                  type="button"
                  onClick={onCancel}
                  className="bg-white hover:bg-gray-50 hover:border-gray-300 border-gray-200 border flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
               >
                  Cancelar
               </button>
               <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white border-transparent border hover:shadow-md flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
               >
                  {currentStatus.name ? "Guardar cambios" : "Crear estado"}
               </button>
            </div>
         </form>
      </div>
   )
}