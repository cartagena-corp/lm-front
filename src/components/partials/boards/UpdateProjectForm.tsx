import { ProjectProps } from "@/lib/types/types"
import { useRef, useState } from "react"
import AutoResizeTextarea from "../../ui/AutoResizeTextarea"
import { useConfigStore } from "@/lib/store/ConfigStore"

interface FormProps {
   name: string,
   description?: string,
   startDate?: string,
   endDate?: string,
   status: number
}

interface UpdateProjectFormProps {
   onSubmit: (data: FormProps) => void
   onCancel: () => void
   projectObject: ProjectProps
}

export default function UpdateProjectForm({ onSubmit, onCancel, projectObject }: UpdateProjectFormProps) {
   const [formData, setFormData] = useState<FormProps>(
      {
         name: projectObject.name,
         description: projectObject.description,
         status: projectObject.status as number,
         startDate: projectObject.startDate,
         endDate: projectObject.endDate
      }
   )
   const [isStatusOpen, setIsStatusOpen] = useState(false)
   const { projectStatus } = useConfigStore()

   const statusRef = useRef(null)

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit(formData)
   }

   return (
      <form onSubmit={handleSubmit} className="space-y-4">
         <section className="flex flex-col gap-2 pt-4 pb-14">
            <div className='space-y-1'>
               <label htmlFor="name" className="text-gray-700 text-sm font-medium">
                  Nombre del Tablero
               </label>
               <div className='border-gray-300 flex justify-center items-center rounded-md border px-2 gap-2'>
                  <input onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     placeholder={projectObject.name}
                     className="outline-none text-sm w-full py-2"
                     value={formData.name}
                     name="name"
                     type="text"
                     id="name"
                  />
               </div>
            </div>

            <div className='space-y-1'>
               <label htmlFor="desc" className="text-gray-700 text-sm font-medium">
                  Descripción
               </label>
               <AutoResizeTextarea onChange={(str) => setFormData({ ...formData, description: str })}
                  placeholder={projectObject.description}
                  value={formData.description as string}
                  className='text-sm'
               />
            </div>

            <div className='space-y-1'>
               <label htmlFor="startDate" className="text-gray-700 text-sm font-medium">
                  Fecha de Inicio
               </label>
               <div className='border-gray-300 flex justify-center items-center rounded-md border px-2 gap-2'>
                  <input onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                     className="outline-none text-sm w-full py-2"
                     value={formData.startDate}
                     name="startDate"
                     type="date"
                     id="startDate"
                  />
               </div>
            </div>

            <div className='space-y-1'>
               <label htmlFor="endDate" className="text-gray-700 text-sm font-medium">
                  Fecha de Finalización
               </label>
               <div className='border-gray-300 flex justify-center items-center rounded-md border px-2 gap-2'>
                  <input onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                     className="outline-none text-sm w-full py-2"
                     value={formData.endDate}
                     name="endDate"
                     type="date"
                     id="endDate"
                  />
               </div>
            </div>

            <div className='space-y-1 relative' ref={statusRef}>
               <label htmlFor="state" className="text-gray-700 text-sm font-medium">
                  Estado
               </label>

               <button onClick={() => setIsStatusOpen(!isStatusOpen)} type='button'
                  className='border-gray-300 flex justify-center items-center select-none rounded-md border w-full px-2 gap-2'>
                  <p className='py-2 w-full text-start text-sm'>
                     {projectStatus?.find(st => st.id === formData.status)?.name}
                  </p>

                  <svg className={`text-gray-500 size-4 duration-150 ${isStatusOpen ? "-rotate-180" : ""}`}
                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                  {
                     isStatusOpen &&
                     <div className='border-gray-300 bg-white shadow-md absolute z-10 top-[110%] flex flex-col items-start rounded-md border text-sm w-full max-h-28 overflow-y-auto'>{
                        projectStatus?.map(obj =>
                           <div key={obj.id} onClick={() => { setFormData({ ...formData, status: obj.id }), setIsStatusOpen(false) }}
                              className='hover:bg-black/5 duration-150 w-full text-start py-2 px-2 flex items-center gap-2'>
                              {
                                 obj.id === formData.status ?
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                                       <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                    :
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                                       <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" className='hidden' />
                                    </svg>

                              }
                              {obj.name}
                           </div>
                        )
                     }</div>
                  }
               </button>
            </div>
         </section>

         <section className="pb-3 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
               type="submit"
               className="text-white inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold textWhite shadow-sm hover:bg-blue-500 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
            >
               Actualizar Tablero
            </button>
            <button
               type="button"
               className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
               onClick={onCancel}
            >
               Cancelar
            </button>
         </section>
      </form>
   )
}