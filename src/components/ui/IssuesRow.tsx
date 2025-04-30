import { useMultiDragContext } from '@/components/ui/dnd-kit/MultiDragContext'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { Draggable } from '@/components/ui/dnd-kit/Draggable'
import { Droppable } from '@/components/ui/dnd-kit/Droppable'
import { SprintProps, TaskProps } from '@/lib/types/types'
import TaskDetailsForm from '../partials/TaskDetailsForm'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { CalendarIcon } from '@/assets/Icon'
import Modal from '../layout/Modal'
import Image from 'next/image'

export default function IssuesRow({ spr, setIsOpen }: { spr: SprintProps, setIsOpen: Dispatch<SetStateAction<boolean>> }) {
   const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false)
   const { selectedIds, setSelectedIds } = useMultiDragContext()
   const [taskActive, setTaskActive] = useState<TaskProps>()
   const { projectConfig } = useConfigStore()

   const sprintTaskIds = spr.tasks?.content.map(t => t.id as string) || []
   const allSelected = sprintTaskIds.length > 0 && sprintTaskIds.every(id => selectedIds.includes(id))

   const formatDate = (fecha: string | null, includeTime = false): string => {
      if (!fecha) return 'No definida'
      const dateObj = new Date(fecha)
      if (isNaN(dateObj.getTime())) return 'Fecha inválida'
      const day = dateObj.getDate().toString().padStart(2, '0')
      const month = dateObj
         .toLocaleString('es-ES', { month: 'short' })
         .replace('.', '')
         .toLowerCase()
      const year = dateObj.getFullYear()
      let formatted = `${day} ${month} ${year}`
      if (includeTime) {
         const hours = dateObj.getHours().toString().padStart(2, '0')
         const minutes = dateObj.getMinutes().toString().padStart(2, '0')
         formatted += ` ${hours}:${minutes}`
      }
      return formatted
   }

   const getStatusStyle = (id: number) => projectConfig?.issueStatuses?.find(status => status.id === id)
   const getPriorityStyle = (id: number) => projectConfig?.issuePriorities?.find(priority => priority.id === id)
   const getTypeStyle = (id: number) => projectConfig?.issueTypes?.find(type => type.id === id)
   const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])


   const toggleSelectAll = () => {
      if (allSelected) setSelectedIds(prev => prev.filter(id => !sprintTaskIds.includes(id)))
      else setSelectedIds(prev => Array.from(new Set([...prev, ...sprintTaskIds])))
   }

   return (
      <>
         <Droppable id={spr.id as string} styleClass="bg-white space-y-2 rounded-md mb-6 p-6">
            {/* Header del sprint */}
            <div className="flex justify-between items-center mb-2">
               <div className="flex items-center gap-4">
                  <h5 className="font-medium text-xl">{spr.title}</h5>
                  {spr.id !== 'null' && spr.statusObject && (
                     <div
                        className="rounded-full text-xs border px-2 whitespace-nowrap w-fit"
                        style={{
                           backgroundColor: `${spr.statusObject.color}0f`,
                           color: spr.statusObject.color
                        }}
                     >
                        {spr.statusObject.name.charAt(0).toUpperCase() +
                           spr.statusObject.name.slice(1).toLowerCase()}
                     </div>
                  )}
               </div>
               {spr.id !== 'null' ? (
                  <div className="flex items-center text-xs gap-2.5 text-black/75">
                     <CalendarIcon size={20} />
                     {formatDate(spr.startDate)} – {formatDate(spr.endDate)}
                  </div>
               ) : (
                  <button
                     onClick={() => setIsOpen(true)}
                     className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 duration-150 whitespace-nowrap"
                  >
                     Crear Tarea
                  </button>
               )}
            </div>
            <p className="text-black/50 text-sm mb-4">{spr.goal}</p>

            {/* Lista de tareas con checkbox */}
            <div className="text-sm">
               {spr.tasks?.content.length ? (
                  <>
                     {/* Cabecera del grid con “select all” */}
                     <div className="grid grid-cols-18 font-semibold border-b border-black/10 px-2 py-4 gap-2">
                        <div className="col-span-1 flex justify-center">
                           <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={toggleSelectAll}
                              className="cursor-pointer"
                           />
                        </div>
                        <h5 className="col-span-1">Tipo</h5>
                        <h5 className="col-span-5">Tarea</h5>
                        <h5 className="col-span-2">Estado</h5>
                        <h5 className="col-span-2">Prioridad</h5>
                        <h5 className="col-span-5">Asignado a</h5>
                        <h5 className="col-span-1 text-center">Acciones</h5>
                     </div>

                     {spr.tasks.content.map(task => {
                        const id = task.id as string
                        const isChecked = selectedIds.includes(id)

                        return (
                           <Draggable
                              key={id}
                              id={id}
                              styleClass="grid grid-cols-18 items-center gap-2 px-2 py-4 hover:bg-black/5 select-none cursor-grab active:cursor-grabbing"
                           >
                              {/* Checkbox individual */}
                              <div className="col-span-1 flex justify-center">
                                 <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleSelect(id)}
                                    onPointerDown={e => e.stopPropagation()}
                                    className="cursor-pointer"
                                 />
                              </div>

                              {/* Tipo */}
                              <div
                                 className="col-span-1 rounded-full text-xs border px-2 whitespace-nowrap w-fit"
                                 style={{
                                    backgroundColor: `${getTypeStyle(Number(task.type))?.color}0f`,
                                    color: getTypeStyle(Number(task.type))?.color
                                 }}
                              >
                                 {getTypeStyle(Number(task.type))?.name}
                              </div>

                              {/* Tarea */}
                              <div className="col-span-5">
                                 <h6 className="font-medium line-clamp-1">{task.title}</h6>
                                 <p className="text-xs text-black/75 line-clamp-1">
                                    {task.descriptions[0].text}
                                 </p>
                              </div>

                              {/* Estado */}
                              <div
                                 className="col-span-2 rounded-full text-xs border px-2 whitespace-nowrap w-fit"
                                 style={{
                                    backgroundColor: `${getStatusStyle(Number(task.status))?.color}0f`,
                                    color: getStatusStyle(Number(task.status))?.color
                                 }}
                              >
                                 {getStatusStyle(Number(task.status))?.name}
                              </div>

                              {/* Prioridad */}
                              <div
                                 className="col-span-2 rounded-full text-xs border px-2 whitespace-nowrap w-fit"
                                 style={{
                                    backgroundColor: `${getPriorityStyle(Number(task.priority))?.color}0f`,
                                    color: getPriorityStyle(Number(task.priority))?.color
                                 }}
                              >
                                 {getPriorityStyle(Number(task.priority))?.name}
                              </div>

                              {/* Asignado a */}
                              <div className="col-span-5 flex items-center gap-2">
                                 <div className="w-6 h-6 aspect-square flex items-center justify-center rounded-full bg-black/10 overflow-hidden">
                                    {typeof task.assignedId === 'object' && task.assignedId.picture ? (
                                       <Image
                                          src={task.assignedId.picture}
                                          alt="assignedto"
                                          width={24}
                                          height={24}
                                       />
                                    ) : (
                                       <span className="font-medium text-sm">
                                          {typeof task.assignedId === 'object'
                                             ? task.assignedId.firstName.charAt(0).toUpperCase()
                                             : ''}
                                       </span>
                                    )}
                                 </div>
                                 <p className="text-xs">
                                    {typeof task.assignedId === 'object'
                                       ? `${task.assignedId.firstName} ${task.assignedId.lastName}`
                                       : ''}
                                 </p>
                              </div>

                              {/* Acciones */}
                              <button
                                 id="custom-ellipsis"
                                 onPointerDown={e => e.stopPropagation()}
                                 onClick={() => {
                                    setIsTaskDetailsModalOpen(true)
                                    setTaskActive(task)
                                 }}
                                 className="col-span-1 flex justify-center items-center gap-1 p-2"
                              >
                                 <span id="dot" />
                                 <span id="dot" />
                                 <span id="dot" />
                              </button>
                           </Draggable>
                        )
                     })}
                  </>
               ) : (
                  <p className="text-center text-sm text-black/50 py-2">
                     No hay tareas disponibles
                  </p>
               )}
            </div>
         </Droppable>

         {/* Modal de detalle de tarea */}
         <Modal
            customWidth="sm:max-w-4xl"
            isOpen={isTaskDetailsModalOpen}
            onClose={() => setIsTaskDetailsModalOpen(false)}
            title={taskActive?.title as string}
         >
            <TaskDetailsForm
               task={taskActive as TaskProps}
               onSubmit={() => setIsTaskDetailsModalOpen(false)}
               onCancel={() => setIsTaskDetailsModalOpen(false)}
            />
         </Modal>
      </>
   )
}
