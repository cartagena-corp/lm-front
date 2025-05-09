import { ColorPicker } from "@/components/ui/ColorPicker"
import { useRef, useState } from "react"

interface DataProps {
   name: string
   color: string
}

interface FilterFormProps {
   onSubmit: (data: DataProps) => void
   onCancel: () => void
   currentTypes: DataProps
}


export default function CreateEditTypes({ onSubmit, onCancel, currentTypes = { name: "", color: "" } }: FilterFormProps) {
   const [formData, setFormData] = useState<DataProps>({
      name: currentTypes.name,
      color: currentTypes.color.charAt(0) === "#" ? currentTypes.color : `#${currentTypes.color}`,
   })

   const colorRef = useRef(null)

   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      onSubmit(formData)
   }

   return (
      <form onSubmit={handleSubmit}>
         <section className="flex flex-col gap-2 pt-4 pb-14">
            <ColorPicker id="color" inputRef={colorRef} value={formData.color} label="Color" onChange={(str) => setFormData({ ...formData, color: str })} />
            <div className='space-y-1'>
               <label htmlFor="name" className="text-sm font-medium">
                  Nombre del tipo
               </label>
               <div className='border-black/15 flex justify-center items-center rounded-md border px-2 gap-2'>
                  <input onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     className="outline-none text-sm w-full py-2"
                     placeholder={formData.name}
                     value={formData.name}
                     name="name"
                     type="text"
                     id="name"
                  />
               </div>
            </div>
         </section>

         <section className="pb-3 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button type="submit" className="text-white inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold textWhite shadow-sm hover:bg-blue-500 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2">
               {currentTypes.name !== "" ? "Editar" : "Crear"} tipo
            </button>
            <button type="button" onClick={onCancel} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0" >
               Cancelar
            </button>
         </section>
      </form>
   )
}