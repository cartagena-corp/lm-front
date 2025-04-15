'use client'

import { FormEvent, useState, useEffect, useRef } from 'react'

interface FilterFormProps {
   onSubmit: (data: {
      keyword: string
      state: string
      sort: string
      isAsc: boolean
   }) => void
   onCancel: () => void
}

export default function FilterProjectForm({ onSubmit, onCancel }: FilterFormProps) {
   const [formData, setFormData] = useState<{ keyword: string, state: string, sort: string, isAsc: boolean }>({
      keyword: "",
      state: "Cualquier estado",
      sort: "Fecha de creación",
      isAsc: false,
   })

   const [isStateSelectOpen, setIsStateSelectOpen] = useState(false)
   const [isSortBySelectOpen, setIsSortBySelectOpen] = useState(false)

   const stateSelect = [
      { state: "Cualquier estado" },
      { state: "Inactivo" },
      { state: "En curso" },
      { state: "Terminado" },
   ]

   const sortBySelect = [
      { sort: "Fecha de creación" },
      { sort: "Última actualización" },
   ]

   const stateSelectRef = useRef<HTMLDivElement>(null)
   const sortBySelectRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            stateSelectRef.current &&
            !stateSelectRef.current.contains(event.target as Node)
         ) {
            setIsStateSelectOpen(false)
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
      <form onSubmit={handleSubmit}>
         <div className='pt-4 pb-14 space-y-4'>
            <div className='space-y-1'>
               <label htmlFor="title" className="text-gray-700 text-sm font-medium">
                  Palabra clave
               </label>
               <div className='border-gray-300 flex justify-center items-center rounded-md border px-2 gap-2'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-gray-400">
                     <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>

                  <input onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                     type="search"
                     placeholder="Buscar por nombre o palabra clave"
                     id="keyword"
                     name="keyword"
                     className="outline-none text-sm w-full py-2"
                     value={formData.keyword}
                  />
               </div>
            </div>

            <div className='space-y-1 relative' ref={stateSelectRef}>
               <label htmlFor="state" className="text-gray-700 text-sm font-medium">
                  Estado
               </label>

               <button onClick={() => {
                  setIsStateSelectOpen(!isStateSelectOpen)
                  setIsSortBySelectOpen(false) // Cierra el otro select
               }} type='button'
                  className='border-gray-300 flex justify-center items-center select-none rounded-md border w-full px-2 gap-2'>
                  <p className='py-2 w-full text-start text-sm'>
                     {formData.state}
                  </p>

                  <svg className={`text-gray-500 size-4 duration-150 ${isStateSelectOpen ? "-rotate-180" : ""}`}
                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
               </button>
               {
                  isStateSelectOpen &&
                  <div className='border-gray-300 bg-white shadow-md absolute z-10 top-[100%] flex flex-col items-start rounded-md border text-sm w-full max-h-28 overflow-y-auto'>{
                     stateSelect.map((obj, i) =>
                        <button key={i} onClick={() => { setFormData({ ...formData, state: obj.state }), setIsStateSelectOpen(false) }} type='button'
                           className='hover:bg-black/5 duration-150 w-full text-start py-2 px-2 flex items-center gap-2'>
                           {
                              obj.state === formData.state ?
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                 </svg>
                                 :
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" className='hidden' />
                                 </svg>

                           }
                           {obj.state}
                        </button>
                     )
                  }</div>
               }
            </div>

            <div className='space-y-1 relative' ref={sortBySelectRef}>
               <label htmlFor="state" className="text-gray-700 text-sm font-medium">
                  Ordenar por
               </label>
               <div className='flex justify-center items-center gap-2'>
                  <button onClick={() => {
                     setIsSortBySelectOpen(!isSortBySelectOpen)
                     setIsStateSelectOpen(false) // Cierra el otro select
                  }} type='button'
                     className='border-gray-300 flex justify-center items-center select-none rounded-md border w-full px-2 gap-2'>
                     <p className='py-2 w-full text-start text-sm'>
                        {formData.sort}
                     </p>

                     <svg className={`text-gray-500 size-4 duration-150 ${isSortBySelectOpen ? "-rotate-180" : ""}`}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                     </svg>
                  </button>

                  <button onClick={() => setFormData({ ...formData, isAsc: !formData.isAsc })} type='button' className='border-gray-300 border p-1.5 rounded-md'>
                     {
                        formData.isAsc ?
                           <svg className='size-6' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11 10H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M11 14H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M11 18H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M11 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M3 5.1875C3.39322 4.74501 4.43982 3 5 3M5 3C5.56018 3 6.60678 4.74501 7 5.1875M5 3V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                           </svg>
                           :
                           <svg className='size-6' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11 10H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M11 14H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M11 18H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M11 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M7 18.8125C6.60678 19.255 5.56018 21 5 21M5 21C4.43982 21 3.39322 19.255 3 18.8125M5 21V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                           </svg>


                     }
                  </button>
               </div>
               {
                  isSortBySelectOpen &&
                  <div className='border-gray-300 bg-white shadow-md absolute z-10 top-[100%] flex flex-col items-start rounded-md border text-sm w-full max-h-28 overflow-y-auto'>{
                     sortBySelect.map((obj, i) =>
                        <button key={i} onClick={() => { setFormData({ ...formData, sort: obj.sort }), setIsSortBySelectOpen(false) }} type='button'
                           className='hover:bg-black/5 duration-150 w-full text-start py-2 px-2 flex items-center gap-2'>
                           {
                              obj.sort === formData.sort ?
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                 </svg>
                                 :
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" className='hidden' />
                                 </svg>

                           }
                           {obj.sort}
                        </button>
                     )
                  }</div>
               }
            </div>
         </div>

         <div className="pb-3 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
               type="submit"
               className="text-white inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold textWhite shadow-sm hover:bg-blue-500 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
            >
               Aplicar Filtros
            </button>
            <button
               type="button"
               className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
               onClick={onCancel}
            >
               Cancelar
            </button>
         </div>
      </form>
   )
}
