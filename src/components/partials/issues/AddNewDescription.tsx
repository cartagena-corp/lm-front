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
               <label htmlFor="title" className="text-gray-700 text-sm font-medium">
                  Título de la descripción
               </label>
               <input onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border-gray-300 outline-none rounded-md w-full border p-2"
                  value={formData.title}
                  name="title"
                  type="text"
                  id="title"
                  required
               />
            </div>

            <div>
               <label htmlFor="text" className="text-gray-700 text-sm font-medium">
                  Contenido de la descripción
               </label>
               <AutoResizeTextarea onChange={(str) => setFormData({ ...formData, text: str })}
                  value={formData.text}
                  required={true}
               />
            </div>
         </span>

         <section className="flex justify-between items-center gap-2">
            <button type="button" onClick={onCancel} className="border-black/15 hover:bg-red-600 hover:text-white duration-150 rounded-md border w-full p-2">Cancelar</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white duration-150 border-transparent rounded-md border w-full p-2">Añadir Descripción</button>
         </section>
      </form>
   )
}