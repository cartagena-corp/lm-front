'use client'

import { ProjectProps } from '@/lib/types/types'
import { useEffect, useRef, useState, DragEvent } from 'react'
import { createPortal } from 'react-dom'
import AutoResizeTextarea from '../../ui/AutoResizeTextarea'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { computeDropdownPosition } from '@/lib/utils/dropdown.utils'

const STATUS_DROPDOWN_MAX_HEIGHT = 240 // px, debe coincidir con max-h-60 del panel

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
   const statusRef = useRef<HTMLDivElement>(null)
   const statusPanelRef = useRef<HTMLDivElement>(null)
   const [statusPosition, setStatusPosition] = useState<{ top?: number, bottom?: number, left: number, width: number, openUpward: boolean }>({ left: 0, width: 0, openUpward: false })
   const [mounted, setMounted] = useState(false)

   // Necesario para el portal del dropdown de Estado: document solo existe en el cliente
   useEffect(() => {
      setMounted(true)
   }, [])

   // El dropdown se porta a document.body para no quedar recortado por el overflow-y-auto
   // del contenido de la modal (Modal.tsx), que además rompe position:fixed al animar con
   // un transform en framer-motion. Si no cabe debajo antes del borde inferior del
   // viewport, se abre hacia arriba (ver dropdown.utils.ts)
   useEffect(() => {
      if (isStatusOpen && statusRef.current) {
         const rect = statusRef.current.getBoundingClientRect()
         setStatusPosition(computeDropdownPosition(rect, { maxHeight: STATUS_DROPDOWN_MAX_HEIGHT, gap: 4 }))
      }
   }, [isStatusOpen])

   useEffect(() => {
      if (!isStatusOpen) return
      const handleScroll = (event: Event) => {
         const target = event.target as Node
         if (statusPanelRef.current?.contains(target)) return
         setIsStatusOpen(false)
      }
      window.addEventListener('scroll', handleScroll, true)
      return () => window.removeEventListener('scroll', handleScroll, true)
   }, [isStatusOpen])

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

   const labelCls = "text-[13px] font-medium"
   const inputWrapCls = "flex items-center rounded-md px-4 h-11 transition-shadow duration-150 focus-within:outline-2 focus-within:outline-[var(--blue-700)] focus-within:outline-offset-2"
   const inputCls = "outline-none text-sm w-full bg-transparent placeholder:text-[var(--ds-text-muted)]"

   return (
      <div>
         {/* Form Content */}
         <form onSubmit={handleSubmit} className="p-6">
            <div className='space-y-4'>
               {/* Nombre del Tablero */}
               <div className='flex flex-col'>
                  <label htmlFor="name" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                     Nombre del Tablero
                     <span className='ml-1' style={{ color: "var(--red-700)" }}>*</span>
                  </label>
                  <div className={inputWrapCls} style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                     <input
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={isEdit ? (editData?.name || 'Nombre del tablero') : 'Ej: Proyecto Marketing Digital 2025'}
                        className={inputCls}
                        style={{ color: "var(--ds-text)" }}
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
                     <label htmlFor="desc" className="font-medium" style={{ color: "var(--ds-text-secondary)" }}>
                        Descripción
                        <span className='ml-1' style={{ color: "var(--red-700)" }}>*</span>
                     </label>

                     <div className='flex items-center gap-2 text-xs'>
                        <div className='w-2 h-2 rounded-full' style={{ background: formData.description.length > 280 ? 'var(--red-700)' : formData.description.length > 250 ? 'var(--amber-700)' : 'var(--green-700)' }} />
                        <span className='font-medium' style={{ color: formData.description.length > 280 ? 'var(--red-700)' : formData.description.length > 250 ? 'var(--amber-700)' : 'var(--green-700)' }}>
                           {formData.description.length}/300
                        </span>
                     </div>
                  </div>
                  <div className='space-y-2'>
                     <div className='flex items-center rounded-md transition-shadow duration-150 focus-within:outline-2 focus-within:outline-[var(--blue-700)] focus-within:outline-offset-2'
                        style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                        <AutoResizeTextarea
                           value={formData.description}
                           onChange={(str) => {
                              if (str.length <= 300) {
                                 setFormData({ ...formData, description: str })
                              }
                           }}
                           className='text-sm! px-4 py-2 w-full resize-none bg-transparent placeholder:text-[var(--ds-text-muted)] border-0!'
                           style={{ color: "var(--ds-text)" }}
                           placeholder='Describe el propósito, objetivos y alcance del tablero...'
                        />
                     </div>
                     <p className='leading-relaxed text-xs' style={{ color: "var(--ds-text-muted)" }}>
                        💡 Una descripción clara ayuda al equipo a entender el propósito del proyecto
                     </p>
                  </div>
               </div>

               {/* Fechas en Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fecha de Inicio */}
                  <div className='space-y-2'>
                     <label htmlFor="startDate" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                        Fecha de Inicio
                        <span className='ml-1' style={{ color: "var(--red-700)" }}>*</span>
                     </label>
                     <div className={inputWrapCls} style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                        <input
                           onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                           className={inputCls}
                           style={{ color: "var(--ds-text)" }}
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
                     <label htmlFor="endDate" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                        Fecha de Finalización
                        <span className='ml-1' style={{ color: "var(--red-700)" }}>*</span>
                     </label>
                     <div className={inputWrapCls} style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                        <input
                           onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                           className={inputCls}
                           style={{ color: "var(--ds-text)" }}
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
                  <label htmlFor="state" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                     Estado
                     <span className='ml-1' style={{ color: "var(--red-700)" }}>*</span>
                  </label>
                  <button
                     onClick={() => setIsStatusOpen(!isStatusOpen)}
                     type='button'
                     className='flex items-center justify-between rounded-md w-full px-4 py-2.5 transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2'
                     style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}
                  >
                     <div className="flex items-center gap-3">
                        {typeof formData.status === 'object' && formData.status.color && (
                           <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: formData.status.color }}
                           />
                        )}
                        <span className='text-sm' style={{ color: "var(--ds-text)" }}>
                           {typeof formData.status === 'object' ? formData.status.name : 'Seleccionar estado'}
                        </span>
                     </div>
                     <svg
                        className={`w-4 h-4 transition-transform duration-200 ${isStatusOpen ? "rotate-180" : ""}`}
                        style={{ color: "var(--ds-text-muted)" }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                     >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                     </svg>
                  </button>
                  {isStatusOpen && mounted && createPortal(
                     <div
                        ref={statusPanelRef}
                        className='fixed z-[9999] flex flex-col rounded-md text-sm max-h-60 overflow-y-auto'
                        style={{
                           ...(statusPosition.openUpward ? { bottom: statusPosition.bottom } : { top: statusPosition.top }),
                           left: statusPosition.left,
                           width: statusPosition.width,
                           background: "var(--ds-card)", border: "1px solid var(--ds-border)", boxShadow: "var(--shadow-lg)"
                        }}
                     >
                        {projectStatus?.map(obj => (
                           <div
                              key={obj.id}
                              onClick={() => { setFormData({ ...formData, status: obj }); setIsStatusOpen(false) }}
                              className='hover:bg-[var(--gray-alpha-100)] transition-colors duration-150 w-full text-start py-3 px-4 flex items-center gap-3 cursor-pointer'
                           >
                              <div className="flex items-center gap-3 flex-1">
                                 <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: obj.color }}
                                 />
                                 <span style={{ color: "var(--ds-text)" }}>{obj.name}</span>
                              </div>
                              {(typeof formData.status === 'object' && obj.id === formData.status.id) && (
                                 <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-4 h-4"
                                    style={{ color: "var(--blue-700)" }}
                                 >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                 </svg>
                              )}
                           </div>
                        ))}
                     </div>,
                     document.body
                  )}
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
                  className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                  style={{ color: "var(--primary-contrast-fg)" }}
                  type="submit">
                  {isEdit ? 'Actualizar Tablero' : 'Crear Tablero'}
               </button>
            </div>
         </form>
      </div>
   )
}
