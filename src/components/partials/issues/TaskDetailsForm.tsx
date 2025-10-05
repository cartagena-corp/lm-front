'use client'

import { CommentProps, TaskProps } from '@/lib/types/types'
import { FormEvent, useEffect, useState } from 'react'
import { useConfigStore } from '@/lib/store/ConfigStore'
import ShowComments from '../comments/ShowComments'
import { useCommentStore } from '@/lib/store/CommentStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { CalendarIcon, ClockIcon, UsersIcon, XIcon, ListIcon, ChevronRightIcon, LinkRedirect } from '@/assets/Icon'
import Link from 'next/link'

interface TaskDetailsFormProps {
   onSubmit: () => void
   onCancel: () => void
   task: TaskProps
}

export default function TaskDetailsForm({ onSubmit, onCancel, task }: TaskDetailsFormProps) {
   const { comments, getComments } = useCommentStore()
   const { getValidAccessToken } = useAuthStore()
   const [isSidebarVisible, setIsSidebarVisible] = useState(true)

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
      <div className="bg-white border-gray-100 rounded-xl shadow-sm border h-full flex flex-col">
         {/* Header */}
         <div className="border-b border-gray-100 p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                     <ListIcon size={20} />
                  </div>
                  <div className='flex flex-col pr-10'>
                     {/* el id al que redirige es al de la tarea: task.id */}
                     <Link href={`/tableros/${task.projectId}/${task.id}`} className="text-lg font-semibold hover inline">
                        <h3 className="text-gray-900 hover:text-blue-600 transition-colors text-lg font-semibold">{task.title} <span className="inline-block ml-1 align-middle"><LinkRedirect size={16} stroke={2} /></span></h3>
                     </Link>
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
         <div className="p-6 flex-1">
            <form onSubmit={handleSubmit} className="h-full">
               <div className="flex items-stretch relative h-full">
                  {/* Main Content */}
                  <div className="flex-1 flex flex-col space-y-4 transition-all duration-300 ease-in-out pr-4 h-full overflow-hidden">
                     {/* Description Section */}
                     <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex-1 flex flex-col min-h-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2 flex-shrink-0">
                           Descripciones
                        </h3>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 flex-1 overflow-y-auto min-h-0">
                           {task.descriptions.length > 0 ? (
                              <div className="space-y-2">
                                 {task.descriptions.map(desc => (
                                    <div key={desc.id} className="bg-white rounded-lg p-4 border border-gray-100 space-y-1">
                                       <h4 className="font-semibold text-gray-900 text-sm">{desc.title}</h4>
                                       <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{desc.text}</p>
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <div className="flex items-center justify-center h-full text-gray-500 py-8">
                                 <p className="text-sm">No hay descripción disponible</p>
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Comments Section */}
                     <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex-1 flex flex-col min-h-0">
                        <div className="flex-1 overflow-y-auto min-h-0">
                           <ShowComments arrayComments={comments} task={task} />
                        </div>
                     </div>
                  </div>

                  {/* Divider Line with Toggle Button */}
                  <div
                     className="relative flex items-start justify-center group cursor-pointer z-20 pt-8"
                     onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                  >
                     <div className="w-px bg-gray-200 h-full absolute top-0" />
                     <div className="relative flex items-center justify-center w-6 h-8 bg-white border border-gray-200 rounded-md shadow-sm group-hover:bg-gray-50 group-hover:border-gray-300 transition-all duration-200">
                        <div className={`text-gray-400 group-hover:text-gray-600 transition-all duration-300 ${isSidebarVisible ? 'transform' : 'transform rotate-180'}`}>
                           <ChevronRightIcon
                              size={14}
                              stroke={2}
                           />
                        </div>
                     </div>
                     <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        {isSidebarVisible ? 'Ocultar panel' : 'Mostrar panel'}
                     </div>
                  </div>

                  {/* Sidebar */}
                  <div className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden h-full ${isSidebarVisible ? 'opacity-100' : 'w-0 opacity-0'}`}>
                     <div className={`pl-4 h-full ${isSidebarVisible ? 'block' : 'hidden'}`}>
                        <div className="h-full overflow-y-auto space-y-4">
                           {/* People Section */}
                           <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm min-w-80">
                              <div className="flex items-center gap-2 mb-2">
                                 <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <UsersIcon size={18} />
                                 </div>
                                 <h3 className="font-semibold text-gray-900">Personas</h3>
                              </div>
                              <div className="space-y-1">
                                 <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                    <span className="text-sm text-gray-500">Asignado a:&nbsp;&nbsp;</span>
                                    <span className="text-sm font-medium text-gray-900">
                                       {typeof task.assignedId === 'object'
                                          ? `${task.assignedId.firstName ?? "Sin"} ${task.assignedId.lastName ?? "asignar"}`
                                          : task.assignedId || 'No asignado'}
                                    </span>
                                 </div>
                                 <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                    <span className="text-sm text-gray-500">Informador:&nbsp;&nbsp;</span>
                                    <span className="text-sm font-medium text-gray-900">
                                       {task.reporterId ? `${task.reporterId.firstName} ${task.reporterId.lastName}` : 'No especificado'}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           {/* Dates Section */}
                           <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm min-w-80">
                              <div className="flex items-center gap-2 mb-2">
                                 <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                    <CalendarIcon size={18} />
                                 </div>
                                 <h3 className="font-semibold text-gray-900">Fechas</h3>
                              </div>
                              <div className="space-y-1">
                                 <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                    <span className="text-sm text-gray-500">Creación:&nbsp;&nbsp;</span>
                                    <span className="text-sm font-medium text-gray-900">
                                       {formatDate(task.createdAt)}
                                    </span>
                                 </div>
                                 <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                    <span className="text-sm text-gray-500">Actualización:&nbsp;&nbsp;</span>
                                    <span className="text-sm font-medium text-gray-900">
                                       {formatDate(task.updatedAt)}
                                    </span>
                                 </div>
                                 <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                    <span className="text-sm text-gray-500">Fecha de inicio:&nbsp;&nbsp;</span>
                                    <span className="text-sm font-medium text-gray-900">{formatDate(task.startDate, false, true)}</span>
                                 </div>
                                 <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                    <span className="text-sm text-gray-500">Fecha de fin:&nbsp;&nbsp;</span>
                                    <span className="text-sm font-medium text-gray-900">{formatDate(task.endDate, false, true)}</span>
                                 </div>
                                 <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                    <span className="text-sm text-gray-500">Fecha real de finalización:&nbsp;&nbsp;</span>
                                    <span className="text-sm font-medium text-gray-900">{formatDate(task.realDate, false, true)}</span>
                                 </div>
                              </div>
                           </div>

                           {/* Time Section */}
                           <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm min-w-80">
                              <div className="flex items-center gap-2 mb-2">
                                 <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                    <ClockIcon size={18} />
                                 </div>
                                 <h3 className="font-semibold text-gray-900">Tiempo</h3>
                              </div>
                              <div className="space-y-1">
                                 <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                    <span className="text-sm text-gray-500">Estimado:&nbsp;&nbsp;</span>
                                    <span className="text-sm font-medium text-gray-900">
                                       {task.estimatedTime ? `${task.estimatedTime} horas` : 'No especificado'}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </form>
         </div>
      </div>
   )

   // Formatea fechas a formato legible
   function formatDate(dateStr?: string, includeTime = false, onlyDate = false): string {
      if (!dateStr) return 'No especificado';
      let date: Date;
      if (dateStr.includes('T')) {
         date = new Date(dateStr);
      } else {
         const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
         date = new Date(year, month - 1, day);
      }
      if (onlyDate) {
         return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
         });
      }
      return date.toLocaleDateString('es-ES', {
         day: '2-digit',
         month: 'long',
         year: 'numeric',
         hour: includeTime ? '2-digit' : undefined,
         minute: includeTime ? '2-digit' : undefined,
         hour12: includeTime ? true : undefined
      });
   }
}
