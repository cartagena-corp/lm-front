import { useMultiDragContext } from '@/components/ui/dnd-kit/MultiDragContext'
import { Dispatch, SetStateAction, useEffect, useRef, useState, useCallback } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Droppable } from '@/components/ui/dnd-kit/Droppable'
import { SprintProps, TaskProps } from '@/lib/types/types'
import { useConfigStore } from '@/lib/store/ConfigStore'
import DeleteIssueForm from '../issues/DeleteIssueForm'
import TaskDetailsForm from '../issues/TaskDetailsForm'
import { useIssueStore } from '@/lib/store/IssueStore'
import CreateTaskForm from '../issues/CreateTaskForm'
import { useAuthStore } from '@/lib/store/AuthStore'
import ReasignIssue from '../issues/ReasignIssue'
import { CalendarIcon, CheckmarkIcon, EditIcon, DeleteIcon, PlusIcon, EyeIcon, ClockIcon, ForbiddenIcon } from '@/assets/Icon'
import Modal from '../../layout/Modal'
import Image from 'next/image'
import CreateSprintForm from './CreateSprintForm'
import { useSprintStore } from '@/lib/store/SprintStore'
import DeleteSprintForm from './DeleteSprintForm'
import IssueConfig from '../config/issues/IssueConfig'
import AuditHistory from '../audit/AuditHistory'
import { getUserAvatar } from '@/lib/utils/avatar.utils'

// Component DraggableIssueRow - Implementación igual a SprintKanbanCard
interface DraggableIssueRowProps {
   task: TaskProps
   selectedIds: string[]
   toggleSelect: (id: string) => void
   onViewDetails: () => void
   onEdit: () => void
   onReassign: () => void
   onDelete: () => void
   onHistory: () => void
   getStatusStyle: (id: number) => any
   getPriorityStyle: (id: number) => any
   getTypeStyle: (id: number) => any
   openItemId: string | null
   setOpenItemId: (id: string | null) => void
   wrapperRef: React.RefObject<HTMLDivElement>
}

