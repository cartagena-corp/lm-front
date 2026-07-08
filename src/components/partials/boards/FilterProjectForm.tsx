'use client'

import { useAuthStore } from '@/lib/store/AuthStore'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { FilterProjectProps } from '@/lib/types/types'
import { FormEvent, useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { computeDropdownPosition } from '@/lib/utils/dropdown.utils'

const DROPDOWN_MAX_HEIGHT = 240 // px, debe coincidir con max-h-60 de los paneles

interface FilterFormProps {
   onSubmit: (data: FilterProjectProps) => void
   onCancel: () => void
   initialFilters?: FilterProjectProps | null
}

export default function FilterProjectForm({ onSubmit, onCancel, initialFilters }: FilterFormProps) {
   const { projectStatus } = useConfigStore()
   const { user } = useAuthStore()
   const [formData, setFormData] = useState<FilterProjectProps>(() => {
      // Inicializar con los filtros de la URL si existen
      if (initialFilters) {
         return initialFilters
      }
      // Valores por defecto
      return {
         name: "",
         status: 0,
         createdBy: "",
         page: 0,
         size: 10,
         sortBy: { id: "createdAt", sort: "Fecha de creación" },
         direction: "asc"
      }
   })

   const [isStatusSelectOpen, setIsStatusSelectOpen] = useState(false)
   const [isSortBySelectOpen, setIsSortBySelectOpen] = useState(false)
   const [isAsc, setIsAsc] = useState(false)

   const sortBySelect = [
      { id: "createdAt", sort: "Fecha de creación" },
      { id: "updatedAt", sort: "Última actualización" },
   ]

   const statusSelectRef = useRef<HTMLDivElement>(null)
   const statusPanelRef = useRef<HTMLDivElement>(null)
   const paginationSelectRef = useRef<HTMLDivElement>(null)
   const sortBySelectRef = useRef<HTMLDivElement>(null)
   const sortByPanelRef = useRef<HTMLDivElement>(null)

   const [statusPosition, setStatusPosition] = useState<{ top?: number, bottom?: number, left: number, width: number, openUpward: boolean }>({ left: 0, width: 0, openUpward: false })
   const [sortByPosition, setSortByPosition] = useState<{ top?: number, bottom?: number, left: number, width: number, openUpward: boolean }>({ left: 0, width: 0, openUpward: false })
   const [mounted, setMounted] = useState(false)

   // Necesario para portar los dropdowns a document.body: document solo existe en el cliente
   useEffect(() => {
      setMounted(true)
   }, [])

   // Sincronizar el estado visual con el valor del formulario
   useEffect(() => {
      setIsAsc(formData.direction === "asc")
   }, [formData.direction])

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         const target = event.target as Node
         if (
            statusSelectRef.current &&
            !statusSelectRef.current.contains(target) &&
            !(statusPanelRef.current && statusPanelRef.current.contains(target))
         ) {
            setIsStatusSelectOpen(false)
         }
         if (
            sortBySelectRef.current &&
            !sortBySelectRef.current.contains(target) &&
            !(sortByPanelRef.current && sortByPanelRef.current.contains(target))
         ) {
            setIsSortBySelectOpen(false)
         }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => {
         document.removeEventListener('mousedown', handleClickOutside)
      }
   }, [])

   // Los paneles se portan a document.body para no quedar recortados por el overflow-y-auto
   // del contenido de la modal (Modal.tsx), que además rompe position:fixed al animar con
   // un transform en framer-motion. Si no caben debajo antes del borde inferior del
   // viewport, se abren hacia arriba (ver dropdown.utils.ts)
   useEffect(() => {
      if (isStatusSelectOpen && statusSelectRef.current) {
         const rect = statusSelectRef.current.getBoundingClientRect()
         setStatusPosition(computeDropdownPosition(rect, { maxHeight: DROPDOWN_MAX_HEIGHT }))
      }
   }, [isStatusSelectOpen])

   useEffect(() => {
      if (isSortBySelectOpen && sortBySelectRef.current) {
         const rect = sortBySelectRef.current.getBoundingClientRect()
         setSortByPosition(computeDropdownPosition(rect, { maxHeight: DROPDOWN_MAX_HEIGHT }))
      }
   }, [isSortBySelectOpen])

   useEffect(() => {
      if (!isStatusSelectOpen && !isSortBySelectOpen) return
      const handleScroll = (event: Event) => {
         const target = event.target as Node
         if (!(statusPanelRef.current?.contains(target))) {
            setIsStatusSelectOpen(false)
         }
         if (!(sortByPanelRef.current?.contains(target))) {
            setIsSortBySelectOpen(false)
         }
      }
      window.addEventListener('scroll', handleScroll, true)
      return () => window.removeEventListener('scroll', handleScroll, true)
   }, [isStatusSelectOpen, isSortBySelectOpen])

   const handleSubmit = (e: FormEvent) => {
      e.preventDefault()
      onSubmit(formData)
   }

   const labelCls = "text-[13px] font-medium"
   const selectTriggerCls = "flex items-center justify-between rounded-md w-full px-3 h-9 transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
   const selectItemCls = "hover:bg-[var(--gray-alpha-100)] transition-colors duration-150 w-full text-start py-2.5 px-3 flex items-center gap-3 cursor-pointer"

   return (
      <div>
         {/* Form Content */}
         <form onSubmit={handleSubmit} className="p-6">
            <div className='space-y-5'>
               {/* Búsqueda por palabra clave */}
               <div className='space-y-2'>
                  <label htmlFor="title" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                     Búsqueda
                  </label>
                  <div className='flex items-center rounded-md px-3 h-9 gap-2 transition-shadow duration-150 focus-within:outline-2 focus-within:outline-[var(--blue-700)] focus-within:outline-offset-2'
                     style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0" style={{ color: "var(--ds-text-muted)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                     </svg>
                     <input
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        type="search"
                        placeholder="Buscar por nombre del tablero..."
                        id="name"
                        name="name"
                        className="outline-none text-sm w-full bg-transparent placeholder:text-[var(--ds-text-muted)]"
                        style={{ color: "var(--ds-text)" }}
                        value={formData.name}
                     />
                  </div>
               </div>

               {/* Estado */}
               <div className='space-y-2 relative' ref={statusSelectRef}>
                  <label htmlFor="status" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                     Estado del proyecto
                  </label>
                  <button
                     onClick={() => {
                        setIsStatusSelectOpen(!isStatusSelectOpen)
                        setIsSortBySelectOpen(false)
                     }}
                     type='button'
                     className={selectTriggerCls}
                     style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}
                  >
                     <div className="flex items-center gap-3">
                        {formData.status !== 0 && (
                           <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: projectStatus?.find(status => status.id === formData.status)?.color || 'var(--gray-500)' }}
                           />
                        )}
                        <span className='text-sm' style={{ color: "var(--ds-text)" }}>
                           {formData.status == 0 ? "Cualquier estado" : projectStatus?.find(status => status.id == formData.status)?.name}
                        </span>
                     </div>
                     <svg className="w-4 h-4 transition-transform duration-200" style={{ color: "var(--ds-text-muted)", transform: isStatusSelectOpen ? "rotate(180deg)" : undefined }}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                     </svg>
                  </button>
                  {isStatusSelectOpen && mounted && createPortal(
                     <div
                        ref={statusPanelRef}
                        className="fixed z-[9999] flex flex-col rounded-md text-sm max-h-60 overflow-y-auto"
                        style={{ ...(statusPosition.openUpward ? { bottom: statusPosition.bottom } : { top: statusPosition.top }), left: statusPosition.left, width: statusPosition.width, background: "var(--ds-card)", border: "1px solid var(--ds-border)", boxShadow: "var(--shadow-lg)" }}
                     >
                        {/* Opción "Cualquier estado" */}
                        <div
                           onClick={() => { setFormData({ ...formData, status: 0 }), setIsStatusSelectOpen(false) }}
                           className={selectItemCls}
                        >
                           <div className="flex items-center gap-3 flex-1">
                              <div className="w-3 h-3 rounded-full" style={{ background: "var(--gray-500)" }} />
                              <span style={{ color: "var(--ds-text)" }}>Cualquier estado</span>
                           </div>
                           {formData.status === 0 && (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4" style={{ color: "var(--blue-700)" }}>
                                 <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                           )}
                        </div>
                        {/* Estados del proyecto */}
                        {projectStatus?.map((obj) => (
                           <div
                              key={obj.id}
                              onClick={() => { setFormData({ ...formData, status: obj.id }), setIsStatusSelectOpen(false) }}
                              className={selectItemCls}
                           >
                              <div className="flex items-center gap-3 flex-1">
                                 <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: obj.color }}
                                 />
                                 <span style={{ color: "var(--ds-text)" }}>{obj.name}</span>
                              </div>
                              {obj.id === formData.status && (
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4" style={{ color: "var(--blue-700)" }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                 </svg>
                              )}
                           </div>
                        ))}
                     </div>,
                     document.body
                  )}
               </div>

               {/* Ordenamiento */}
               <div className='space-y-2' ref={sortBySelectRef}>
                  <label htmlFor="sortBy" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                     Ordenar resultados
                  </label>
                  <div className='flex gap-3'>
                     <button
                        onClick={() => {
                           setIsSortBySelectOpen(!isSortBySelectOpen)
                           setIsStatusSelectOpen(false)
                        }}
                        type='button'
                        className={`${selectTriggerCls} flex-1 relative`}
                        style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}
                     >
                        <span className='text-sm' style={{ color: "var(--ds-text)" }}>
                           {formData.sortBy.sort}
                        </span>
                        <svg className="w-4 h-4 transition-transform duration-200" style={{ color: "var(--ds-text-muted)", transform: isSortBySelectOpen ? "rotate(180deg)" : undefined }}
                           xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>

                        {isSortBySelectOpen && mounted && createPortal(
                           <div
                              ref={sortByPanelRef}
                              className="fixed z-[9999] flex flex-col rounded-md text-sm max-h-60 overflow-y-auto"
                              style={{ ...(sortByPosition.openUpward ? { bottom: sortByPosition.bottom } : { top: sortByPosition.top }), left: sortByPosition.left, width: sortByPosition.width, background: "var(--ds-card)", border: "1px solid var(--ds-border)", boxShadow: "var(--shadow-lg)" }}
                           >
                              {sortBySelect.map((obj) => (
                                 <div
                                    key={obj.id}
                                    onClick={() => { setFormData({ ...formData, sortBy: obj }), setIsSortBySelectOpen(false) }}
                                    className={selectItemCls}
                                 >
                                    <span className="flex-1" style={{ color: "var(--ds-text)" }}>{obj.sort}</span>
                                    {obj.id === formData.sortBy.id && (
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4" style={{ color: "var(--blue-700)" }}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                       </svg>
                                    )}
                                 </div>
                              ))}
                           </div>,
                           document.body
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
                        className={`h-9 w-9 flex items-center justify-center rounded-md transition-colors duration-150 ${isAsc ? '' : 'hover:bg-[var(--gray-alpha-100)]'} focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2`}
                        style={isAsc
                           ? { background: "var(--blue-100)", border: "1px solid var(--blue-400)", color: "var(--blue-900)" }
                           : { background: "var(--ds-card)", boxShadow: "var(--shadow-border)", color: "var(--ds-text-secondary)" }}
                        title={isAsc ? 'Orden ascendente (A-Z, 1-9, más reciente)' : 'Orden descendente (Z-A, 9-1, más antiguo)'}
                     >
                        {isAsc ? (
                           <svg className='w-5 h-5' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11 10H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M11 14H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M11 18H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M11 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M3 5.1875C3.39322 4.74501 4.43982 3 5 3M5 3C5.56018 3 6.60678 4.74501 7 5.1875M5 3V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                           </svg>
                        ) : (
                           <svg className='w-5 h-5' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
               <div className='rounded-md p-4' style={{ background: "var(--gray-alpha-100)" }}>
                  <div className='flex items-center gap-3' ref={paginationSelectRef}>
                     <input
                        onChange={(e) => setFormData({ ...formData, createdBy: e.target.checked && user ? user?.id : "" })}
                        className='w-4 h-4 rounded focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2'
                        style={{ accentColor: "var(--blue-700)" }}
                        checked={formData.createdBy !== ""}
                        name="createdBy"
                        type="checkbox"
                        id="createdBy"
                     />
                     <div className="flex-1">
                        <label htmlFor="createdBy" className="text-sm font-medium cursor-pointer" style={{ color: "var(--ds-text)" }}>
                           Solo mis tableros
                        </label>
                        <p className="text-xs" style={{ color: "var(--ds-text-muted)" }}>
                           Mostrar únicamente los tableros que he creado
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
               <button
                  className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                  style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                  type="button"
                  onClick={() => onCancel()}>
                  Cancelar
               </button>
               <button
                  className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                  style={{ color: "var(--primary-contrast-fg)" }}
                  type="submit">
                  Aplicar filtros
               </button>
            </div>
         </form>
      </div>
   )
}
