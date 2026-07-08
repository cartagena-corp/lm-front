import { Dispatch, SetStateAction, useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useBoardStore } from '@/lib/store/BoardStore'
import { SprintProps, TaskProps, UserProps } from '@/lib/types/types'
import { useConfigStore } from '@/lib/store/ConfigStore'
import DeleteIssueForm from '../issues/DeleteIssueForm'
import TaskDetailsForm from '../issues/TaskDetailsForm'
import { useIssueStore } from '@/lib/store/IssueStore'
import CreateTaskForm from '../issues/CreateTaskForm'
import { useAuthStore } from '@/lib/store/AuthStore'
import ReasignIssue from '../issues/ReasignIssue'
import { Calendar, CircleCheck, Pencil, Trash2, Plus, Eye, Clock, Ban, Bot, Upload, BarChart3, MoreVertical, PowerOff, Zap, ListChecks, FileText } from 'lucide-react'
import { useModalStore } from '@/lib/hooks/ModalStore'
import Image from 'next/image'
import CreateSprintForm from './CreateSprintForm'
import { useSprintStore } from '@/lib/store/SprintStore'
import DeleteSprintForm from './DeleteSprintForm'
import AuditHistory from '../audit/AuditHistory'
import { getUserAvatar } from '@/lib/utils/avatar.utils'
import ImportIssuesModal from '../issues/ImportIssuesModal'
import CreateWithIA from '../issues/CreateWithIA'
import DeleteAllForm from '../issues/DeleteAllForm'
import SafeHtml from '@/components/ui/SafeHtml'
import Dashboard from '../audit/Dashboard'
import UserFilterSelect, { FilterUser } from '@/components/ui/UserFilterSelect'
import ColumnFilterSelect, { ColumnFilterOption } from '@/components/ui/ColumnFilterSelect'

// Component DraggableIssueRow
interface DraggableIssueRowProps {
   task: TaskProps
   selectedIds: string[]
   toggleSelect: (id: string) => void
   onDragStart: (e: React.DragEvent, taskId: string) => void
   onViewDetails: () => void
   onEdit: () => void
   onReassign: () => void
   onDelete: () => void
   onHistory: () => void
   onDashboard: () => void
   getStatusStyle: (id: number) => any
   getPriorityStyle: (id: number) => any
   getTypeStyle: (id: number) => any
   openItemId: string | null
   setOpenItemId: (id: string | null) => void
   wrapperRef: React.RefObject<HTMLDivElement>
}

