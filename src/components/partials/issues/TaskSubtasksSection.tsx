'use client'

import { TaskProps } from '@/lib/types/types'
import { useEffect, useState } from 'react'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { useModalStore } from '@/lib/hooks/ModalStore'
import { ChevronRight, Clock, Trash2, Filter, Plus } from 'lucide-react'
import Link from 'next/link'
import CreateTaskForm from './CreateTaskForm'
import { getUserAvatar } from '@/lib/utils/avatar.utils'
import AuditHistory from '../audit/AuditHistory'
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect'
import { API_ROUTES } from '@/lib/routes/issues.routes'

interface TaskSubtasksSectionProps {
   task: TaskProps
}

interface SubtaskFilters {
   type: number | null
   status: number | null
   priority: number | null
   assigned: string | null
}

function IconButton({ onClick, title, active = false, children }: { onClick: () => void, title: string, active?: boolean, children: React.ReactNode }) {
   return (
      <button
         type="button"
         onClick={onClick}
         title={title}
         className={`relative flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200 flex-shrink-0 ${active ? 'bg-[var(--blue-100)]' : 'hover:bg-[var(--gray-alpha-100)]'}`}
         style={{ color: active ? "var(--blue-700)" : "var(--ds-text-muted)" }}
      >
         {children}
      </button>
   )
}

function SubtaskFiltersForm({ initialFilters, typeOptions, statusOptions, priorityOptions, assignedOptions, onApply, onCancel }: {
   initialFilters: SubtaskFilters
   typeOptions: SelectOption[]
   statusOptions: SelectOption[]
   priorityOptions: SelectOption[]
   assignedOptions: SelectOption[]
   onApply: (filters: SubtaskFilters) => void
   onCancel: () => void
}) {
   const [filters, setFilters] = useState<SubtaskFilters>(initialFilters)
   const labelCls = "text-[13px] font-medium"

   return (
      <div className="p-6">
         <div className="space-y-4">
            <div className="space-y-1.5">
               <label className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>Tipo</label>
               <CustomSelect value={filters.type} onChange={(value) => setFilters(f => ({ ...f, type: value as number | null }))} options={typeOptions} placeholder="Cualquier tipo" variant="colored" />
            </div>
            <div className="space-y-1.5">
               <label className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>Estado</label>
               <CustomSelect value={filters.status} onChange={(value) => setFilters(f => ({ ...f, status: value as number | null }))} options={statusOptions} placeholder="Cualquier estado" variant="colored" />
            </div>
            <div className="space-y-1.5">
               <label className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>Prioridad</label>
               <CustomSelect value={filters.priority} onChange={(value) => setFilters(f => ({ ...f, priority: value as number | null }))} options={priorityOptions} placeholder="Cualquier prioridad" variant="colored" />
            </div>
            <div className="space-y-1.5">
               <label className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>Asignado</label>
               <CustomSelect value={filters.assigned} onChange={(value) => setFilters(f => ({ ...f, assigned: value as string | null }))} options={assignedOptions} placeholder="Cualquier persona" variant="user" />
            </div>
         </div>

         <div className="flex justify-between items-center mt-6">
            <button
               type="button"
               onClick={() => setFilters({ type: null, status: null, priority: null, assigned: null })}
               className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors duration-150 hover:bg-[var(--gray-alpha-100)]"
               style={{ color: "var(--ds-text-secondary)" }}
            >
               Limpiar filtros
            </button>
            <div className="flex gap-3">
               <button
                  type="button"
                  onClick={onCancel}
                  className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                  style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
               >
                  Cancelar
               </button>
               <button
                  type="button"
                  onClick={() => onApply(filters)}
                  className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                  style={{ color: "var(--primary-contrast-fg)" }}
               >
                  Aplicar filtros
               </button>
            </div>
         </div>
      </div>
   )
}

