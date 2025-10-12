'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useBoardStore } from '@/lib/store/BoardStore'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { useIssueStore } from '@/lib/store/IssueStore'
import { useSprintStore } from '@/lib/store/SprintStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { TaskProps, SprintProps, ConfigProjectStatusProps } from '@/lib/types/types.d'
import {
    DndContext,
    closestCenter,
    pointerWithin,
    rectIntersection,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    useDroppable,
    DragOverEvent,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core'
import {
    useSortable,
    SortableContext,
    verticalListSortingStrategy,
    horizontalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'react-hot-toast'
import { CalendarIcon, MenuIcon, EditIcon, DeleteIcon, PlusIcon, ClockIcon, UsersIcon, EyeIcon } from '@/assets/Icon'
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

interface DraggableIssueProps {
    issue: TaskProps
    isOverlay?: boolean
    isOverTarget?: boolean
    onViewDetails: (issue: TaskProps) => void
    onEdit: (issue: TaskProps) => void
    onReassign: (issue: TaskProps) => void
    onDelete: (issue: TaskProps) => void
    onHistory: (issue: TaskProps) => void
}

function DraggableIssue({ issue, isOverlay = false, isOverTarget = false, onViewDetails, onEdit, onReassign, onDelete, onHistory }: DraggableIssueProps) {
    const { projectConfig } = useConfigStore()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Estado para manejar clicks y drag
    const startPosition = useRef<{ x: number; y: number } | null>(null)
    const lastClickTime = useRef<number>(0)
    const isPointerDown = useRef<boolean>(false)
    const hasMoved = useRef<boolean>(false)

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: issue.id || 'issue' })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

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

    // Custom event handlers para detectar drag vs click
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
            onViewDetails(issue)
            return
        }

        lastClickTime.current = currentTime

        // Siempre llamar al listener original, el sensor se encarga de la distancia
        if (listeners?.onPointerDown) {
            listeners.onPointerDown(event)
        }
    }, [onViewDetails, issue, listeners])

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
                    onViewDetails(issue)
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
    }, [onViewDetails, issue, listeners])

    // Crear listeners personalizados
    const customListeners = {
        ...listeners,
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp
    }

    const getPriorityInfo = (priorityId: number) => {
        const priority = projectConfig?.issuePriorities?.find(p => p.id === priorityId)
        return priority || { name: 'Sin prioridad', color: '#6b7280' }
    }

    const getTypeInfo = (typeId: number) => {
        const type = projectConfig?.issueTypes?.find(t => t.id === typeId)
        return type || { name: 'Sin tipo', color: '#6b7280' }
    }

    const getStatusInfo = (statusId: number) => {
        const status = projectConfig?.issueStatuses?.find(s => s.id === statusId)
        return status || { name: 'Sin estado', color: '#6b7280' }
    }

    const priorityInfo = getPriorityInfo(issue.priority)
    const typeInfo = getTypeInfo(issue.type)
    const statusInfo = getStatusInfo(issue.status)

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...customListeners}
            className={`
        bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-grab relative
        ${isDragging ? 'opacity-50' : ''}
        ${isOverlay ? 'rotate-3 shadow-lg' : ''}
        ${isOverTarget ? 'transform translate-y-2 opacity-75 scale-95' : ''}
      `}
        >
            {/* Header with type and title */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <div
                            className="rounded-full text-[10px] border px-2 whitespace-nowrap w-fit"
                            style={{
                                backgroundColor: `${typeInfo.color}0f`,
                                color: typeInfo.color
                            }}
                        >
                            {typeInfo.name}
                        </div>
                    </div>
                    <span
                        className="text-sm font-medium text-gray-900 line-clamp-1"
                        title={issue.title}
                    >
                        {issue.title}
                    </span>
                </div>

                {/* Actions menu */}
                <div ref={menuRef} className="relative flex-shrink-0 ml-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsMenuOpen(!isMenuOpen)
                        }}
                        onPointerDown={e => e.stopPropagation()}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>

                    {isMenuOpen && (
                        <div
                            className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-[80] overflow-hidden"
                            onPointerDown={e => e.stopPropagation()}
                        >
                            <button
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onViewDetails(issue)
                                    setIsMenuOpen(false)
                                }}
                            >
                                <EyeIcon size={14} />
                                Ver detalles
                            </button>
                            <button
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit(issue)
                                    setIsMenuOpen(false)
                                }}
                            >
                                <EditIcon size={14} />
                                Editar
                            </button>
                            <button
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onHistory(issue)
                                    setIsMenuOpen(false)
                                }}
                            >
                                <ClockIcon size={14} />
                                Historial
                            </button>
                            <div className="border-t border-gray-100"></div>
                            <button
                                className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(issue)
                                    setIsMenuOpen(false)
                                }}
                            >
                                <DeleteIcon size={14} />
                                Eliminar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Priority and Status badges */}
            <div className="flex items-center gap-2 mb-3">
                <div
                    className="px-2 py-1 rounded-full text-xs font-medium border"
                    style={{
                        backgroundColor: `${priorityInfo.color}15`,
                        color: priorityInfo.color,
                        borderColor: `${priorityInfo.color}30`
                    }}
                    title={priorityInfo.name}
                >
                    {priorityInfo.name}
                </div>

                {/* <div
                    className="px-2 py-1 rounded-full text-xs font-medium border"
                    style={{
                        backgroundColor: `${statusInfo.color}15`,
                        color: statusInfo.color,
                        borderColor: `${statusInfo.color}30`
                    }}
                    title={statusInfo.name}
                >
                    <div className="flex items-center gap-1">
                        <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: statusInfo.color }}
                        />
                        {statusInfo.name}
                    </div>
                </div> */}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {issue.descriptions?.[0]?.text || 'Sin descripción'}
            </p>

            {/* Footer with assigned user and date */}
            <div className="flex items-center justify-between gap-1 overflow-hidden">
                {/* Assigned user - clickable to reassign */}
                <button
                    className="flex w-full justify-start items-center gap-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg p-1 transition-colors group"
                    onPointerDown={e => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation()
                        onReassign(issue)
                    }}
                    title="Clic para reasignar"
                >
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {typeof issue.assignedId === 'object' && issue.assignedId ? (
                            <img
                                src={getUserAvatar(issue.assignedId, 20)}
                                alt="Asignado a"
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <UsersIcon size={12} />
                        )}
                    </div>
                    <p className="group-hover:text-blue-600 transition-colors text-start">
                        {typeof issue.assignedId === 'object' && issue.assignedId
                            ? issue.assignedId.firstName === null && issue.assignedId.lastName === null
                                ? issue.assignedId.email || 'Sin asignar'
                                : `${issue.assignedId.firstName || ''} ${issue.assignedId.lastName || ''}`
                            : 'Sin asignar'}
                    </p>
                </button>
                <div className="flex items-center gap-1">
                    <ClockIcon size={14} />
                    <span className="text-xs text-gray-500">
                        {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString('es-ES') : 'Sin fecha'}
                    </span>
                </div>
            </div>
        </div>
    )
}

