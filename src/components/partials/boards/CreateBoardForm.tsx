'use client'

import { ProjectProps } from '@/lib/types/types'
import { useEffect, useRef, useState, DragEvent } from 'react'
import AutoResizeTextarea from '../../ui/AutoResizeTextarea'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { XIcon, PlusIcon } from '@/assets/Icon'

interface CreateBoardFormProps {
   onSubmit: (newBoard: ProjectProps, jiraImport: File | null) => void
   onCancel: () => void
   editData?: ProjectProps | null // Para modo edición
   isEdit?: boolean // Para determinar si es edición o creación
}

export default function CreateBoardForm({ onSubmit, onCancel, editData = null, isEdit = false }: CreateBoardFormProps) {
   const { projectStatus } = useConfigStore()
   const [isStatusOpen, setIsStatusOpen] = useState(false)
   const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
   const [dragActive, setDragActive] = useState(false)
   const [formData, setFormData] = useState<ProjectProps>({
      id: editData?.id || "",
      name: editData?.name || "",
      description: editData?.description || "",
      startDate: editData?.startDate || "",
      endDate: editData?.endDate || "",
      status: editData?.status || { id: 0, name: "", color: "" },
      createdAt: editData?.createdAt || "",
      updatedAt: editData?.updatedAt || "",
   })

   const [jiraImport, setJiraImport] = useState<File | null>(null)
   const inputRef = useRef<HTMLInputElement>(null)
   const statusRef = useRef(null)

   useEffect(() => {
      if (projectStatus && !isEdit) {
         setFormData({
            ...formData,
            status: projectStatus[0]
         })
      } else if (projectStatus && isEdit && editData) {
         // En modo edición, mantener el estado actual del proyecto
         const currentStatus = projectStatus.find(status =>
            (typeof editData.status === 'object' && (editData.status !== null && status.id === editData.status.id)) ||
            (typeof editData.status === 'number' && status.id === editData.status) || { id: 0, name: "", color: "" }
         )
         if (currentStatus) {
            setFormData(prev => ({
               ...prev,
               status: currentStatus
            }))
         }
      }
   }, [projectStatus, isEdit, editData])

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit(formData, jiraImport)
   }

   const handleDrag = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
      if (e.type === 'dragleave') setDragActive(false)
   }

   const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
         setJiraImport(e.dataTransfer.files[0])
      }
   }

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) setJiraImport(e.target.files[0])
      else setJiraImport(null)
   }

   const clearFile = () => {
      setJiraImport(null)
      if (inputRef.current) inputRef.current.value = ''
   }


   return (
      <div className="bg-white border-gray-100">
         {/* Form Content */}
         <form onSubmit={handleSubmit} className="p-6">
            <div className='space-y-4'>
               {/* Nombre del Tablero */}
               <div className='flex flex-col'>
                  <label htmlFor="name" className="text-gray-900 text-sm font-semibold">
                     Nombre del Tablero
                     <span className='text-red-500 ml-1'>*</span>
                  </label>
                  <div className='border-gray-200 flex items-center rounded-lg border px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200'>
                     <input
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={isEdit ? (editData?.name || 'Nombre del tablero') : 'Ej: Proyecto Marketing Digital 2025'}
                        className="outline-none text-sm w-full bg-transparent placeholder-gray-400"
                        value={formData.name}
                        name="name"
                        type="text"
                        id="name"
                        required
                     />
                  </div>
               </div>

               {/* Descripción */}
               <div className='flex flex-col'>
                  <div className='flex items-center justify-between text-sm gap-2'>
                     <label htmlFor="desc" className="text-gray-900 font-semibold">
                        Descripción
                        <span className='text-red-500 ml-1'>*</span>
                     </label>

                     <div className='flex items-center gap-2 text-xs'>
                        <div className={`w-2 h-2 rounded-full ${formData.description.length > 280 ? 'bg-red-500' : formData.description.length > 250 ? 'bg-orange-500' : 'bg-green-500'}`} />
                        <span className={`font-medium ${formData.description.length > 280 ? 'text-red-600' : formData.description.length > 250 ? 'text-orange-600' : 'text-green-600'}`}>
                           {formData.description.length}/300
                        </span>
                     </div>
                  </div>
                  <div className='space-y-2'>
                     <div className='border-gray-200 flex items-center rounded-lg border focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200'>
                        <AutoResizeTextarea
                           required
                           value={formData.description}
                           onChange={(str) => {
                              if (str.length <= 300) {
                                 setFormData({ ...formData, description: str })
                              }
                           }}
                           className='text-sm! px-4 py-2 w-full resize-none bg-transparent placeholder-gray-400 border-0!'
                           placeholder='Describe el propósito, objetivos y alcance del tablero...'
                        />
                     </div>
                     <p className='text-gray-500 leading-relaxed text-xs'>
                        💡 Una descripción clara ayuda al equipo a entender el propósito del proyecto
                     </p>
                  </div>
               </div>

               {/* Fechas en Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fecha de Inicio */}
                  <div className='space-y-2'>
                     <label htmlFor="startDate" className="text-gray-900 text-sm font-semibold">
                        Fecha de Inicio
                        <span className='text-red-500 ml-1'>*</span>
                     </label>
                     <div className='border-gray-200 flex items-center rounded-lg border px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200'>
                        <input
                           onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                           className="outline-none text-sm w-full bg-transparent"
                           value={formData.startDate}
                           name="startDate"
                           type="date"
                           id="startDate"
                           required
                        />
                     </div>
                  </div>

                  {/* Fecha de Finalización */}
                  <div className='space-y-2'>
                     <label htmlFor="endDate" className="text-gray-900 text-sm font-semibold">
                        Fecha de Finalización
                        <span className='text-red-500 ml-1'>*</span>
                     </label>
                     <div className='border-gray-200 flex items-center rounded-lg border px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200'>
                        <input
                           onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                           className="outline-none text-sm w-full bg-transparent"
                           value={formData.endDate}
                           name="endDate"
                           type="date"
                           id="endDate"
                           required
                        />
                     </div>
                  </div>
               </div>

               {/* Estado */}
               <div className='space-y-2 relative' ref={statusRef}>
                  <label htmlFor="state" className="text-gray-900 text-sm font-semibold">
                     Estado
                     <span className='text-red-500 ml-1'>*</span>
                  </label>
                  <button
                     onClick={() => setIsStatusOpen(!isStatusOpen)}
                     type='button'
                     className='border-gray-200 flex items-center justify-between rounded-lg border w-full px-4 py-3 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                  >
                     <div className="flex items-center gap-3">
                        {typeof formData.status === 'object' && formData.status.color && (
                           <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: formData.status.color }}
                           />
                        )}
                        <span className='text-sm text-gray-700'>
                           {typeof formData.status === 'object' ? formData.status.name : 'Seleccionar estado'}
                        </span>
                     </div>
                     <svg
                        className={`text-gray-400 w-4 h-4 transition-transform duration-200 ${isStatusOpen ? "rotate-180" : ""}`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                     >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                     </svg>
                  </button>
                  {isStatusOpen && (
                     <div className='border-gray-200 bg-white shadow-lg absolute z-10 top-full mt-1 flex flex-col rounded-lg border text-sm w-full max-h-60 overflow-y-auto'>
                        {projectStatus?.map(obj => (
                           <div
                              key={obj.id}
                              onClick={() => { setFormData({ ...formData, status: obj }); setIsStatusOpen(false) }}
                              className='hover:bg-blue-50 duration-150 w-full text-start py-3 px-4 flex items-center gap-3 cursor-pointer'
                           >
                              <div className="flex items-center gap-3 flex-1">
                                 <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: obj.color }}
                                 />
                                 <span className="text-gray-700">{obj.name}</span>
                              </div>
                              {(typeof formData.status === 'object' && obj.id === formData.status.id) && (
                                 <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-4 h-4 text-blue-600"
                                 >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                 </svg>
                              )}
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
               <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200 text-sm font-medium" type="button"
                  onClick={() => onCancel()}>
                  Cancelar
               </button>
               <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium" type="submit">
                  {isEdit ? 'Actualizar Tablero' : 'Crear Tablero'}
               </button>
            </div>
         </form>
      </div>
   )
}