export default function TaskSubtasksSection({ task }: TaskSubtasksSectionProps) {
   const { getValidAccessToken } = useAuthStore()
   const { projectConfig } = useConfigStore()
   const { openModal, closeModal } = useModalStore()

   const [isSubtasksOpen, setIsSubtasksOpen] = useState(false)
   const [typeFilter, setTypeFilter] = useState<number | null>(null)
   const [statusFilter, setStatusFilter] = useState<number | null>(null)
   const [priorityFilter, setPriorityFilter] = useState<number | null>(null)
   const [assignedFilter, setAssignedFilter] = useState<string | null>(null)
   const [subtasks, setSubtasks] = useState<TaskProps[]>([])
   const [loadingSubtasks, setLoadingSubtasks] = useState(false)

   const fetchSubtasks = async (token: string, issueId: string) => {
      setLoadingSubtasks(true)
      try {
         const response = await fetch(API_ROUTES.CRUD_SUBTASKS(issueId), {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            }
         })

         if (!response.ok) {
            throw new Error('Error al obtener las subtareas')
         }

         const data: TaskProps[] = await response.json()
         setSubtasks(data)
      } catch (error) {
         console.error('Error al cargar subtareas:', error)
         setSubtasks([])
      } finally {
         setLoadingSubtasks(false)
      }
   }

   useEffect(() => {
      const load = async () => {
         const token = await getValidAccessToken()
         if (token && task?.id) {
            await fetchSubtasks(token, task.id as string)
         }
      }
      load()
   }, [task?.id])

   const getTypeStyle = (typeId: number) => projectConfig?.issueTypes?.find((t: any) => t.id === typeId)
   const getStatusStyle = (statusId: number) => projectConfig?.issueStatuses?.find((s: any) => s.id === statusId)
   const getPriorityStyle = (priorityId: number) => projectConfig?.issuePriorities?.find((p: any) => p.id === priorityId)

   const filteredSubtasks = subtasks.filter(subtask => {
      if (typeFilter !== null && subtask.type !== typeFilter) return false
      if (statusFilter !== null && subtask.status !== statusFilter) return false
      if (priorityFilter !== null && subtask.priority !== priorityFilter) return false
      if (assignedFilter !== null && typeof subtask.assignedId === 'object' && subtask.assignedId?.id !== assignedFilter) return false
      return true
   })

   const handleDeleteSubtask = (subtaskId: string) => {
      console.log('Eliminar subtarea:', subtaskId)
   }

   const handleHistorySubtask = (subtaskId: string) => {
      openModal({
         size: "xl",
         title: "Historial de Auditoría",
         desc: "Consulta el historial de cambios",
         Icon: <Clock size={20} strokeWidth={1.75} />,
         children: <AuditHistory issueId={subtaskId} onCancel={() => closeModal()} />,
         closeOnBackdrop: true,
         closeOnEscape: true,
      })
   }

   const handleCreateSubtask = async (formData: TaskProps, filesMap?: Map<string, File[]>) => {
      const token = await getValidAccessToken()
      if (!token || !task?.id) return

      try {
         const payload = {
            title: formData.title,
            descriptions: formData.descriptions,
            estimatedTime: formData.estimatedTime,
            priority: formData.priority,
            status: formData.status,
            type: formData.type,
            projectId: formData.projectId,
            assignedId: typeof formData.assignedId === 'string' ? formData.assignedId : formData.assignedId?.id,
            ...(formData.startDate ? { startDate: formData.startDate } : {}),
            ...(formData.endDate ? { endDate: formData.endDate } : {})
         }

         const response = await fetch(API_ROUTES.CRUD_SUBTASKS(task.id), {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
         })

         if (!response.ok) {
            throw new Error('Error al crear la subtarea')
         }

         const newSubtask: TaskProps = await response.json()

         if (filesMap && filesMap.size > 0 && newSubtask.id) {
            for (const [descTitle, files] of filesMap.entries()) {
               const description = newSubtask.descriptions.find(d => d.title === descTitle)

               if (description && description.id && files.length > 0) {
                  const uploadFormData = new FormData()
                  files.forEach(file => {
                     uploadFormData.append('files', file)
                  })

                  try {
                     await fetch(API_ROUTES.ADD_FILES_TO_DESCRIPTION(newSubtask.id, description.id), {
                        method: 'POST',
                        headers: {
                           'Authorization': `Bearer ${token}`
                        },
                        body: uploadFormData
                     })
                  } catch (error) {
                     console.error(`Error al subir archivos para la descripción ${descTitle}:`, error)
                  }
               }
            }
         }

         setSubtasks(prev => [newSubtask, ...prev])
         closeModal()
      } catch (error) {
         console.error('Error al crear la subtarea:', error)
      }
   }

   const handleOpenCreateSubtaskModal = () => {
      openModal({
         size: "xl",
         title: "Crear Subtarea",
         desc: "Crea una nueva subtarea para esta tarea",
         Icon: <Plus size={20} strokeWidth={1.75} />,
         children: <CreateTaskForm
            onSubmit={handleCreateSubtask}
            onCancel={() => closeModal()}
            taskObject={{
               title: "",
               descriptions: [],
               projectId: task?.projectId || "",
               priority: projectConfig?.issuePriorities?.[0]?.id || 1,
               status: projectConfig?.issueStatuses?.[0]?.id || 1,
               type: projectConfig?.issueTypes?.[0]?.id || 1,
               assignedId: "",
               estimatedTime: 0
            }}
            isEdit={false}
         />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "CREATE"
      })
   }

   const getTypeOptions = (): SelectOption[] => {
      if (!projectConfig?.issueTypes) return []
      return projectConfig.issueTypes.map((type: any) => ({
         value: type.id,
         label: type.name,
         color: type.color
      }))
   }

   const getStatusOptions = (): SelectOption[] => {
      if (!projectConfig?.issueStatuses) return []
      return projectConfig.issueStatuses.map((status: any) => ({
         value: status.id,
         label: status.name,
         color: status.color
      }))
   }

   const getPriorityOptions = (): SelectOption[] => {
      if (!projectConfig?.issuePriorities) return []
      return projectConfig.issuePriorities.map((priority: any) => ({
         value: priority.id,
         label: priority.name,
         color: priority.color
      }))
   }

   const getAssignedOptions = (): SelectOption[] => {
      const uniqueUsers = Array.from(
         new Set(subtasks.map(s => typeof s.assignedId === 'object' ? s.assignedId?.id : null).filter(Boolean))
      )

      return uniqueUsers.map((userId) => {
         const user = subtasks.find(s => typeof s.assignedId === 'object' && s.assignedId?.id === userId)?.assignedId
         if (!user || typeof user !== 'object') return null

         return {
            value: user.id,
            label: user.firstName || user.lastName ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : user.email || 'Sin nombre',
            image: user.picture || undefined,
            subtitle: user.email
         }
      }).filter(Boolean) as SelectOption[]
   }

   const activeFiltersCount = [typeFilter, statusFilter, priorityFilter, assignedFilter].filter(f => f !== null).length

   const handleOpenFilterModal = () => {
      openModal({
         size: "md",
         title: "Filtrar subtareas",
         desc: "Filtra la lista de subtareas por tipo, estado, prioridad o asignado",
         Icon: <Filter size={20} strokeWidth={1.75} />,
         children: (
            <SubtaskFiltersForm
               initialFilters={{ type: typeFilter, status: statusFilter, priority: priorityFilter, assigned: assignedFilter }}
               typeOptions={getTypeOptions()}
               statusOptions={getStatusOptions()}
               priorityOptions={getPriorityOptions()}
               assignedOptions={getAssignedOptions()}
               onApply={(filters) => {
                  setTypeFilter(filters.type)
                  setStatusFilter(filters.status)
                  setPriorityFilter(filters.priority)
                  setAssignedFilter(filters.assigned)
                  closeModal()
               }}
               onCancel={() => closeModal()}
            />
         ),
         closeOnBackdrop: true,
         closeOnEscape: true,
      })
   }

   // Solo se muestra si la tarea actual no es en sí misma una subtarea
   if (task.parent) return null

   return (
      <div>
         {/* Header */}
         <div className="flex items-center justify-between">
            <button
               type="button"
               onClick={() => setIsSubtasksOpen(!isSubtasksOpen)}
               className="flex items-center gap-1.5 group"
            >
               <div className={`transition-transform duration-200 ${isSubtasksOpen ? 'rotate-90' : ''}`} style={{ color: "var(--ds-text-muted)" }}>
                  <ChevronRight size={16} strokeWidth={2} />
               </div>
               <h3 className="text-sm font-semibold" style={{ color: "var(--ds-text)" }}>
                  Subtareas
               </h3>
               <span className="text-xs" style={{ color: "var(--ds-text-muted)" }}>
                  {filteredSubtasks.length}
               </span>
            </button>
            <div className="flex items-center gap-0.5">
               <IconButton onClick={handleOpenFilterModal} title="Filtrar subtareas" active={activeFiltersCount > 0}>
                  <Filter size={15} strokeWidth={1.5} />
                  {activeFiltersCount > 0 && (
                     <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 flex items-center justify-center rounded-full text-[9px] font-bold" style={{ background: "var(--blue-700)", color: "var(--ds-contrast-inverse)" }}>
                        {activeFiltersCount}
                     </span>
                  )}
               </IconButton>
               <IconButton onClick={handleOpenCreateSubtaskModal} title="Añadir subtarea">
                  <Plus size={16} strokeWidth={1.75} />
               </IconButton>
            </div>
         </div>

         {isSubtasksOpen && (
            <div className="mt-2">
               {loadingSubtasks ? (
                  <div className="py-3 text-sm" style={{ color: "var(--ds-text-muted)" }}>Cargando subtareas...</div>
               ) : (
                  <>
                     {/* Lista de subtareas */}
                     {filteredSubtasks.length > 0 ? (
                        <div>
                           {filteredSubtasks.map((subtask) => {
                              const type = getTypeStyle(subtask.type)
                              const status = getStatusStyle(subtask.status)
                              const priority = getPriorityStyle(subtask.priority)
                              const assignedUser = typeof subtask.assignedId === 'object' ? subtask.assignedId : null

                              return (
                                 <Link
                                    key={subtask.id}
                                    href={`/tableros/${task.projectId}/${subtask.id}`}
                                    target="_blank"
                                    className="flex items-center gap-2.5 -mx-2 px-2 py-1.5 rounded-md transition-colors hover:bg-[var(--gray-alpha-100)] group"
                                 >
                                    <span
                                       className="w-2 h-2 rounded-full flex-shrink-0"
                                       style={{ background: type?.color ?? "#6B7280" }}
                                       title={type?.name ?? "Sin tipo"}
                                    />
                                    <span className="flex-1 min-w-0 truncate text-sm" style={{ color: "var(--ds-text)" }} title={subtask.title}>
                                       {subtask.title}
                                    </span>
                                    <span
                                       className="flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap"
                                       style={{ backgroundColor: `${status?.color ?? "#6B7280"}15`, color: status?.color ?? "#6B7280" }}
                                    >
                                       {status?.name ?? "Sin estado"}
                                    </span>
                                    <span
                                       className="flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap hidden sm:inline-block"
                                       style={{ backgroundColor: `${priority?.color ?? "#6B7280"}15`, color: priority?.color ?? "#6B7280" }}
                                    >
                                       {priority?.name ?? "Sin prioridad"}
                                    </span>
                                    <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: "var(--gray-alpha-200)" }} title={assignedUser ? `${assignedUser.firstName ?? ''} ${assignedUser.lastName ?? ''}`.trim() || assignedUser.email : 'Sin asignar'}>
                                       {assignedUser ? (
                                          <img
                                             src={getUserAvatar({
                                                picture: assignedUser.picture || undefined,
                                                firstName: assignedUser.firstName || undefined,
                                                lastName: assignedUser.lastName || undefined,
                                                email: assignedUser.email || undefined
                                             }, 20)}
                                             alt=""
                                             className="w-full h-full object-cover"
                                          />
                                       ) : null}
                                    </div>
                                    <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button
                                          onClick={(e) => {
                                             e.preventDefault()
                                             e.stopPropagation()
                                             if (subtask.id) handleHistorySubtask(subtask.id)
                                          }}
                                          className="p-1 rounded-md transition-colors text-[var(--ds-text-muted)] hover:bg-[var(--gray-alpha-200)] hover:text-[var(--purple-700)]"
                                          title="Historial"
                                       >
                                          <Clock size={14} strokeWidth={1.5} />
                                       </button>
                                       <button
                                          onClick={(e) => {
                                             e.preventDefault()
                                             e.stopPropagation()
                                             if (subtask.id) handleDeleteSubtask(subtask.id)
                                          }}
                                          className="p-1 rounded-md transition-colors text-[var(--ds-text-muted)] hover:bg-[var(--red-100)] hover:text-[var(--red-700)]"
                                          title="Eliminar"
                                       >
                                          <Trash2 size={14} strokeWidth={1.5} />
                                       </button>
                                    </div>
                                 </Link>
                              )
                           })}
                        </div>
                     ) : (
                        <p className="text-sm py-2" style={{ color: "var(--ds-text-muted)" }}>
                           {subtasks.length === 0 ? 'No hay subtareas' : 'Ninguna subtarea coincide con los filtros'}
                        </p>
                     )}
                  </>
               )}
            </div>
         )}
      </div>
   )
}
