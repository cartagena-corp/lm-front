import { useMultiDragContext } from '@/components/ui/dnd-kit/MultiDragContext'
import { Dispatch, SetStateAction, useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useBoardStore } from '@/lib/store/BoardStore'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Droppable } from '@/components/ui/dnd-kit/Droppable'
import { SprintProps, TaskProps, UserProps } from '@/lib/types/types'
import { useConfigStore } from '@/lib/store/ConfigStore'
import DeleteIssueForm from '../issues/DeleteIssueForm'
import TaskDetailsForm from '../issues/TaskDetailsForm'
import { useIssueStore } from '@/lib/store/IssueStore'
import CreateTaskForm from '../issues/CreateTaskForm'
import { useAuthStore } from '@/lib/store/AuthStore'
import ReasignIssue from '../issues/ReasignIssue'
import { CalendarIcon, CheckmarkIcon, EditIcon, DeleteIcon, PlusIcon, EyeIcon, ClockIcon, ForbiddenIcon, IAIcon, ChatIAIcon, ImportIcon, FilterIcon, XIcon } from '@/assets/Icon'
import Modal from '../../layout/Modal'
import Image from 'next/image'
import CreateSprintForm from './CreateSprintForm'
import { useSprintStore } from '@/lib/store/SprintStore'
import DeleteSprintForm from './DeleteSprintForm'
import IssueConfig from '../config/issues/IssueConfig'
import AuditHistory from '../audit/AuditHistory'
import { getUserAvatar } from '@/lib/utils/avatar.utils'
import ImportIssuesModal from '../issues/ImportIssuesModal'
import CreateWithIA from '../issues/CreateWithIA'
import DeleteAllForm from '../issues/DeleteAllForm'

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


   const formatDate = (dateStr: string) => {
      if (!dateStr) return ''

      let date
      const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10))
      date = new Date(year, month - 1, day)

      return date.toLocaleDateString('es-ES', {
         day: '2-digit',
         month: 'short',
         year: 'numeric'
      })
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
            {
               (task.descriptions.length > 0) ?
                  <p className="text-xs text-gray-500 line-clamp-1" title={task.descriptions[0].text}>
                     {task.descriptions[0].text}
                  </p>
                  :
                  <p className="text-xs text-gray-500 line-clamp-1">
                     {
                        ((task.startDate || task.endDate) && !task.realDate) ?
                           <>
                              {task.startDate ? formatDate(task.startDate as string) : "Sin fecha inicio"}
                              &nbsp;-&nbsp;
                              {task.endDate ? formatDate(task.endDate as string) : "Sin fecha fin"}
                           </> : (task.realDate) ? <>
                              Tarea finalizada el {formatDate(task.realDate as string)}
                           </> : "Fechas NO definidas"
                     }
                  </p>
            }

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
                     <span className="text-xs text-gray-500">N/A</span>
                  )}

               </div>
               <span className="text-xs text-gray-700 line-clamp-1">
                  {typeof task.assignedId === 'object' && task.assignedId
                     ? (
                        task.assignedId.firstName || task.assignedId.lastName
                           ? `${task.assignedId.firstName ?? ''} ${task.assignedId.lastName ?? ''}`.trim()
                           : (task.assignedId.email || 'Sin asignar')
                     )
                     : 'Sin asignar'
                  }
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

