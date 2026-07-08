'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useBoardStore } from '@/lib/store/BoardStore'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { useIssueStore } from '@/lib/store/IssueStore'
import { useSprintStore } from '@/lib/store/SprintStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { TaskProps, SprintProps, ConfigProjectStatusProps } from '@/lib/types/types.d'
import { toast } from 'react-hot-toast'
import { Calendar, MoreVertical, Pencil, Trash2, Plus, Clock, Users, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { useModalStore } from '@/lib/hooks/ModalStore'
import CreateTaskForm from '../issues/CreateTaskForm'
import TaskDetailsForm from '../issues/TaskDetailsForm'
import DeleteIssueForm from '../issues/DeleteIssueForm'
import CreateSprintForm from './CreateSprintForm'
import DeleteSprintForm from './DeleteSprintForm'
import ReasignIssue from '../issues/ReasignIssue'
import AuditHistory from '../audit/AuditHistory'
import CreateEditStatus from '../config/CreateEditStatus'
import { getUserAvatar } from '@/lib/utils/avatar.utils'
import SafeHtml from '@/components/ui/SafeHtml'
import StatusTimer from '@/components/ui/StatusTimer'
import UserFilterSelect, { FilterUser } from '@/components/ui/UserFilterSelect'

// Ítem que se está arrastrando actualmente en el tablero — issue o columna,
// nunca ambos a la vez (drag-and-drop nativo HTML5, sin librería externa).
type DragPayload =
    | { type: 'issue'; issue: TaskProps }
    | { type: 'column'; status: ConfigProjectStatusProps }

interface DraggableIssueProps {
    issue: TaskProps
    onIssueDragStart: (issue: TaskProps) => void
    onIssueDragEnd: () => void
    onViewDetails: (issue: TaskProps) => void
    onEdit: (issue: TaskProps) => void
    onReassign: (issue: TaskProps) => void
    onDelete: (issue: TaskProps) => void
    onHistory: (issue: TaskProps) => void
}

function DraggableIssue({ issue, onIssueDragStart, onIssueDragEnd, onViewDetails, onEdit, onReassign, onDelete, onHistory }: DraggableIssueProps) {
    const { projectConfig } = useConfigStore()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: PointerEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }
        document.addEventListener('pointerdown', handleClickOutside)
        return () => document.removeEventListener('pointerdown', handleClickOutside)
    }, [])

    const getPriorityInfo = (priorityId: number) => {
        const priority = projectConfig?.issuePriorities?.find(p => p.id === priorityId)
        return priority || { name: 'Sin prioridad', color: '#6b7280' }
    }

    const getTypeInfo = (typeId: number) => {
        const type = projectConfig?.issueTypes?.find(t => t.id === typeId)
        return type || { name: 'Sin tipo', color: '#6b7280' }
    }

    const priorityInfo = getPriorityInfo(issue.priority)
    const typeInfo = getTypeInfo(issue.type)

    return (
        <div
            draggable
            onDragStart={(e) => {
                // No iniciar un drag de la tarjeta si el gesto arrancó sobre un botón
                // (menú de acciones, reasignar) — solo debe comportarse como click.
                if ((e.target as HTMLElement).closest('button')) {
                    e.preventDefault()
                    return
                }
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('text/plain', issue.id || '')
                // Aplicar la atenuación en el siguiente tick: si se aplica en el mismo
                // frame, el navegador la captura en la miniatura ("ghost") del drag.
                setTimeout(() => setIsDragging(true), 0)
                onIssueDragStart(issue)
            }}
            onDragEnd={() => {
                setIsDragging(false)
                onIssueDragEnd()
            }}
            onClick={() => onViewDetails(issue)}
            style={{ background: "var(--ds-card)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-border)" }}
            className={`p-3 transition-shadow duration-150 cursor-grab relative ${isDragging ? 'opacity-50' : ''}`}
        >
            {/* Header with type and title */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex flex-col gap-[6px] flex-1 min-w-0">
                    <span
                        className="font-medium truncate"
                        style={{ fontSize: 13.5, lineHeight: "19px", color: "var(--ds-text)" }}
                        title={issue.title}
                    >
                        {issue.title}
                    </span>
                    <div className="flex items-center gap-2">
                        <span
                            className="inline-flex items-center gap-[5px] whitespace-nowrap w-fit"
                            style={{ height: 20, padding: "0 7px", borderRadius: "var(--radius-sm)", backgroundColor: `${typeInfo.color}1f`, color: typeInfo.color, fontSize: 11, fontWeight: 500 }}
                        >
                            <span style={{ width: 5, height: 5, borderRadius: 9999, background: typeInfo.color }} />
                            {typeInfo.name}
                        </span>
                        <span
                            className="inline-flex items-center gap-[5px] whitespace-nowrap w-fit"
                            style={{ height: 20, padding: "0 7px", borderRadius: "var(--radius-sm)", backgroundColor: `${priorityInfo.color}1f`, color: priorityInfo.color, fontSize: 11, fontWeight: 500 }}
                            title={priorityInfo.name}
                        >
                            <span style={{ width: 5, height: 5, borderRadius: 2, background: priorityInfo.color }} />
                            {priorityInfo.name}
                        </span>
                    </div>
                </div>

                {/* Actions menu */}
                <div ref={menuRef} className="relative flex-shrink-0 ml-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsMenuOpen(!isMenuOpen)
                        }}
                        className="p-1 rounded transition-colors hover:bg-[var(--gray-alpha-100)]"
                        style={{ color: "var(--ds-text-muted)" }}
                    >
                        <MoreVertical size={16} strokeWidth={1.5} />
                    </button>

                    {isMenuOpen && (
                        <div
                            className="absolute top-full right-0 mt-1 w-40 z-[80] overflow-hidden"
                            style={{ background: "var(--ds-card)", border: "1px solid var(--ds-border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)" }}
                        >
                            <button
                                className="w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 hover:bg-[var(--gray-alpha-100)]"
                                style={{ color: "var(--ds-text)" }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onViewDetails(issue)
                                    setIsMenuOpen(false)
                                }}
                            >
                                <Eye size={14} strokeWidth={1.5} />
                                Ver detalles
                            </button>
                            <button
                                className="w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 hover:bg-[var(--gray-alpha-100)]"
                                style={{ color: "var(--ds-text)" }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit(issue)
                                    setIsMenuOpen(false)
                                }}
                            >
                                <Pencil size={14} strokeWidth={1.5} />
                                Editar
                            </button>
                            <button
                                className="w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 hover:bg-[var(--gray-alpha-100)]"
                                style={{ color: "var(--ds-text)" }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onHistory(issue)
                                    setIsMenuOpen(false)
                                }}
                            >
                                <Clock size={14} strokeWidth={1.5} />
                                Historial
                            </button>
                            <div style={{ borderTop: "1px solid var(--ds-border)" }}></div>
                            <button
                                className="w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 hover:bg-[var(--red-100)]"
                                style={{ color: "var(--red-700)" }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(issue)
                                    setIsMenuOpen(false)
                                }}
                            >
                                <Trash2 size={14} strokeWidth={1.5} />
                                Eliminar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Description */}
            <hgroup className="mb-3 line-clamp-4" style={{ fontSize: 12, color: "var(--ds-text-secondary)" }}>
                <SafeHtml
                    html={issue.descriptions?.[0]?.text || 'Sin descripción'}
                    className="leading-relaxed [&_code]:font-mono [&_code]:bg-[var(--gray-alpha-100)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs"
                />
            </hgroup>

            {/* Footer with assigned user and status timer */}
            <div className="flex items-center justify-between gap-1">
                {/* Assigned user - clickable to reassign */}
                <button
                    className="flex min-w-0 flex-1 justify-start items-center gap-1 text-xs rounded-md p-1 transition-colors group hover:bg-[var(--gray-alpha-100)]"
                    style={{ color: "var(--ds-text-secondary)" }}
                    onClick={(e) => {
                        e.stopPropagation()
                        onReassign(issue)
                    }}
                    title="Clic para reasignar"
                >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: "var(--gray-alpha-200)" }}>
                        {typeof issue.assignedId === 'object' && issue.assignedId ? (
                            <img
                                src={getUserAvatar(issue.assignedId, 20)}
                                alt="Asignado a"
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <Users size={12} strokeWidth={1.5} />
                        )}
                    </div>
                    <p className="min-w-0 flex-1 group-hover:text-[var(--blue-900)] transition-colors text-start truncate">
                        {typeof issue.assignedId === 'object' && issue.assignedId
                            ? issue.assignedId.firstName === null && issue.assignedId.lastName === null
                                ? issue.assignedId.email || 'Sin asignar'
                                : `${issue.assignedId.firstName || ''} ${issue.assignedId.lastName || ''}`
                            : 'Sin asignar'}
                    </p>
                </button>
                <StatusTimer lastStatusUpdate={issue.lastStatusUpdate} variant="card" />
            </div>
        </div>
    )
}

