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
import { CalendarIcon, ConfigIcon } from '@/assets/Icon'
import Modal from '../../layout/Modal'
import Image from 'next/image'
import UpdateSprintForm from './UpdateSprintForm'
import { useSprintStore } from '@/lib/store/SprintStore'
import DeleteSprintForm from './DeleteSprintForm'
import IssueConfig from '../config/issues/IssueConfig'

export default function IssuesCard({ spr, setIsOpen, isOverlay = false }: { spr: SprintProps, setIsOpen: Dispatch<SetStateAction<boolean>>, isOverlay?: boolean }) {
   const { selectedIds, setSelectedIds } = useMultiDragContext()

   if (isOverlay) {
      return (
         <div className="bg-sky-100 border-sky-700 text-sky-700 cursor-grabbing flex items-center rounded-md shadow-xl border w-full h-full p-4">
            <h3 className="font-medium text-sm truncate">
               {selectedIds.length === 1 ? `${selectedIds.length} tarea seleccionada` : `${selectedIds.length} tareas seleccionadas`}
            </h3>
         </div>
      )
   }

   const { getValidAccessToken } = useAuthStore()
   const { deleteIssue, updateIssue, reasingIssue } = useIssueStore()
   const { updateSprint, deleteSprint } = useSprintStore()

   const wrapperRef = useRef<HTMLDivElement>(null)
   const wrapperSprintRef = useRef<HTMLDivElement>(null)

   const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false)
   const [isTaskUpdateModalOpen, setIsTaskUpdateModalOpen] = useState(false)
   const [isSprintOptionsOpen, setisSprintOptionsOpen] = useState(false)
   const [isReasignModalOpen, setIsReasignModalOpen] = useState(false)
   const [isUpdateSprintOpen, setIsUpdateSprintOpen] = useState(false)
   const [isDeleteSprintOpen, setIsDeleteSprintOpen] = useState(false)
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
   const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
   const [sprintSelected, setSprintSelected] = useState<SprintProps>()
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

   useEffect(() => {
      const handlePointerDown = (event: PointerEvent) => { if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setOpenItemId(null) }
      document.addEventListener('pointerdown', handlePointerDown)
      return () => document.removeEventListener('pointerdown', handlePointerDown)
   }, [])

   useEffect(() => {
      const handlePointerSprintDown = (event: PointerEvent) => {
         if (wrapperSprintRef.current && !wrapperSprintRef.current.contains(event.target as Node)) {
            setisSprintOptionsOpen(false)
         }
      }
      document.addEventListener('pointerdown', handlePointerSprintDown)
      return () => document.removeEventListener('pointerdown', handlePointerSprintDown)
   }, [])

   const handleUpdateSprint = async (formData: SprintProps) => {
      const token = await getValidAccessToken()
      if (token) await updateSprint(token, formData, formData.projectId)
      setIsUpdateSprintOpen(false)
   }

   const handleDeleteSprint = async (sprint: SprintProps) => {
      const token = await getValidAccessToken()
      if (token) await deleteSprint(token, sprint.id as string, sprint.projectId)
      setIsDeleteModalOpen(false)
   }

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
         <Droppable id={spr.id as string} styleClass="bg-white rounded-md py-4 min-w-[425px] max-w-[425px] overflow-x-hidden">
            {/* Header del sprint */}
            <div className="flex flex-col items-start gap-1.5 px-4">
               <div className="flex justify-between items-center w-full gap-2">
                  <h5 className="font-semibold text-lg truncate">{spr.title}</h5>
                  {
                     spr.id !== 'null' ? (
                        <div ref={wrapperSprintRef} className="text-black/75 relative flex items-center text-xs">
                           <aside className='flex items-center gap-1.5'>
                              <CalendarIcon size={18} />
                              {formatDate(spr.startDate)} – {formatDate(spr.endDate)}
                           </aside>

                           <button
                              id="custom-ellipsis"
                              onClick={() => {
                                 setSprintSelected(spr)
                                 setisSprintOptionsOpen(!isSprintOptionsOpen)
                              }}
                              className="flex justify-center items-center gap-1 p-2 pr-0 scale-75"
                           >
                              <span id="dot" />
                              <span id="dot" />
                              <span id="dot" />
                           </button>
                           {
                              isSprintOptionsOpen &&
                              <div className='bg-white border-black/15 flex flex-col top-[125%] right-0 overflow-hidden select-animation rounded-md text-xs absolute border z-20'>
                                 <button className='hover:bg-black/5 duration-150 text-start p-2'
                                    onClick={() => {
                                       setIsUpdateSprintOpen(true)
                                       setisSprintOptionsOpen(false)
                                    }}>
                                    Editar
                                 </button>
                                 <button className='hover:bg-black/5 duration-150 text-start p-2'
                                    onClick={() => {
                                       setIsDeleteSprintOpen(true)
                                       setisSprintOptionsOpen(false)
                                    }}>
                                    Eliminar
                                 </button>
                              </div>
                           }
                        </div>
                     ) : (
                        <div className='flex items-center text-sm gap-2'>
                           <button
                              onClick={() => setIsConfigModalOpen(true)}
                              className="border-blue-600 text-blue-600 hover:bg-blue-700 hover:text-white
                            border rounded-md duration-150 whitespace-nowrap flex items-center gap-2 px-3 py-2"
                           >
                              <ConfigIcon size={20} stroke={2} />
                              Configuración
                           </button>
                           <button
                              onClick={() => setIsOpen(true)}
                              className="px-3 py-2 border-blue-600 bg-blue-600 text-white rounded-md hover:bg-blue-700 border duration-150 whitespace-nowrap"
                           >
                              Crear Tarea
                           </button>
                        </div>
                     )
                  }
               </div>
               <div className='flex justify-between items-start w-full gap-2'>
                  <p className="text-black/50 text-sm line-clamp-2 mb-4">{spr.goal}</p>
                  {
                     spr.id !== 'null' && spr.statusObject &&
                     <div className="rounded-full text-xs border px-2 whitespace-nowrap w-fit"
                        style={{ backgroundColor: `${spr.statusObject.color}0f`, color: spr.statusObject.color }}>
                        {spr.statusObject.name.charAt(0).toUpperCase() + spr.statusObject.name.slice(1).toLowerCase()}
                     </div>
                  }
               </div>
            </div>

            {/* Lista de tareas con checkbox */}
            <div className="text-sm space-y-2 max-h-[600px] overflow-y-auto overflow-x-hidden px-4">
               {spr.tasks?.content.length ? (
                  <>
                     {
                        spr.tasks.content.map(task => {
                           const id = task.id as string
                           const isChecked = selectedIds.includes(id)

                           return (
                              <Draggable key={id} id={id}
                                 styleClass="border-black/15 hover:bg-black/5 active:cursor-grabbing select-none cursor-grab
                                  flex flex-col rounded-md border gap-2 p-4">
                                 {/* Checkbox individual */}
                                 <div className='flex justify-between items-center gap-2'>
                                    <div className="flex items-center gap-2">
                                       <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => toggleSelect(id)}
                                          onPointerDown={e => e.stopPropagation()}
                                          className="cursor-pointer"
                                       />
                                       <h6 className="font-medium line-clamp-1" title={task.title}>{task.title}</h6>
                                    </div>

                                    <div ref={openItemId === task.id ? wrapperRef : null} className='w-16 relative flex justify-end cursor-pointer' onPointerDown={e => e.stopPropagation()}>
                                       <button
                                          id="custom-ellipsis"
                                          onClick={() => { setOpenItemId(openItemId === task.id ? null : task.id as string), setTaskActive(task) }}
                                          className="col-span-1 flex justify-center items-center gap-1 p-2 pr-0 scale-75"
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
                                 </div>

                                 <p className="text-xs text-black/75 line-clamp-3" title={task.descriptions[0].text}>
                                    {task.descriptions[0].text}
                                 </p>

                                 <div className='flex justify-between items-stretch gap-2'>
                                    {/* Estado */}
                                    <div
                                       className="rounded-md border w-full p-2.5"
                                       style={{
                                          backgroundColor: `${getStatusStyle(Number(task.status))?.color ?? "#000000"}0f`,
                                          color: getStatusStyle(Number(task.status))?.color ?? "#000000"
                                       }}
                                    >
                                       <h6 className='text-[10px]'>Estado</h6>
                                       <p className='font-bold'>
                                          {getStatusStyle(Number(task.status))?.name ?? "Sin estado"}
                                       </p>
                                    </div>

                                    {/* Prioridad */}
                                    <div
                                       className="rounded-md border w-full p-2.5"
                                       style={{
                                          backgroundColor: `${getPriorityStyle(Number(task.priority))?.color ?? "#000000"}0f`,
                                          color: getPriorityStyle(Number(task.priority))?.color ?? "#000000"
                                       }}
                                    >
                                       <h6 className='text-[10px]'>Prioridad</h6>
                                       <p className='font-bold'>
                                          {getPriorityStyle(Number(task.priority))?.name ?? "Sin prioridad"}
                                       </p>
                                    </div>
                                 </div>

                                 <div className='flex items-center justify-between gap-2'>
                                    {/* Asignado a */}
                                    <button className="flex self-end items-center gap-1 w-fit cursor-pointer hover:font-semibold duration-150" onPointerDown={e => e.stopPropagation()}
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
                                       <p className="text-xs truncate">
                                          {typeof task.assignedId === 'object' ? `${task.assignedId.firstName} ${task.assignedId.lastName}` : ''}
                                       </p>
                                    </button>

                                    {/* Tipo */}
                                    <div
                                       className="col-span-1 rounded-full text-xs border px-2 whitespace-nowrap w-fit"
                                       style={{
                                          backgroundColor: `${getTypeStyle(Number(task.type))?.color ?? "#000000"}0f`,
                                          color: getTypeStyle(Number(task.type))?.color ?? "#000000"
                                       }}
                                    >
                                       {getTypeStyle(Number(task.type))?.name ?? "Sin tipo"}
                                    </div>
                                 </div>
                              </Draggable>
                           )
                        })
                     }
                  </>
               ) : (
                  <p className="text-black/50 text-center text-sm py-2 mt-60">
                     No hay tareas disponibles
                  </p>
               )}
            </div>
         </Droppable >

         {/* Modal de editar sprint */}
         < Modal isOpen={isUpdateSprintOpen} onClose={() => setIsUpdateSprintOpen(false)} title="Editar sprint" >
            <UpdateSprintForm onSubmit={handleUpdateSprint} onCancel={() => setIsUpdateSprintOpen(false)} currentSprint={sprintSelected as SprintProps} />
         </Modal >

         {/* Modal de detalle de tarea */}
         < Modal isOpen={isTaskDetailsModalOpen} customWidth="sm:max-w-6xl" onClose={() => setIsTaskDetailsModalOpen(false)
         } title={taskActive?.title as string} >
            <TaskDetailsForm task={taskActive as TaskProps} onSubmit={() => setIsTaskDetailsModalOpen(false)} onCancel={() => setIsTaskDetailsModalOpen(false)} />
         </Modal >

         {/* Modal de editar tarea */}
         < Modal isOpen={isTaskUpdateModalOpen} customWidth="sm:max-w-4xl" onClose={() => setIsTaskUpdateModalOpen(false)} title={`Editar Tarea - ${taskActive?.title}`} >
            <UpdateTaskForm onSubmit={handleUpdate} onCancel={() => setIsTaskUpdateModalOpen(false)} taskObject={taskActive as TaskProps} />
         </Modal >

         {/* Modal de reasignar tarea */}
         < Modal isOpen={isReasignModalOpen} onClose={() => setIsReasignModalOpen(false)} title="Reasignar tarea" >
            <ReasignIssue onSubmit={handleReasign} onCancel={() => setIsReasignModalOpen(false)} taskObject={taskActive as TaskProps} />
         </Modal >

         {/* Modal de eliminar tarea */}
         < Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Eliminar tarea" >
            <DeleteIssueForm onSubmit={handleDelete} onCancel={() => setIsDeleteModalOpen(false)} taskObject={taskActive as TaskProps} />
         </Modal >

         {/* Modal de eliminar sprint */}
         <Modal isOpen={isDeleteSprintOpen} onClose={() => setIsDeleteSprintOpen(false)} title="Eliminar sprint" >
            <DeleteSprintForm onSubmit={handleDeleteSprint} onCancel={() => setIsDeleteSprintOpen(false)} sprintObject={sprintSelected as SprintProps} />
         </Modal>

         {/* Modal de configuración de tareas */}
         <Modal customWidth='max-w-2xl' isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} title="Configuración de tareas" >
            <IssueConfig onClose={() => setIsConfigModalOpen(false)} projectId={spr.projectId} />
         </Modal>
      </>
   )
}