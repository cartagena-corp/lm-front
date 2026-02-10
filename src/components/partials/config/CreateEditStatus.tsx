import { ColorPicker } from "@/components/ui/ColorPicker"
import { Button, TextInput } from "@/components/ui/FormUI"
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
      <form onSubmit={handleSubmit} className='space-y-4'>
         <main className='flex flex-col gap-4'>
            <TextInput placeholder="Ej: Por hacer, En progreso, Terminado..."
               value={formData.name} onChange={(str) => setFormData({ ...formData, name: str })}
               label="Nombre del estado" variant={currentStatus.name ? "purple" : "blue"} isRequired={true} type='text' />

            <ColorPicker
               id="color"
               inputRef={colorRef}
               value={formData.color}
               label="Color del estado"
               onChange={handleColorChange}
            />
         </main>

         <hgroup className="bg-gray-100 flex flex-col justify-center items-center rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-2">Vista previa</p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
               style={{ backgroundColor: `${formData.color}15`, color: formData.color, border: `1px solid ${formData.color}30` }}>
               <span className="w-2 h-2 rounded-full" style={{ backgroundColor: formData.color }} />
               {formData.name || "Nombre del estado"}
            </div>
         </hgroup>

         <footer className="flex justify-end items-center gap-2">
            <Button onClick={() => onCancel()} size='sm' variant='gray'>Cancelar</Button>
            <Button type="submit" size='sm' variant={currentStatus.name ? "purple" : "blue"}>{currentStatus.name ? "Guardar cambios" : "Crear estado"}</Button>
         </footer>
      </form>
   )
}