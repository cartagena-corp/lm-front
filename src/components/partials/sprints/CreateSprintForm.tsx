'use client'

import AutoResizeTextarea from '../../ui/AutoResizeTextarea'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { SprintProps } from '@/lib/types/types'
import { useRef, useState, useEffect } from 'react'

interface FormProps {
   onSubmit: (data: SprintProps) => void
   onCancel: () => void
   currentSprint?: SprintProps | null
   isEdit?: boolean
}

export default function CreateSprintForm({ onSubmit, onCancel, currentSprint, isEdit = false }: FormProps) {
   const { sprintStatuses } = useConfigStore()
   const [isStatusOpen, setIsStatusOpen] = useState(false)
   const [isSubmitting, setIsSubmitting] = useState(false)
   const [errors, setErrors] = useState<{ [key: string]: string }>({})

   const [formData, setFormData] = useState<SprintProps>(() => {
      if (isEdit && currentSprint) {
         return {
            ...currentSprint,
            startDate: currentSprint.startDate ? new Date(currentSprint.startDate).toISOString().split('T')[0] : '',
            endDate: currentSprint.endDate ? new Date(currentSprint.endDate).toISOString().split('T')[0] : ''
         }
      }
      return {
         projectId: "",
         title: "",
         goal: "",
         status: sprintStatuses?.[0]?.id || 0,
         statusObject: sprintStatuses?.[0],
         startDate: "",
         endDate: "",
      }
   })

   const statusRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      if (!isEdit && sprintStatuses && sprintStatuses.length > 0) {
         setFormData(prev => ({
            ...prev,
            status: sprintStatuses[0].id,
            statusObject: sprintStatuses[0]
         }))
      } else if (isEdit && currentSprint && sprintStatuses && sprintStatuses.length > 0) {
         // En modo edición, asegurar que el statusObject esté correctamente configurado
         const currentStatus = sprintStatuses.find(status => status.id === currentSprint.status)
         if (currentStatus) {
            setFormData(prev => ({
               ...prev,
               statusObject: currentStatus
            }))
         }
      }
   }, [sprintStatuses, isEdit, currentSprint])

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
            setIsStatusOpen(false)
         }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
   }, [])

   const validateForm = () => {
      const newErrors: { [key: string]: string } = {}

      if (!formData.title?.trim()) {
         newErrors.title = 'El título es requerido'
      }

      if (!formData.startDate) {
         newErrors.startDate = 'La fecha de inicio es requerida'
      }

      if (!formData.endDate) {
         newErrors.endDate = 'La fecha de fin es requerida'
      }

      if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
         newErrors.dateRange = 'La fecha de fin debe ser posterior a la fecha de inicio'
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
   }

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) return

      setIsSubmitting(true)
      try {
         await onSubmit({ ...formData })
      } catch (error) {
         console.error('Error al crear sprint:', error)
      } finally {
         setIsSubmitting(false)
      }
   }

   const handleInputChange = (field: keyof SprintProps, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }))
      // Limpiar error específico cuando el usuario empieza a escribir
      if (errors[field]) {
         setErrors(prev => ({ ...prev, [field]: '' }))
      }
   }

   const labelCls = "block text-[13px] font-medium"
   const inputCls = "block w-full h-9 px-3 rounded-md text-sm bg-[var(--ds-card)] outline-none transition-shadow duration-150 placeholder:text-[var(--ds-text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
   const errorMsgCls = "flex items-center gap-2 text-sm font-medium"

   return (
      <div>
         {/* Form Content */}
         <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
               {/* Título */}
               <div className="space-y-2">
                  <label htmlFor="title" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                     Título del Sprint
                     <span className="ml-1" style={{ color: "var(--red-700)" }}>*</span>
                  </label>
                  <input
                     type="text"
                     id="title"
                     name="title"
                     value={formData.title || ''}
                     onChange={(e) => handleInputChange('title', e.target.value)}
                     className={inputCls}
                     style={{ color: "var(--ds-text)", boxShadow: errors.title ? "0 0 0 1px var(--red-700)" : "var(--shadow-border)" }}
                     placeholder={isEdit ? "Actualiza el título del sprint" : "Ej: Sprint 1 - Desarrollo de funcionalidades base"}
                     disabled={isSubmitting}
                  />
                  {errors.title && (
                     <div className={errorMsgCls} style={{ color: "var(--red-700)" }}>
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{errors.title}</span>
                     </div>
                  )}
               </div>

               {/* Meta del Sprint */}
               <div className="space-y-2">
                  <label className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                     Meta del Sprint
                  </label>
                  <AutoResizeTextarea
                     value={formData.goal || ''}
                     onChange={(value) => handleInputChange('goal', value)}
                     required={false}
                     rows={1}
                     placeholder={isEdit ? "Actualiza la meta del sprint" : "Describe el objetivo principal que se espera lograr con este sprint..."}
                     className="block w-full px-3 py-2 rounded-md text-sm bg-[var(--ds-card)] outline-none transition-shadow duration-150 placeholder:text-[var(--ds-text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2 resize-none"
                     style={{ color: "var(--ds-text)", boxShadow: errors.goal ? "0 0 0 1px var(--red-700)" : "var(--shadow-border)" }}
                  />
                  {errors.goal && (
                     <div className={errorMsgCls} style={{ color: "var(--red-700)" }}>
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{errors.goal}</span>
                     </div>
                  )}
               </div>

               {/* Estado */}
               <div className="space-y-2">
                  <label className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                     Estado del Sprint
                  </label>
                  <div className="relative" ref={statusRef}>
                     <button
                        type="button"
                        onClick={() => setIsStatusOpen(!isStatusOpen)}
                        disabled={isSubmitting}
                        className="w-full px-3 h-9 text-left rounded-md transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}
                     >
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              {formData.statusObject ? (
                                 <div className="flex items-center gap-2">
                                    <div
                                       className="w-3 h-3 rounded-full"
                                       style={{ backgroundColor: formData.statusObject.color }}
                                    />
                                    <span className="text-sm font-medium" style={{ color: "var(--ds-text)" }}>
                                       {formData.statusObject.name.charAt(0).toUpperCase() + formData.statusObject.name.slice(1).toLowerCase()}
                                    </span>
                                 </div>
                              ) : (
                                 <span className="text-sm" style={{ color: "var(--ds-text-muted)" }}>Seleccionar estado</span>
                              )}
                           </div>
                           <svg
                              className={`w-4 h-4 transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`}
                              style={{ color: "var(--ds-text-muted)" }}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                           >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                           </svg>
                        </div>
                     </button>

                     {isStatusOpen && (
                        <div className="absolute z-50 w-full mt-2 rounded-md max-h-60 overflow-auto" style={{ background: "var(--ds-card)", border: "1px solid var(--ds-border)", boxShadow: "var(--shadow-lg)" }}>
                           {sprintStatuses && sprintStatuses.length > 0 ? (
                              sprintStatuses.map((status) => (
                                 <button
                                    key={status.id}
                                    type="button"
                                    onClick={() => {
                                       handleInputChange('status', status.id)
                                       setFormData(prev => ({ ...prev, statusObject: status }))
                                       setIsStatusOpen(false)
                                    }}
                                    className="w-full px-3 h-9 text-left transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus:outline-none flex items-center justify-between"
                                 >
                                    <div className="flex items-center gap-2">
                                       <div
                                          className="w-3 h-3 rounded-full"
                                          style={{ backgroundColor: status.color }}
                                       />
                                       <span className="text-sm font-medium" style={{ color: "var(--ds-text)" }}>
                                          {status.name.charAt(0).toUpperCase() + status.name.slice(1).toLowerCase()}
                                       </span>
                                    </div>
                                    {formData.status === status.id && (
                                       <svg className="w-4 h-4" style={{ color: "var(--blue-700)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                       </svg>
                                    )}
                                 </button>
                              ))
                           ) : (
                              <div className="px-3 py-2 text-sm" style={{ color: "var(--ds-text-muted)" }}>
                                 No hay estados disponibles
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               </div>

               {/* Fechas */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label htmlFor="startDate" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                        Fecha de Inicio
                        <span className="ml-1" style={{ color: "var(--red-700)" }}>*</span>
                     </label>
                     <div className="relative">
                        <input
                           type="date"
                           id="startDate"
                           name="startDate"
                           value={formData.startDate || ''}
                           onChange={(e) => handleInputChange('startDate', e.target.value)}
                           className={inputCls}
                           style={{ color: "var(--ds-text)", boxShadow: errors.startDate ? "0 0 0 1px var(--red-700)" : "var(--shadow-border)" }}
                           disabled={isSubmitting}
                        />
                     </div>
                     {errors.startDate && (
                        <div className={errorMsgCls} style={{ color: "var(--red-700)" }}>
                           <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                           </svg>
                           <span>{errors.startDate}</span>
                        </div>
                     )}
                  </div>

                  <div className="space-y-2">
                     <label htmlFor="endDate" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                        Fecha de Fin
                        <span className="ml-1" style={{ color: "var(--red-700)" }}>*</span>
                     </label>
                     <div className="relative">
                        <input
                           type="date"
                           id="endDate"
                           name="endDate"
                           value={formData.endDate || ''}
                           onChange={(e) => handleInputChange('endDate', e.target.value)}
                           className={inputCls}
                           style={{ color: "var(--ds-text)", boxShadow: errors.endDate ? "0 0 0 1px var(--red-700)" : "var(--shadow-border)" }}
                           disabled={isSubmitting}
                        />
                     </div>
                     {errors.endDate && (
                        <div className={errorMsgCls} style={{ color: "var(--red-700)" }}>
                           <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                           </svg>
                           <span>{errors.endDate}</span>
                        </div>
                     )}
                  </div>
               </div>

               {/* Error de rango de fechas */}
               {errors.dateRange && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium" style={{ background: "var(--red-100)", color: "var(--red-900)", boxShadow: "0 0 0 1px var(--red-400)" }}>
                     <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                     </svg>
                     <span>{errors.dateRange}</span>
                  </div>
               )}

               {/* Botones de acción */}
               <div className="flex justify-end flex-col-reverse sm:flex-row gap-3 pt-6" style={{ borderTop: "1px solid var(--ds-border)" }}>
                  <button
                     type="button"
                     onClick={onCancel}
                     disabled={isSubmitting}
                     className="w-full sm:w-auto h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                     style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                  >
                     Cancelar
                  </button>
                  <button
                     type="submit"
                     disabled={isSubmitting}
                     className="w-full sm:w-auto h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                     style={{ color: "var(--primary-contrast-fg)" }}
                  >
                     {isSubmitting ? (
                        <>
                           <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           {isEdit ? 'Actualizando...' : 'Creando...'}
                        </>
                     ) : (
                        isEdit ? 'Actualizar Sprint' : 'Crear Sprint'
                     )}
                  </button>
               </div>
            </form>
         </div>
      </div>
   )
}
