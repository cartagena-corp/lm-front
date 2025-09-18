'use client'

import { useAuthStore } from '@/lib/store/AuthStore'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { FilterProjectProps } from '@/lib/types/types'
import { XIcon } from '@/assets/Icon'
import { FormEvent, useState, useEffect, useRef } from 'react'

interface FilterFormProps {
   onSubmit: (data: FilterProjectProps) => void
   onCancel: () => void
}

export default function FilterProjectForm({ onSubmit, onCancel }: FilterFormProps) {
   const { projectStatus } = useConfigStore()
   const { user } = useAuthStore()
   const [formData, setFormData] = useState<FilterProjectProps>({
      name: "",
      status: 0,
      createdBy: "",
      page: 0,
      size: 10,
      sortBy: { id: "createdAt", sort: "Fecha de creación" },
      direction: "desc"
   })

   const [isStatusSelectOpen, setIsStatusSelectOpen] = useState(false)
   const [isSortBySelectOpen, setIsSortBySelectOpen] = useState(false)
   const [isAsc, setIsAsc] = useState(false)

   const sortBySelect = [
      { id: "createdAt", sort: "Fecha de creación" },
      { id: "updatedAt", sort: "Última actualización" },
   ]

   const statusSelectRef = useRef<HTMLDivElement>(null)
   const paginationSelectRef = useRef<HTMLDivElement>(null)
   const sortBySelectRef = useRef<HTMLDivElement>(null)

   // Sincronizar el estado visual con el valor del formulario
   useEffect(() => {
      setIsAsc(formData.direction === "asc")
   }, [formData.direction])

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            statusSelectRef.current &&
            !statusSelectRef.current.contains(event.target as Node)
         ) {
            setIsStatusSelectOpen(false)
         }
         if (
            sortBySelectRef.current &&
            !sortBySelectRef.current.contains(event.target as Node)
         ) {
            setIsSortBySelectOpen(false)
         }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => {
         document.removeEventListener('mousedown', handleClickOutside)
      }
   }, [])

   const handleSubmit = (e: FormEvent) => {
      e.preventDefault()
      onSubmit(formData)
   }

   return (
      <div className="bg-white border-gray-100 rounded-xl shadow-sm border">
         {/* Header */}
         <div className="border-b border-gray-100 p-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                     <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                     </svg>
                  </div>
                  <div>
                     <h3 className="text-lg font-semibold text-gray-900">Filtrar tableros</h3>
                     <p className="text-sm text-gray-500">Encuentra tableros específicos usando los filtros</p>
                  </div>
               </div>
               <button
                  type="button"
                  onClick={onCancel}
                  className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
               >
                  <XIcon />
               </button>
            </div>
         </div>

         {/* Form Content */}
         <form onSubmit={handleSubmit} className="p-6">
            <div className='space-y-5'>
            {/* Búsqueda por palabra clave */}
            <div className='space-y-2'>
               <label htmlFor="title" className="text-gray-900 text-sm font-semibold">
                  Búsqueda
               </label>
               <div className='border-gray-200 flex items-center rounded-lg border px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mr-3">
                     <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <input 
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     type="search"
                     placeholder="Buscar por nombre del tablero..."
                     id="name"
                     name="name"
                     className="outline-none text-sm w-full bg-transparent placeholder-gray-400"
                     value={formData.name}
                  />
               </div>
            </div>

            {/* Estado */}
            <div className='space-y-2 relative' ref={statusSelectRef}>
               <label htmlFor="status" className="text-gray-900 text-sm font-semibold">
                  Estado del proyecto
               </label>
               <button 
                  onClick={() => {
                     setIsStatusSelectOpen(!isStatusSelectOpen)
                     setIsSortBySelectOpen(false)
                  }} 
                  type='button'
                  className='border-gray-200 flex items-center justify-between rounded-lg border w-full px-4 py-3 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
               >
                  <div className="flex items-center gap-3">
                     {formData.status !== 0 && (
                        <div 
                           className="w-3 h-3 rounded-full"
                           style={{ backgroundColor: projectStatus?.find(status => status.id === formData.status)?.color || '#6B7280' }}
                        />
                     )}
                     <span className='text-sm text-gray-700'>
                        {formData.status == 0 ? "Cualquier estado" : projectStatus?.find(status => status.id == formData.status)?.name}
                     </span>
                  </div>
                  <svg className={`text-gray-400 w-4 h-4 transition-transform duration-200 ${isStatusSelectOpen ? "rotate-180" : ""}`}
                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
               </button>
               {isStatusSelectOpen && (
                  <div className='border-gray-200 bg-white shadow-lg absolute z-10 top-full mt-1 flex flex-col rounded-lg border text-sm w-full max-h-28 overflow-y-auto'>
                     {/* Opción "Cualquier estado" */}
                     <div
                        onClick={() => { setFormData({ ...formData, status: 0 }), setIsStatusSelectOpen(false) }}
                        className='hover:bg-blue-50 duration-150 w-full text-start py-3 px-4 flex items-center gap-3 cursor-pointer'
                     >
                        <div className="flex items-center gap-3 flex-1">
                           <div className="w-3 h-3 rounded-full bg-gray-300" />
                           <span className="text-gray-700">Cualquier estado</span>
                        </div>
                        {formData.status === 0 && (
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-blue-600">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                           </svg>
                        )}
                     </div>
                     {/* Estados del proyecto */}
                     {projectStatus?.map((obj) => (
                        <div 
                           key={obj.id} 
                           onClick={() => { setFormData({ ...formData, status: obj.id }), setIsStatusSelectOpen(false) }}
                           className='hover:bg-blue-50 duration-150 w-full text-start py-3 px-4 flex items-center gap-3 cursor-pointer'
                        >
                           <div className="flex items-center gap-3 flex-1">
                              <div 
                                 className="w-3 h-3 rounded-full"
                                 style={{ backgroundColor: obj.color }}
                              />
                              <span className="text-gray-700">{obj.name}</span>
                           </div>
                           {obj.id === formData.status && (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-blue-600">
                                 <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                           )}
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* Ordenamiento */}
            <div className='space-y-2' ref={sortBySelectRef}>
               <label htmlFor="sortBy" className="text-gray-900 text-sm font-semibold">
                  Ordenar resultados
               </label>
               <div className='flex gap-3'>
                  <button 
                     onClick={() => {
                        setIsSortBySelectOpen(!isSortBySelectOpen)
                        setIsStatusSelectOpen(false)
                     }} 
                     type='button'
                     className='border-gray-200 flex items-center justify-between rounded-lg border flex-1 px-4 py-3 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 relative'
                  >
                     <span className='text-sm text-gray-700'>
                        {formData.sortBy.sort}
                     </span>
                     <svg className={`text-gray-400 w-4 h-4 transition-transform duration-200 ${isSortBySelectOpen ? "rotate-180" : ""}`}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                     </svg>

                     {isSortBySelectOpen && (
                        <div className='border-gray-200 bg-white shadow-lg absolute z-10 top-full mt-1 left-0 flex flex-col rounded-lg border text-sm w-full max-h-32 overflow-y-auto'>
                           {sortBySelect.map((obj) => (
                              <div 
                                 key={obj.id} 
                                 onClick={() => { setFormData({ ...formData, sortBy: obj }), setIsSortBySelectOpen(false) }}
                                 className='hover:bg-blue-50 duration-150 w-full text-start py-3 px-4 flex items-center gap-3 cursor-pointer'
                              >
                                 <span className="text-gray-700 flex-1">{obj.sort}</span>
                                 {obj.id === formData.sortBy.id && (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-blue-600">
                                       <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                 )}
                              </div>
                           ))}
                        </div>
                     )}
                  </button>

                  {/* Botón de dirección ascendente/descendente */}
                  <button 
                     onClick={() => { 
                        const newIsAsc = !isAsc
                        const newDirection = newIsAsc ? "asc" : "desc"
                        setIsAsc(newIsAsc)
                        setFormData({ ...formData, direction: newDirection })
                     }} 
                     type='button' 
                     className={`border-gray-200 border p-3 rounded-lg hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${isAsc ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                     title={isAsc ? 'Orden ascendente (A-Z, 1-9, más reciente)' : 'Orden descendente (Z-A, 9-1, más antiguo)'}
                  >
                     {isAsc ? (
                        <svg className='w-5 h-5 text-blue-600' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M11 10H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                           <path d="M11 14H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                           <path d="M11 18H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                           <path d="M11 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                           <path d="M3 5.1875C3.39322 4.74501 4.43982 3 5 3M5 3C5.56018 3 6.60678 4.74501 7 5.1875M5 3V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                     ) : (
                        <svg className='w-5 h-5 text-gray-600' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M11 10H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                           <path d="M11 14H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                           <path d="M11 18H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                           <path d="M11 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                           <path d="M7 18.8125C6.60678 19.255 5.56018 21 5 21M5 21C4.43982 21 3.39322 19.255 3 18.8125M5 21V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                     )}
                  </button>
               </div>
            </div>

            {/* Checkbox "Mis tableros" */}
            <div className='bg-gray-50 rounded-lg p-4 border border-gray-200 hidden'>
               <div className='flex items-center gap-3' ref={paginationSelectRef}>
                  <input 
                     onChange={(e) => setFormData({ ...formData, createdBy: e.target.checked && user ? user?.id : "" })}
                     className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
                     placeholder="Buscar por nombre o palabra clave"
                     value={formData.createdBy}
                     name="createdBy"
                     type="checkbox"
                     id="createdBy"
                  />
                  <div className="flex-1">
                     <label htmlFor="createdBy" className="text-gray-900 text-sm font-medium cursor-pointer">
                        Solo mis tableros
                     </label>
                     <p className="text-xs text-gray-500">
                        Mostrar únicamente los tableros que he creado
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* Botones */}
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
               className="bg-blue-600 hover:bg-blue-700 text-white border-transparent border hover:shadow-md flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
               Aplicar filtros
            </button>
         </div>
         </form>
      </div>
   )
}