interface StatusColumnProps {
    status: ConfigProjectStatusProps
    issues: TaskProps[]
    isDragOverTarget: boolean
    onColumnDragStart: (status: ConfigProjectStatusProps) => void
    onColumnDragEnd: () => void
    onColumnDragOver: (statusId: number) => void
    onColumnDragLeave: () => void
    onColumnDrop: (statusId: number) => void
    onIssueDragStart: (issue: TaskProps) => void
    onIssueDragEnd: () => void
    onViewDetails: (issue: TaskProps) => void
    onEdit: (issue: TaskProps) => void
    onReassign: (issue: TaskProps) => void
    onDelete: (issue: TaskProps) => void
    onHistory: (issue: TaskProps) => void
    onCreateTaskInSprint: (statusId: number) => void
}

function StatusColumn({
    status, issues, isDragOverTarget,
    onColumnDragStart, onColumnDragEnd, onColumnDragOver, onColumnDragLeave, onColumnDrop,
    onIssueDragStart, onIssueDragEnd,
    onViewDetails, onEdit, onReassign, onDelete, onHistory, onCreateTaskInSprint
}: StatusColumnProps) {
    const [isDragging, setIsDragging] = useState(false)

    return (
        <div
            className={`flex flex-col w-[85vw] sm:w-72 md:w-80 flex-shrink-0 transition-all duration-300 ${isDragging ? 'opacity-50' : ''}`}
            onDragOver={(e) => {
                e.preventDefault()
                onColumnDragOver(status.id)
            }}
            onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) onColumnDragLeave()
            }}
            onDrop={(e) => {
                e.preventDefault()
                onColumnDrop(status.id)
            }}
        >
            <div
                draggable
                onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move'
                    e.dataTransfer.setData('text/plain', `status-${status.id}`)
                    setTimeout(() => setIsDragging(true), 0)
                    onColumnDragStart(status)
                }}
                onDragEnd={() => {
                    setIsDragging(false)
                    onColumnDragEnd()
                }}
                className="flex items-center gap-2 mb-3 cursor-grab active:cursor-grabbing px-1"
            >
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: status.color }}
                />
                <h4 className="font-semibold" style={{ fontSize: 13, color: "var(--ds-text)" }}>{status.name}</h4>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ds-text-muted)" }}>
                    {issues.length}
                </span>
            </div>

            <div
                className="min-h-[200px] rounded-lg p-2 space-y-2 h-full group"
                style={{ background: isDragOverTarget ? "var(--blue-100)" : "var(--gray-alpha-100)", border: isDragOverTarget ? "1px dashed var(--blue-600)" : "1px solid transparent" }}
            >
                {issues.map((issue) => (
                    <DraggableIssue
                        key={issue.id}
                        issue={issue}
                        onIssueDragStart={onIssueDragStart}
                        onIssueDragEnd={onIssueDragEnd}
                        onViewDetails={onViewDetails}
                        onEdit={onEdit}
                        onReassign={onReassign}
                        onDelete={onDelete}
                        onHistory={onHistory}
                    />
                ))}
                <button
                    className='text-sm rounded-md flex justify-start items-center gap-2 w-full py-2 px-3 transition-all duration-150 cursor-pointer relative opacity-0 group-hover:opacity-100'
                    style={{ background: "var(--ds-card)", color: "var(--ds-text-secondary)", border: "1px dashed var(--ds-border-strong)" }}
                    onClick={() => onCreateTaskInSprint(status.id)}
                    title={`Crear nueva tarea en este sprint con estado "${status.name}"`}
                >
                    <Plus size={16} strokeWidth={1.5} />
                    <span>Crear tarea</span>
                </button>
            </div>
        </div>
    )
}