function DraggableIssueRow({ task, selectedIds, toggleSelect, onDragStart, onViewDetails, onEdit, onReassign, onDelete, onHistory, onDashboard, getStatusStyle, getPriorityStyle, getTypeStyle, openItemId, setOpenItemId, wrapperRef }: DraggableIssueRowProps) {
   const id = task.id as string
   const isChecked = selectedIds.includes(id)
   const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
   const buttonRef = useRef<HTMLButtonElement>(null)
   const [isDragging, setIsDragging] = useState(false)

   // Cerrar menú al hacer scroll
   useEffect(() => {
      const handleScroll = () => {
         if (openItemId === task.id) {
            setOpenItemId(null)
         }
      }

      // Agregar listener al scroll de la ventana y cualquier contenedor con scroll
      window.addEventListener('scroll', handleScroll, true) // true para capturar en fase de captura

      return () => {
         window.removeEventListener('scroll', handleScroll, true)
      }
   }, [openItemId, task.id, setOpenItemId])


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
         draggable
         onDragStart={(e) => {
            // No iniciar un drag si el gesto arrancó sobre un control interactivo
            // (checkbox, reasignar, menú de acciones) — debe comportarse como su
            // propio click, no como el arrastre de toda la fila.
            if ((e.target as HTMLElement).closest('button, input')) {
               e.preventDefault()
               return
            }
            onDragStart(e, id)
            // Atenuar en el siguiente tick: si se aplica en el mismo frame, el
            // navegador la captura en la miniatura ("ghost") del drag.
            setTimeout(() => setIsDragging(true), 0)
         }}
         onDragEnd={() => setIsDragging(false)}
         onClick={() => onViewDetails()}
         className={`grid grid-cols-1 md:grid-cols-18 gap-2 md:gap-3 py-2 px-3 items-start md:items-center hover:bg-[var(--gray-alpha-100)] rounded-md border border-[var(--ds-border)] hover:border-[var(--ds-border-strong)] transition-all cursor-grab active:cursor-grabbing bg-[var(--ds-card)] ${isDragging ? 'opacity-50' : ''}`}
      >
         {/* Checkbox */}
         <div className="col-span-full md:col-span-1 flex items-center gap-2 md:justify-center">
            <input
               type="checkbox"
               checked={isChecked}
               onChange={() => toggleSelect(id)}
               onClick={e => e.stopPropagation()}
               className="w-4 h-4 rounded accent-[var(--blue-700)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
            />
            <span className="md:hidden text-xs text-[var(--ds-text-muted)]">Seleccionar</span>
         </div>

         {/* Tipo */}
         <div className="col-span-full md:col-span-1">
            <span className="md:hidden block text-[10px] font-medium uppercase tracking-wide text-[var(--ds-text-muted)] mb-1">Tipo</span>
            <div
               className="rounded-full text-[10px] border px-2 whitespace-nowrap w-fit"
               style={{
                  backgroundColor: `${getTypeStyle(Number(task.type))?.color ?? "#6B7280"}0f`,
                  color: getTypeStyle(Number(task.type))?.color ?? "#6B7280"
               }}
            >
               {getTypeStyle(Number(task.type))?.name ?? "Sin tipo"}
            </div>
         </div>

         {/* Tarea */}
         <div className="col-span-full md:col-span-5">
            <h6 className="font-medium text-[var(--ds-text)] text-sm line-clamp-1" title={task.title}>
               {task.title}
            </h6>
            {
               (task.descriptions.length > 0) ?
                  <SafeHtml
                     html={task.descriptions[0].text}
                     className="line-clamp-1 text-xs text-[var(--ds-text-secondary)] leading-relaxed [&_code]:font-mono [&_code]:bg-[var(--gray-alpha-200)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs"
                  />
                  :
                  <p className="text-xs text-[var(--ds-text-muted)] line-clamp-1">
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
         <div className="col-span-full md:col-span-2">
            <span className="md:hidden block text-[10px] font-medium uppercase tracking-wide text-[var(--ds-text-muted)] mb-1">Estado</span>
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
         <div className="col-span-full md:col-span-2">
            <span className="md:hidden block text-[10px] font-medium uppercase tracking-wide text-[var(--ds-text-muted)] mb-1">Prioridad</span>
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
         <div className="col-span-full md:col-span-5">
            <span className="md:hidden block text-[10px] font-medium uppercase tracking-wide text-[var(--ds-text-muted)] mb-1">Asignado a</span>
            <button
               className="flex items-center gap-2 w-full text-left hover:bg-[var(--gray-alpha-100)] rounded-md p-2 transition-colors"
               onClick={e => { e.stopPropagation(); onReassign() }}
            >
               <div className="w-6 h-6 rounded-full bg-[var(--gray-alpha-200)] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {typeof task.assignedId === 'object' && task.assignedId ? (
                     <img
                        src={getUserAvatar(task.assignedId, 24)}
                        alt="Asignado a"
                        className="w-full h-full object-cover rounded-full"
                     />
                  ) : (
                     <span className="text-xs text-[var(--ds-text-muted)]">N/A</span>
                  )}

               </div>
               <span className="text-xs text-[var(--ds-text-secondary)] line-clamp-1">
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
         <div className="col-span-full md:col-span-1 flex justify-end md:justify-center">
            <div ref={openItemId === task.id ? wrapperRef : null} className="relative">
               <button
                  ref={buttonRef}
                  onClick={(e) => {
                     e.stopPropagation()
                     const newOpenState = openItemId === task.id ? null : task.id as string
                     setOpenItemId(newOpenState)

                     // Calcular posición si se está abriendo
                     if (newOpenState && buttonRef.current) {
                        const rect = buttonRef.current.getBoundingClientRect()
                        setMenuPosition({
                           top: rect.bottom + window.scrollY + 8,
                           left: rect.right + window.scrollX - 160 // 160px es el ancho del menú (w-40)
                        })
                     }
                  }}
                  className="p-2 text-[var(--ds-text-muted)] hover:text-[var(--ds-text-secondary)] hover:bg-[var(--gray-alpha-100)] rounded-md transition-colors"
               >
                  <MoreVertical size={16} strokeWidth={1.5} />
               </button>

               {openItemId === task.id && (
                  <div
                     className="fixed w-40 bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-md shadow-[var(--shadow-lg)] z-[99999] overflow-hidden"
                     style={{
                        top: `${menuPosition.top}px`,
                        left: `${menuPosition.left}px`
                     }}
                     onClick={e => e.stopPropagation()}
                  >
                     <button
                        className="w-full px-3 py-2 text-left text-sm text-[var(--ds-text)] hover:bg-[var(--gray-alpha-100)] transition-colors flex items-center gap-2"
                        onClick={() => {
                           onDashboard()
                           setOpenItemId(null)
                        }}
                     >
                        <BarChart3 size={14} />
                        Ver Dashboard
                     </button>
                     <button
                        className="w-full px-3 py-2 text-left text-sm text-[var(--ds-text)] hover:bg-[var(--gray-alpha-100)] transition-colors flex items-center gap-2"
                        onClick={() => {
                           onViewDetails()
                           setOpenItemId(null)
                        }}
                     >
                        <Eye size={14} strokeWidth={1.5} />
                        Ver Detalles
                     </button>
                     <button
                        className="w-full px-3 py-2 text-left text-sm text-[var(--ds-text)] hover:bg-[var(--gray-alpha-100)] transition-colors flex items-center gap-2"
                        onClick={() => {
                           onEdit()
                           setOpenItemId(null)
                        }}
                     >
                        <Pencil size={14} strokeWidth={1.5} />
                        Editar
                     </button>
                     <button
                        className="w-full px-3 py-2 text-left text-sm text-[var(--ds-text)] hover:bg-[var(--gray-alpha-100)] transition-colors flex items-center gap-2"
                        onClick={() => {
                           onHistory()
                           setOpenItemId(null)
                        }}
                     >
                        <Clock size={14} strokeWidth={1.5} />
                        Historial
                     </button>
                     <div style={{ borderTop: "1px solid var(--ds-border)" }}></div>
                     <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--red-100)] transition-colors flex items-center gap-2 text-[var(--ds-error)]"
                        onClick={() => {
                           onDelete()
                           setOpenItemId(null)
                        }}
                     >
                        <Trash2 size={14} strokeWidth={1.5} />
                        Eliminar
                     </button>
                  </div>
               )}
            </div>
         </div>
      </div>
   )
}

