import { useMultiDragContext } from '@/components/ui/dnd-kit/MultiDragContext'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { Draggable } from '@/components/ui/dnd-kit/Draggable'
import { Droppable } from '@/components/ui/dnd-kit/Droppable'
import { SprintProps, TaskProps } from '@/lib/types/types'
import { useConfigStore } from '@/lib/store/ConfigStore'
import DeleteIssueForm from '../issues/DeleteIssueForm'
import TaskDetailsForm from '../issues/TaskDetailsForm'
import { useIssueStore } from '@/lib/store/IssueStore'
import CreateTaskForm from '../issues/CreateTaskForm'
import { useAuthStore } from '@/lib/store/AuthStore'
import ReasignIssue from '../issues/ReasignIssue'
import { CalendarIcon, MenuIcon, EditIcon, DeleteIcon, PlusIcon, ClockIcon, UsersIcon } from '@/assets/Icon'
import Modal from '../../layout/Modal'
import Image from 'next/image'
import CreateSprintForm from './CreateSprintForm'
import { useSprintStore } from '@/lib/store/SprintStore'
import DeleteSprintForm from './DeleteSprintForm'
import IssueConfig from '../config/issues/IssueConfig'
import { getUserAvatar } from '@/lib/utils/avatar.utils'

export default function IssuesCard({ spr, setIsOpen, isOverlay = false }: { spr: SprintProps, setIsOpen: Dispatch<SetStateAction<boolean>>, isOverlay?: boolean }) {
   const { selectedIds, setSelectedIds } = useMultiDragContext()

   if (isOverlay) {
      return (
         <div className="bg-blue-50 border-2 border-blue-200 border-dashed text-blue-700 cursor-grabbing flex items-center justify-center rounded-xl shadow-lg w-full h-full min-h-[320px] transition-all duration-200">
            <div className="flex flex-col items-center gap-3">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
               </svg>
               <div className="text-center">
                  <h3 className="font-semibold text-sm">
                     {selectedIds.length === 1 ? `${selectedIds.length} tarea seleccionada` : `${selectedIds.length} tareas seleccionadas`}
                  </h3>
                  <p className="text-xs opacity-75 mt-1">Arrastra para mover entre sprints</p>
               </div>
            </div>
         </div>
      )
   }

   const { getValidAccessToken } = useAuthStore()
   const { deleteIssue, updateIssue, assignIssue } = useIssueStore()
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
   const [sprintSelected, setSprintSelected] = useState<SprintProps>()
   const [openItemId, setOpenItemId] = useState<string | null>(null)
   const [taskActive, setTaskActive] = useState<TaskProps>()
   const { projectConfig, sprintStatuses } = useConfigStore()

   const sprintTaskIds = spr.tasks?.content.map(t => t.id as string) || []
   const allSelected = sprintTaskIds.length > 0 && sprintTaskIds.every(id => selectedIds.includes(id))

   const formatDate = (fecha: string | null, includeTime = false): string => {
      if (!fecha) return 'No definida'
      const dateObj = new Date(fecha)
      if (isNaN(dateObj.getTime())) return 'Fecha inválida'
      
      const day = dateObj.getDate().toString().padStart(2, '0')
      const month = dateObj.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')
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
   const getSprintStatusStyle = (id: number) => sprintStatuses?.find(status => status.id === id)
   const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

   const toggleSelectAll = () => {
      if (allSelected) {
         setSelectedIds(prev => prev.filter(id => !sprintTaskIds.includes(id)))
      } else {
         setSelectedIds(prev => Array.from(new Set([...prev, ...sprintTaskIds])))
      }
   }

   const getSprintProgress = () => {
      const totalTasks = spr.tasks?.content.length || 0
      if (totalTasks === 0) return 0
      
      const completedStatuses = projectConfig?.issueStatuses?.filter(status => 
         status.name.toLowerCase().includes('done') || 
         status.name.toLowerCase().includes('completed') ||
         status.name.toLowerCase().includes('cerrado')
      ) || []
      
      const completedTasks = spr.tasks?.content.filter(task => 
         completedStatuses.some(status => status.id === task.status)
      ).length || 0
      
      return Math.round((completedTasks / totalTasks) * 100)
   }

   const getSprintDaysLeft = () => {
      if (!spr.endDate) return null
      
      const today = new Date()
      const endDate = new Date(spr.endDate)
      const diffTime = endDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return diffDays
   }

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
   }, filesMap?: Map<string, File[]>) => {
      const token = await getValidAccessToken()
      if (token) await updateIssue(token, formData, filesMap)
      setIsTaskUpdateModalOpen(false)
   }

   const handleReasign = async ({ newUserId, issueId }: { newUserId: string, issueId: string }) => {
      const token = await getValidAccessToken()
      if (token) await assignIssue(token, issueId, newUserId, taskActive?.projectId as string)
      setIsReasignModalOpen(false)
   }

   const handleDelete = async () => {
      const token = await getValidAccessToken()
      if (token) await deleteIssue(token, taskActive?.id as string, taskActive?.projectId as string)
      setIsDeleteModalOpen(false)
   }

   return (
      <>
         <Droppable id={spr.id as string} styleClass="bg-white min-w-40 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
            {/* Sprint Header */}
            <div className="p-6 border-b border-gray-100 bg-gray-50">
               <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{spr.title}</h3>
                        {spr.id !== 'null' && (() => {
                           const statusObject = spr.statusObject || (spr.status ? getSprintStatusStyle(spr.status) : null)
                           return statusObject ? (
                              <div
                                 className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border"
                                 style={{
                                    backgroundColor: `${statusObject.color}15`,
                                    color: statusObject.color,
                                    borderColor: `${statusObject.color}30`
                                 }}
                              >
                                 <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: statusObject.color }}
                                 />
                                 {statusObject.name}
                              </div>
                           ) : null
                        })()}
                     </div>
                     
                     {spr.goal && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{spr.goal}</p>
                     )}

                     {/* Sprint Metadata */}
                     {spr.id !== 'null' && (
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                           <div className="flex items-center gap-1">
                              <CalendarIcon size={14} />
                              <span>{formatDate(spr.startDate)} - {formatDate(spr.endDate)}</span>
                           </div>
                           {(() => {
                              const daysLeft = getSprintDaysLeft()
                              return daysLeft !== null ? (
                                 <div className="flex items-center gap-1">
                                    <ClockIcon size={14} />
                                    <span>
                                       {daysLeft > 0 ? `${daysLeft} días restantes` : 
                                        daysLeft === 0 ? 'Termina hoy' : 
                                        `Terminó hace ${Math.abs(daysLeft)} días`}
                                    </span>
                                 </div>
                              ) : null
                           })()}
                        </div>
                     )}
                  </div>

                  {/* Sprint Actions */}
                  {spr.id !== 'null' ? (
                     <div ref={wrapperSprintRef} className="relative">
                        <button
                           onClick={() => {
                              setSprintSelected(spr)
                              setisSprintOptionsOpen(!isSprintOptionsOpen)
                           }}
                           className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                           <MenuIcon size={16} />
                        </button>
                        
                        {isSprintOptionsOpen && (
                           <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[140px]">
                              <button
                                 className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                 onClick={() => {
                                    setIsUpdateSprintOpen(true)
                                    setisSprintOptionsOpen(false)
                                 }}
                              >
                                 <EditIcon size={14} />
                                 Editar Sprint
                              </button>
                              <button
                                 className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-gray-100"
                                 onClick={() => {
                                    setIsDeleteSprintOpen(true)
                                    setisSprintOptionsOpen(false)
                                 }}
                              >
                                 <DeleteIcon size={14} />
                                 Eliminar Sprint
                              </button>
                           </div>
                        )}
                     </div>
                  ) : (
                     <div className="flex items-center gap-2">
                        <button
                           onClick={() => setIsOpen(true)}
                           className="flex items-center gap-2 px-3 py-2 text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
                        >
                           <PlusIcon size={16} />
                           Tarea
                        </button>
                     </div>
                  )}
               </div>

               {/* Progress and Stats */}
               {spr.id !== 'null' && spr.tasks?.content.length ? (
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="text-xs text-gray-600">
                           <span className="font-medium">{getSprintProgress()}%</span> completado
                        </div>
                        <div className="text-xs text-gray-500">
                           {spr.tasks.content.length} {spr.tasks.content.length === 1 ? 'tarea' : 'tareas'}
                        </div>
                     </div>
                     <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-blue-500 rounded-full transition-all duration-300"
                           style={{ width: `${getSprintProgress()}%` }}
                        />
                     </div>
                  </div>
               ) : null}
            </div>

            {/* Lista de tareas */}
            <div className="p-6 relative">
               {spr.tasks?.content.length ? (
                  <div className="space-y-3">
                     {/* Cabecera con checkbox para seleccionar todas */}
                     <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <input
                           type="checkbox"
                           checked={allSelected}
                           onChange={toggleSelectAll}
                           className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm font-medium text-gray-700">
                           {allSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
                        </span>
                        <span className="text-xs text-gray-500">
                           ({spr.tasks.content.length} {spr.tasks.content.length === 1 ? 'tarea' : 'tareas'})
                        </span>
                     </div>

                     {/* Lista de tareas */}
                     {spr.tasks.content.map((task, index) => {
                        const id = task.id as string
                        const isChecked = selectedIds.includes(id)

                        return (
                           <Draggable
                              key={id}
                              id={id}
                              styleClass={`group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-grab active:cursor-grabbing ${isChecked ? 'ring-2 ring-blue-500 ring-opacity-50 border-blue-300' : ''}`}
                              onDoubleClick={() => {
                                 setIsTaskDetailsModalOpen(true)
                                 setTaskActive(task)
                              }}
                           >
                              {/* Header con checkbox, título y acciones */}
                              <div className="flex items-start justify-between gap-3 mb-3">
                                 <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <input
                                       type="checkbox"
                                       checked={isChecked}
                                       onChange={() => toggleSelect(id)}
                                       onPointerDown={e => e.stopPropagation()}
                                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                                    />
                                    <div className="flex-1 min-w-0">
                                       <h6 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-1" title={task.title}>
                                          {task.title}
                                       </h6>
                                       <p className="text-xs text-gray-500 line-clamp-2" title={task.descriptions[0]?.text}>
                                          {task.descriptions[0]?.text || 'Sin descripción'}
                                       </p>
                                    </div>
                                 </div>

                                 {/* Menú de acciones */}
                                 <div ref={openItemId === task.id ? wrapperRef : null} className="relative flex-shrink-0">
                                    <button
                                       onClick={() => {
                                          setOpenItemId(openItemId === task.id ? null : task.id as string)
                                          setTaskActive(task)
                                       }}
                                       onPointerDown={e => e.stopPropagation()}
                                       className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group-hover:opacity-100 opacity-60"
                                    >
                                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                       </svg>
                                    </button>

                                    {openItemId === task.id && (
                                       <div
                                          className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden"
                                          onPointerDown={e => e.stopPropagation()}
                                       >
                                          <button
                                             className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                                             onClick={() => {
                                                setIsTaskDetailsModalOpen(true)
                                                setOpenItemId(null)
                                             }}
                                          >
                                             Ver detalles
                                          </button>
                                          <button
                                             className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                                             onClick={() => {
                                                setIsTaskUpdateModalOpen(true)
                                                setOpenItemId(null)
                                             }}
                                          >
                                             Editar
                                          </button>
                                          <button
                                             className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 transition-colors text-red-600"
                                             onClick={() => {
                                                setIsDeleteModalOpen(true)
                                                setOpenItemId(null)
                                             }}
                                          >
                                             Eliminar
                                          </button>
                                       </div>
                                    )}
                                 </div>
                              </div>

                              {/* Badges de estado y prioridad */}
                              <div className="flex items-center gap-2 mb-3">
                                 <span
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
                                    style={{
                                       backgroundColor: `${getTypeStyle(Number(task.type))?.color ?? "#6B7280"}15`,
                                       color: getTypeStyle(Number(task.type))?.color ?? "#6B7280",
                                       borderColor: `${getTypeStyle(Number(task.type))?.color ?? "#6B7280"}30`
                                    }}
                                 >
                                    {getTypeStyle(Number(task.type))?.name ?? "Sin tipo"}
                                 </span>
                                 <span
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
                                    style={{
                                       backgroundColor: `${getStatusStyle(Number(task.status))?.color ?? "#6B7280"}15`,
                                       color: getStatusStyle(Number(task.status))?.color ?? "#6B7280",
                                       borderColor: `${getStatusStyle(Number(task.status))?.color ?? "#6B7280"}30`
                                    }}
                                 >
                                    {getStatusStyle(Number(task.status))?.name ?? "Sin estado"}
                                 </span>
                                 <span
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
                                    style={{
                                       backgroundColor: `${getPriorityStyle(Number(task.priority))?.color ?? "#6B7280"}15`,
                                       color: getPriorityStyle(Number(task.priority))?.color ?? "#6B7280",
                                       borderColor: `${getPriorityStyle(Number(task.priority))?.color ?? "#6B7280"}30`
                                    }}
                                 >
                                    {getPriorityStyle(Number(task.priority))?.name ?? "Sin prioridad"}
                                 </span>
                              </div>

                              {/* Asignado a y metadata */}
                              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                 <button
                                    className="flex items-center gap-2 text-left hover:bg-gray-50 rounded-lg p-2 transition-colors flex-1"
                                    onPointerDown={e => e.stopPropagation()}
                                    onClick={() => {
                                       setIsReasignModalOpen(true)
                                       setOpenItemId(null)
                                       setTaskActive(task)
                                    }}
                                 >
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                       {typeof task.assignedId === 'object' && task.assignedId ? (
                                          <img
                                             src={getUserAvatar(task.assignedId, 32)}
                                             alt="Asignado a"
                                             className="w-full h-full object-cover rounded-full"
                                          />
                                       ) : (
                                          <span className="text-sm font-medium text-gray-600">
                                             N/A
                                          </span>
                                       )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className="text-sm font-medium text-gray-900 truncate">
                                          {typeof task.assignedId === 'object' && task.assignedId
                                             ? `${task.assignedId.firstName} ${task.assignedId.lastName}`
                                             : 'Sin asignar'}
                                       </p>
                                       <p className="text-xs text-gray-500">
                                          {typeof task.assignedId === 'object' && task.assignedId
                                             ? 'Asignado'
                                             : 'Click para asignar'}
                                       </p>
                                    </div>
                                 </button>

                                 <div className="flex items-center gap-2">
                                    {task.estimatedTime && (
                                       <div className="flex items-center gap-1 text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                                          <ClockIcon size={14} />
                                          <span>{task.estimatedTime}h</span>
                                       </div>
                                    )}
                                    {task.createdAt && (
                                       <div className="text-xs text-gray-400 px-2">
                                          {formatDate(task.createdAt)}
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </Draggable>
                        )
                     })}
                  </div>
               ) : (
                  <div className="text-center py-12">
                     <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                     <p className="text-gray-500 text-lg font-medium">No hay tareas disponibles</p>
                     <p className="text-gray-400 text-sm mt-1">Agrega algunas tareas para comenzar</p>
                  </div>
               )}
            </div>
         </Droppable>

         {/* Modal de editar sprint */}
         <Modal isOpen={isUpdateSprintOpen} onClose={() => setIsUpdateSprintOpen(false)} title="" customWidth="sm:max-w-2xl" showCloseButton={false}>
            <CreateSprintForm 
               onSubmit={handleUpdateSprint} 
               onCancel={() => setIsUpdateSprintOpen(false)} 
               currentSprint={sprintSelected as SprintProps} 
               isEdit={true}
            />
         </Modal>

         {/* Modal de detalle de tarea */}
         <Modal isOpen={isTaskDetailsModalOpen} customWidth="sm:max-w-6xl" onClose={() => setIsTaskDetailsModalOpen(false)} title="" showCloseButton={false}>
            <TaskDetailsForm task={taskActive as TaskProps} onSubmit={() => setIsTaskDetailsModalOpen(false)} onCancel={() => setIsTaskDetailsModalOpen(false)} />
         </Modal>

         {/* Modal de editar tarea */}
         < Modal isOpen={isTaskUpdateModalOpen} customWidth="sm:max-w-4xl" onClose={() => setIsTaskUpdateModalOpen(false)} title={`Editar Tarea - ${taskActive?.title}`} showCloseButton={false} >
            <CreateTaskForm 
               onSubmit={handleUpdate} 
               onCancel={() => setIsTaskUpdateModalOpen(false)} 
               taskObject={taskActive as TaskProps}
               isEdit={true}
            />
         </Modal >

         {/* Modal de reasignar tarea */}
         < Modal isOpen={isReasignModalOpen} onClose={() => setIsReasignModalOpen(false)} title="Reasignar tarea" showCloseButton={false} >
            <ReasignIssue onSubmit={handleReasign} onCancel={() => setIsReasignModalOpen(false)} taskObject={taskActive as TaskProps} />
         </Modal >

         {/* Modal de eliminar tarea */}
         < Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="" >
            <DeleteIssueForm onSubmit={handleDelete} onCancel={() => setIsDeleteModalOpen(false)} taskObject={taskActive as TaskProps} />
         </Modal >

         {/* Modal de eliminar sprint */}
         <Modal isOpen={isDeleteSprintOpen} onClose={() => setIsDeleteSprintOpen(false)} title="Eliminar sprint" >
            <DeleteSprintForm onSubmit={handleDeleteSprint} onCancel={() => setIsDeleteSprintOpen(false)} sprintObject={sprintSelected as SprintProps} />
         </Modal>
      </>
   )
}