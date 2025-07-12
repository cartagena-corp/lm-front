'use client'

import { CommentProps, TaskProps } from '@/lib/types/types'
import { FormEvent, useEffect } from 'react'
import { useConfigStore } from '@/lib/store/ConfigStore'
import ShowComments from '../comments/ShowComments'
import { useCommentStore } from '@/lib/store/CommentStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { CalendarIcon, ClockIcon, UsersIcon, XIcon, ListIcon } from '@/assets/Icon'

interface TaskDetailsFormProps {
   onSubmit: () => void
   onCancel: () => void
   task: TaskProps
}

export default function TaskDetailsForm({ onSubmit, onCancel, task }: TaskDetailsFormProps) {
   const { comments, getComments } = useCommentStore()
   const { getValidAccessToken } = useAuthStore()

   const handleSubmit = (e: FormEvent) => {
      e.preventDefault()
      onSubmit()
   }

   useEffect(() => {
      const getCommentsByIssueId = async () => {
         const token = await getValidAccessToken()
         if (token) {
            await getComments(token, task?.id as string)
         }
      }

      getCommentsByIssueId()
   }, [])

   return (
      <div className="bg-white border-gray-100 rounded-xl shadow-sm border">
         {/* Header */}
         <div className="border-b border-gray-100 p-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                     <ListIcon size={20} />
                  </div>
                  <div>
                     <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                     <p className="text-sm text-gray-500">Detalles y comentarios de la tarea</p>
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
            <form onSubmit={handleSubmit} className="space-y-6 mt-2">
         <div className="flex justify-between items-stretch gap-4">
            {/* Main Content */}
            <div className="flex flex-col justify-between w-8/12 space-y-4">
               {/* Description Section */}
               <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                     <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                     Descripción
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 h-40 overflow-y-auto">
                     {task.descriptions.length > 0 ? (
                        <div className="space-y-2">
                           {task.descriptions.map(desc => (
                              <div key={desc.id} className="bg-white rounded-lg p-4 border border-gray-100 space-y-1">
                                 <h4 className="font-semibold text-gray-900 text-sm">{desc.title}</h4>
                                 <p className="text-xs text-gray-600 leading-relaxed">{desc.text}</p>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                           <p className="text-sm">No hay descripción disponible</p>
                        </div>
                     )}
                  </div>
               </div>

               {/* Comments Section */}
               <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <ShowComments arrayComments={comments} task={task} />
               </div>
            </div>

            {/* Sidebar */}
            <div className="w-1/2 space-y-4">
               {/* People Section */}
               <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <UsersIcon size={18} />
                     </div>
                     <h3 className="font-semibold text-gray-900">Personas</h3>
                  </div>
                  <div className="space-y-1">
                     <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-sm text-gray-500">Asignado a:</span>
                        <span className="text-sm font-medium text-gray-900">
                           {typeof task.assignedId === 'object'
                              ? `${task.assignedId.firstName} ${task.assignedId.lastName}`
                              : task.assignedId || 'No asignado'}
                        </span>
                     </div>
                     <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-sm text-gray-500">Informador:</span>
                        <span className="text-sm font-medium text-gray-900">
                           {task.reporterId ? `${task.reporterId.firstName} ${task.reporterId.lastName}` : 'No especificado'}
                        </span>
                     </div>
                  </div>
               </div>

               {/* Dates Section */}
               <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="p-2 bg-green-100 rounded-lg text-green-600">
                        <CalendarIcon size={18} />
                     </div>
                     <h3 className="font-semibold text-gray-900">Fechas</h3>
                  </div>
                  <div className="space-y-1">
                     <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-sm text-gray-500">Creación:</span>
                        <span className="text-sm font-medium text-gray-900">
                           {(() => {
                              const dateStr = task.createdAt
                              if (!dateStr) return 'No especificado'

                              let date
                              if (dateStr.includes('T')) {
                                 date = new Date(dateStr)
                              } else {
                                 const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10))
                                 date = new Date(year, month - 1, day)
                              }

                              return date.toLocaleDateString('es-ES', {
                                 day: '2-digit',
                                 month: 'long',
                                 year: 'numeric',
                                 hour: '2-digit',
                                 minute: '2-digit',
                                 hour12: true
                              })
                           })()}
                        </span>
                     </div>
                     <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-sm text-gray-500">Actualización:</span>
                        <span className="text-sm font-medium text-gray-900">
                           {(() => {
                              const dateStr = task.updatedAt
                              if (!dateStr) return 'No especificado'

                              let date
                              if (dateStr.includes('T')) {
                                 date = new Date(dateStr)
                              } else {
                                 const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10))
                                 date = new Date(year, month - 1, day)
                              }

                              return date.toLocaleDateString('es-ES', {
                                 day: '2-digit',
                                 month: 'long',
                                 year: 'numeric',
                                 hour: '2-digit',
                                 minute: '2-digit',
                                 hour12: true
                              })
                           })()}
                        </span>
                     </div>
                  </div>
               </div>

               {/* Time Section */}
               <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                        <ClockIcon size={18} />
                     </div>
                     <h3 className="font-semibold text-gray-900">Tiempo</h3>
                  </div>
                  <div className="space-y-1">
                     <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-sm text-gray-500">Estimado:</span>
                        <span className="text-sm font-medium text-gray-900">
                           {task.estimatedTime ? `${task.estimatedTime} horas` : 'No especificado'}
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         </form>
         </div>
      </div>
   )
}
