'use client'

import AutoResizeTextarea from '../ui/AutoResizeTextarea'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { useSprintStore } from '@/lib/store/SprintStore'
import { SprintProps } from '@/lib/types/types'
import { useRef, useState } from 'react'

interface FormProps {
   onSubmit: (data: SprintProps) => void
   onCancel: () => void
}

export default function CreateSprintForm({ onSubmit, onCancel }: FormProps) {
   const { sprintStatuses } = useSprintStore()
   const [isStatusOpen, setIsStatusOpen] = useState(false)

   const [formData, setFormData] = useState<SprintProps>({
      projectId: "",
      title: "",
      goal: "",
      status: sprintStatuses[0].id,
      statusObject: sprintStatuses[0],
      startDate: "",
      endDate: "",
   })

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit({ ...formData })
   }

   const statusRef = useRef(null)

   return (
      <form onSubmit={handleSubmit}>
         <div className='pt-4 pb-14 space-y-2'>
            <div className='space-y-1'>
               <label htmlFor="title" className="text-gray-700 text-sm font-medium">
                  Título del Sprint
               </label>
               <div className='border-gray-300 flex justify-center items-center rounded-md border px-2 gap-2'>
                  <input onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                     className="outline-none text-sm w-full py-2"
                     value={formData.title}
                     name="title"
                     type="text"
                     id="title"
                     required
                  />
               </div>
            </div>

            <div className='space-y-1'>
               <label className="text-gray-700 text-sm font-medium">
                  Meta del Sprint
               </label>
               <AutoResizeTextarea onChange={(str) => setFormData({ ...formData, goal: str })}
                  placeholder='Escribe una breve descripción de la meta del sprint'
                  value={formData.goal}
                  className='text-sm'
               />
            </div>

            <div className='space-y-1 relative' ref={statusRef}>
               <label className="text-gray-700 text-sm font-medium">
                  Estado
               </label>
               <button onClick={() => {
                  setIsStatusOpen(!isStatusOpen)
               }} type='button'
                  className='border-gray-300 flex justify-center items-center select-none rounded-md border w-full px-2 gap-2'>
                  <div className='py-2 w-full text-start text-sm'>
                     <span className='rounded-full text-xs border px-2 whitespace-nowrap h-fit w-fit'
                        style={{
                           backgroundColor: `${formData.statusObject?.color}0f`,
                           color: formData.statusObject?.color,
                        }}>
                        {formData.statusObject?.name ? formData.statusObject.name.charAt(0).toUpperCase() +
                           formData.statusObject.name.slice(1).toLowerCase() : ''}
                     </span>
                  </div>

                  <svg className={`text-gray-500 size-4 duration-150 ${isStatusOpen ? "-rotate-180" : ""}`}
                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>

                  {
                     isStatusOpen &&
                     <div className='border-gray-300 bg-white shadow-md absolute z-10 top-[105%] left-0  flex flex-col items-start rounded-md border text-sm w-full max-h-28 overflow-y-auto'>{
                        sprintStatuses && sprintStatuses.map((obj, i) =>
                           <span key={i} onClick={() => { setFormData({ ...formData, status: obj.id, statusObject: obj }), setIsStatusOpen(false) }}
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
                           </span>
                        )
                     }</div>
                  }
               </button>
            </div>

            <div className='flex justify-between items-center gap-2'>
               <div className='space-y-1 w-full'>
                  <label htmlFor="startDate" className="text-gray-700 text-sm font-medium">
                     Fecha de Inicio
                  </label>
                  <div className='border-gray-300 flex justify-center items-center rounded-md border px-2 gap-2'>
                     <input onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="outline-none text-sm w-full py-2"
                        value={formData.startDate}
                        name="startDate"
                        id="startDate"
                        type="date"
                        required
                     />
                  </div>
               </div>
               <div className='space-y-1 w-full'>
                  <label htmlFor="endDate" className="text-gray-700 text-sm font-medium">
                     Fecha de Fin
                  </label>
                  <div className='border-gray-300 flex justify-center items-center rounded-md border px-2 gap-2'>
                     <input onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="outline-none text-sm w-full py-2"
                        value={formData.endDate}
                        placeholder='Inserta un tiempo estimado en horas'
                        name="endDate"
                        id="endDate"
                        type="date"
                        required
                     />
                  </div>
               </div>
            </div>

         </div>
         <div className="pb-3 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
               type="submit"
               className="text-white inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold textWhite shadow-sm hover:bg-blue-500 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
            >
               Crear Nuevo Sprint
            </button>
            <button
               type="button"
               className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
               onClick={onCancel}
            >
               Cancelar
            </button>
         </div>
      </form >
   )
}
