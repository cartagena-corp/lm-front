import { useMultiDragContext } from '@/components/ui/dnd-kit/MultiDragContext'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { Draggable } from '@/components/ui/dnd-kit/Draggable'
import { Droppable } from '@/components/ui/dnd-kit/Droppable'
import { SprintProps, TaskProps } from '@/lib/types/types'
import { useConfigStore } from '@/lib/store/ConfigStore'
import DeleteIssueForm from '../issues/DeleteIssueForm'
import TaskDetailsForm from '../issues/TaskDetailsForm'
import { useIssueStore } from '@/lib/store/IssueStore'
import UpdateTaskForm from '../issues/UpdateTaskForm'
import { useAuthStore } from '@/lib/store/AuthStore'
import ReasignIssue from '../issues/ReasignIssue'
import { CalendarIcon } from '@/assets/Icon'
import Modal from '../../layout/Modal'
import Image from 'next/image'

export default function IssuesRow({ spr, setIsOpen, isOverlay = false }: { spr: SprintProps, setIsOpen: Dispatch<SetStateAction<boolean>>, isOverlay?: boolean }) {
   const { selectedIds, setSelectedIds } = useMultiDragContext()

   if (isOverlay) {
      return (
         <div className="bg-sky-100 border-sky-700 text-sky-700 flex items-center rounded-md shadow-xl border w-full h-full p-4">
            <h3 className="font-medium text-sm truncate">
               {selectedIds.length === 1 ? `${selectedIds.length} tarea seleccionada` : `${selectedIds.length} tareas seleccionadas`}
            </h3>
         </div>
      )
   }

   const { getValidAccessToken } = useAuthStore()
   const { deleteIssue, updateIssue, reasingIssue } = useIssueStore()

   const wrapperRef = useRef<HTMLDivElement>(null)

   const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false)
   const [isTaskUpdateModalOpen, setIsTaskUpdateModalOpen] = useState(false)
   const [isReasignModalOpen, setIsReasignModalOpen] = useState(false)
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
   const [openItemId, setOpenItemId] = useState<string | null>(null)
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

   useEffect(() => {
      const handlePointerDown = (event: PointerEvent) => { if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setOpenItemId(null) }
      document.addEventListener('pointerdown', handlePointerDown)
      return () => document.removeEventListener('pointerdown', handlePointerDown)
   }, [])

   const handleUpdate = async (formData: {
      descriptions: { id?: string, title: string, text: string }[],
      estimatedTime: number,
      priority: number,
      status: number,
      title: string,
      type: number
   }) => {
      const token = await getValidAccessToken()
      if (token) await updateIssue(token, formData)
      setIsTaskUpdateModalOpen(false)
   }

   const handleReasign = async ({ newUserId, issueId }: { newUserId: string, issueId: string }) => {
      const token = await getValidAccessToken()
      if (token) await reasingIssue(token, issueId, newUserId, taskActive?.projectId as string)
      setIsReasignModalOpen(false)
   }

   const handleDelete = async () => {
      const token = await getValidAccessToken()
      if (token) await deleteIssue(token, taskActive?.id as string, taskActive?.projectId as string)
      setIsDeleteModalOpen(false)
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
                        <h5 className="col-span-6">Tarea</h5>
                        <h5 className="col-span-2">Estado</h5>
                        <h5 className="col-span-2">Prioridad</h5>
                        <h5 className="col-span-4">Asignado a</h5>
                        <h5 className="col-span-1 text-center">Acciones</h5>
                     </div>

                     {
                        spr.tasks.content.map(task => {
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
                                 <div className="col-span-6">
                                    <h6 className="font-medium line-clamp-1" title={task.title}>{task.title}</h6>
                                    <p className="text-xs text-black/75 line-clamp-1" title={task.descriptions[0].text}>
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
                                 <button className="col-span-4 flex items-center gap-2 w-full cursor-pointer" onPointerDown={e => e.stopPropagation()}
                                    onClick={() => {
                                       setIsReasignModalOpen(true)
                                       setOpenItemId(null)
                                       setTaskActive(task)
                                    }}>
                                    <div className="w-6 h-6 aspect-square flex items-center justify-center rounded-full bg-black/10 overflow-hidden">
                                       {
                                          typeof task.assignedId === 'object' && task.assignedId.picture ?
                                             <Image
                                                src={task.assignedId.picture}
                                                alt="assignedto"
                                                width={24}
                                                height={24}
                                             />
                                             :
                                             <span className="font-medium text-sm">
                                                {typeof task.assignedId === 'object'
                                                   ? task.assignedId.firstName.charAt(0).toUpperCase()
                                                   : ''}
                                             </span>
                                       }
                                    </div>
                                    <p className="text-xs">
                                       {typeof task.assignedId === 'object' ? `${task.assignedId.firstName} ${task.assignedId.lastName}` : ''}
                                    </p>
                                 </button>

                                 {/* Acciones */}
                                 <div ref={openItemId === task.id ? wrapperRef : null} className='relative flex justify-center w-full cursor-pointer' onPointerDown={e => e.stopPropagation()}>
                                    <button
                                       id="custom-ellipsis"
                                       onClick={() => { setOpenItemId(openItemId === task.id ? null : task.id as string), setTaskActive(task) }}
                                       className="col-span-1 flex justify-center items-center gap-1 p-2"
                                    >
                                       <span id="dot" />
                                       <span id="dot" />
                                       <span id="dot" />
                                    </button>

                                    {
                                       openItemId === task.id &&
                                       <div className='bg-white border-black/15 top-[125%] overflow-hidden select-animation rounded-md text-xs absolute border w-full z-20'>
                                          <button className='hover:bg-black/5 duration-150 w-full text-start p-2'
                                             onClick={() => {
                                                setIsTaskDetailsModalOpen(true)
                                                setOpenItemId(null)
                                             }}>
                                             Ver
                                          </button>
                                          <button className='hover:bg-black/5 duration-150 w-full text-start p-2'
                                             onClick={() => {
                                                setIsTaskUpdateModalOpen(true)
                                                setOpenItemId(null)
                                             }}>
                                             Editar
                                          </button>
                                          <button className='hover:bg-black/5 duration-150 w-full text-start p-2'
                                             onClick={() => {
                                                setIsDeleteModalOpen(true)
                                                setOpenItemId(null)
                                             }}>
                                             Eliminar
                                          </button>
                                       </div>
                                    }
                                 </div>
                              </Draggable>
                           )
                        })
                     }
                  </>
               ) : (
                  <p className="text-center text-sm text-black/50 py-2">
                     No hay tareas disponibles
                  </p>
               )}
            </div>
         </Droppable>

         {/* Modal de detalle de tarea */}
         <Modal isOpen={isTaskDetailsModalOpen} customWidth="sm:max-w-4xl" onClose={() => setIsTaskDetailsModalOpen(false)
         } title={taskActive?.title as string} >
            <TaskDetailsForm task={taskActive as TaskProps} onSubmit={() => setIsTaskDetailsModalOpen(false)} onCancel={() => setIsTaskDetailsModalOpen(false)} />
         </Modal>

         {/* Modal de editar tarea */}
         <Modal isOpen={isTaskUpdateModalOpen} customWidth="sm:max-w-4xl" onClose={() => setIsTaskUpdateModalOpen(false)} title={`Editar Tarea - ${taskActive?.title}`} >
            <UpdateTaskForm onSubmit={handleUpdate} onCancel={() => setIsTaskUpdateModalOpen(false)} taskObject={taskActive as TaskProps} />
         </Modal>

         {/* Modal de reasignar tarea */}
         <Modal isOpen={isReasignModalOpen} onClose={() => setIsReasignModalOpen(false)} title="Reasignar tarea">
            <ReasignIssue onSubmit={handleReasign} onCancel={() => setIsReasignModalOpen(false)} taskObject={taskActive as TaskProps} />
         </Modal>

         {/* Modal de eliminar tarea */}
         <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Eliminar tarea">
            <DeleteIssueForm onSubmit={handleDelete} onCancel={() => setIsDeleteModalOpen(false)} taskObject={taskActive as TaskProps} />
         </Modal>
      </>
   )
}