function DraggableIssueRow({ task, selectedIds, toggleSelect, onViewDetails, onEdit, onReassign, onDelete, onHistory, getStatusStyle, getPriorityStyle, getTypeStyle, openItemId, setOpenItemId, wrapperRef }: DraggableIssueRowProps) {
   const id = task.id as string
   const isChecked = selectedIds.includes(id)
   
   // Estado para manejar clicks y drag - MISMA LÓGICA QUE SprintKanbanCard
   const startPosition = useRef<{ x: number; y: number } | null>(null)
   const lastClickTime = useRef<number>(0)
   const isPointerDown = useRef<boolean>(false)
   const hasMoved = useRef<boolean>(false)

   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      isDragging,
   } = useDraggable({ id })

   const style = {
      transform: CSS.Translate.toString(transform),
   }

   // Custom event handlers para detectar drag vs click - MISMA LÓGICA QUE SprintKanbanCard
   const handlePointerDown = useCallback((event: React.PointerEvent) => {
      const currentTime = Date.now()
      startPosition.current = { x: event.clientX, y: event.clientY }
      isPointerDown.current = true
      hasMoved.current = false
      
      // Detectar doble click
      if (currentTime - lastClickTime.current < 300) {
         // Es un doble click
         event.preventDefault()
         event.stopPropagation()
         onViewDetails()
         return
      }
      
      lastClickTime.current = currentTime
      
      // Siempre llamar al listener original, el sensor se encarga de la distancia
      if (listeners?.onPointerDown) {
         listeners.onPointerDown(event)
      }
   }, [onViewDetails, listeners])
   
   const handlePointerMove = useCallback((event: React.PointerEvent) => {
      if (startPosition.current && isPointerDown.current) {
         const deltaX = Math.abs(event.clientX - startPosition.current.x)
         const deltaY = Math.abs(event.clientY - startPosition.current.y)
         
         // Si se mueve más de 3 píxeles, marcar como movimiento
         if (deltaX > 3 || deltaY > 3) {
            hasMoved.current = true
         }
      }
      
      // Llamar al listener original del drag
      if (listeners?.onPointerMove) {
         listeners.onPointerMove(event)
      }
   }, [listeners])
   
   const handlePointerUp = useCallback((event: React.PointerEvent) => {
      // Si fue un click simple (sin movimiento) y no fue doble click
      if (isPointerDown.current && !hasMoved.current) {
         // Esperar un momento para ver si viene un segundo click
         setTimeout(() => {
            const timeSinceLastClick = Date.now() - lastClickTime.current
            // Si han pasado más de 300ms desde el último click, es un click simple
            if (timeSinceLastClick > 300) {
               onViewDetails()
            }
         }, 350) // Esperar un poco más de 300ms para asegurar que no es doble click
      }
      
      startPosition.current = null
      isPointerDown.current = false
      hasMoved.current = false
      
      // Llamar al listener original del drag
      if (listeners?.onPointerUp) {
         listeners.onPointerUp(event)
      }
   }, [onViewDetails, listeners])
   
   // Crear listeners personalizados
   const customListeners = {
      ...listeners,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp
   }

   return (
      <div
         ref={setNodeRef}
         style={style}
         {...attributes}
         {...customListeners}
         className={`grid grid-cols-18 gap-4 p-3 items-center hover:bg-blue-50/30 rounded-lg border border-gray-100 hover:border-blue-200 transition-all cursor-grab active:cursor-grabbing bg-white shadow-sm hover:shadow-md ${isDragging ? 'opacity-0' : ''}`}
      >
         {/* Checkbox */}
         <div className="col-span-1 flex justify-center">
            <input
               type="checkbox"
               checked={isChecked}
               onChange={() => toggleSelect(id)}
               onPointerDown={e => e.stopPropagation()}
               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
         </div>

         {/* Tipo */}
         <div
            className="col-span-1 rounded-full text-[10px] border px-2 whitespace-nowrap w-fit"
            style={{
               backgroundColor: `${getTypeStyle(Number(task.type))?.color ?? "#000000"}0f`,
               color: getTypeStyle(Number(task.type))?.color ?? "#000000"
            }}
         >
            {getTypeStyle(Number(task.type))?.name ?? "Sin tipo"}
         </div>

         {/* Tarea */}
         <div className="col-span-5">
            <h6 className="font-medium text-gray-900 text-sm line-clamp-1" title={task.title}>
               {task.title}
            </h6>
            <p className="text-xs text-gray-500 line-clamp-1" title={task.descriptions[0]?.text}>
               {task.descriptions[0]?.text || 'Sin descripción'}
            </p>
         </div>

         {/* Estado */}
         <div className="col-span-2">
            <span
               className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border"
               style={{
                  backgroundColor: `${getStatusStyle(Number(task.status))?.color ?? "#6B7280"}15`,
                  color: getStatusStyle(Number(task.status))?.color ?? "#6B7280",
                  borderColor: `${getStatusStyle(Number(task.status))?.color ?? "#6B7280"}30`
               }}
            >
               <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: getStatusStyle(Number(task.status))?.color ?? "#6B7280" }}
               />
               {getStatusStyle(Number(task.status))?.name ?? "Sin estado"}
            </span>
         </div>

         {/* Prioridad */}
         <div className="col-span-2">
            <span
               className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border"
               style={{
                  backgroundColor: `${getPriorityStyle(Number(task.priority))?.color ?? "#6B7280"}15`,
                  color: getPriorityStyle(Number(task.priority))?.color ?? "#6B7280",
                  borderColor: `${getPriorityStyle(Number(task.priority))?.color ?? "#6B7280"}30`
               }}
            >
               <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: getPriorityStyle(Number(task.priority))?.color ?? "#6B7280" }}
               />
               {getPriorityStyle(Number(task.priority))?.name ?? "Sin prioridad"}
            </span>
         </div>

         {/* Asignado a */}
         <div className="col-span-5">
            <button
               className="flex items-center gap-2 w-full text-left hover:bg-gray-50 rounded-lg p-2 transition-colors"
               onPointerDown={e => e.stopPropagation()}
               onClick={onReassign}
            >
               <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {typeof task.assignedId === 'object' && task.assignedId ? (
                     <img
                        src={getUserAvatar(task.assignedId, 24)}
                        alt="Asignado a"
                        className="w-full h-full object-cover rounded-full"
                     />
                  ) : (
                     <span className="text-xs font-medium text-gray-600">
                        N/A
                     </span>
                  )}
               </div>
               <span className="text-xs text-gray-700 line-clamp-1">
                  {typeof task.assignedId === 'object' && task.assignedId
                     ? `${task.assignedId.firstName} ${task.assignedId.lastName}`
                     : 'Sin asignar'}
               </span>
            </button>
         </div>

         {/* Acciones */}
         <div className="col-span-1 flex justify-center">
            <div ref={openItemId === task.id ? wrapperRef : null} className="relative">
               <button
                  onClick={() => {
                     setOpenItemId(openItemId === task.id ? null : task.id as string)
                  }}
                  onPointerDown={e => e.stopPropagation()}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
               >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
               </button>

               {openItemId === task.id && (
                  <div
                     className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-[70] overflow-hidden"
                     onPointerDown={e => e.stopPropagation()}
                  >
                     <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                        onPointerDown={e => e.stopPropagation()}
                        onClick={() => {
                           onViewDetails()
                           setOpenItemId(null)
                        }}
                     >
                        <EyeIcon size={14} />
                        Ver detalles
                     </button>
                     <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                        onPointerDown={e => e.stopPropagation()}
                        onClick={() => {
                           onEdit()
                           setOpenItemId(null)
                        }}
                     >
                        <EditIcon size={14} />
                        Editar
                     </button>
                     <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                        onPointerDown={e => e.stopPropagation()}
                        onClick={() => {
                           onHistory()
                           setOpenItemId(null)
                        }}
                     >
                        <ClockIcon size={14} />
                        Historial
                     </button>
                     <div className="border-t border-gray-100"></div>
                     <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600"
                        onPointerDown={e => e.stopPropagation()}
                        onClick={() => {
                           onDelete()
                           setOpenItemId(null)
                        }}
                     >
                        <DeleteIcon size={14} />
                        Eliminar
                     </button>
                  </div>
               )}
            </div>
         </div>
      </div>
   )
}

