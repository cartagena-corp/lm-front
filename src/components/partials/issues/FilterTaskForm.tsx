'use client'

import { FormEvent, useState, useEffect, useRef } from 'react'

interface FilterFormProps {
   onSubmit: (data: {
      keyword: string
      state: string
      sort: string
      priority: string
      user: string
      isAsc: boolean
   }) => void
   onCancel: () => void
}

export default function FilterTaskForm({ onSubmit, onCancel }: FilterFormProps) {
   const [formData, setFormData] = useState<{ keyword: string, state: string, sort: string, priority: string, isAsc: boolean, user: string }>({
      keyword: "",
      state: "Cualquier estado",
      sort: "Fecha de creación",
      priority: "Cualquier prioridad",
      user: "Cualquier usuario",
      isAsc: false,
   })

   const [isPrioritySelectOpen, setIsPrioritySelectOpen] = useState(false)
   const [isSortBySelectOpen, setIsSortBySelectOpen] = useState(false)
   const [isStateSelectOpen, setIsStateSelectOpen] = useState(false)
   const [isUserSelectOpen, setIsUserSelectOpen] = useState(false)

   const stateSelect = [
      { state: "Cualquier estado" },
      { state: "Abierto" },
      { state: "En curso" },
      { state: "Cerrado" },
      { state: "Reabierto" },
   ]

   const userSelect = [
      { user: "Cualquier usuario" },
      { user: "Kenn Marcucci" },
      { user: "Diego Pedrozo" },
      { user: "Juan Cartagena" },
      { user: "Natalia Ariza" },
   ]

   const prioritySelect = [
      { priority: "Cualquier prioridad" },
      { priority: "Baja" },
      { priority: "Media" },
      { priority: "Alta" },
   ]

   const sortBySelect = [
      { sort: "Fecha de creación" },
      { sort: "Última actualización" },
   ]

   const prioritySelectRef = useRef<HTMLDivElement>(null)
   const sortBySelectRef = useRef<HTMLDivElement>(null)
   const stateSelectRef = useRef<HTMLDivElement>(null)
   const userSelectRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (prioritySelectRef.current && !prioritySelectRef.current.contains(event.target as Node)) setIsPrioritySelectOpen(false)
         if (sortBySelectRef.current && !sortBySelectRef.current.contains(event.target as Node)) setIsSortBySelectOpen(false)
         if (stateSelectRef.current && !stateSelectRef.current.contains(event.target as Node)) setIsStateSelectOpen(false)
         if (userSelectRef.current && !userSelectRef.current.contains(event.target as Node)) setIsUserSelectOpen(false)
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
   }, [])

   const handleSubmit = (e: FormEvent) => {
      e.preventDefault()
      onSubmit(formData)
   }

   const labelCls = "text-[13px] font-medium"
   const selectTriggerCls = "flex items-center select-none rounded-md w-full px-3 h-9 gap-2 transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
   const selectPanelCls = "absolute z-10 top-[105%] flex flex-col items-start rounded-md text-sm w-full max-h-28 overflow-y-auto"
   const selectItemCls = "hover:bg-[var(--gray-alpha-100)] transition-colors duration-150 w-full text-start py-2 px-2 flex items-center gap-2 cursor-pointer"

   return (
      <form onSubmit={handleSubmit}>
         <div className='pt-4 pb-14 space-y-4'>
            <div className='space-y-1'>
               <label htmlFor="title" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                  Palabra clave
               </label>
               <div className='flex justify-center items-center rounded-md px-3 h-9 gap-2 transition-shadow duration-150 focus-within:outline-2 focus-within:outline-[var(--blue-700)] focus-within:outline-offset-2'
                  style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 flex-shrink-0" style={{ color: "var(--ds-text-muted)" }}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>

                  <input onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                     placeholder="Buscar por nombre o palabra clave"
                     className="outline-none text-sm w-full bg-transparent placeholder:text-[var(--ds-text-muted)]"
                     style={{ color: "var(--ds-text)" }}
                     value={formData.keyword}
                     name="keyword"
                     type="search"
                     id="keyword"
                  />
               </div>
            </div>

            <div className='flex items-center gap-2 justify-between'>
               <div className='space-y-1 relative w-full' ref={stateSelectRef}>
                  <label htmlFor="state" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                     Estado
                  </label>

                  <button onClick={() => {
                     setIsStateSelectOpen(!isStateSelectOpen)
                     setIsPrioritySelectOpen(false), setIsSortBySelectOpen(false), setIsUserSelectOpen(false)
                  }} type='button'
                     className={selectTriggerCls}
                     style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                     <p className='w-full text-start text-sm' style={{ color: "var(--ds-text)" }}>
                        {formData.state}
                     </p>

                     <svg className={`size-4 duration-150 ${isStateSelectOpen ? "-rotate-180" : ""}`}
                        style={{ color: "var(--ds-text-muted)" }}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                     </svg>
                     {
                        isStateSelectOpen &&
                        <div className={selectPanelCls} style={{ background: "var(--ds-card)", border: "1px solid var(--ds-border)", boxShadow: "var(--shadow-lg)" }}>{
                           stateSelect.map((obj, i) =>
                              <div key={i} onClick={() => { setFormData({ ...formData, state: obj.state }), setIsStateSelectOpen(false) }}
                                 className={selectItemCls} style={{ color: "var(--ds-text)" }}>
                                 {
                                    obj.state === formData.state ?
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3" style={{ color: "var(--blue-700)" }}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                       </svg>
                                       :
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" className='hidden' />
                                       </svg>

                                 }
                                 {obj.state}
                              </div>
                           )
                        }</div>
                     }
                  </button>
               </div>
               <div className='space-y-1 relative w-full' ref={prioritySelectRef}>
                  <label htmlFor="state" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                     Prioridad
                  </label>

                  <button onClick={() => {
                     setIsPrioritySelectOpen(!isPrioritySelectOpen)
                     setIsUserSelectOpen(false), setIsSortBySelectOpen(false), setIsStateSelectOpen(false)
                  }} type='button'
                     className={selectTriggerCls}
                     style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                     <p className='w-full text-start text-sm' style={{ color: "var(--ds-text)" }}>
                        {formData.priority}
                     </p>

                     <svg className={`size-4 duration-150 ${isPrioritySelectOpen ? "-rotate-180" : ""}`}
                        style={{ color: "var(--ds-text-muted)" }}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                     </svg>
                     {
                        isPrioritySelectOpen &&
                        <div className={selectPanelCls} style={{ background: "var(--ds-card)", border: "1px solid var(--ds-border)", boxShadow: "var(--shadow-lg)" }}>{
                           prioritySelect.map((obj, i) =>
                              <div key={i} onClick={() => { setFormData({ ...formData, priority: obj.priority }), setIsPrioritySelectOpen(false) }}
                                 className={selectItemCls} style={{ color: "var(--ds-text)" }}>
                                 {
                                    obj.priority === formData.priority ?
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3" style={{ color: "var(--blue-700)" }}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                       </svg>
                                       :
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" className='hidden' />
                                       </svg>

                                 }
                                 {obj.priority}
                              </div>
                           )
                        }</div>
                     }
                  </button>
               </div>
            </div>

            <div className='space-y-1 relative' ref={userSelectRef}>
               <label htmlFor="state" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                  Usuario
               </label>

               <button onClick={() => {
                  setIsUserSelectOpen(!isUserSelectOpen)
                  setIsPrioritySelectOpen(false), setIsSortBySelectOpen(false), setIsStateSelectOpen(false)
               }} type='button'
                  className={selectTriggerCls}
                  style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                  <p className='w-full text-start text-sm' style={{ color: "var(--ds-text)" }}>
                     {formData.user}
                  </p>

                  <svg className={`size-4 duration-150 ${isUserSelectOpen ? "-rotate-180" : ""}`}
                     style={{ color: "var(--ds-text-muted)" }}
                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                  {
                     isUserSelectOpen &&
                     <div className={selectPanelCls} style={{ background: "var(--ds-card)", border: "1px solid var(--ds-border)", boxShadow: "var(--shadow-lg)" }}>{
                        userSelect.map((obj, i) =>
                           <div key={i} onClick={() => { setFormData({ ...formData, user: obj.user }), setIsUserSelectOpen(false) }}
                              className={selectItemCls} style={{ color: "var(--ds-text)" }}>
                              {
                                 obj.user === formData.user ?
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3" style={{ color: "var(--blue-700)" }}>
                                       <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                    :
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                                       <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" className='hidden' />
                                    </svg>

                              }
                              {obj.user}
                           </div>
                        )
                     }
                     </div>
                  }
               </button>
            </div>

            <div className='space-y-1'>
               <label htmlFor="state" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                  Ordenar por
               </label>
               <div className='flex justify-center items-center gap-2' ref={sortBySelectRef}>
                  <button onClick={() => {
                     setIsSortBySelectOpen(!isSortBySelectOpen)
                     setIsPrioritySelectOpen(false), setIsUserSelectOpen(false), setIsStateSelectOpen(false)
                  }} type='button'
                     className={`${selectTriggerCls} relative`}
                     style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                     <p className='w-full text-start text-sm' style={{ color: "var(--ds-text)" }}>
                        {formData.sort}
                     </p>

                     <svg className={`size-4 duration-150 ${isSortBySelectOpen ? "-rotate-180" : ""}`}
                        style={{ color: "var(--ds-text-muted)" }}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                     </svg>
                     {
                        isSortBySelectOpen &&
                        <div className={`${selectPanelCls} top-[110%]`} style={{ background: "var(--ds-card)", border: "1px solid var(--ds-border)", boxShadow: "var(--shadow-lg)" }}>{
                           sortBySelect.map((obj, i) =>
                              <div key={i} onClick={() => { setFormData({ ...formData, sort: obj.sort }), setIsSortBySelectOpen(false) }}
                                 className={selectItemCls} style={{ color: "var(--ds-text)" }}>
                                 {
                                    obj.sort === formData.sort ?
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3" style={{ color: "var(--blue-700)" }}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                       </svg>
                                       :
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" className='hidden' />
                                       </svg>

                                 }
                                 {obj.sort}
                              </div>
                           )
                        }</div>
                     }
                  </button>

                  <button onClick={() => setFormData({ ...formData, isAsc: !formData.isAsc })} type='button'
                     className="h-9 w-9 flex items-center justify-center rounded-md transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                     style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)", color: "var(--ds-text-secondary)" }}>
                     {
                        formData.isAsc ?
                           <svg className='size-5' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11 10H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M11 14H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M11 18H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M11 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M3 5.1875C3.39322 4.74501 4.43982 3 5 3M5 3C5.56018 3 6.60678 4.74501 7 5.1875M5 3V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                           </svg>
                           :
                           <svg className='size-5' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11 10H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M11 14H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M11 18H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M11 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M7 18.8125C6.60678 19.255 5.56018 21 5 21M5 21C4.43982 21 3.39322 19.255 3 18.8125M5 21V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                           </svg>
                     }
                  </button>
               </div>
            </div>
         </div>

         <div className="pb-3 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
               type="submit"
               className="inline-flex items-center w-full justify-center rounded-md px-3 h-9 text-sm font-medium transition-opacity duration-150 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2 sm:col-start-2"
               style={{ background: "var(--gray-1000)", color: "var(--ds-contrast-inverse)" }}
            >
               Aplicar Filtros
            </button>
            <button
               type="button"
               className="mt-3 inline-flex items-center w-full justify-center rounded-md px-3 h-9 text-sm font-medium transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2 sm:col-start-1 sm:mt-0"
               style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
               onClick={onCancel}
            >
               Cancelar
            </button>
         </div>
      </form>
   )
}