interface StatusColumnProps {
    status: ConfigProjectStatusProps
    issues: TaskProps[]
    sprintId: string
    activeId: string | null
    overId: string | null
    onViewDetails: (issue: TaskProps) => void
    onEdit: (issue: TaskProps) => void
    onReassign: (issue: TaskProps) => void
    onDelete: (issue: TaskProps) => void
    onHistory: (issue: TaskProps) => void
    onCreateTaskInSprint: (statusId: number) => void
}

function StatusColumn({ status, issues, sprintId, activeId, overId, onViewDetails, onEdit, onReassign, onDelete, onHistory, onCreateTaskInSprint }: StatusColumnProps) {
    const {
        attributes,
        listeners,
        setNodeRef: setSortableNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `status-column-${status.id}`,
        data: {
            type: 'column',
            status
        }
    })

    const { setNodeRef: setDroppableNodeRef } = useDroppable({
        id: `column-${sprintId}-${status.id}`,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    // Verificar si estamos arrastrando una columna sobre esta columna
    const isColumnOverTarget = activeId?.startsWith('status-column-') &&
        overId === `status-column-${status.id}` &&
        activeId !== `status-column-${status.id}`

    return (
        <div
            ref={setSortableNodeRef}
            style={style}
            className={`flex flex-col min-w-80 w-80 flex-shrink-0 transition-all duration-300 ${isDragging ? 'opacity-50' : ''
                } ${isColumnOverTarget ? 'transform scale-95 opacity-75 bg-blue-50 rounded-lg' : ''
                }`}
        >
            <div
                className="flex items-center gap-2 mb-3 cursor-grab active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: status.color }}
                />
                <h4 className="font-medium text-gray-900">{status.name}</h4>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {issues.length}
                </span>
            </div>

            <div
                ref={setDroppableNodeRef}
                className="min-h-[200px] bg-gray-50 rounded-lg p-3 space-y-3 h-full group"
            >
                <SortableContext items={issues.filter(i => i.id).map(i => i.id!)} strategy={verticalListSortingStrategy}>
                    {issues.map((issue) => {
                        // Verificar si estamos arrastrando un issue sobre este issue
                        const isIssueOverTarget = !!(activeId &&
                            !activeId.startsWith('status-column-') &&
                            overId === issue.id &&
                            activeId !== issue.id)

                        return (
                            <DraggableIssue
                                key={issue.id}
                                issue={issue}
                                isOverTarget={isIssueOverTarget}
                                onViewDetails={onViewDetails}
                                onEdit={onEdit}
                                onReassign={onReassign}
                                onDelete={onDelete}
                                onHistory={onHistory}
                            />
                        )
                    })}
                </SortableContext>
                <button
                    className='bg-blue-50 border-blue-200 hover:border-blue-400 text-blue-600 text-sm rounded-lg flex justify-start items-center gap-2 border w-full border-dashed py-2 px-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative opacity-0 group-hover:opacity-100'
                    onClick={() => onCreateTaskInSprint(status.id)}
                    title={`Crear nueva tarea en este sprint con estado "${status.name}"`}
                >
                    <PlusIcon size={16} />
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
    const [userSelected, setUserSelected] = useState<any[]>([]);
    const [isUserOpen, setIsUserOpen] = useState(false);
    const userRef = useRef<HTMLDivElement>(null);
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

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userRef.current && !(userRef.current as HTMLElement).contains(event.target as Node)) {
                setIsUserOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const { projectConfig, addIssueStatus, editIssueStatus, setProjectConfig } = useConfigStore()
    const { updateIssue, deleteIssue, assignIssue, createIssue } = useIssueStore()
    const { updateSprint, deleteSprint } = useSprintStore()
    const { getValidAccessToken } = useAuthStore()
    const { openModal, closeModal } = useModalStore()

    const [selectedStatusForNewTask, setSelectedStatusForNewTask] = useState<number | null>(null)
    const [selectedIssue, setSelectedIssue] = useState<TaskProps | null>(null)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [overId, setOverId] = useState<string | null>(null)
    const [draggedIssue, setDraggedIssue] = useState<TaskProps | null>(null)
    const [draggedColumn, setDraggedColumn] = useState<ConfigProjectStatusProps | null>(null)

    // Estado optimista para los issues
    const [optimisticIssues, setOptimisticIssues] = useState<TaskProps[] | null>(null)

    // Estado optimista para el orden de las columnas
    const [optimisticStatuses, setOptimisticStatuses] = useState<ConfigProjectStatusProps[] | null>(null)

    // Refs para manejar el debounce de actualizaciones al servidor
    const pendingStatusUpdateRef = useRef<{
        timeoutId: NodeJS.Timeout | null,
        statuses: ConfigProjectStatusProps[] | null
    }>({ timeoutId: null, statuses: null })

    // Configuración de sensores personalizados para el drag
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3, // El drag se activa después de mover 3 píxeles
            },
        })
    )

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

    const handleReasignIssue = async ({ newUserId, issueId }: { newUserId: string, issueId: string }) => {
        const token = await getValidAccessToken()
        if (token) await assignIssue(token, issueId, newUserId, selectedIssue?.projectId as string)
        closeModal()
        setSelectedIssue(null)
    }

    const handleDeleteIssue = async () => {
        const token = await getValidAccessToken()
        if (token && selectedIssue) await deleteIssue(token, selectedIssue.id as string, selectedIssue.projectId as string)
        closeModal()
        setSelectedIssue(null)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event
        setOverId(over?.id as string || null)
    }

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const activeId = active.id as string
        setActiveId(activeId)

        // Verificar si es una columna o un issue
        if (activeId.startsWith('status-column-')) {
            // Es una columna
            const statusId = parseInt(activeId.replace('status-column-', ''))
            const status = statuses.find(s => s.id === statusId) as ConfigProjectStatusProps
            if (status) {
                setDraggedColumn(status)
                toast.dismiss()
                toast(
                    `Reordenando columna "${status.name}"`,
                    {
                        icon: '📋',
                        duration: 1500,
                        position: 'bottom-center'
                    }
                )
            }
        } else {
            // Es un issue
            const issue = issues.find(i => i.id === activeId)
            if (issue) {
                setDraggedIssue(issue)

                // Feedback visual opcional: toast de información sobre el drag
                const statusInfo = statuses.find(s => s.id === issue.status)
                toast.dismiss() // Limpiar toasts anteriores
                toast(
                    `Arrastrando tarea desde "${statusInfo?.name || 'Estado actual'}"`,
                    {
                        icon: '🤏',
                        duration: 1500,
                        position: 'bottom-center'
                    }
                )
            }
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)
        setOverId(null)
        setDraggedIssue(null)
        setDraggedColumn(null)

        // Limpiar toasts de drag
        toast.dismiss()

        if (!over) {
            // Drag cancelado
            toast('Movimiento cancelado', {
                icon: '↩️',
                duration: 1000,
                position: 'bottom-center'
            })
            return
        }

        const overId = over.id as string
        const activeId = active.id as string

        // CASO 1: Reordenamiento de columnas
        if (activeId.startsWith('status-column-') && overId.startsWith('status-column-')) {
            await handleColumnReorder(activeId, overId)
            return
        }

        // CASO 2: Movimiento de issue entre columnas o sobre otro issue
        if (!activeId.startsWith('status-column-')) {
            // Si se suelta sobre otro issue, usar la columna de ese issue
            if (overId && !overId.startsWith('column-') && !overId.startsWith('status-column-')) {
                const targetIssue = issues.find(i => i.id === overId)
                if (targetIssue) {
                    const targetColumnId = `column-${spr.id || 'unknown'}-${targetIssue.status}`
                    await handleIssueMove(activeId, targetColumnId)
                    return
                }
            }
            // Si se suelta directamente sobre una columna
            else if (overId && overId.startsWith('column-')) {
                await handleIssueMove(activeId, overId)
                return
            }
        }

        // CASO 3: Otros casos no manejados
        console.warn('Drag operation not handled:', { activeId, overId })
    }

    const handleColumnReorder = async (activeId: string, overId: string) => {
        const activeStatusId = parseInt(activeId.replace('status-column-', ''))
        const overStatusId = parseInt(overId.replace('status-column-', ''))

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

                // Obtener los estados originales para comparar
                const originalStatuses = [...(projectConfig?.issueStatuses || [])].sort((a, b) => {
                    const orderA = (a as ConfigProjectStatusProps).orderIndex ?? 999999
                    const orderB = (b as ConfigProjectStatusProps).orderIndex ?? 999999
                    if (orderA === orderB) {
                        return a.id - b.id
                    }
                    return orderA - orderB
                })

                // Actualizar orderIndex de cada estado que cambió de posición
                for (let i = 0; i < statusesToSync.length; i++) {
                    const status = statusesToSync[i] as ConfigProjectStatusProps
                    const originalStatus = originalStatuses.find(s => s.id === status.id) as ConfigProjectStatusProps | undefined

                    // Solo actualizar si el orderIndex cambió
                    if (!originalStatus || (originalStatus as ConfigProjectStatusProps).orderIndex !== status.orderIndex) {
                        await editIssueStatus(token, spr.projectId, {
                            id: status.id.toString(),
                            name: status.name,
                            color: status.color,
                            orderIndex: status.orderIndex
                        })
                    }
                }

                // Recargar configuración del proyecto para reflejar los cambios del servidor
                await setProjectConfig(spr.projectId, token)

                // Limpiar la referencia
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

    const handleIssueMove = async (activeId: string, overId: string) => {
        // El formato es: column-{sprintId}-{statusId}
        // Como sprintId puede contener guiones, extraemos el statusId desde el final
        const lastDashIndex = overId.lastIndexOf('-')
        const statusId = overId.substring(lastDashIndex + 1)
        const newStatusId = parseInt(statusId)

        // Validar que el newStatusId sea un número válido
        if (isNaN(newStatusId) || newStatusId <= 0) {
            console.error('Invalid status ID:', statusId, newStatusId)
            toast.error('ID de estado inválido')
            return
        }

        const issue = issues.find(i => i.id === activeId)
        if (!issue) {
            console.error('Issue not found:', activeId)
            toast.error('Tarea no encontrada')
            return
        }

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
            i.id === activeId ? { ...i, status: newStatusId } : i
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
                status: selectedStatusForNewTask // Asignar el estado específico de la columna
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

    const handleIssueClick = (issue: TaskProps) => {
        handleTaskDetailsModal(issue)
    }

    const getStatusDates = () => {
        const startDate = spr.startDate ? new Date(spr.startDate) : null
        const endDate = spr.endDate ? new Date(spr.endDate) : null

        if (startDate && endDate) {
            const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
            return `${days} días`
        }
        return 'Sin fechas'
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
            Icon: <EyeIcon size={20} stroke={1.75} />,
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
            Icon: <EditIcon size={20} stroke={1.75} />,
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
                    onSubmit={handleReasignIssue}
                    onCancel={() => closeModal()}
                />
            ),
            Icon: <UsersIcon size={20} stroke={1.75} />,
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
            Icon: <ClockIcon size={20} stroke={1.75} />,
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
                    onSubmit={handleDeleteIssue}
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
            Icon: <PlusIcon size={20} stroke={1.75} />,
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
            Icon: <PlusIcon size={20} stroke={1.75} />,
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
            Icon: <EditIcon size={20} stroke={1.75} />,
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
            Icon: <PlusIcon size={20} stroke={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: true,
            mode: "CREATE"
        })
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Sprint Header */}
            <div className="px-6 pt-4">
                <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex items-center gap-2">
                                <CalendarIcon size={20} />
                                <h3 className="text-lg font-semibold text-gray-900">{spr.title}</h3>
                            </div>
                            {/* <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${spr.status === 1
                                    ? 'bg-green-100 text-green-800'
                                    : spr.status === 2
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {spr.status === 1 ? 'Activo' : spr.status === 2 ? 'Completado' : 'Planificado'}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {issues.length} {issues.length === 1 ? 'tarea' : 'tareas'}
                                </span>
                            </div> */}
                        </div>
                        <div className="flex items-center gap-2">
                            {spr.id === 'null' ? (
                                // Backlog - solo mostrar botón crear tarea
                                <button
                                    onClick={handleCreateTask}
                                    className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
                                >
                                    <PlusIcon size={18} stroke={2.5} />
                                    Crear Tarea
                                </button>
                            ) : (
                                // Sprint normal - mostrar menú de opciones
                                <div className="relative group">
                                    <button className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200">
                                        <MenuIcon size={16} />
                                    </button>
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                        <div className="py-1">
                                            <button
                                                onClick={handleEditSprint}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <EditIcon size={14} />
                                                Editar Sprint
                                            </button>
                                            <button
                                                onClick={handleDeleteSprintModal}
                                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <DeleteIcon size={14} />
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
                        <span className="text-xs text-gray-500">Asignado a:</span>
                        <div className="relative" ref={userRef} style={{ minWidth: 180 }}>
                            <button
                                type="button"
                                className="bg-black/5 hover:bg-black/10 rounded-full pr-2 flex items-center gap-2 w-full group"
                                onClick={() => setIsUserOpen(!isUserOpen)}
                            >
                                {/* Avatar/Count */}
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
                </div>
                {/* <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <ClockIcon size={14} />
                        <span>{getStatusDates()}</span>
                    </div>
                    {spr.startDate && (
                        <span>
                            <b>Inicio:</b> {spr.startDate ? (() => {
                                const [year, month, day] = spr.startDate.split('-').map(num => parseInt(num, 10))
                                const date = new Date(year, month - 1, day)
                                return date.toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                })
                            })() : 'No definida'}
                        </span>
                    )}
                    {spr.endDate && (
                        <span>
                            <b>Fin:</b> {spr.endDate ? (() => {
                                const [year, month, day] = spr.endDate.split('-').map(num => parseInt(num, 10))
                                const date = new Date(year, month - 1, day)
                                return date.toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                })
                            })() : 'No definida'}
                        </span>
                    )}
                </div> */}
            </div>

            {/* Kanban Columns */}
            <div className="p-6">
                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    collisionDetection={pointerWithin}
                >
                    <div className="flex flex-col">
                        <div className="flex justify-between items-center gap-2 mb-4">
                            <button
                                type="button"
                                aria-label="Desplazar a la izquierda"
                                className="p-2 rounded-full bg-white border border-gray-200 shadow hover:bg-gray-100 transition disabled:opacity-50"
                                onClick={() => {
                                    const container = document.getElementById('kanban-scroll-container');
                                    if (container) container.scrollBy({ left: -320, behavior: 'smooth' });
                                }}
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                aria-label="Desplazar a la derecha"
                                className="p-2 rounded-full bg-white border border-gray-200 shadow hover:bg-gray-100 transition disabled:opacity-50"
                                onClick={() => {
                                    const container = document.getElementById('kanban-scroll-container');
                                    if (container) container.scrollBy({ left: 320, behavior: 'smooth' });
                                }}
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>
                        </div>

                        {/* Contenido principal */}
                        <div className="overflow-x-auto" id="kanban-scroll-container">
                            <div className="flex gap-4 min-h-[300px]">
                                <SortableContext items={statuses.map(s => `status-column-${s.id}`)} strategy={horizontalListSortingStrategy}>
                                    {statuses.map((status) => (
                                        <StatusColumn
                                            key={status.id}
                                            status={status}
                                            issues={issuesByStatus[status.id] || []}
                                            sprintId={spr.id || 'unknown'}
                                            activeId={activeId}
                                            overId={overId}
                                            onViewDetails={handleViewDetails}
                                            onEdit={handleEdit}
                                            onReassign={handleReassign}
                                            onDelete={handleDelete}
                                            onHistory={handleHistory}
                                            onCreateTaskInSprint={handleOpenCreateTaskInSprint}
                                        />
                                    ))}
                                </SortableContext>

                                {/* Columna para crear nuevo estado */}
                                <div className="flex flex-col min-w-80 w-80 flex-shrink-0">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                                        <h4 className="font-medium text-gray-500">Nuevo Estado</h4>
                                    </div>

                                    <div className="min-h-[200px] bg-gray-50 rounded-lg flex items-center justify-center h-full">
                                        <button
                                            onClick={handleCreateStatusModal}
                                            className="flex flex-col justify-center items-center gap-2 w-full h-full border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
                                        >
                                            <div className="text-gray-400 group-hover:text-blue-500">
                                                <PlusIcon size={24} />
                                            </div>
                                            <span className="text-sm text-gray-500 group-hover:text-blue-600 font-medium">
                                                Crear Estado
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DragOverlay>
                        {activeId && draggedIssue && !activeId.startsWith('status-column-') && (
                            <DraggableIssue
                                issue={draggedIssue}
                                isOverlay
                                onViewDetails={handleViewDetails}
                                onEdit={handleEdit}
                                onReassign={handleReassign}
                                onDelete={handleDelete}
                                onHistory={handleHistory}
                            />
                        )}
                        {activeId && draggedColumn && activeId.startsWith('status-column-') && (
                            <div className="flex flex-col min-w-80 w-80 flex-shrink-0 bg-white rounded-lg shadow-lg border-2 border-blue-400 opacity-90 rotate-3">
                                <div className="flex items-center gap-2 mb-3 p-4">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: draggedColumn.color }}
                                    />
                                    <h4 className="font-medium text-gray-900">{draggedColumn.name}</h4>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        {issuesByStatus[draggedColumn.id]?.length || 0}
                                    </span>
                                </div>
                                <div className="min-h-[200px] bg-gray-50 rounded-lg p-3 m-4 mt-0">
                                    <div className="text-center text-gray-400 text-sm py-8">
                                        Reordenando columna...
                                    </div>
                                </div>
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    )
}