export default function SprintKanbanCard({ spr }: { spr: SprintProps }) {
    // --- Filtro de participantes (multi-select) ---
    const { filters, setFilter } = useSprintStore();
    const sprintId = spr.id as string;
    const filter = filters?.[sprintId] || { key: '', value: '' };
    const [userSelected, setUserSelected] = useState<FilterUser[]>([]);
    const { projectParticipants } = useConfigStore();
    const { selectedBoard } = useBoardStore();
    const { listUsers } = useAuthStore();
    const allProjectUsers = useMemo(() => {
        const participants = [...(projectParticipants || [])];
        if (selectedBoard?.createdBy && !participants.some(p => p.id === selectedBoard.createdBy?.id)) {
            const creatorFromUserList = listUsers?.find(user => user.id === selectedBoard.createdBy?.id);
            participants.push({
                id: selectedBoard.createdBy.id,
                firstName: selectedBoard.createdBy.firstName,
                lastName: selectedBoard.createdBy.lastName,
                email: creatorFromUserList?.email || '',
                picture: selectedBoard.createdBy.picture
            });
        }
        return participants;
    }, [projectParticipants, selectedBoard?.createdBy, listUsers]);

    // Sincronizar userSelected con el filtro del sprint al montar/cambiar filtro
    useEffect(() => {
        if (filter && filter.key === 'assignedIds') {
            if (filter.value === '') setUserSelected([]);
            else {
                const ids = filter.value.split(',');
                setUserSelected(allProjectUsers.filter(u => ids.includes(u.id)));
            }
        }
    }, [filter, allProjectUsers]);

    const { projectConfig, addIssueStatus, updateIssueStatusesOrder, updateProjectConfigStatuses } = useConfigStore()
    const { updateIssue, deleteIssue, assignIssue, createIssue } = useIssueStore()
    const { updateSprint, deleteSprint } = useSprintStore()
    const { getValidAccessToken } = useAuthStore()
    const { openModal, closeModal } = useModalStore()

    const [selectedStatusForNewTask, setSelectedStatusForNewTask] = useState<number | null>(null)
    const [selectedIssue, setSelectedIssue] = useState<TaskProps | null>(null)

    // Drag-and-drop nativo: qué se está arrastrando (issue o columna) y sobre
    // qué columna está pasando el cursor ahora mismo.
    const [dragPayload, setDragPayload] = useState<DragPayload | null>(null)
    const [dragOverStatusId, setDragOverStatusId] = useState<number | null>(null)

    // Estado optimista para los issues
    const [optimisticIssues, setOptimisticIssues] = useState<TaskProps[] | null>(null)

    // Estado optimista para el orden de las columnas
    const [optimisticStatuses, setOptimisticStatuses] = useState<ConfigProjectStatusProps[] | null>(null)

    // Refs para manejar el debounce de actualizaciones al servidor
    const pendingStatusUpdateRef = useRef<{
        timeoutId: NodeJS.Timeout | null,
        statuses: ConfigProjectStatusProps[] | null
    }>({ timeoutId: null, statuses: null })

    // Usar issues optimistas si existen, sino usar los del sprint
    let issues = optimisticIssues !== null ? optimisticIssues : (spr.tasks?.content || [])

    // Filtrar issues por participantes seleccionados (assignedIds)
    if (filter && filter.key === 'assignedIds' && filter.value) {
        const assignedIds = filter.value.split(',');
        issues = issues.filter(issue => {
            // Soporta tanto assignedId string como objeto
            if (!issue.assignedId) return false;
            if (typeof issue.assignedId === 'string') return assignedIds.includes(issue.assignedId);
            if (typeof issue.assignedId === 'object' && issue.assignedId.id) return assignedIds.includes(issue.assignedId.id);
            return false;
        });
    }

    // Ordenar los estados por orderIndex, y luego por id si no tienen orderIndex
    // Usar estados optimistas si existen, sino usar los del proyecto
    const statuses = optimisticStatuses !== null
        ? optimisticStatuses
        : [...(projectConfig?.issueStatuses || [])].sort((a, b) => {
            const orderA = (a as ConfigProjectStatusProps).orderIndex ?? 999999
            const orderB = (b as ConfigProjectStatusProps).orderIndex ?? 999999
            if (orderA === orderB) {
                return a.id - b.id
            }
            return orderA - orderB
        })

    // Efecto para limpiar estado optimista cuando cambian los datos del sprint
    useEffect(() => {
        setOptimisticIssues(null)
    }, [spr.tasks?.content])

    // Efecto para limpiar estado optimista de columnas cuando cambian los estados del proyecto
    useEffect(() => {
        setOptimisticStatuses(null)
    }, [projectConfig?.issueStatuses])

    // Efecto de limpieza para cancelar timeouts pendientes
    useEffect(() => {
        return () => {
            // Limpiar timeout pendiente cuando el componente se desmonte
            if (pendingStatusUpdateRef.current.timeoutId) {
                clearTimeout(pendingStatusUpdateRef.current.timeoutId)
            }
        }
    }, [])

    // Group issues by status
    const issuesByStatus = statuses.reduce((acc, status) => {
        acc[status.id] = issues.filter(issue => issue.status === status.id)
        return acc
    }, {} as Record<number, TaskProps[]>)

    // Callback functions for issue actions
    const handleViewDetails = (issue: TaskProps) => {
        handleTaskDetailsModal(issue)
    }

    const handleEdit = (issue: TaskProps) => {
        handleTaskUpdateModal(issue)
    }

    const handleReassign = (issue: TaskProps) => {
        handleReasignModal(issue)
    }

    const handleDelete = (issue: TaskProps) => {
        handleDeleteIssueModal(issue)
    }

    const handleHistory = (issue: TaskProps) => {
        handleHistoryModal(issue)
    }

    // Handler functions for modals
    const handleUpdateIssue = async (formData: {
        descriptions: { id?: string, title: string, text: string }[],
        estimatedTime: number,
        priority: number,
        status: number,
        title: string,
        type: number,
        startDate?: string,
        endDate?: string,
        realDate?: string
    }, filesMap?: Map<string, File[]>) => {
        const token = await getValidAccessToken()
        if (token) await updateIssue(token, formData, filesMap)
        closeModal()
        setSelectedIssue(null)
    }

    const handleReasignIssue = async ({ newUserId, issueId, issue }: { newUserId: string, issueId: string, issue: TaskProps }) => {
        const token = await getValidAccessToken()
        if (!token) {
            toast.error('No se pudo obtener el token de autenticación')
            return
        }

        const toastId = toast.loading('Reasignando tarea...')

        try {
            await assignIssue(token, issueId, newUserId, issue.projectId as string)

            // Verificar si hubo un error en el store
            const storeState = useIssueStore.getState()
            if (storeState.error) {
                throw new Error(storeState.error)
            }

            toast.success('Tarea reasignada exitosamente', { id: toastId })
            closeModal()
            setSelectedIssue(null)
        } catch (error) {
            console.error('Error al reasignar tarea:', error)
            const errorMessage = error instanceof Error ? error.message : 'Error al reasignar la tarea'
            toast.error(errorMessage, { id: toastId })
        }
    }

    const handleDeleteIssue = async (gonnaDelete: boolean, issue?: TaskProps) => {
        if (!gonnaDelete) {
            closeModal()
            setSelectedIssue(null)
            return
        }

        if (!issue) {
            toast.error('No se ha seleccionado ninguna tarea')
            closeModal()
            return
        }

        const token = await getValidAccessToken()
        if (!token) {
            toast.error('No se pudo obtener el token de autenticación')
            return
        }

        const toastId = toast.loading('Eliminando tarea...')

        try {
            await deleteIssue(token, issue.id as string, issue.projectId as string)

            // Verificar si hubo un error en el store
            const storeState = useIssueStore.getState()
            if (storeState.error) {
                throw new Error(storeState.error)
            }

            toast.success('Tarea eliminada exitosamente', { id: toastId })
            closeModal()
            setSelectedIssue(null)
        } catch (error) {
            console.error('Error al eliminar tarea:', error)
            const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la tarea'
            toast.error(errorMessage, { id: toastId })
        }
    }

    // --- Drag and drop nativo (HTML5): issue ---
    const handleIssueDragStart = (issue: TaskProps) => {
        setDragPayload({ type: 'issue', issue })
        const statusInfo = statuses.find(s => s.id === issue.status)
        toast.dismiss()
        toast(
            `Arrastrando tarea desde "${statusInfo?.name || 'Estado actual'}"`,
            { icon: '🤏', duration: 1500, position: 'bottom-center' }
        )
    }

    // --- Drag and drop nativo (HTML5): columna ---
    const handleColumnDragStart = (status: ConfigProjectStatusProps) => {
        setDragPayload({ type: 'column', status })
        toast.dismiss()
        toast(
            `Reordenando columna "${status.name}"`,
            { icon: '📋', duration: 1500, position: 'bottom-center' }
        )
    }

    // Limpieza común al soltar o cancelar cualquier drag
    const handleDragEnd = () => {
        setDragPayload(null)
        setDragOverStatusId(null)
        toast.dismiss()
    }

    const handleColumnDragOver = (statusId: number) => {
        setDragOverStatusId(statusId)
    }

    const handleColumnDragLeave = () => {
        setDragOverStatusId(null)
    }

    const handleColumnDrop = async (targetStatusId: number) => {
        const payload = dragPayload
        handleDragEnd()
        if (!payload) return

        if (payload.type === 'column') {
            await handleColumnReorder(payload.status.id, targetStatusId)
        } else {
            await handleIssueMove(payload.issue, targetStatusId)
        }
    }

    const handleColumnReorder = async (activeStatusId: number, overStatusId: number) => {
        if (activeStatusId === overStatusId) {
            // No hay cambio de posición
            return
        }

        // Reordenar columnas
        const activeIndex = statuses.findIndex(s => s.id === activeStatusId)
        const overIndex = statuses.findIndex(s => s.id === overStatusId)

        if (activeIndex === -1 || overIndex === -1) {
            console.error('Status not found for reordering:', { activeStatusId, overStatusId })
            toast.error('Error: Estado no encontrado')
            return
        }

        // --- OPTIMISTIC UPDATE INSTANTÁNEO ---
        // Crear nueva lista reordenada
        const reorderedStatuses = [...statuses]
        const [movedStatus] = reorderedStatuses.splice(activeIndex, 1)
        reorderedStatuses.splice(overIndex, 0, movedStatus)

        // Actualizar orderIndex en la lista reordenada
        const updatedStatuses = reorderedStatuses.map((status, index) => ({
            ...status,
            orderIndex: index + 1
        }))

        // Aplicar actualización optimista INMEDIATAMENTE sin esperar
        setOptimisticStatuses(updatedStatuses)

        // Cancelar cualquier actualización pendiente anterior
        if (pendingStatusUpdateRef.current.timeoutId) {
            clearTimeout(pendingStatusUpdateRef.current.timeoutId)
        }

        // Guardar los estados actualizados para la sincronización
        pendingStatusUpdateRef.current.statuses = updatedStatuses

        // Programar la sincronización con el backend después de 800ms de inactividad
        pendingStatusUpdateRef.current.timeoutId = setTimeout(async () => {
            const statusesToSync = pendingStatusUpdateRef.current.statuses
            if (!statusesToSync) return

            try {
                const token = await getValidAccessToken()
                if (!token) {
                    throw new Error('No se pudo obtener el token de autenticación')
                }

                // Preparar el array de estados para enviar al backend
                const statusesPayload = statusesToSync.map(status => ({
                    id: status.id,
                    name: status.name,
                    color: status.color,
                    orderIndex: status.orderIndex ?? 1
                }))

                // Enviar todos los estados en una sola petición
                await updateIssueStatusesOrder(token, spr.projectId, statusesPayload)

                // Actualizar el projectConfig localmente con los nuevos estados ordenados
                updateProjectConfigStatuses(statusesToSync)

                // Limpiar el estado optimista y las referencias
                setOptimisticStatuses(null)
                pendingStatusUpdateRef.current.statuses = null
                pendingStatusUpdateRef.current.timeoutId = null

                // Toast de confirmación silenciosa (opcional, se puede omitir)
                toast.success('Orden de columnas sincronizado', {
                    duration: 1500,
                    position: 'bottom-center'
                })

            } catch (error) {
                console.error('Error syncing column order:', error)
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

                // En caso de error, revertir al estado del servidor
                setOptimisticStatuses(null)

                toast.error(`Error al sincronizar orden de columnas: ${errorMessage}`, {
                    duration: 4000,
                    position: 'bottom-center'
                })

                // Limpiar la referencia
                pendingStatusUpdateRef.current.statuses = null
                pendingStatusUpdateRef.current.timeoutId = null
            }
        }, 800) // Esperar 800ms después del último cambio antes de sincronizar
    }

    const handleIssueMove = async (issue: TaskProps, newStatusId: number) => {
        if (issue.status === newStatusId) {
            // No hay cambio de estado
            toast('La tarea ya está en este estado', {
                icon: 'ℹ️',
                duration: 1500,
                position: 'bottom-center'
            })
            return
        }

        const oldStatus = issue.status
        const newStatusInfo = statuses.find(s => s.id === newStatusId)
        const oldStatusInfo = statuses.find(s => s.id === oldStatus)

        // --- OPTIMISTIC UPDATE ---
        const prevIssues = issues.map(i => ({ ...i }))
        const updatedIssues = issues.map(i =>
            i.id === issue.id ? { ...i, status: newStatusId } : i
        )
        setOptimisticIssues(updatedIssues)

        // Mostrar toast de progreso
        const toastId = toast.loading(
            `Moviendo tarea de "${oldStatusInfo?.name || 'Estado anterior'}" a "${newStatusInfo?.name || 'Nuevo estado'}"...`
        )

        try {
            const token = await getValidAccessToken()
            if (!token) {
                throw new Error('No se pudo obtener el token de autenticación')
            }

            // Realizar la actualización en el backend
            const updatePayload = {
                id: issue.id,
                projectId: issue.projectId,
                title: issue.title,
                descriptions: issue.descriptions || [],
                estimatedTime: issue.estimatedTime || 0,
                priority: issue.priority || 1,
                status: newStatusId, // Asegurar que el status sea el nuevo
                type: issue.type || 1,
                startDate: issue.startDate,
                endDate: issue.endDate,
                realDate: issue.realDate
            }

            await updateIssue(token, updatePayload)

            // Éxito: NO limpiar estado optimista inmediatamente
            // Dejar que el useEffect lo limpie cuando lleguen los datos reales del servidor
            toast.success(
                `Tarea movida exitosamente a "${newStatusInfo?.name || 'Nuevo estado'}"`,
                { id: toastId }
            )

        } catch (error) {
            // Error: revertir cambios optimistas y mostrar toast de error
            setOptimisticIssues(prevIssues)
            console.error('Error updating issue status:', error)

            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            toast.error(
                `Error al mover la tarea: ${errorMessage}`,
                { id: toastId }
            )
            // Limpiar el estado optimista después de un tiempo para evitar loops
            setTimeout(() => setOptimisticIssues(null), 2000)
        }
    }

    const handleEditSprint = () => {
        handleEditSprintModal()
    }

    const handleUpdateSprint = async (formData: SprintProps) => {
        const token = await getValidAccessToken()
        if (token) await updateSprint(token, formData, formData.projectId)
        closeModal()
    }

    const handleDeleteSprintModal = () => {
        handleDeleteSprintModalOpen()
    }

    const handleDeleteSprint = async (sprint: SprintProps) => {
        const token = await getValidAccessToken()
        if (token) await deleteSprint(token, sprint.id as string, sprint.projectId)
        closeModal()
    }

    const handleCreateStatus = async (statusData: { name: string, color: string }) => {
        const token = await getValidAccessToken()
        if (token && spr.projectId) {
            await addIssueStatus(token, spr.projectId, statusData)
            closeModal()
        }
    }

    const handleCreateTask = () => {
        handleCreateTaskModal()
    }

    // Función específica para crear tareas dentro del sprint
    const handleCreateTaskInSprint = async (newTask: any, filesMap?: Map<string, File[]>) => {
        const token = await getValidAccessToken()
        if (token) {
            // Agregar el sprintId y status específico a la tarea antes de crearla
            const taskWithSprintAndStatus = {
                ...newTask,
                sprintId: spr.id, // Asignar la tarea al sprint actual
                status: newTask.status || selectedStatusForNewTask // Usar el status del formulario, o el seleccionado como fallback
            }
            await createIssue(token, taskWithSprintAndStatus, filesMap)
        }
        closeModal()
        setSelectedStatusForNewTask(null) // Limpiar el estado seleccionado
    }

    // Nueva función para manejar la apertura del modal con estado específico
    const handleOpenCreateTaskInSprint = (statusId: number) => {
        handleCreateTaskInSprintModal(statusId)
    }

    // Modal handlers
    const handleTaskDetailsModal = (issue: TaskProps) => {
        setSelectedIssue(issue)
        openModal({
            size: "full",
            desc: "Visualiza toda la información de la tarea",
            children: (
                <TaskDetailsForm
                    task={issue}
                    onSubmit={() => closeModal()}
                    onCancel={() => closeModal()}
                />
            ),
            Icon: <Eye size={20} strokeWidth={1.75} />,
            closeOnBackdrop: true,
            closeOnEscape: true,
            mode: "UPDATE"
        })
    }

    const handleTaskUpdateModal = (issue: TaskProps) => {
        setSelectedIssue(issue)
        openModal({
            size: "xl",
            title: "Editar Tarea",
            desc: "Modifica la información de la tarea",
            children: (
                <CreateTaskForm
                    onSubmit={handleUpdateIssue}
                    onCancel={() => closeModal()}
                    taskObject={issue}
                    isEdit={true}
                />
            ),
            Icon: <Pencil size={20} strokeWidth={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: true,
            mode: "UPDATE"
        })
    }

    const handleReasignModal = (issue: TaskProps) => {
        setSelectedIssue(issue)
        openModal({
            size: "lg",
            title: "Reasignar Tarea",
            desc: "Asigna la tarea a otro miembro del equipo",
            children: (
                <ReasignIssue
                    taskObject={issue}
                    onSubmit={({ newUserId, issueId }) => handleReasignIssue({ newUserId, issueId, issue })}
                    onCancel={() => closeModal()}
                />
            ),
            Icon: <Users size={20} strokeWidth={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: true,
            mode: "UPDATE"
        })
    }

    const handleHistoryModal = (issue: TaskProps) => {
        setSelectedIssue(issue)
        openModal({
            size: "xl",
            title: "Historial de Cambios",
            desc: "Revisa todos los cambios realizados en la tarea",
            children: (
                <AuditHistory
                    projectId={issue.projectId}
                    issueId={issue.id as string}
                    currentIssue={issue}
                    onCancel={() => closeModal()}
                />
            ),
            Icon: <Clock size={20} strokeWidth={1.75} />,
            closeOnBackdrop: true,
            closeOnEscape: true,
            mode: "UPDATE"
        })
    }

    const handleDeleteIssueModal = (issue: TaskProps) => {
        setSelectedIssue(issue)
        openModal({
            size: "md",
            children: (
                <DeleteIssueForm
                    onSubmit={(gonnaDelete) => handleDeleteIssue(gonnaDelete, issue)}
                    onCancel={() => closeModal()}
                    taskObject={issue}
                />
            ),
            closeOnBackdrop: false,
            closeOnEscape: true,
            mode: "DELETE"
        })
    }

    const handleCreateTaskModal = () => {
        openModal({
            size: "lg",
            title: "Crear Nueva Tarea",
            desc: "Agrega una nueva tarea al proyecto",
            children: (
                <CreateTaskForm
                    onSubmit={() => closeModal()}
                    onCancel={() => closeModal()}
                />
            ),
            Icon: <Plus size={20} strokeWidth={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: true,
            mode: "CREATE"
        })
    }

    const handleCreateTaskInSprintModal = (statusId: number) => {
        setSelectedStatusForNewTask(statusId)
        openModal({
            size: "lg",
            title: "Crear Tarea en Sprint",
            desc: "Agrega una nueva tarea directamente al sprint con estado específico",
            children: (
                <CreateTaskForm
                    onSubmit={handleCreateTaskInSprint}
                    onCancel={() => {
                        closeModal()
                        setSelectedStatusForNewTask(null)
                    }}
                    taskObject={{
                        id: undefined,
                        title: "",
                        descriptions: [],
                        priority: Number(projectConfig?.issuePriorities?.[0]?.id) || 1,
                        status: statusId,
                        type: Number(projectConfig?.issueTypes?.[0]?.id) || 1,
                        projectId: spr.projectId,
                        assignedId: "",
                        estimatedTime: 0,
                        startDate: '',
                        endDate: '',
                        realDate: '',
                    } as TaskProps}
                    isEdit={false}
                />
            ),
            Icon: <Plus size={20} strokeWidth={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: true,
            mode: "CREATE"
        })
    }

    const handleEditSprintModal = () => {
        openModal({
            size: "lg",
            title: "Editar Sprint",
            desc: "Modifica la información del sprint",
            children: (
                <CreateSprintForm
                    onSubmit={handleUpdateSprint}
                    onCancel={() => closeModal()}
                    currentSprint={spr}
                    isEdit={true}
                />
            ),
            Icon: <Pencil size={20} strokeWidth={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: true,
            mode: "UPDATE"
        })
    }

    const handleDeleteSprintModalOpen = () => {
        openModal({
            size: "md",
            children: (
                <DeleteSprintForm
                    onSubmit={handleDeleteSprint}
                    onCancel={() => closeModal()}
                    sprintObject={spr}
                />
            ),
            closeOnBackdrop: false,
            closeOnEscape: true,
            mode: "DELETE"
        })
    }

    const handleCreateStatusModal = () => {
        openModal({
            size: "lg",
            title: "Crear Nuevo Estado",
            desc: "Define un nuevo estado para las tareas del proyecto",
            children: (
                <CreateEditStatus
                    onSubmit={handleCreateStatus}
                    onCancel={() => closeModal()}
                    currentStatus={{ name: "", color: "#6366f1" }}
                />
            ),
            Icon: <Plus size={20} strokeWidth={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: true,
            mode: "CREATE"
        })
    }

    return (
        <div>
            {/* Sprint Header */}
            <div className="pb-4" style={{ borderBottom: "1px solid var(--ds-border)" }}>
                <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex items-center gap-2" style={{ color: "var(--ds-text)" }}>
                                <Calendar size={20} strokeWidth={1.5} />
                                <h3 className="font-semibold" style={{ fontSize: 18, letterSpacing: "-0.3px", color: "var(--ds-text)" }}>{spr.title}</h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {spr.id === 'null' ? (
                                // Backlog - solo mostrar botón crear tarea
                                <button
                                    onClick={handleCreateTask}
                                    className="flex items-center gap-2 px-[14px] transition-colors hover:bg-[var(--primary-800)] text-sm font-medium bg-[var(--primary-700)]"
                                    style={{ height: 34, color: "var(--primary-contrast-fg)", border: "1px solid var(--primary-700)", borderRadius: "var(--radius-md)" }}
                                >
                                    <Plus size={16} strokeWidth={2.5} />
                                    Crear Tarea
                                </button>
                            ) : (
                                // Sprint normal - mostrar menú de opciones
                                <div className="relative group">
                                    <button className="p-2 rounded-md transition-colors duration-200 hover:bg-[var(--gray-alpha-100)]" style={{ color: "var(--ds-text-muted)" }}>
                                        <MoreVertical size={16} strokeWidth={1.5} />
                                    </button>
                                    <div className="absolute right-0 top-full mt-1 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 overflow-hidden" style={{ background: "var(--ds-card)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", border: "1px solid var(--ds-border)" }}>
                                        <div className="py-1">
                                            <button
                                                onClick={handleEditSprint}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--gray-alpha-100)] transition-colors duration-150 flex items-center gap-2"
                                                style={{ color: "var(--ds-text-secondary)" }}
                                            >
                                                <Pencil size={14} strokeWidth={1.5} />
                                                Editar Sprint
                                            </button>
                                            <button
                                                onClick={handleDeleteSprintModal}
                                                className="w-full text-left px-3 py-2 text-sm text-[var(--red-900)] hover:bg-[var(--red-100)] transition-colors duration-150 flex items-center gap-2"
                                            >
                                                <Trash2 size={14} strokeWidth={1.5} />
                                                Eliminar Sprint
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Filtro de participantes */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: "var(--ds-text-muted)" }}>Asignado a:</span>
                        <UserFilterSelect
                            users={allProjectUsers}
                            selected={userSelected}
                            onChange={newSelected => {
                                setUserSelected(newSelected)
                                setFilter(sprintId, { key: 'assignedIds', value: newSelected.length > 0 ? newSelected.map(u => u.id).join(',') : '' })
                            }}
                            className="w-[180px]"
                        />
                    </div>
                </div>
            </div>

            {/* Kanban Columns */}
            <div className="pt-4">
                <div className="flex flex-col">
                    <div className="flex justify-between items-center gap-2 mb-4">
                        <button
                            type="button"
                            aria-label="Desplazar a la izquierda"
                            className="p-2 rounded-full hover:bg-[var(--gray-alpha-100)] transition-colors duration-150 disabled:opacity-50"
                            style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}
                            onClick={() => {
                                const container = document.getElementById('kanban-scroll-container');
                                if (container) container.scrollBy({ left: -320, behavior: 'smooth' });
                            }}
                        >
                            <ChevronLeft size={20} strokeWidth={2} style={{ color: "var(--ds-text-secondary)" }} />
                        </button>
                        <button
                            type="button"
                            aria-label="Desplazar a la derecha"
                            className="p-2 rounded-full hover:bg-[var(--gray-alpha-100)] transition-colors duration-150 disabled:opacity-50"
                            style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}
                            onClick={() => {
                                const container = document.getElementById('kanban-scroll-container');
                                if (container) container.scrollBy({ left: 320, behavior: 'smooth' });
                            }}
                        >
                            <ChevronRight size={20} strokeWidth={2} style={{ color: "var(--ds-text-secondary)" }} />
                        </button>
                    </div>

                    {/* Contenido principal */}
                    <div className="overflow-x-auto" id="kanban-scroll-container">
                        <div className="flex gap-4 min-h-[300px]">
                            {statuses.map((status) => (
                                <StatusColumn
                                    key={status.id}
                                    status={status}
                                    issues={issuesByStatus[status.id] || []}
                                    isDragOverTarget={dragOverStatusId === status.id}
                                    onColumnDragStart={handleColumnDragStart}
                                    onColumnDragEnd={handleDragEnd}
                                    onColumnDragOver={handleColumnDragOver}
                                    onColumnDragLeave={handleColumnDragLeave}
                                    onColumnDrop={handleColumnDrop}
                                    onIssueDragStart={handleIssueDragStart}
                                    onIssueDragEnd={handleDragEnd}
                                    onViewDetails={handleViewDetails}
                                    onEdit={handleEdit}
                                    onReassign={handleReassign}
                                    onDelete={handleDelete}
                                    onHistory={handleHistory}
                                    onCreateTaskInSprint={handleOpenCreateTaskInSprint}
                                />
                            ))}

                            {/* Columna para crear nuevo estado */}
                            <div className="flex flex-col w-[85vw] sm:w-72 md:w-80 flex-shrink-0">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-3 h-3 rounded-full bg-[var(--gray-alpha-300)]" />
                                    <h4 className="font-medium" style={{ fontSize: 13, color: "var(--ds-text-muted)" }}>Nuevo Estado</h4>
                                </div>

                                <div className="min-h-[200px] rounded-md flex items-center justify-center h-full" style={{ background: "var(--gray-alpha-100)" }}>
                                    <button
                                        onClick={handleCreateStatusModal}
                                        className="flex flex-col justify-center items-center gap-2 w-full h-full border border-dashed rounded-md hover:border-[var(--blue-700)] hover:bg-[var(--blue-100)] border-[var(--ds-border-strong)] transition-all duration-150 group"
                                    >
                                        <div className="text-[var(--ds-text-muted)] group-hover:text-[var(--blue-900)]">
                                            <Plus size={24} strokeWidth={1.5} />
                                        </div>
                                        <span className="text-sm group-hover:text-[var(--blue-900)] font-medium" style={{ color: "var(--ds-text-muted)" }}>
                                            Crear Estado
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


