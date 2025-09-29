'use client'

import AutoResizeTextarea from '../../ui/AutoResizeTextarea'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { SprintProps } from '@/lib/types/types'
import { CalendarIcon, XIcon } from '@/assets/Icon'
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

      if (!formData.goal?.trim()) {
         newErrors.goal = 'La meta del sprint es requerida'
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

   return (
      <div className="bg-white border-gray-100 rounded-xl shadow-sm border">
         {/* Header */}
         <div className="border-b border-gray-100 p-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                     <CalendarIcon size={20} />
                  </div>
                  <div>
                     <h3 className="text-lg font-semibold text-gray-900">
                        {isEdit ? 'Editar Sprint' : 'Crear Nuevo Sprint'}
                     </h3>
                     <p className="text-sm text-gray-500">
                        {isEdit ? 'Actualiza la información del sprint' : 'Completa la información para crear un nuevo sprint'}
                     </p>
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
         <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
               <label htmlFor="title" className="block text-sm font-semibold text-gray-900">
                  Título del Sprint
                  <span className="text-red-500 ml-1">*</span>
               </label>
               <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 ${
                     errors.title 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder={isEdit ? "Actualiza el título del sprint" : "Ej: Sprint 1 - Desarrollo de funcionalidades base"}
                  disabled={isSubmitting}
               />
               {errors.title && (
                  <div className="flex items-center gap-2 text-red-600">
                     <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                     </svg>
                     <span className="text-sm font-medium">{errors.title}</span>
                  </div>
               )}
            </div>

            {/* Meta del Sprint */}
            <div className="space-y-2">
               <label className="block text-sm font-semibold text-gray-900">
                  Meta del Sprint
               </label>
               <AutoResizeTextarea
                  value={formData.goal || ''}
                  onChange={(value) => handleInputChange('goal', value)}
                  required={false}
                  rows={1}
                  placeholder={isEdit ? "Actualiza la meta del sprint" : "Describe el objetivo principal que se espera lograr con este sprint..."}
                  className={`block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none ${
                     errors.goal 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
               />
               {errors.goal && (
                  <div className="flex items-center gap-2 text-red-600">
                     <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                     </svg>
                     <span className="text-sm font-medium">{errors.goal}</span>
                  </div>
               )}
            </div>

            {/* Estado */}
            <div className="space-y-2">
               <label className="block text-sm font-semibold text-gray-900">
                  Estado del Sprint
               </label>
               <div className="relative" ref={statusRef}>
                  <button
                     type="button"
                     onClick={() => setIsStatusOpen(!isStatusOpen)}
                     disabled={isSubmitting}
                     className="w-full px-4 py-3 text-left bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           {formData.statusObject ? (
                              <div className="flex items-center gap-2">
                                 <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: formData.statusObject.color }}
                                 />
                                 <span className="text-sm font-medium text-gray-900">
                                    {formData.statusObject.name.charAt(0).toUpperCase() + formData.statusObject.name.slice(1).toLowerCase()}
                                 </span>
                              </div>
                           ) : (
                              <span className="text-gray-500 text-sm">Seleccionar estado</span>
                           )}
                        </div>
                        <svg 
                           className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`}
                           fill="none" 
                           stroke="currentColor" 
                           viewBox="0 0 24 24"
                        >
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                     </div>
                  </button>

                  {isStatusOpen && (
                     <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
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
                                 className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors flex items-center justify-between"
                              >
                                 <div className="flex items-center gap-2">
                                    <div
                                       className="w-3 h-3 rounded-full"
                                       style={{ backgroundColor: status.color }}
                                    />
                                    <span className="text-sm font-medium text-gray-900">
                                       {status.name.charAt(0).toUpperCase() + status.name.slice(1).toLowerCase()}
                                    </span>
                                 </div>
                                 {formData.status === status.id && (
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                 )}
                              </button>
                           ))
                        ) : (
                           <div className="px-4 py-3 text-gray-500 text-sm">
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
                  <label htmlFor="startDate" className="block text-sm font-semibold text-gray-900">
                     Fecha de Inicio
                     <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                     <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate || ''}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className={`block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 ${
                           errors.startDate 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                        disabled={isSubmitting}
                     />
                  </div>
                  {errors.startDate && (
                     <div className="flex items-center gap-2 text-red-600">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">{errors.startDate}</span>
                     </div>
                  )}
               </div>

               <div className="space-y-2">
                  <label htmlFor="endDate" className="block text-sm font-semibold text-gray-900">
                     Fecha de Fin
                     <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                     <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate || ''}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        className={`block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 ${
                           errors.endDate 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                        disabled={isSubmitting}
                     />
                  </div>
                  {errors.endDate && (
                     <div className="flex items-center gap-2 text-red-600">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">{errors.endDate}</span>
                     </div>
                  )}
               </div>
            </div>

            {/* Error de rango de fechas */}
            {errors.dateRange && (
               <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{errors.dateRange}</span>
               </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-200">
               <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-500/20 focus:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
               >
                  Cancelar
               </button>
               <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-blue-600 border-2 border-blue-600 rounded-xl shadow-sm hover:bg-blue-700 hover:border-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
               >
                  {isSubmitting ? (
                     <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