interface IssuesRowProps {
   spr: SprintProps
   setIsOpen: Dispatch<SetStateAction<boolean>>
   setIsCreateWithIAOpen: Dispatch<SetStateAction<boolean>>
   selectedIds: string[]
   setSelectedIds: Dispatch<SetStateAction<string[]>>
   onTaskDragStart: (e: React.DragEvent, taskId: string) => void
   onDropOnSprint: (e: React.DragEvent) => void
}

export default function IssuesRow({ spr, setIsOpen, setIsCreateWithIAOpen, selectedIds, setSelectedIds, onTaskDragStart, onDropOnSprint }: IssuesRowProps) {
   const [isDragOverSprint, setIsDragOverSprint] = useState(false)

   const { getValidAccessToken, user } = useAuthStore()
   const { deleteAllIssues, deleteIssue, updateIssue, assignIssue, createIssue } = useIssueStore()
   const { updateSprint, deleteSprint, activeSprint, getIssuesBySprint, loadMoreIssuesBySprint, clearIssuesFromSprint, isLoadingSprintDetails } = useSprintStore()
   const { openModal, closeModal } = useModalStore()

   const wrapperRef = useRef<HTMLDivElement>(null)
   const wrapperSprintRef = useRef<HTMLDivElement>(null)
   const scrollContainerRef = useRef<HTMLDivElement>(null)

   const [isSprintOptionsOpen, setisSprintOptionsOpen] = useState(false)
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


         await loadMoreIssuesBySprint(token, sprintId, projectId, currentPage + 1, activeFiltersRef.current)

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
      closeModal()
   }

   const handleDeleteSprint = async (sprint: SprintProps) => {
      const token = await getValidAccessToken()
      if (token) await deleteSprint(token, sprint.id as string, sprint.projectId)
      closeModal()
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
   }, filesMap?: Map<string, File[]>) => {
      const token = await getValidAccessToken()
      if (token) await updateIssue(token, formData, filesMap)
      closeModal()
   }

   const handleReasign = async ({ newUserId, issueId, task }: { newUserId: string, issueId: string, task: TaskProps }) => {
      const token = await getValidAccessToken()
      if (token) await assignIssue(token, issueId, newUserId, task.projectId)
      closeModal()
   }

   const handleDelete = async ({ data, task }: { data: boolean, task: TaskProps }) => {
      const token = await getValidAccessToken()
      if (token) await deleteIssue(token, task.id as string, task.projectId)
      closeModal()
   }

   const handleDeleteAll = async () => {
      const token = await getValidAccessToken()
      if (token) await deleteAllIssues(token, selectedIds, spr.projectId as string)
      closeModal()
      setSelectedIds([])
   }

   // Función específica para crear tareas dentro del sprint
   const handleCreateTaskInSprint = async (newTask: any, filesMap?: Map<string, File[]>) => {
      const token = await getValidAccessToken()
      if (token) {
         // Agregar el sprintId a la tarea antes de crearla
         const taskWithSprint = {
            ...newTask,
            sprintId: spr.id // Asignar la tarea al sprint actual
         }
         await createIssue(token, taskWithSprint, filesMap)
      }
      closeModal()
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
      closeModal()
   }

   // Modal handlers
   const handleImportModal = () => {
      openModal({
         size: "xxl",
         title: "Importar Tareas",
         desc: "Importa tareas desde un archivo CSV o Excel al sprint actual",
         children: <ImportIssuesModal onCancel={() => closeModal()} sprintId={spr.id} />,
         Icon: <Upload size={20} strokeWidth={1.5} />,
         closeOnBackdrop: false,
         closeOnEscape: true,
         mode: "CREATE"
      })
   }

   const handleUpdateSprintModal = () => {
      openModal({
         size: "lg",
         title: "Editar Sprint",
         desc: `Modifica la información del sprint ${spr.title}`,
         children: <CreateSprintForm onSubmit={handleUpdateSprint} onCancel={() => closeModal()} currentSprint={sprintSelected as SprintProps} isEdit={true} />,
         Icon: <Pencil size={20} strokeWidth={1.5} />,
         closeOnBackdrop: false,
         closeOnEscape: true,
         mode: "UPDATE"
      })
   }

   const handleDeleteSprintModal = () => {
      openModal({
         size: "md",
         children: <DeleteSprintForm onSubmit={handleDeleteSprint} onCancel={() => closeModal()} sprintObject={sprintSelected as SprintProps} />,
         closeOnBackdrop: false,
         closeOnEscape: true,
         mode: "DELETE"
      })
   }

   const handleShowDashboardModal = async () => {
      const token = await getValidAccessToken()
      if (token && sprintSelected) {
         openModal({
            size: "xxl",
            title: `Dashboard del sprint: ${sprintSelected.title}`,
            desc: "Estadísticas y métricas del sprint",
            Icon: <BarChart3 size={20} />,
            children: <Dashboard projectId={spr.projectId as string} sprintId={sprintSelected.id as string} token={token} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
         })
      }
   }

   const handleTaskDetailsModal = (task: TaskProps) => {
      setTaskActive(task)
      openModal({
         size: "full",
         desc: "Detalles completos de la tarea",
         children: <TaskDetailsForm task={task} onSubmit={() => closeModal()} onCancel={() => closeModal()} />,
         Icon: <Eye size={20} strokeWidth={1.5} />,
         closeOnBackdrop: false,
         closeOnEscape: true,
         mode: "UPDATE"
      })
   }

   const handleTaskUpdateModal = (task: TaskProps) => {
      setTaskActive(task)
      openModal({
         size: "xl",
         title: "Editar Tarea",
         desc: `Modifica la información de la tarea ${task.title}`,
         children: <CreateTaskForm onSubmit={handleUpdate} onCancel={() => closeModal()} taskObject={task} isEdit={true} />,
         Icon: <Pencil size={20} strokeWidth={1.5} />,
         closeOnBackdrop: false,
         closeOnEscape: true,
         mode: "UPDATE"
      })
   }

   const handleReasignModal = (task: TaskProps) => {
      setTaskActive(task)
      openModal({
         size: "lg",
         title: "Reasignar Tarea",
         desc: `Reasigna la tarea ${task.title} a otro usuario`,
         children: <ReasignIssue onSubmit={(data) => handleReasign({ ...data, task })} onCancel={() => closeModal()} taskObject={task} />,
         Icon: <Pencil size={20} strokeWidth={1.5} />,
         closeOnBackdrop: false,
         closeOnEscape: true,
         mode: "UPDATE"
      })
   }

   const handleDeleteTaskModal = (task: TaskProps) => {
      setTaskActive(task)
      openModal({
         size: "md",
         children: <DeleteIssueForm onSubmit={(data) => handleDelete({ data, task })} onCancel={() => closeModal()} taskObject={task} />,
         closeOnBackdrop: false,
         closeOnEscape: true,
         mode: "DELETE"
      })
   }

   const handleHistoryModal = (task: TaskProps) => {
      setTaskActive(task)
      openModal({
         size: "xl",
         title: "Historial de Cambios",
         desc: `Historial completo de la tarea ${task.title}`,
         children: <AuditHistory issueId={task.id} currentIssue={task} onCancel={() => closeModal()} />,
         Icon: <Clock size={20} strokeWidth={1.5} />,
         closeOnBackdrop: false,
         closeOnEscape: true,
         mode: "UPDATE"
      })
   }

   const handleIssueDashboardModal = async (task: TaskProps) => {
      const token = await getValidAccessToken()
      if (token) {
         setTaskActive(task)
         openModal({
            size: "xxl",
            title: `Dashboard de la tarea: ${task.title}`,
            desc: "Estadísticas y métricas de la tarea",
            Icon: <BarChart3 size={20} />,
            children: <Dashboard projectId={task.projectId} issueId={task.id as string} token={token} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
         })
      }
   }

   const handleDeleteAllModal = () => {
      openModal({
         size: "md",
         children: <DeleteAllForm onSubmit={handleDeleteAll} onCancel={() => closeModal()} taskArray={selectedIds} />,
         closeOnBackdrop: false,
         closeOnEscape: true,
         mode: "DELETE"
      })
   }

   const handleCreateTaskInSprintModal = () => {
      openModal({
         size: "xl",
         title: "Crear Tarea en Sprint",
         desc: `Crea una nueva tarea en el sprint ${spr.title}`,
         children: <CreateTaskForm onSubmit={handleCreateTaskInSprint} onCancel={() => closeModal()} />,
         Icon: <Plus size={20} strokeWidth={1.5} />,
         closeOnBackdrop: false,
         closeOnEscape: true,
         mode: "CREATE"
      })
   }

   const handleCreateWithIAInSprintModal = () => {
      openModal({
         size: "full",
         title: "Crear Tareas con IA",
         desc: "Chatea con IA para crear tareas de forma rápida y eficiente.",
         children: <CreateWithIA onSubmit={handleCreateWithIAInSprint} onCancel={() => closeModal()} sprintId={spr.id} />,
         Icon: <Bot size={20} strokeWidth={1.5} />,
         closeOnBackdrop: false,
         closeOnEscape: true,
         mode: "CREATE"
      })
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

   const [userSelected, setUserSelected] = useState<FilterUser[]>([])

   const [typeSelected, setTypeSelected] = useState<ColumnFilterOption | null>(null)
   const [statusSelected, setStatusSelected] = useState<ColumnFilterOption | null>(null)
   const [prioritySelected, setPrioritySelected] = useState<ColumnFilterOption | null>(null)

   // Filtros combinados vigentes (Tipo/Estado/Prioridad/Asignado a), en un ref para que
   // `handleLoadMore` (más arriba, definido antes de que exista este estado) pueda leer
   // el valor más reciente sin tener que recrearse en cada cambio de filtro.
   const activeFiltersRef = useRef({ assignedIds: '', type: null as number | null, status: null as number | null, priority: null as number | null })

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
      const filters = {
         type: typeSelected?.id ?? null,
         status: statusSelected?.id ?? null,
         priority: prioritySelected?.id ?? null,
         assignedIds: userSelected.map(u => u.id).join(','),
      }
      activeFiltersRef.current = filters
      const getNewIssues = async () => {
         setIsFiltering(true)
         await clearIssuesFromSprint(sprintId)
         const token = await getValidAccessToken()
         // El sprint activo siempre debe traer todas sus issues (size 999), tanto en
         // esta vista (Lista) como en el fast path de Tablero (SprintStore.getSprints) —
         // si no, este efecto (que corre también al montar) pisa esas 999 con solo 10.
         const newTasks = await getIssuesBySprint(token, sprintId, spr.projectId as string, filters, spr.active ? 999 : 10)

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

   return (
      <>
         <div
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => { e.preventDefault(); setIsDragOverSprint(true) }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOverSprint(false) }}
            onDrop={(e) => { setIsDragOverSprint(false); onDropOnSprint(e) }}
            className="rounded-xl transition-shadow duration-150"
            style={{ background: "var(--ds-card)", boxShadow: isDragOverSprint ? "0 0 0 2px var(--blue-600)" : "var(--shadow-border)" }}
         >
            {/* Header del sprint */}
            <div className="bg-[var(--gray-alpha-100)] border-b border-[var(--ds-border)] px-5 py-3">
               <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5 min-w-0">
                     <div className={`w-2 h-2 rounded-full flex-shrink-0 ${spr.active ? 'bg-[var(--green-700)] animate-pulse' : 'bg-[var(--gray-500)]'}`}></div>
                     <h3 className="text-sm font-semibold text-[var(--ds-text)] truncate">{spr.title}</h3>

                     {/* Badge de activo */}
                     {spr.active && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0" style={{ background: "var(--green-100)", color: "var(--green-900)", border: "1px solid var(--green-400)" }}>
                           <div className="w-1.5 h-1.5 rounded-full bg-[var(--green-700)] animate-pulse" />
                           ACTIVO
                        </span>
                     )}
                  </div>

                  {/* Acciones del sprint */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                     {spr.id !== 'null' ? (
                        <>
                           <button
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary-700)] text-[var(--primary-contrast-fg)] rounded-md hover:bg-[var(--primary-800)] transition-colors duration-200 text-xs font-medium"
                              onClick={handleCreateTaskInSprintModal}
                              title="Crear nueva tarea en este sprint"
                           >
                              <Plus size={14} strokeWidth={2} />
                              <span>Nueva Tarea</span>
                           </button>

                           {/* Menú de opciones — el resto de acciones del sprint vive acá para no
                              saturar el header con botones */}
                           <div ref={wrapperSprintRef} className="relative">
                              <button
                                 onClick={() => {
                                    setSprintSelected(spr)
                                    setisSprintOptionsOpen(!isSprintOptionsOpen)
                                 }}
                                 className="p-1.5 text-[var(--ds-text-secondary)] hover:text-[var(--ds-text)] hover:bg-[var(--gray-alpha-100)] rounded-md transition-colors duration-200 border border-[var(--ds-border)]"
                              >
                                 <MoreVertical size={16} strokeWidth={1.5} />
                              </button>

                              {isSprintOptionsOpen && (
                                 <div className="absolute top-full right-0 mt-2 w-56 bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-md shadow-[var(--shadow-lg)] z-50 overflow-hidden">
                                    <div className="py-1">
                                       <button
                                          className="w-full px-4 py-2 text-left text-sm text-[var(--ds-text)] hover:bg-[var(--gray-alpha-100)] flex items-center gap-3 transition-colors"
                                          onClick={() => {
                                             handleShowDashboardModal()
                                             setisSprintOptionsOpen(false)
                                          }}
                                       >
                                          <BarChart3 size={16} />
                                          <span>Ver Dashboard</span>
                                       </button>
                                       <button
                                          className="w-full px-4 py-2 text-left text-sm text-[var(--ds-text)] hover:bg-[var(--gray-alpha-100)] flex items-center gap-3 transition-colors"
                                          onClick={() => {
                                             handleUpdateSprintModal()
                                             setisSprintOptionsOpen(false)
                                          }}
                                       >
                                          <Pencil size={16} strokeWidth={1.5} />
                                          <span>Editar Sprint</span>
                                       </button>
                                       <div style={{ borderTop: "1px solid var(--ds-border)", margin: "4px 0" }}></div>
                                       <button
                                          className="w-full px-4 py-2 text-left text-sm text-[var(--ds-text)] hover:bg-[var(--gray-alpha-100)] flex items-center gap-3 transition-colors"
                                          onClick={() => {
                                             handleImportModal()
                                             setisSprintOptionsOpen(false)
                                          }}
                                       >
                                          <Upload size={16} strokeWidth={1.5} />
                                          <span>Importar Tareas</span>
                                       </button>
                                       {(typeof user?.role === 'object' && user?.role?.permissions?.some(p => (p.name === "GEMINI_ACTIVE" || p.name === "GEMINI_CONFIG"))) && (
                                          <button
                                             className="w-full px-4 py-2 text-left text-sm text-[var(--ds-text)] hover:bg-[var(--gray-alpha-100)] flex items-center gap-3 transition-colors"
                                             onClick={() => {
                                                handleCreateWithIAInSprintModal()
                                                setisSprintOptionsOpen(false)
                                             }}
                                          >
                                             <Bot size={16} strokeWidth={1.5} />
                                             <span>Crear tareas con IA</span>
                                          </button>
                                       )}
                                       <div style={{ borderTop: "1px solid var(--ds-border)", margin: "4px 0" }}></div>
                                       {!spr.active ? (
                                          <button
                                             disabled={!!activeSprint && activeSprint.id !== spr.id}
                                             className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors text-[var(--green-900)] hover:bg-[var(--green-100)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:text-[var(--ds-text-muted)]"
                                             title={!!activeSprint && activeSprint.id !== spr.id ? 'Ya hay un sprint activo' : 'Activar este sprint'}
                                             onClick={() => {
                                                handleActivateSprint(spr)
                                                setisSprintOptionsOpen(false)
                                             }}
                                          >
                                             {!!activeSprint && activeSprint.id !== spr.id ? <Ban size={16} strokeWidth={1.5} /> : <CircleCheck size={16} strokeWidth={1.5} />}
                                             <span>{!!activeSprint && activeSprint.id !== spr.id ? "Ya hay un sprint activo" : "Activar Sprint"}</span>
                                          </button>
                                       ) : (
                                          <button
                                             className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--amber-100)] flex items-center gap-3 transition-colors text-[var(--amber-900)]"
                                             onClick={() => {
                                                const updatedSprint = { ...spr, active: false }
                                                handleUpdateSprint(updatedSprint)
                                                setisSprintOptionsOpen(false)
                                             }}
                                          >
                                             <PowerOff size={16} strokeWidth={1.5} />
                                             <span>Desactivar Sprint</span>
                                          </button>
                                       )}
                                       <div style={{ borderTop: "1px solid var(--ds-border)", margin: "4px 0" }}></div>
                                       <button
                                          className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--red-100)] flex items-center gap-3 transition-colors text-[var(--ds-error)]"
                                          onClick={() => {
                                             handleDeleteSprintModal()
                                             setisSprintOptionsOpen(false)
                                          }}
                                       >
                                          <Trash2 size={16} strokeWidth={1.5} />
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
                              onClick={handleImportModal}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-[var(--ds-text)] bg-[var(--ds-card)] border border-[var(--ds-border-strong)] rounded-md hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2 transition-colors duration-200 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Importar tareas"
                           >
                              <Upload size={14} strokeWidth={2} />
                              <span>Importar Tareas</span>
                           </button>
                           {
                              // Solo mostrar si el usuario tiene el permiso GEMINI_ACTIVE
                              (typeof user?.role === 'object' && user?.role?.permissions?.some(p => (p.name === "GEMINI_ACTIVE" || p.name === "GEMINI_CONFIG"))) && (
                                 <button className="flex items-center gap-1.5 px-3 py-1.5 text-[var(--blue-900)] bg-[var(--blue-100)] border border-[var(--blue-400)] rounded-md hover:bg-[var(--blue-200)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2 transition-colors duration-200 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => setIsCreateWithIAOpen(true)}
                                    title="Crear tareas con IA"
                                 >
                                    <Bot size={16} strokeWidth={2} />
                                    <span>Crear tareas con IA</span>
                                 </button>
                              )
                           }
                           <button
                              onClick={() => setIsOpen(true)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary-700)] text-[var(--primary-contrast-fg)] rounded-md hover:bg-[var(--primary-800)] transition-colors duration-200 text-xs font-medium"
                           >
                              <Plus size={14} strokeWidth={2} />
                              <span>Nueva Tarea</span>
                           </button>
                        </>
                     )}
                  </div>
               </div>

               {/* Información secundaria: estado, tareas, meta y fechas en una sola fila compacta */}
               <div className="flex items-center gap-2 flex-wrap mt-2">
                  {/* Badge de estado */}
                  {(() => {
                     const statusObject = spr.statusObject || (spr.status ? getSprintStatusStyle(spr.status) : null)
                     return statusObject ? (
                        <div
                           className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0"
                           style={{
                              backgroundColor: `${statusObject.color}15`,
                              color: statusObject.color,
                              borderColor: `${statusObject.color}30`
                           }}
                        >
                           <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: statusObject.color }}
                           />
                           {statusObject.name}
                        </div>
                     ) : null
                  })()}

                  {/* Badge de tareas */}
                  {spr.tasks?.content && spr.tasks.content.length > 0 && (
                     <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0" style={{ background: "var(--blue-100)", color: "var(--blue-900)", border: "1px solid var(--blue-400)" }}>
                        <ListChecks size={11} strokeWidth={1.5} className="text-[var(--blue-700)]" />
                        <span>
                           {spr.tasks.totalElements} {spr.tasks.totalElements === 1 ? 'tarea' : 'tareas'}
                        </span>
                     </div>
                  )}

                  {/* Meta del sprint — línea inline en vez de tarjeta propia, para no ocupar una fila entera */}
                  {spr.goal && (
                     <div className="flex items-center gap-1.5 min-w-0 text-[11px] text-[var(--ds-text-secondary)]" title={spr.goal}>
                        <Zap size={11} strokeWidth={1.5} className="text-[var(--blue-700)] flex-shrink-0" />
                        <span className="truncate max-w-[320px]">{spr.goal}</span>
                     </div>
                  )}

                  {/* Badge de fechas */}
                  {spr.id !== 'null' && (
                     <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ml-auto" style={{ background: "var(--purple-100)", color: "var(--purple-900)", border: "1px solid var(--purple-400)" }}>
                        <Calendar size={12} strokeWidth={1.5} />
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

            {/* Lista de tareas */}
            <div className="p-4">
               {spr.tasks?.content.length ? (
                  <div className="space-y-2">
                     {/* Cabecera del grid */}
                     <div className="grid grid-cols-1 md:grid-cols-18 gap-2 md:gap-3 py-2 px-3 md:pl-0 rounded-md text-xs font-medium text-[var(--ds-text-secondary)]" style={{ background: "var(--gray-alpha-100)", border: "1px solid var(--ds-border)" }}>
                        <div className="col-span-full md:col-span-1 flex items-center justify-start md:justify-center gap-1">
                           <div className="w-6 h-6 flex items-center justify-center">
                              {
                                 selectedIds.length > 0 &&
                                 <button onClick={handleDeleteAllModal} className='text-[var(--red-700)] hover:text-[var(--red-900)] transition-colors cursor-pointer'>
                                    <Trash2 size={16} strokeWidth={2} />
                                 </button>
                              }
                           </div>
                           <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={toggleSelectAll}
                              className="w-4 h-4 rounded accent-[var(--blue-700)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                           />
                        </div>
                        <div className="col-span-full md:col-span-1 flex items-center w-full">
                           <ColumnFilterSelect
                              label="Tipo"
                              allLabel="Todos los tipos"
                              options={projectConfig?.issueTypes || []}
                              selected={typeSelected}
                              onChange={setTypeSelected}
                           />
                        </div>
                        <div className="col-span-full md:col-span-5 flex items-center gap-2 w-full">
                           <p className='whitespace-nowrap'>Tarea</p>
                        </div>
                        <div className="col-span-full md:col-span-2 flex items-center w-full">
                           <ColumnFilterSelect
                              label="Estado"
                              allLabel="Todos los estados"
                              options={projectConfig?.issueStatuses || []}
                              selected={statusSelected}
                              onChange={setStatusSelected}
                           />
                        </div>
                        <div className="col-span-full md:col-span-2 flex items-center w-full">
                           <ColumnFilterSelect
                              label="Prioridad"
                              allLabel="Todas las prioridades"
                              options={projectConfig?.issuePriorities || []}
                              selected={prioritySelected}
                              onChange={setPrioritySelected}
                           />
                        </div>
                        <div className="col-span-full md:col-span-5 flex items-center gap-2 w-full">
                           <p className='whitespace-nowrap'>Asignado a</p>
                           <UserFilterSelect
                              users={allProjectUsers}
                              selected={userSelected}
                              onChange={newSelected => {
                                 setUserSelected(newSelected)
                                 setFilter(sprintId, { key: 'assignedIds', value: newSelected.length > 0 ? newSelected.map(u => u.id).join(',') : '' })
                              }}
                              className="w-full"
                           />
                        </div>
                        <div className="col-span-full md:col-span-1 flex items-center justify-start md:justify-center">Acciones</div>
                     </div>
                     <div className='space-y-1.5 max-h-[440px] overflow-y-auto overscroll-contain' ref={scrollContainerRef}>
                        {/* Filas de tareas */}
                        {spr.tasks.content.map((task, index) => {
                           return (
                              <DraggableIssueRow
                                 key={task.id}
                                 task={task}
                                 selectedIds={selectedIds}
                                 toggleSelect={toggleSelect}
                                 onDragStart={onTaskDragStart}
                                 onViewDetails={() => handleTaskDetailsModal(task)}
                                 onEdit={() => handleTaskUpdateModal(task)}
                                 onReassign={() => handleReasignModal(task)}
                                 onDelete={() => handleDeleteTaskModal(task)}
                                 onHistory={() => handleHistoryModal(task)}
                                 onDashboard={() => handleIssueDashboardModal(task)}
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
                              <div className="flex items-center justify-center gap-3 text-[var(--blue-700)]">
                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--blue-700)]"></div>
                                 <span className="text-sm">Cargando más tareas...</span>
                              </div>
                           </div>
                        )}

                        {/* Mensaje cuando no hay más elementos */}
                        {!hasMore && spr.tasks.content.length > 0 && (
                           <div className="text-center py-4 text-[var(--ds-text-muted)] text-sm mt-4">
                              <div className="flex items-center justify-center gap-2">
                                 <div className="w-2 h-2 bg-[var(--gray-alpha-300)] rounded-full" />
                                 <span>No hay más tareas para mostrar</span>
                                 <div className="w-2 h-2 bg-[var(--gray-alpha-300)] rounded-full" />
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               ) : (
                  isFiltering ? (
                     <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--blue-100)" }}>
                           <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "2px solid var(--blue-200)", borderTopColor: "var(--blue-700)" }}></div>
                        </div>
                        <h3 className="text-lg font-medium text-[var(--blue-700)] mb-2">Aplicando Filtros…</h3>
                        <p className="text-[var(--blue-700)] text-sm">Por favor espera mientras se filtran las tareas</p>
                     </div>
                  ) : (isLoadingSprintDetails && !spr.active && !filter.key) ? (
                     // Este sprint todavía no trajo sus issues reales (el fast path de
                     // getSprints solo trae de una vez el sprint activo) — mostrar esto
                     // en vez de "no hay tareas", que sería falso mientras carga.
                     <div className="text-center py-12">
                        <div className="mx-auto w-8 h-8 rounded-full animate-spin" style={{ border: "2px solid var(--gray-alpha-200)", borderTopColor: "var(--blue-700)" }}></div>
                        <p className="text-sm mt-3" style={{ color: "var(--ds-text-muted)" }}>Cargando tareas…</p>
                     </div>
                  ) : (
                     (filter && filter.key === 'assignedIds' && filter.value && userSelected.length > 0) ? (
                        <div className="text-center py-12 flex flex-col items-center justify-center">
                           <div className="flex items-center justify-center gap-2 mb-4">
                              {userSelected.length === 1 ? (
                                 <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center overflow-hidden" style={{ background: "var(--gray-alpha-200)" }}>
                                    {userSelected[0].picture ? (
                                       <img
                                          src={getUserAvatar(userSelected[0], 64)}
                                          alt={userSelected[0].id}
                                          className="w-full h-full object-cover rounded-full"
                                       />
                                    ) : (
                                       <span className="text-3xl font-medium text-[var(--ds-text-secondary)]">
                                          {userSelected[0].firstName || userSelected[0].lastName ?
                                             ((userSelected[0].firstName?.[0] || '') + (userSelected[0].lastName?.[0] || '')).toUpperCase()
                                             : (userSelected[0].email?.[0] || '?').toUpperCase()}
                                       </span>
                                    )}
                                 </div>
                              ) : (
                                 userSelected.slice(0, 3).map((user, idx) => (
                                    <div key={user.id} className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden -ml-2 first:ml-0" style={{ background: "var(--gray-alpha-200)", border: "2px solid var(--ds-card)" }}>
                                       {user.picture ? (
                                          <img
                                             src={getUserAvatar(user, 48)}
                                             alt={user.id}
                                             className="w-full h-full object-cover rounded-full"
                                          />
                                       ) : (
                                          <span className="text-xl font-medium text-[var(--ds-text-secondary)]">
                                             {user.firstName || user.lastName ?
                                                ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase()
                                                : (user.email?.[0] || '?').toUpperCase()}
                                          </span>
                                       )}
                                    </div>
                                 ))
                              )}
                              {userSelected.length > 3 && (
                                 <span className="ml-2 text-[var(--ds-text-muted)] text-lg font-semibold">+{userSelected.length - 3}</span>
                              )}
                           </div>
                           <h3 className="text-lg font-medium text-[var(--ds-text)] mb-2">
                              {userSelected.length === 1
                                 ? `No hay tareas asignadas a ${userSelected[0].firstName || userSelected[0].lastName ? `${userSelected[0].firstName ?? ''} ${userSelected[0].lastName ?? ''}`.trim() : (userSelected[0].email || 'Sin asignar')}`
                                 : `No hay tareas asignadas a los usuarios seleccionados`}
                           </h3>
                           <p className="text-[var(--ds-text-muted)] text-sm">Selecciona otro usuario o elimina el filtro para ver más tareas</p>
                           {/* Mostrar el filtro aquí cuando no hay resultados */}
                           <div className="mt-6 flex justify-center items-center">
                              <div className="flex items-center gap-2 max-w-xs">
                                 <UserFilterSelect
                                    users={allProjectUsers}
                                    selected={userSelected}
                                    onChange={newSelected => {
                                       setUserSelected(newSelected)
                                       setFilter(sprintId, { key: 'assignedIds', value: newSelected.length > 0 ? newSelected.map(u => u.id).join(',') : '' })
                                    }}
                                    className="w-full"
                                 />
                                 {
                                    (userSelected.length !== 0 || typeSelected || statusSelected || prioritySelected) &&
                                    <div className="flex justify-center w-full gap-2">
                                       <button className="flex items-center gap-2 py-0.5 px-2 text-[var(--red-800)] rounded-full hover:bg-[var(--red-100)] focus-visible:outline-2 focus-visible:outline-[var(--red-700)] focus-visible:outline-offset-2 transition-all duration-200 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                          onClick={() => {
                                             setUserSelected([])
                                             setTypeSelected(null)
                                             setStatusSelected(null)
                                             setPrioritySelected(null)
                                             setFilter(sprintId, { key: '', value: '' })
                                          }}
                                       >
                                          <Trash2 size={16} strokeWidth={1.5} />
                                          Borrar Filtros
                                       </button>
                                    </div>
                                 }
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="text-center py-12 w-full">
                           <div className="mx-auto w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--gray-alpha-100)" }}>
                              <FileText size={32} strokeWidth={1.5} className="text-[var(--ds-text-muted)]" />
                           </div>
                           <h3 className="text-lg font-medium text-[var(--ds-text)] mb-2">No hay tareas disponibles</h3>
                           <p className="text-[var(--ds-text-muted)] text-sm">Agrega algunas tareas para comenzar a trabajar en este sprint</p>
                           {
                              (userSelected.length !== 0 || typeSelected || statusSelected || prioritySelected) &&
                              <div className="flex justify-center mt-6">
                                 <button className="flex items-center gap-2 px-4 py-2 text-[var(--red-900)] bg-[var(--red-100)] border border-[var(--red-400)] rounded-md hover:bg-[var(--red-200)] focus-visible:outline-2 focus-visible:outline-[var(--red-700)] focus-visible:outline-offset-2 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => {
                                       setUserSelected([])
                                       setTypeSelected(null)
                                       setStatusSelected(null)
                                       setPrioritySelected(null)
                                       setFilter(sprintId, { key: '', value: '' })
                                    }}
                                 >
                                    <Trash2 size={18} strokeWidth={1.5} />
                                    Borrar Filtros
                                 </button>
                              </div>
                           }
                        </div>
                     )
                  )
               )}
            </div>
         </div>
      </>
   )
}