export default function IssuesRow({ spr, setIsOpen, isOverlay = false }: { spr: SprintProps, setIsOpen: Dispatch<SetStateAction<boolean>>, isOverlay?: boolean }) {
   const { selectedIds, setSelectedIds } = useMultiDragContext()

   if (isOverlay) {
      return (
         <div className="bg-blue-50 border-2 border-blue-200 border-dashed text-blue-700 cursor-grabbing flex items-center justify-center rounded-xl shadow-lg w-full h-20 transition-all duration-200">
            <div className="flex items-center gap-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
               </svg>
               <span className="font-medium text-sm">
                  {selectedIds.length === 1 ? `${selectedIds.length} tarea seleccionada` : `${selectedIds.length} tareas seleccionadas`}
               </span>
            </div>
         </div>
      )
   }

   const { getValidAccessToken } = useAuthStore()
   const { deleteIssue, updateIssue, assignIssue } = useIssueStore()
   const { updateSprint, deleteSprint, activeSprint } = useSprintStore()

   const wrapperRef = useRef<HTMLDivElement>(null)
   const wrapperSprintRef = useRef<HTMLDivElement>(null)

   const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false)
   const [isTaskUpdateModalOpen, setIsTaskUpdateModalOpen] = useState(false)
   const [isSprintOptionsOpen, setisSprintOptionsOpen] = useState(false)
   const [isReasignModalOpen, setIsReasignModalOpen] = useState(false)
   const [isUpdateSprintOpen, setIsUpdateSprintOpen] = useState(false)
   const [isDeleteSprintOpen, setIsDeleteSprintOpen] = useState(false)
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
   const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
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
   const getSprintStatusStyle = (id: number) => sprintStatuses?.find(status => status.id === id)
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
      setIsDeleteSprintOpen(false)
   }

   const handleActivateSprint = async (sprint: SprintProps) => {
      const token = await getValidAccessToken()
      if (token) {
         const updatedSprint = { ...sprint, active: true }
         await updateSprint(token, updatedSprint, sprint.projectId)
      }
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
         <Droppable id={spr.id as string} styleClass="bg-white rounded-xl shadow-sm border mb-6">
            {/* Header del sprint */}
            <div className="bg-zinc-50/75 border-b border-gray-200/50 p-6">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                     <div className={`w-3 h-3 rounded-full ${spr.active ? 'bg-green-500 animate-pulse shadow-sm' : 'bg-gray-400'}`}></div>
                     <h3 className="text-xl font-semibold text-gray-900">{spr.title}</h3>

                     {/* Badge de activo */}
                     {spr.active && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm">
                           <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                           ACTIVO
                        </span>
                     )}
                  </div>


                  {/* Acciones del sprint */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                     {spr.id !== 'null' ? (
                        <>
                           {/* Botón de Activar Sprint */}
                           {!spr.active && (
                              <button
                                 onClick={() => handleActivateSprint(spr)}
                                 disabled={!!activeSprint && activeSprint.id !== spr.id}
                                 className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${!!activeSprint && activeSprint.id !== spr.id
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                    : 'bg-green-600 hover:bg-green-700 text-white border border-green-500 shadow-sm hover:shadow-md'
                                    }`}
                                 title={!!activeSprint && activeSprint.id !== spr.id ? 'Ya hay un sprint activo' : 'Activar este sprint'}
                              >
                                 {!!activeSprint && activeSprint.id !== spr.id ? <ForbiddenIcon size={16} stroke={2.5} /> : <CheckmarkIcon size={16} stroke={2.5} />}
                                 <span>{!!activeSprint && activeSprint.id !== spr.id ? "Deshabilitado" : "Activar"}</span>
                              </button>
                           )}

                           {/* Menú de opciones */}
                           <div ref={wrapperSprintRef} className="relative">
                              <button
                                 onClick={() => {
                                    setSprintSelected(spr)
                                    setisSprintOptionsOpen(!isSprintOptionsOpen)
                                 }}
                                 className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-all duration-200 border border-gray-200/60 shadow-sm hover:shadow-md"
                              >
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                 </svg>
                              </button>

                              {isSprintOptionsOpen && (
                                 <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                                    <div className="py-1">
                                       <button
                                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                          onClick={() => {
                                             setIsUpdateSprintOpen(true)
                                             setisSprintOptionsOpen(false)
                                          }}
                                       >
                                          <EditIcon size={16} />
                                          <span>Editar Sprint</span>
                                       </button>
                                       {spr.active && (
                                          <button
                                             className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 flex items-center gap-3 transition-colors text-orange-600"
                                             onClick={() => {
                                                const updatedSprint = { ...spr, active: false }
                                                handleUpdateSprint(updatedSprint)
                                                setisSprintOptionsOpen(false)
                                             }}
                                          >
                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                             </svg>
                                             <span>Desactivar Sprint</span>
                                          </button>
                                       )}
                                       <div className="border-t border-gray-100 my-1"></div>
                                       <button
                                          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-3 transition-colors text-red-600"
                                          onClick={() => {
                                             setIsDeleteSprintOpen(true)
                                             setisSprintOptionsOpen(false)
                                          }}
                                       >
                                          <DeleteIcon size={16} />
                                          <span>Eliminar Sprint</span>
                                       </button>
                                    </div>
                                 </div>
                              )}
                           </div>
                        </>
                     ) : (
                        <button
                           onClick={() => setIsOpen(true)}
                           className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                        >
                           <PlusIcon size={16} />
                           <span>Nueva Tarea</span>
                        </button>
                     )}
                  </div>
               </div>

               {/* Meta del sprint */}
               {spr.goal && (
                  <div className="px-6 pb-4">
                     <div className="bg-white/70 backdrop-blur-sm border border-gray-200/80 rounded-lg p-3 shadow-sm">
                        <div className="flex items-start gap-2">
                           <div className="flex-shrink-0 mt-0.5">
                              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                           </div>
                           <div>
                              <p className="text-xs font-medium text-gray-800 mb-1">Meta del Sprint</p>
                              <p className="text-xs text-gray-600 leading-relaxed">{spr.goal}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* Información secundaria - badges */}
               <div className="px-6 pb-4">
                  <div className='flex justify-between items-center'>
                     <div className="flex items-center gap-2 flex-wrap">
                        {/* Badge de estado */}
                        {(() => {
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

                        {/* Badge de tareas */}
                        {spr.tasks?.content && (
                           <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-xs font-medium text-blue-800 border border-blue-200">
                              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              <span>
                                 {spr.tasks.content.length} {spr.tasks.content.length === 1 ? 'tarea' : 'tareas'}
                              </span>
                           </div>
                        )}
                     </div>

                     {/* Badge de fechas */}
                     {spr.id !== 'null' && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full text-xs font-medium text-purple-800 border border-purple-200">
                           <CalendarIcon size={14} />
                           <span>
                              {formatDate(spr.startDate)} – {formatDate(spr.endDate)}
                           </span>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Lista de tareas */}
            <div className="p-6">
               {spr.tasks?.content.length ? (
                  <div className="space-y-3">
                     {/* Cabecera del grid */}
                     <div className="grid grid-cols-18 gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs font-medium text-gray-600">
                        <div className="col-span-1 flex justify-center">
                           <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={toggleSelectAll}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                           />
                        </div>
                        <div className="col-span-1">Tipo</div>
                        <div className="col-span-5">Tarea</div>
                        <div className="col-span-2">Estado</div>
                        <div className="col-span-2">Prioridad</div>
                        <div className="col-span-5">Asignado a</div>
                        <div className="col-span-1 text-center">Acciones</div>
                     </div>

                     {/* Filas de tareas */}
                     {spr.tasks.content.map((task, index) => {
                        return (
                           <DraggableIssueRow
                              key={task.id}
                              task={task}
                              selectedIds={selectedIds}
                              toggleSelect={toggleSelect}
                              onViewDetails={() => {
                                 setIsTaskDetailsModalOpen(true)
                                 setTaskActive(task)
                              }}
                              onEdit={() => {
                                 setIsTaskUpdateModalOpen(true)
                                 setTaskActive(task)
                              }}
                              onReassign={() => {
                                 setIsReasignModalOpen(true)
                                 setTaskActive(task)
                              }}
                              onDelete={() => {
                                 setIsDeleteModalOpen(true)
                                 setTaskActive(task)
                              }}
                              onHistory={() => {
                                 setIsHistoryModalOpen(true)
                                 setTaskActive(task)
                              }}
                              getStatusStyle={getStatusStyle}
                              getPriorityStyle={getPriorityStyle}
                              getTypeStyle={getTypeStyle}
                              openItemId={openItemId}
                              setOpenItemId={setOpenItemId}
                              wrapperRef={wrapperRef}
                           />
                        )
                     })}
                  </div>
               ) : (
                  <div className="text-center py-12">
                     <div className="mx-auto w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                     </div>
                     <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas disponibles</h3>
                     <p className="text-gray-500 text-sm">Agrega algunas tareas para comenzar a trabajar en este sprint</p>
                  </div>
               )}
            </div>
         </Droppable>

         {/* Modales */}
         <>
            <Modal isOpen={isUpdateSprintOpen} onClose={() => setIsUpdateSprintOpen(false)} title="" customWidth="sm:max-w-2xl" showCloseButton={false}>
               <CreateSprintForm
                  onSubmit={handleUpdateSprint}
                  onCancel={() => setIsUpdateSprintOpen(false)}
                  currentSprint={sprintSelected as SprintProps}
                  isEdit={true}
               />
            </Modal>

            <Modal isOpen={isTaskDetailsModalOpen} customWidth="sm:max-w-6xl" onClose={() => setIsTaskDetailsModalOpen(false)} title="" showCloseButton={false}>
               <TaskDetailsForm
                  task={taskActive as TaskProps}
                  onSubmit={() => setIsTaskDetailsModalOpen(false)}
                  onCancel={() => setIsTaskDetailsModalOpen(false)}
               />
            </Modal>

            <Modal isOpen={isTaskUpdateModalOpen} customWidth="sm:max-w-4xl" onClose={() => setIsTaskUpdateModalOpen(false)} title={``} showCloseButton={false}>
               <CreateTaskForm
                  onSubmit={handleUpdate}
                  onCancel={() => setIsTaskUpdateModalOpen(false)}
                  taskObject={taskActive as TaskProps}
                  isEdit={true}
               />
            </Modal>

            <Modal isOpen={isReasignModalOpen} onClose={() => setIsReasignModalOpen(false)} title="" customWidth='max-w-xl' showCloseButton={false}>
               <ReasignIssue
                  onSubmit={handleReasign}
                  onCancel={() => setIsReasignModalOpen(false)}
                  taskObject={taskActive as TaskProps}
               />
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="">
               <DeleteIssueForm
                  onSubmit={handleDelete}
                  onCancel={() => setIsDeleteModalOpen(false)}
                  taskObject={taskActive as TaskProps}
               />
            </Modal>

            <Modal isOpen={isDeleteSprintOpen} onClose={() => setIsDeleteSprintOpen(false)} title="">
               <DeleteSprintForm
                  onSubmit={handleDeleteSprint}
                  onCancel={() => setIsDeleteSprintOpen(false)}
                  sprintObject={sprintSelected as SprintProps}
               />
            </Modal>

            <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title="" customWidth="max-w-4xl" showCloseButton={false}>
               <AuditHistory
                  issueId={taskActive?.id}
                  title={`Historial de cambios: ${taskActive?.title}`}
                  currentIssue={taskActive}
                  onCancel={() => setIsHistoryModalOpen(false)}
               />
            </Modal>
         </>
      </>
   )
}
