'use client'

import { FormEvent, useState, useEffect, useRef } from 'react'

interface FilterBoardsOrgProps {
   sortBy: string
   direction: string
}

interface FilterFormProps {
   onSubmit: (data: FilterBoardsOrgProps) => void
   onCancel: () => void
   initialData: FilterBoardsOrgProps
}

export default function FilterBoardsOrgForm({ onSubmit, onCancel, initialData }: FilterFormProps) {
   const [formData, setFormData] = useState<FilterBoardsOrgProps>(initialData)
   const [isSortBySelectOpen, setIsSortBySelectOpen] = useState(false)
   const [isAsc, setIsAsc] = useState(false)

   const sortBySelect = [
      { id: "name", sort: "Nombre" },
      { id: "createdAt", sort: "Fecha de creación" },
      { id: "status", sort: "Estado" },
   ]

   const sortBySelectRef = useRef<HTMLDivElement>(null)

   // Sincronizar el estado visual con el valor del formulario
   useEffect(() => {
      setIsAsc(formData.direction === "asc")
   }, [formData.direction])

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
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
      <div>
         {/* Form Content */}
         <form onSubmit={handleSubmit} className="p-6">
            <div className='space-y-5'>
               {/* Ordenamiento */}
               <div className='space-y-2' ref={sortBySelectRef}>
                  <label htmlFor="sortBy" className="text-sm font-medium" style={{ color: "var(--ds-text)" }}>
                     Ordenar resultados
                  </label>
                  <div className='flex gap-3'>
                     <button
                        onClick={() => {
                           setIsSortBySelectOpen(!isSortBySelectOpen)
                        }}
                        type='button'
                        className='flex items-center justify-between rounded-md flex-1 px-3 h-9 text-sm transition-colors duration-150 relative focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2'
                        style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                     >
                        <span className='text-sm'>
                           {sortBySelect.find(item => item.id === formData.sortBy)?.sort || 'Nombre'}
                        </span>
                        <svg className={`w-4 h-4 transition-transform duration-200 ${isSortBySelectOpen ? "rotate-180" : ""}`}
                           style={{ color: "var(--ds-text-muted)" }}
                           xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>

                        {isSortBySelectOpen && (
                           <div className='absolute z-10 top-full mt-1 left-0 flex flex-col rounded-md text-sm w-full max-h-48 overflow-y-auto'
                              style={{ background: "var(--ds-card)", border: "1px solid var(--ds-border)", boxShadow: "var(--shadow-lg)" }}>
                              {sortBySelect.map((obj) => (
                                 <div
                                    key={obj.id}
                                    onClick={() => { setFormData({ ...formData, sortBy: obj.id }), setIsSortBySelectOpen(false) }}
                                    className='hover:bg-[var(--gray-alpha-100)] transition-colors duration-150 w-full text-start py-2 px-3 flex items-center gap-3 cursor-pointer'
                                 >
                                    <span className="flex-1" style={{ color: "var(--ds-text)" }}>{obj.sort}</span>
                                    {obj.id === formData.sortBy && (
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4" style={{ color: "var(--blue-700)" }}>
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
            </div>

            <div className="flex justify-end gap-3 mt-4">
               <button className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2" type="button"
                  style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                  onClick={() => onCancel()}>
                  Cancelar
               </button>
               <button className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2" type="submit"
                  style={{ color: "var(--primary-contrast-fg)" }}>
                  Aplicar Filtros
               </button>
            </div>
         </form>
      </div>
   )
}