export default function IssuesRow({ spr, setIsOpen, setIsCreateWithIAOpen, isOverlay = false }: { spr: SprintProps, setIsOpen: Dispatch<SetStateAction<boolean>>, setIsCreateWithIAOpen: Dispatch<SetStateAction<boolean>>, isOverlay?: boolean }) {
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

   const { getValidAccessToken, user } = useAuthStore()
   const { deleteAllIssues, deleteIssue, updateIssue, assignIssue, createIssue } = useIssueStore()
   const { updateSprint, deleteSprint, activeSprint, getIssuesBySprint, loadMoreIssuesBySprint, clearIssuesFromSprint } = useSprintStore()

   const wrapperRef = useRef<HTMLDivElement>(null)
   const wrapperSprintRef = useRef<HTMLDivElement>(null)
   const scrollContainerRef = useRef<HTMLDivElement>(null)

   const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false)
   const [isTaskUpdateModalOpen, setIsTaskUpdateModalOpen] = useState(false)
   const [isSprintOptionsOpen, setisSprintOptionsOpen] = useState(false)
   const [isReasignModalOpen, setIsReasignModalOpen] = useState(false)
   const [isUpdateSprintOpen, setIsUpdateSprintOpen] = useState(false)
   const [isDeleteSprintOpen, setIsDeleteSprintOpen] = useState(false)
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
   const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false)
   const [isImportModalOpen, setIsImportModalOpen] = useState(false)
   const [isCreateWithIAInSprintOpen, setIsCreateWithIAInSprintOpen] = useState(false)
   const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
   const [isCreateTaskInSprintOpen, setIsCreateTaskInSprintOpen] = useState(false)
   const [sprintSelected, setSprintSelected] = useState<SprintProps>()
   const [openItemId, setOpenItemId] = useState<string | null>(null)
   const [taskActive, setTaskActive] = useState<TaskProps>()
   const [isLoadingMore, setIsLoadingMore] = useState(false)
   const [hasMore, setHasMore] = useState(true)
   const [isFiltering, setIsFiltering] = useState(false)
   const { projectConfig, sprintStatuses } = useConfigStore()

   const sprintTaskIds = spr.tasks?.content.map(t => t.id as string) || []
   const allSelected = sprintTaskIds.length > 0 && sprintTaskIds.every(id => selectedIds.includes(id))

   // Función para cargar más tareas del sprint actual
   const handleLoadMore = useCallback(async () => {
      if (isLoadingMore || !hasMore || !spr.tasks) return

      const currentPage = spr.tasks.number || 0
      const totalPages = spr.tasks.totalPages || 0

      // Si ya estamos en la última página, no cargar más
      if (currentPage >= totalPages - 1) {
         setHasMore(false)
         return
      }

      setIsLoadingMore(true)

      try {
         const token = await getValidAccessToken()
         if (!token) return

         // Usar el ID del sprint actual (puede ser 'null' para backlog)
         const sprintId = spr.id as string
         const projectId = spr.projectId as string


         await loadMoreIssuesBySprint(token, sprintId, projectId, currentPage + 1, filterRef.current)

         // Verificar si hay más páginas después de cargar
         const updatedSprint = useSprintStore.getState().sprints.find(s => {
            // Para el backlog, buscar el sprint con id 'null'
            if (sprintId === 'null') {
               return s.id === 'null'
            }
            return s.id === sprintId
         })

         if (updatedSprint?.tasks) {
            const newCurrentPage = updatedSprint.tasks.number || 0
            const newTotalPages = updatedSprint.tasks.totalPages || 0
            setHasMore(newCurrentPage < newTotalPages - 1)
         }
      } catch (error) {
         console.error('Error al cargar más tareas:', error)
      } finally {
         setIsLoadingMore(false)
      }
   }, [isLoadingMore, hasMore, spr, getValidAccessToken, loadMoreIssuesBySprint])

   // Función para manejar el scroll
   const handleScroll = useCallback(() => {
      const container = scrollContainerRef.current
      if (!container || isLoadingMore || !hasMore) return

      const { scrollTop, scrollHeight, clientHeight } = container
      const scrolledPercentage = (scrollTop + clientHeight) / scrollHeight

      // Cargar más cuando se llegue al 80% del scroll
      if (scrolledPercentage >= 0.8) {
         handleLoadMore()
      }
   }, [isLoadingMore, hasMore, handleLoadMore])

   // Agregar event listener para el scroll con throttling
   useEffect(() => {
      const container = scrollContainerRef.current
      if (!container) return

      let timeoutId: NodeJS.Timeout
      const throttledScroll = () => {
         clearTimeout(timeoutId)
         timeoutId = setTimeout(handleScroll, 150)
      }

      container.addEventListener('scroll', throttledScroll)

      return () => {
         container.removeEventListener('scroll', throttledScroll)
         clearTimeout(timeoutId)
      }
   }, [handleScroll])

   // Resetear estados cuando cambia el sprint
   useEffect(() => {
      if (spr.tasks && spr.tasks.content.length > 0) {
         const currentPage = spr.tasks.number || 0
         const totalPages = spr.tasks.totalPages || 0
         setHasMore(currentPage < totalPages - 1)
      }
   }, [spr.tasks])

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

   const handleDeleteAll = async () => {
      const token = await getValidAccessToken()
      if (token) await deleteAllIssues(token, selectedIds, spr.projectId as string)
      setIsDeleteAllModalOpen(false)
      setSelectedIds([])
   }

   // Función específica para crear tareas dentro del sprint
   const handleCreateTaskInSprint = async (newTask: any) => {
      const token = await getValidAccessToken()
      if (token) {
         // Agregar el sprintId a la tarea antes de crearla
         const taskWithSprint = {
            ...newTask,
            sprintId: spr.id // Asignar la tarea al sprint actual
         }
         await createIssue(token, taskWithSprint)
      }
      setIsCreateTaskInSprintOpen(false)
   }

   // Función específica para crear tareas con IA dentro del sprint
   const handleCreateWithIAInSprint = async (detectedTasks: any[]) => {
      const token = await getValidAccessToken()
      if (token) {
         // Agregar el sprintId a todas las tareas detectadas antes de crearlas
         const tasksWithSprint = detectedTasks.map(task => ({
            ...task,
            sprintId: spr.id // Asignar todas las tareas al sprint actual
         }))

         // Crear las tareas con IA usando la funcionalidad existente
         const { createIssuesFromIA } = useIssueStore.getState()
         for (const taskData of tasksWithSprint) {
            await createIssuesFromIA(token, taskData)
         }
      }
      setIsCreateWithIAInSprintOpen(false)
   }

   // --- Asignado a (multi-select) ---
   const { projectParticipants } = useConfigStore()
   const { selectedBoard } = useBoardStore()
   const { listUsers } = useAuthStore()

   // Combine project participants with the project creator (avoid duplicates)
   const allProjectUsers = useMemo(() => {
      const participants = [...(projectParticipants || [])]
      if (selectedBoard?.createdBy && !participants.some(p => p.id === selectedBoard.createdBy?.id)) {
         const creatorFromUserList = listUsers?.find(user => user.id === selectedBoard.createdBy?.id)
         participants.push({
            id: selectedBoard.createdBy.id,
            firstName: selectedBoard.createdBy.firstName,
            lastName: selectedBoard.createdBy.lastName,
            email: creatorFromUserList?.email || '',
            picture: selectedBoard.createdBy.picture
         })
      }
      return participants
   }, [projectParticipants, selectedBoard?.createdBy, listUsers])

   // Multi-select state (filtro por sprint)
   const { filters, setFilter } = useSprintStore() // filters: { [sprintId]: { key, value } }
   const sprintId = spr.id as string
   const filter = filters?.[sprintId] || { key: '', value: '' }

   const [userSelected, setUserSelected] = useState<any[]>([])
   const [isUserOpen, setIsUserOpen] = useState(false)
   const userRef = useRef<HTMLDivElement>(null)

   interface FilterOption {
      color: string
      name: string
      id: number
   }

   const [typeSelected, setTypeSelected] = useState<FilterOption | null>(null)
   const [isTypeOpen, setIsTypeOpen] = useState(false)
   const typeRef = useRef<HTMLDivElement>(null)

   const [statusSelected, setStatusSelected] = useState<FilterOption | null>(null)
   const [isStatusOpen, setIsStatusOpen] = useState(false)
   const statusRef = useRef<HTMLDivElement>(null)

   const [prioritySelected, setPrioritySelected] = useState<FilterOption | null>(null)
   const [isPriorityOpen, setIsPriorityOpen] = useState(false)
   const priorityRef = useRef<HTMLDivElement>(null)

   const filterRef = useRef(filter)

   // Sincronizar userSelected con el filtro del sprint al montar/cambiar filtro
   useEffect(() => {
      if (filter && filter.key === 'assignedIds') {
         if (filter.value === '') setUserSelected([])
         else {
            // Buscar los usuarios seleccionados a partir de los IDs en el filtro
            const ids = filter.value.split(',').filter(Boolean)
            const selectedUsers = allProjectUsers.filter(u => ids.includes(u.id))
            setUserSelected(selectedUsers)
         }
      }
   }, [filter, allProjectUsers])

   useEffect(() => {
      filterRef.current = filter
      const getNewIssues = async () => {
         setIsFiltering(true)
         await clearIssuesFromSprint(sprintId)
         const token = await getValidAccessToken()
         let newTasks
         const filters = {
            type: typeSelected?.id ?? null,
            status: statusSelected?.id ?? null,
            priority: prioritySelected?.id ?? null,
            assignedIds: userSelected.map(u => u.id).join(','),
         }
         newTasks = await getIssuesBySprint(token, sprintId, spr.projectId as string, filters, 10)

         if (newTasks) {
            useSprintStore.setState(state => {
               const sprintIndex = state.sprints.findIndex(s => s.id === sprintId)
               if (sprintIndex === -1) return state
               const updatedSprint = {
                  ...state.sprints[sprintIndex],
                  tasks: {
                     ...newTasks,
                     content: Array.isArray(newTasks.content) ? (newTasks.content as TaskProps[]).filter(t => t && t.id) : []
                  }
               }
               const updatedSprints = [...state.sprints]
               updatedSprints[sprintIndex] = updatedSprint
               return { sprints: updatedSprints }
            })
         }
         setIsFiltering(false)
      }
      getNewIssues()
   }, [userSelected, typeSelected, statusSelected, prioritySelected])

   // Effect to close dropdown on outside click
   useEffect(() => {
      const handleClickOutside: (event: MouseEvent) => void = (event: MouseEvent) => {
         if (userRef.current && !(userRef.current as HTMLElement).contains(event.target as Node)) setIsUserOpen(false)
         if (typeRef.current && !(typeRef.current as HTMLElement).contains(event.target as Node)) setIsTypeOpen(false)
         if (statusRef.current && !(statusRef.current as HTMLElement).contains(event.target as Node)) setIsStatusOpen(false)
         if (priorityRef.current && !(priorityRef.current as HTMLElement).contains(event.target as Node)) setIsPriorityOpen(false)
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
         document.removeEventListener('mousedown', handleClickOutside)
      }
   }, [])

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
                           <button
                              onClick={() => setIsImportModalOpen(true)}
                              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Importar tareas en este sprint"
                           >
                              <ImportIcon size={16} stroke={2} />
                              <span>Importar Tareas</span>
                           </button>
                           {
                              // Solo mostrar si el usuario tiene el permiso GEMINI_ACTIVE
                              (typeof user?.role === 'object' && user?.role?.permissions?.some(p => (p.name === "GEMINI_ACTIVE" || p.name === "GEMINI_CONFIG"))) && (
                                 <button className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => setIsCreateWithIAInSprintOpen(true)}
                                    title="Crear tareas con IA en este sprint"
                                 >
                                    <ChatIAIcon size={18} stroke={2} />
                                    <span>Crear tareas con IA</span>
                                 </button>
                              )
                           }

                           <button
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                              onClick={() => setIsCreateTaskInSprintOpen(true)}
                              title="Crear nueva tarea en este sprint"
                           >
                              <PlusIcon size={16} stroke={2} />
                              <span>Nueva Tarea</span>
                           </button>
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
                        <>
                           <button
                              onClick={() => setIsImportModalOpen(true)}
                              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Importar tareas"
                           >
                              <ImportIcon size={16} stroke={2} />
                              <span>Importar Tareas</span>
                           </button>
                           {
                              // Solo mostrar si el usuario tiene el permiso GEMINI_ACTIVE
                              (typeof user?.role === 'object' && user?.role?.permissions?.some(p => (p.name === "GEMINI_ACTIVE" || p.name === "GEMINI_CONFIG"))) && (
                                 <button className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => setIsCreateWithIAOpen(true)}
                                    title="Crear tareas con IA"
                                 >
                                    <ChatIAIcon size={18} stroke={2} />
                                    <span>Crear tareas con IA</span>
                                 </button>
                              )
                           }
                           <button
                              onClick={() => setIsOpen(true)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                           >
                              <PlusIcon size={16} stroke={2} />
                              <span>Nueva Tarea</span>
                           </button>
                        </>
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
                        {spr.tasks?.content && spr.tasks.content.length > 0 && (
                           <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-xs font-medium text-blue-800 border border-blue-200">
                              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              <span>
                                 {spr.tasks.totalElements} {spr.tasks.totalElements === 1 ? 'tarea' : 'tareas'}
                              </span>
                           </div>
                        )}
                     </div>

                     {/* Badge de fechas */}
                     {spr.id !== 'null' && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full text-xs font-medium text-purple-800 border border-purple-200">
                           <CalendarIcon size={14} />
                           <span>
                              {spr.startDate ? (() => {
                                 const [year, month, day] = spr.startDate.split('-').map(num => parseInt(num, 10))
                                 const date = new Date(year, month - 1, day)
                                 return date.toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                 })
                              })() : 'No definida'}
                              &nbsp;–&nbsp;
                              {spr.endDate ? (() => {
                                 const [year, month, day] = spr.endDate.split('-').map(num => parseInt(num, 10))
                                 const date = new Date(year, month - 1, day)
                                 return date.toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                 })
                              })() : 'No definida'}
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
                     <div className="grid grid-cols-18 gap-4 p-3 pl-0 bg-gray-50 rounded-lg border border-gray-200 text-xs font-medium text-gray-600">
                        <div className="col-span-1 flex items-center justify-center gap-1">
                           <div className="w-6 h-6 flex items-center justify-center">
                              {
                                 selectedIds.length > 0 &&
                                 <button onClick={() => setIsDeleteAllModalOpen(true)} className='text-red-500 hover:text-red-700 transition-colors cursor-pointer'>
                                    <DeleteIcon size={16} stroke={2} />
                                 </button>
                              }
                           </div>
                           <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={toggleSelectAll}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                           />
                        </div>
                        <div className="col-span-1 flex items-center gap-1 relative w-full" style={{ zIndex: 20 }}>
                           <div className="relative" ref={typeRef}>
                              <button onClick={() => setIsTypeOpen(!isTypeOpen)} className="flex items-center transition-colors rounded-full gap-1 py-0.5 px-2"
                                 style={{ backgroundColor: typeSelected ? typeSelected.color + '25' : 'transparent', color: typeSelected ? typeSelected.color : 'inherit' }}>
                                 {typeSelected ? <span onClick={() => setTypeSelected(null)}><XIcon size={14} stroke={2} /></span> : <FilterIcon size={14} stroke={2} />}
                                 {typeSelected ? typeSelected.name : 'Tipo'}
                              </button>
                              {isTypeOpen &&
                                 <div className="bg-white border-gray-200 absolute top-full -left-full mt-2 w-48 border rounded-lg shadow-xl z-50">
                                    <button key={"none"} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 
                                       ${!typeSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                                       onClick={() => setTypeSelected(null)}>
                                       <span style={{ backgroundColor: "#0000001f" }} className='p-1 rounded-full' />
                                       Todos los tipos
                                    </button>
                                    {
                                       projectConfig?.issueTypes?.map(type =>
                                          <button key={type.id} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 
                                             ${typeSelected?.id === type.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                                             onClick={() => setTypeSelected(type)}>
                                             <span style={{ backgroundColor: type.color }} className='p-1 rounded-full' />
                                             {type.name}
                                          </button>
                                       )
                                    }
                                 </div>
                              }
                           </div>
                        </div>
                        <div className="col-span-5 flex items-center gap-2 relative w-full" style={{ zIndex: 20 }}>
                           <p className='whitespace-nowrap'>Tarea</p>
                        </div>
                        <div className="col-span-2 flex items-center gap-2 relative w-full" style={{ zIndex: 20 }}>
                           <div className="relative" ref={statusRef}>
                              <button onClick={() => setIsStatusOpen(!isTypeOpen)} className="flex items-center transition-colors rounded-full gap-1 py-0.5 px-2"
                                 style={{ backgroundColor: statusSelected ? statusSelected.color + '25' : 'transparent', color: statusSelected ? statusSelected.color : 'inherit' }}>
                                 {statusSelected ? <span onClick={() => setStatusSelected(null)}><XIcon size={14} stroke={2} /></span> : <FilterIcon size={14} stroke={2} />}
                                 {statusSelected ? statusSelected.name : 'Estado'}
                              </button>
                              {isStatusOpen &&
                                 <div className="bg-white border-gray-200 absolute top-full -left-full mt-2 w-48 border rounded-lg shadow-xl z-50">
                                    <button key={"none"} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 
                                       ${!statusSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                                       onClick={() => setStatusSelected(null)}>
                                       <span style={{ backgroundColor: "#0000001f" }} className='p-1 rounded-full' />
                                       Todos los estados
                                    </button>
                                    {
                                       projectConfig?.issueStatuses?.map(status =>
                                          <button key={status.id} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 
                                             ${statusSelected?.id === status.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                                             onClick={() => setStatusSelected(status)}>
                                             <span style={{ backgroundColor: status.color }} className='p-1 rounded-full' />
                                             {status.name}
                                          </button>
                                       )
                                    }
                                 </div>
                              }
                           </div>
                        </div>
                        <div className="col-span-2 flex items-center gap-2 relative w-full" style={{ zIndex: 20 }}>
                           <div className="relative" ref={priorityRef}>
                              <button onClick={() => setIsPriorityOpen(!isPriorityOpen)} className="flex items-center transition-colors rounded-full gap-1 py-0.5 px-2"
                                 style={{ backgroundColor: prioritySelected ? prioritySelected.color + '25' : 'transparent', color: prioritySelected ? prioritySelected.color : 'inherit' }}>
                                 {prioritySelected ? <span onClick={() => setPrioritySelected(null)}><XIcon size={14} stroke={2} /></span> : <FilterIcon size={14} stroke={2} />}
                                 {prioritySelected ? prioritySelected.name : 'Prioridad'}
                              </button>
                              {isPriorityOpen &&
                                 <div className="bg-white border-gray-200 absolute top-full -left-full mt-2 w-48 border rounded-lg shadow-xl z-50">
                                    <button key={"none"} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 
                                       ${!prioritySelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                                       onClick={() => setPrioritySelected(null)}>
                                       <span style={{ backgroundColor: "#0000001f" }} className='p-1 rounded-full' />
                                       Todas las prioridades
                                    </button>
                                    {
                                       projectConfig?.issuePriorities?.map(prio =>
                                          <button key={prio.id} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 
                                             ${prioritySelected?.id === prio.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                                             onClick={() => setPrioritySelected(prio)}>
                                             <span style={{ backgroundColor: prio.color }} className='p-1 rounded-full' />
                                             {prio.name}
                                          </button>
                                       )
                                    }
                                 </div>
                              }
                           </div>
                        </div>
                        <div className="col-span-5 flex items-center gap-2 relative w-full" style={{ zIndex: 20 }}>
                           <p className='whitespace-nowrap'>Asignado a</p>
                           <div className="w-full" ref={userRef}>
                              <button
                                 type="button"
                                 className="bg-black/5 hover:bg-black/10 transition-colors rounded-full pr-2 flex items-center gap-2 w-full group"
                                 onClick={() => setIsUserOpen(!isUserOpen)}
                              >
                                 {/* Avatar/Count */}
                                 <div
                                    className={`w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden relative group ${userSelected.length > 0 ? 'cursor-pointer' : ''}`}
                                    onMouseEnter={e => {
                                       if (userSelected.length > 0) e.currentTarget.classList.add('hovering-x')
                                    }}
                                    onMouseLeave={e => {
                                       e.currentTarget.classList.remove('hovering-x')
                                    }}
                                 >
                                    {userSelected.length > 0 && (
                                       <div
                                          className="absolute inset-0 flex items-center justify-center bg-black/60 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-150 z-10"
                                          style={{ fontSize: 14 }}
                                          title="Limpiar selección"
                                          onClick={e => {
                                             e.stopPropagation();
                                             setUserSelected([])
                                             setFilter(sprintId, { key: 'assignedIds', value: '' })
                                          }}
                                       >
                                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                       </div>
                                    )}
                                    <span className={`${userSelected.length > 0 ? 'opacity-100 group-hover:opacity-0 transition-opacity' : ''} flex items-center justify-center w-full h-full`}>
                                       {userSelected.length === 1 ? (
                                          userSelected[0].picture ? (
                                             <img
                                                src={getUserAvatar(userSelected[0], 28)}
                                                alt="avatar"
                                                className="w-full h-full object-cover rounded-full"
                                             />
                                          ) : (
                                             <span className="text-xs font-medium text-gray-600">
                                                {userSelected[0].firstName || userSelected[0].lastName ?
                                                   ((userSelected[0].firstName?.[0] || '') + (userSelected[0].lastName?.[0] || '')).toUpperCase()
                                                   : (userSelected[0].email[0].toUpperCase() || 'Sin asignar')}
                                             </span>
                                          )
                                       ) : userSelected.length > 1 ? (
                                          <span className="text-xs font-semibold text-gray-700">{userSelected.length}</span>
                                       ) : (
                                          <span className="text-xs font-medium text-gray-500">?</span>
                                       )}
                                    </span>
                                 </div>
                                 {/* Name/Count */}
                                 <span
                                    className="text-xs font-medium text-gray-900 truncate block mr-auto"
                                    title={userSelected.length === 1
                                       ? (userSelected[0].firstName || userSelected[0].lastName
                                          ? `${userSelected[0].firstName ?? ''} ${userSelected[0].lastName ?? ''}`.trim()
                                          : (userSelected[0].email || 'Sin asignar'))
                                       : userSelected.length > 1
                                          ? `${userSelected.length} seleccionados`
                                          : 'Todos'}
                                 >
                                    {userSelected.length === 1 ? (
                                       userSelected[0].firstName || userSelected[0].lastName ?
                                          `${`${userSelected[0].firstName ?? ''} ${userSelected[0].lastName ?? ''}`.trim()}`.slice(0, 20) +
                                          (`${userSelected[0].firstName ?? ''} ${userSelected[0].lastName ?? ''}`.trim().length > 20 ? '…' : '')
                                          : (userSelected[0].email?.slice(0, 20) || 'Sin asignar') + (userSelected[0].email && userSelected[0].email.length > 20 ? '…' : '')
                                    ) : userSelected.length > 1 ? (
                                       `${userSelected.length} seleccionados`
                                    ) : (
                                       'Todos'
                                    )}
                                 </span>
                                 <svg className={`text-gray-400 w-4 h-4 transition-transform duration-200 ${isUserOpen ? "rotate-180" : ""}`}
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                 </svg>
                              </button>

                              {isUserOpen && (
                                 <div className="absolute z-[9999] top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto overscroll-none min-w-md">
                                    <button
                                       type="button"
                                       onClick={() => {
                                          setUserSelected([])
                                          setFilter(sprintId, { key: 'assignedIds', value: '' })
                                          setIsUserOpen(false)
                                       }}
                                       className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg ${userSelected.length === 0 ? 'bg-blue-50' : ''}`}
                                    >
                                       <div className="flex items-center gap-3">
                                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                             <span className="text-xs font-medium text-gray-500">?</span>
                                          </div>
                                          <span className="text-sm font-medium text-gray-900">Todos</span>
                                       </div>
                                    </button>
                                    {allProjectUsers.map((obj, i) => {
                                       const isSelected = userSelected.some(u => u.id === obj.id)
                                       return (
                                          <button
                                             key={i}
                                             type="button"
                                             onClick={e => {
                                                e.stopPropagation()
                                                let newSelected;
                                                if (isSelected) {
                                                   newSelected = userSelected.filter(u => u.id !== obj.id)
                                                } else {
                                                   newSelected = [...userSelected, obj]
                                                }
                                                setUserSelected(newSelected)
                                                setFilter(sprintId, { key: 'assignedIds', value: newSelected.length > 0 ? newSelected.map(u => u.id).join(',') : '' })
                                             }}
                                             className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                                          >
                                             <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-transparent'}`} />
                                                <div className='w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden'>
                                                   {obj.picture ? (
                                                      <img
                                                         src={getUserAvatar(obj, 28)}
                                                         alt={obj.id}
                                                         className="w-full h-full object-cover rounded-full"
                                                      />
                                                   ) : (
                                                      <span className="text-sm font-medium text-gray-600">
                                                         {obj.firstName || obj.lastName ?
                                                            ((obj.firstName?.[0] || '') + (obj.lastName?.[0] || '')).toUpperCase()
                                                            : (obj.email?.[0] || '?').toUpperCase()}
                                                      </span>
                                                   )}
                                                </div>
                                                <div className="flex-1">
                                                   <span className='text-sm font-medium text-gray-900 block'>
                                                      {obj.firstName || obj.lastName ? `${obj.firstName ?? ''} ${obj.lastName ?? ''}`.trim() : (obj.email || 'Sin email')}
                                                   </span>
                                                   <span className="text-xs text-gray-500">
                                                      {obj.email || 'Sin email'}
                                                   </span>
                                                </div>
                                                {isSelected && (
                                                   <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                   </svg>
                                                )}
                                             </div>
                                          </button>
                                       )
                                    })}
                                 </div>
                              )}
                           </div>
                        </div>
                        <div className="col-span-1 flex items-center">Acciones</div>
                     </div>
                     <div className='space-y-2 max-h-[440px] overflow-y-auto overscroll-contain' ref={scrollContainerRef}>
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

                        {/* Indicador de carga para páginas adicionales */}
                        {isLoadingMore && (
                           <div className="py-4">
                              <div className="flex items-center justify-center gap-3 text-blue-600">
                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                 <span className="text-sm">Cargando más tareas...</span>
                              </div>
                           </div>
                        )}

                        {/* Mensaje cuando no hay más elementos */}
                        {!hasMore && spr.tasks.content.length > 0 && (
                           <div className="text-center py-4 text-gray-500 text-sm mt-4">
                              <div className="flex items-center justify-center gap-2">
                                 <div className="w-2 h-2 bg-gray-300 rounded-full" />
                                 <span>No hay más tareas para mostrar</span>
                                 <div className="w-2 h-2 bg-gray-300 rounded-full" />
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               ) : (
                  isFiltering ? (
                     <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4 animate-spin-slow">
                           <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                           </svg>
                        </div>
                        <h3 className="text-lg font-medium text-blue-700 mb-2">Aplicando Filtros…</h3>
                        <p className="text-blue-500 text-sm">Por favor espera mientras se filtran las tareas</p>
                     </div>
                  ) : (
                     (filter && filter.key === 'assignedIds' && filter.value && userSelected.length > 0) ? (
                        <div className="text-center py-12 flex flex-col items-center justify-center">
                           <div className="flex items-center justify-center gap-2 mb-4">
                              {userSelected.length === 1 ? (
                                 <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                    {userSelected[0].picture ? (
                                       <img
                                          src={getUserAvatar(userSelected[0], 64)}
                                          alt={userSelected[0].id}
                                          className="w-full h-full object-cover rounded-full"
                                       />
                                    ) : (
                                       <span className="text-3xl font-medium text-gray-600">
                                          {userSelected[0].firstName || userSelected[0].lastName ?
                                             ((userSelected[0].firstName?.[0] || '') + (userSelected[0].lastName?.[0] || '')).toUpperCase()
                                             : (userSelected[0].email?.[0] || '?').toUpperCase()}
                                       </span>
                                    )}
                                 </div>
                              ) : (
                                 userSelected.slice(0, 3).map((user, idx) => (
                                    <div key={user.id} className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white -ml-2 first:ml-0">
                                       {user.picture ? (
                                          <img
                                             src={getUserAvatar(user, 48)}
                                             alt={user.id}
                                             className="w-full h-full object-cover rounded-full"
                                          />
                                       ) : (
                                          <span className="text-xl font-medium text-gray-600">
                                             {user.firstName || user.lastName ?
                                                ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase()
                                                : (user.email?.[0] || '?').toUpperCase()}
                                          </span>
                                       )}
                                    </div>
                                 ))
                              )}
                              {userSelected.length > 3 && (
                                 <span className="ml-2 text-gray-500 text-lg font-semibold">+{userSelected.length - 3}</span>
                              )}
                           </div>
                           <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {userSelected.length === 1
                                 ? `No hay tareas asignadas a ${userSelected[0].firstName || userSelected[0].lastName ? `${userSelected[0].firstName ?? ''} ${userSelected[0].lastName ?? ''}`.trim() : (userSelected[0].email || 'Sin asignar')}`
                                 : `No hay tareas asignadas a los usuarios seleccionados`}
                           </h3>
                           <p className="text-gray-500 text-sm">Selecciona otro usuario o elimina el filtro para ver más tareas</p>
                           {/* Mostrar el filtro aquí cuando no hay resultados */}
                           <div className="mt-6 flex justify-center items-center">
                              <div className="flex items-center gap-2 max-w-xs">
                                 {/* Copia el botón y dropdown del filtro aquí */}
                                 <div className="relative w-full" ref={userRef}>
                                    <button
                                       type="button"
                                       className="bg-black/5 hover:bg-black/10 rounded-full pr-2 flex items-center gap-2 w-full group"
                                       onClick={() => setIsUserOpen(!isUserOpen)}
                                    >
                                       <div
                                          className={`w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden relative group ${userSelected.length > 0 ? 'cursor-pointer' : ''}`}
                                       >
                                          {userSelected.length > 0 && (
                                             <div
                                                className="absolute inset-0 flex items-center justify-center bg-black/60 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-150 z-10"
                                                style={{ fontSize: 14 }}
                                                title="Limpiar selección"
                                                onClick={e => {
                                                   e.stopPropagation();
                                                   setUserSelected([])
                                                   setFilter(sprintId, { key: 'assignedIds', value: '' })
                                                }}
                                             >
                                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                             </div>
                                          )}
                                          <span className={`${userSelected.length > 0 ? 'opacity-100 group-hover:opacity-0 transition-opacity' : ''} flex items-center justify-center w-full h-full`}>
                                             {userSelected.length === 1 ? (
                                                userSelected[0].picture ? (
                                                   <img
                                                      src={getUserAvatar(userSelected[0], 28)}
                                                      alt="avatar"
                                                      className="w-full h-full object-cover rounded-full"
                                                   />
                                                ) : (
                                                   <span className="text-xs font-medium text-gray-600">
                                                      {userSelected[0].firstName || userSelected[0].lastName ?
                                                         ((userSelected[0].firstName?.[0] || '') + (userSelected[0].lastName?.[0] || '')).toUpperCase()
                                                         : (userSelected[0].email?.[0] || '?').toUpperCase()}
                                                   </span>
                                                )
                                             ) : userSelected.length > 1 ? (
                                                <span className="text-xs font-semibold text-gray-700">{userSelected.length}</span>
                                             ) : (
                                                <span className="text-xs font-medium text-gray-500">?</span>
                                             )}
                                          </span>
                                       </div>
                                       <span
                                          className="text-xs font-medium text-gray-900 truncate block mr-auto"
                                          title={userSelected.length === 1
                                             ? (userSelected[0].firstName || userSelected[0].lastName
                                                ? `${userSelected[0].firstName ?? ''} ${userSelected[0].lastName ?? ''}`.trim()
                                                : (userSelected[0].email || 'Sin asignar'))
                                             : userSelected.length > 1
                                                ? `${userSelected.length} seleccionados`
                                                : 'Todos'}
                                       >
                                          {userSelected.length === 1 ? (
                                             userSelected[0].firstName || userSelected[0].lastName ?
                                                `${`${userSelected[0].firstName ?? ''} ${userSelected[0].lastName ?? ''}`.trim()}`.slice(0, 20) +
                                                (`${userSelected[0].firstName ?? ''} ${userSelected[0].lastName ?? ''}`.trim().length > 20 ? '…' : '')
                                                : (userSelected[0].email?.slice(0, 20) || 'Sin asignar') + (userSelected[0].email && userSelected[0].email.length > 20 ? '…' : '')
                                          ) : userSelected.length > 1 ? (
                                             `${userSelected.length} seleccionados`
                                          ) : (
                                             'Todos'
                                          )}
                                       </span>
                                       <svg className={`text-gray-400 w-4 h-4 transition-transform duration-200 ${isUserOpen ? "rotate-180" : ""}`}
                                          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                       </svg>
                                    </button>
                                    {isUserOpen && (
                                       <div className="absolute z-[9999] top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto overscroll-none min-w-md">
                                          <button
                                             type="button"
                                             onClick={() => {
                                                setUserSelected([])
                                                setFilter(sprintId, { key: 'assignedIds', value: '' })
                                                setIsUserOpen(false)
                                             }}
                                             className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg ${userSelected.length === 0 ? 'bg-blue-50' : ''}`}
                                          >
                                             <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                   <span className="text-xs font-medium text-gray-500">?</span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">Todos</span>
                                             </div>
                                          </button>
                                          {allProjectUsers.map((obj, i) => {
                                             const isSelected = userSelected.some(u => u.id === obj.id)
                                             return (
                                                <button
                                                   key={i}
                                                   type="button"
                                                   onClick={e => {
                                                      e.stopPropagation()
                                                      let newSelected;
                                                      if (isSelected) {
                                                         newSelected = userSelected.filter(u => u.id !== obj.id)
                                                      } else {
                                                         newSelected = [...userSelected, obj]
                                                      }
                                                      setUserSelected(newSelected)
                                                      setFilter(sprintId, { key: 'assignedIds', value: newSelected.length > 0 ? newSelected.map(u => u.id).join(',') : '' })
                                                   }}
                                                   className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                                                >
                                                   <div className="flex items-center gap-3">
                                                      <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-transparent'}`} />
                                                      <div className='w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden'>
                                                         {obj.picture ? (
                                                            <img
                                                               src={getUserAvatar(obj, 28)}
                                                               alt={obj.id}
                                                               className="w-full h-full object-cover rounded-full"
                                                            />
                                                         ) : (
                                                            <span className="text-sm font-medium text-gray-600">
                                                               {obj.firstName || obj.lastName ?
                                                                  ((obj.firstName?.[0] || '') + (obj.lastName?.[0] || '')).toUpperCase()
                                                                  : (obj.email?.[0] || '?').toUpperCase()}
                                                            </span>
                                                         )}
                                                      </div>
                                                      <div className="flex-1">
                                                         <span className='text-sm font-medium text-gray-900 block'>
                                                            {obj.firstName || obj.lastName ? `${obj.firstName ?? ''} ${obj.lastName ?? ''}`.trim() : (obj.email || 'Sin email')}
                                                         </span>
                                                         <span className="text-xs text-gray-500">
                                                            {obj.email || 'Sin email'}
                                                         </span>
                                                      </div>
                                                      {isSelected && (
                                                         <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                         </svg>
                                                      )}
                                                   </div>
                                                </button>
                                             )
                                          })}
                                       </div>
                                    )}
                                 </div>
                                 {
                                    (userSelected.length !== 0 || typeSelected || statusSelected || prioritySelected) &&
                                    <div className="flex justify-center w-full gap-2">
                                       o
                                       <button className="flex items-center gap-2 py-0.5 px-2 text-red-700 rounded-full hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                          onClick={() => {
                                             setUserSelected([])
                                             setTypeSelected(null)
                                             setStatusSelected(null)
                                             setPrioritySelected(null)
                                             setFilter(sprintId, { key: '', value: '' })
                                          }}
                                       >
                                          <DeleteIcon size={16} />
                                          Borrar Filtros
                                       </button>
                                    </div>
                                 }
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="text-center py-12 w-full">
                           <div className="mx-auto w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                           </div>
                           <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas disponibles</h3>
                           <p className="text-gray-500 text-sm">Agrega algunas tareas para comenzar a trabajar en este sprint</p>
                           {
                              (userSelected.length !== 0 || typeSelected || statusSelected || prioritySelected) &&
                              <div className="flex justify-center mt-6">
                                 <button className="flex items-center gap-2 px-4 py-2 text-red-700 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => {
                                       setUserSelected([])
                                       setTypeSelected(null)
                                       setStatusSelected(null)
                                       setPrioritySelected(null)
                                       setFilter(sprintId, { key: '', value: '' })
                                    }}
                                 >
                                    <DeleteIcon size={18} />
                                    Borrar Filtros
                                 </button>
                              </div>
                           }
                        </div>
                     )
                  )
               )}
            </div>
         </Droppable >

         {/* Modales */}
         <>
            <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="" customWidth="sm:max-w-6xl" showCloseButton={false}>
               <ImportIssuesModal
                  onCancel={() => setIsImportModalOpen(false)}
                  sprintId={spr.id}
               />
            </Modal>
            <Modal isOpen={isUpdateSprintOpen} onClose={() => setIsUpdateSprintOpen(false)} title="" customWidth="sm:max-w-2xl" showCloseButton={false}>
               <CreateSprintForm
                  onSubmit={handleUpdateSprint}
                  onCancel={() => setIsUpdateSprintOpen(false)}
                  currentSprint={sprintSelected as SprintProps}
                  isEdit={true}
               />
            </Modal>

            <Modal isOpen={isTaskDetailsModalOpen} customWidth="w-full m-10! h-full!" closeOnClickOutside={false} onClose={() => setIsTaskDetailsModalOpen(false)} title="" showCloseButton={false}>
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

            <Modal isOpen={isDeleteAllModalOpen} onClose={() => setIsDeleteAllModalOpen(false)} title="">
               <DeleteAllForm
                  onSubmit={handleDeleteAll}
                  onCancel={() => setIsDeleteAllModalOpen(false)}
                  taskArray={selectedIds}
               />
            </Modal>

            {/* Modal específico para crear tareas dentro del sprint actual */}
            <Modal
               isOpen={isCreateTaskInSprintOpen}
               onClose={() => setIsCreateTaskInSprintOpen(false)}
               title=""
               customWidth='max-w-2xl'
               showCloseButton={false}
            >
               <CreateTaskForm
                  onSubmit={handleCreateTaskInSprint}
                  onCancel={() => setIsCreateTaskInSprintOpen(false)}
               />
            </Modal>

            {/* Modal específico para crear tareas con IA dentro del sprint actual */}
            <Modal
               isOpen={isCreateWithIAInSprintOpen}
               onClose={() => setIsCreateWithIAInSprintOpen(false)}
               title=""
               customWidth="sm:max-w-4xl h-[90dvh]"
               showCloseButton={false}
               closeOnClickOutside={false}
            >
               <CreateWithIA
                  onSubmit={handleCreateWithIAInSprint}
                  onCancel={() => setIsCreateWithIAInSprintOpen(false)}
                  sprintId={spr.id}
               />
            </Modal>
         </>
      </>
   )
}
