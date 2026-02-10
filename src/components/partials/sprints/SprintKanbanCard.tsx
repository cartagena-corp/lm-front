'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useBoardStore } from '@/lib/store/BoardStore'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { useIssueStore } from '@/lib/store/IssueStore'
import { useSprintStore } from '@/lib/store/SprintStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { TaskProps, SprintProps, ConfigProjectStatusProps } from '@/lib/types/types.d'
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
import SafeHtml from '@/components/ui/SafeHtml'

interface DraggableIssueProps {
    issue: TaskProps
    isOverlay?: boolean
    onViewDetails: (issue: TaskProps) => void
    onEdit: (issue: TaskProps) => void
    onReassign: (issue: TaskProps) => void
    onDelete: (issue: TaskProps) => void
    onHistory: (issue: TaskProps) => void
    onPointerDown: (e: React.PointerEvent, issue: TaskProps) => void
    isPlaceholder?: boolean
}

function DraggableIssue({
    issue,
    isOverlay = false,
    onViewDetails,
    onEdit,
    onReassign,
    onDelete,
    onHistory,
    onPointerDown,
    isPlaceholder = false
}: DraggableIssueProps) {
    const { projectConfig } = useConfigStore()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
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

    const getStatusInfo = (statusId: number) => {
        const status = projectConfig?.issueStatuses?.find(s => s.id === statusId)
        return status || { name: 'Sin estado', color: '#6b7280' }
    }

    const priorityInfo = getPriorityInfo(issue.priority)
    const typeInfo = getTypeInfo(issue.type)
    const statusInfo = getStatusInfo(issue.status)

    return (
        <div
            id={`issue-${issue.id}`}
            onPointerDown={(e) => onPointerDown(e, issue)}
            className={`
        bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-grab relative select-none touch-none
        ${isPlaceholder ? 'opacity-30 border-dashed border-gray-400 bg-gray-50' : ''}
        ${isOverlay ? 'rotate-3 shadow-2xl scale-105 z-50 cursor-grabbing pointer-events-none' : ''}
      `}
            style={isOverlay ? { width: '300px' } : undefined}
        >
            {/* Header with type and title */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span
                        className="text-sm font-semibold text-gray-900 truncate"
                        title={issue.title}
                    >
                        {issue.title}
                    </span>
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
                        <div
                            className="rounded-full text-[10px] border px-2 whitespace-nowrap w-fit"
                            style={{
                                backgroundColor: `${priorityInfo.color}15`,
                                color: priorityInfo.color,
                            }}
                            title={priorityInfo.name}
                        >
                            {priorityInfo.name}
                        </div>
                    </div>
                </div>

                {/* Actions menu - Prevent pointer down propagation to avoid dragging when clicking menu */}
                <div
                    ref={menuRef}
                    className="relative flex-shrink-0 ml-2"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsMenuOpen(!isMenuOpen)
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>

                    {isMenuOpen && (
                        <div
                            className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-[80] overflow-hidden"
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

            {/* Description */}
            <hgroup className="text-xs text-gray-600 mb-3 line-clamp-4">
                <SafeHtml
                    html={issue.descriptions?.[0]?.text || 'Sin descripción'}
                    className="text-xs text-gray-600 leading-relaxed [&_code]:font-mono [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs"
                />
            </hgroup>

            {/* Footer with assigned user and date */}
            <div className="flex items-center justify-between gap-1 overflow-hidden">
                {/* Assigned user - clickable to reassign */}
                <button
                    className="flex w-full justify-start items-center gap-1 text-xs text-gray-600 hover:bg-gray-50 rounded-lg p-1 transition-colors group"
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
                    <p className="group-hover:text-blue-600 transition-colors text-start whitespace-nowrap overflow-hidden text-ellipsis w-full">
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
    onViewDetails: (issue: TaskProps) => void
    onEdit: (issue: TaskProps) => void
    onReassign: (issue: TaskProps) => void
    onDelete: (issue: TaskProps) => void
    onHistory: (issue: TaskProps) => void
    onCreateTaskInSprint: (statusId: number) => void
    onIssuePointerDown: (e: React.PointerEvent, issue: TaskProps) => void
    onColumnPointerDown: (e: React.PointerEvent, status: ConfigProjectStatusProps) => void
    dropIndicator: { type: 'line' | 'rect'; position: any; targetId: string } | null
    isDraggingIssue: boolean
    draggingId: string | null
    isColumnDropTarget?: boolean
}

function StatusColumn({
    status,
    issues,
    sprintId,
    onViewDetails,
    onEdit,
    onReassign,
    onDelete,
    onHistory,
    onCreateTaskInSprint,
    onIssuePointerDown,
    onColumnPointerDown,
    dropIndicator,
    isDraggingIssue,
    draggingId,
    isColumnDropTarget = false
}: StatusColumnProps) {
    return (
        <div
            id={`column-${status.id}`}
            className={`flex flex-col min-w-80 w-80 flex-shrink-0 transition-all duration-300 border-2 border-transparent ${isColumnDropTarget ? ' border-blue-500! rounded-xl bg-blue-50/50' : ''}`}
        >
            <div
                id={`status-column-${status.id}`}
                className="flex items-center gap-2 mb-3 cursor-grab active:cursor-grabbing select-none hover:bg-gray-50 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                onPointerDown={(e) => onColumnPointerDown(e, status)}
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
                id={`column-droppable-${status.id}`}
                className={`min-h-[200px] bg-gray-50/50 rounded-lg p-3 space-y-3 flex-1 flex flex-col group transition-colors duration-200 border-2 ${isDraggingIssue && dropIndicator?.targetId === `column-${status.id}` ? 'border-blue-200 bg-blue-50/30' : 'border-transparent'
                    }`}
            >
                {issues.map((issue) => {
                    const isPlaceholder = draggingId === issue.id

                    return (
                        <div key={issue.id} className="relative">
                            {/* Blue Line Indicator BEFORE issue */}
                            {isDraggingIssue && dropIndicator && dropIndicator.targetId === issue.id && dropIndicator.position.y < (document.getElementById(`issue-${issue.id}`)?.getBoundingClientRect().top || 0) + (document.getElementById(`issue-${issue.id}`)?.getBoundingClientRect().height || 0) / 2 && (
                                <div className="absolute -top-2 left-0 right-0 h-1 bg-blue-500 rounded-full z-10 pointer-events-none shadow-sm" />
                            )}

                            <DraggableIssue
                                issue={issue}
                                isPlaceholder={isPlaceholder}
                                onViewDetails={onViewDetails}
                                onEdit={onEdit}
                                onReassign={onReassign}
                                onDelete={onDelete}
                                onHistory={onHistory}
                                onPointerDown={onIssuePointerDown}
                            />

                            {/* Blue Line Indicator AFTER issue */}
                            {isDraggingIssue && dropIndicator && dropIndicator.targetId === issue.id && dropIndicator.position.y >= (document.getElementById(`issue-${issue.id}`)?.getBoundingClientRect().top || 0) + (document.getElementById(`issue-${issue.id}`)?.getBoundingClientRect().height || 0) / 2 && (
                                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-blue-500 rounded-full z-10 pointer-events-none shadow-sm" />
                            )}
                        </div>
                    )
                })}

                {/* Empty State Drop Zone */}
                {issues.length === 0 && isDraggingIssue && dropIndicator?.targetId === `column-${status.id}` && (
                    <div className="h-20 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/50 flex items-center justify-center">
                        <span className="text-blue-400 text-sm font-medium">Soltar aquí</span>
                    </div>
                )}

                <button
                    className='bg-white border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-500 text-sm rounded-lg flex justify-start items-center gap-2 border w-full border-dashed py-2 px-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer opacity-70 hover:opacity-100'
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
    const scrollContainerRef = useRef<HTMLDivElement>(null);
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
    const { projectConfig, addIssueStatus, editIssueStatus, updateIssueStatusesOrder, updateProjectConfigStatuses, setProjectConfig } = useConfigStore()
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

    // Native Drag and Drop State
    const [dragState, setDragState] = useState<{
        activeId: string
        type: 'issue' | 'column'
        offset: { x: number; y: number } // Offset from top-left of the dragged item
        currentPos: { x: number; y: number } // Current pointer position
        startPos: { x: number; y: number }
        originalStatusId?: number // For issues
        startHeight?: number
        startWidth?: number
    } | null>(null)

    const [dropIndicator, setDropIndicator] = useState<{
        type: 'line' | 'rect'
        position: { x: number; y: number; width?: number; height?: number }
        targetId: string
    } | null>(null)

    // Refs para manejar el debounce de actualizaciones al servidor
    const pendingStatusUpdateRef = useRef<{
        timeoutId: NodeJS.Timeout | null,
        statuses: ConfigProjectStatusProps[] | null
    }>({ timeoutId: null, statuses: null })

    // Estado para manejar el inicio del drag (evitar overlay en clicks)
    const [pendingDrag, setPendingDrag] = useState<{
        startPos: { x: number; y: number }
        item: TaskProps | ConfigProjectStatusProps
        type: 'issue' | 'column'
        target: HTMLElement
    } | null>(null)

    // Refs to avoid stale closures in event handlers (declared early for use in effects)
    const issuesRef = useRef<TaskProps[]>([])
    const statusesRef = useRef<ConfigProjectStatusProps[]>([])

    // Handler global del Pointer Move
    useEffect(() => {
        const handleGlobalPointerMove = (e: PointerEvent) => {
            // Verificar si debe iniciar el drag desde pending
            if (pendingDrag) {
                const dx = e.clientX - pendingDrag.startPos.x
                const dy = e.clientY - pendingDrag.startPos.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                // Umbral de movimiento de 5px para activar el drag
                if (distance > 5) {
                    const { item, type, target } = pendingDrag
                    const rect = target.getBoundingClientRect()

                    setDragState({
                        activeId: type === 'issue'
                            ? (item as TaskProps).id as string
                            : `status-column-${(item as ConfigProjectStatusProps).id}`,
                        type: type,
                        offset: {
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top
                        },
                        currentPos: { x: e.clientX, y: e.clientY },
                        startPos: pendingDrag.startPos,
                        originalStatusId: type === 'issue' ? (item as TaskProps).status : undefined,
                        startHeight: rect.height,
                        startWidth: rect.width
                    })

                    setPendingDrag(null)
                    document.body.style.userSelect = 'none'
                }
                return
            }

            if (!dragState) return

            setDragState(prev => prev ? { ...prev, currentPos: { x: e.clientX, y: e.clientY } } : null)

            // Logic to find drop target

            const elements = document.elementsFromPoint(e.clientX, e.clientY)

            if (dragState.type === 'issue') {
                const hoveredIssue = elements.find(el => el.id.startsWith('issue-'))
                const hoveredDroppable = elements.find(el => el.id.startsWith('column-droppable-'))

                if (hoveredIssue) {
                    const issueId = hoveredIssue.id.replace('issue-', '')
                    const rect = hoveredIssue.getBoundingClientRect()
                    const midY = rect.top + rect.height / 2

                    setDropIndicator({
                        type: 'line',
                        targetId: issueId,
                        position: {
                            x: rect.left,
                            y: e.clientY < midY ? rect.top : rect.bottom,
                            width: rect.width
                        }
                    })
                } else if (hoveredDroppable) {
                    const columnId = hoveredDroppable.id.replace('column-droppable-', '')
                    setDropIndicator({
                        type: 'rect',
                        targetId: `column-${columnId}`,
                        position: { x: 0, y: 0 }
                    })
                } else {
                    // No valid issue or column target - clear indicator
                    setDropIndicator(null)
                }
            } else if (dragState.type === 'column') {
                // Logic for column dragging
                // Detect either the header specific ID or the general column container
                const targetEl = elements.find(el =>
                    el.id.startsWith('status-column-') ||
                    el.id.startsWith('column-')
                )

                if (targetEl) {
                    let targetStatusIdStr = ''
                    if (targetEl.id.startsWith('status-column-')) {
                        targetStatusIdStr = targetEl.id.replace('status-column-', '')
                    } else if (targetEl.id.startsWith('column-droppable-')) {
                        targetStatusIdStr = targetEl.id.replace('column-droppable-', '')
                    } else if (targetEl.id.startsWith('column-')) {
                        // Careful not to catch column-droppable if it was checked first? 
                        // actually elements.find returns first match.
                        // But 'column-' prefix might match 'column-droppable-' too if we are not careful with strict check or ordering?
                        // startsWith('column-') matches 'column-droppable-...'
                        // So we should handle droppable explicitly or just parse number.
                        // simpler: extract the number from the end.
                        const parts = targetEl.id.split('-')
                        targetStatusIdStr = parts[parts.length - 1]
                    }

                    // Normalize to status-column-ID
                    const targetColumnId = `status-column-${targetStatusIdStr}`

                    // Don't drop on self
                    if (targetColumnId !== dragState.activeId && !isNaN(parseInt(targetStatusIdStr))) {
                        setDropIndicator({
                            type: 'rect',
                            targetId: targetColumnId,
                            position: { x: 0, y: 0 }
                        })
                    } else {
                        // Hovering over self or invalid target - clear indicator
                        setDropIndicator(null)
                    }
                } else {
                    // No valid column target - clear indicator
                    setDropIndicator(null)
                }
            }
        }

        const handleGlobalPointerUp = (e: PointerEvent) => {
            document.body.style.userSelect = ''

            // Calculate distance moved to detect click
            const dx = e.clientX - (dragState?.startPos?.x || 0)
            const dy = e.clientY - (dragState?.startPos?.y || 0)
            const distance = Math.sqrt(dx * dx + dy * dy)

            // If distance is small, treat as click
            if (distance < 5 && dragState?.type === 'issue') {
                const issueId = dragState.activeId
                const issue = issuesRef.current.find(i => i.id === issueId)
                if (issue) {
                    handleIssueClick(issue)
                }
                setDragState(null)
                setDropIndicator(null)
                return
            }

            // If pendingDrag exists on mouse up, it was a CLICK
            if (pendingDrag) {
                if (pendingDrag.type === 'issue') {
                    handleIssueClick(pendingDrag.item as TaskProps)
                }
                setPendingDrag(null)
                document.body.style.userSelect = ''
                return
            }

            // Commit the drop
            if (dropIndicator && dragState) {
                handleNativeDrop(dragState.activeId, dropIndicator)
            }
            setDragState(null)
            setDropIndicator(null)
        }

        window.addEventListener('pointermove', handleGlobalPointerMove)
        window.addEventListener('pointerup', handleGlobalPointerUp)

        return () => {
            window.removeEventListener('pointermove', handleGlobalPointerMove)
            window.removeEventListener('pointerup', handleGlobalPointerUp)
        }
    }, [dragState, dropIndicator, pendingDrag]) // Removed issues from deps - use issuesRef inside

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
    // SOLUCIÓN BUG "SNAP BACK": Solo limpiar si los datos del servidor ya coinciden con los optimistas
    useEffect(() => {
        if (!optimisticIssues) return

        const serverIssues = spr.tasks?.content || []

        // Verificar si todos los issues optimistas modificados ya están sincronizados en el servidor
        let allSynced = true

        // Buscamos discrepancias. Si el servidor tiene un estado DIFERENTE al optimista
        // para un issue que estamos mostrando optimísticamente, entonces NO debemos limpiar todavía
        // (asumiendo que el optimista es la verdad más reciente).
        for (const optIssue of optimisticIssues) {
            const srvIssue = serverIssues.find(i => i.id === optIssue.id)
            // Si el issue existe en el servidor y su estado es diferente al optimista,
            // significa que el servidor aún tiene datos viejos (o alguien más cambió, pero priorizamos local flow)
            if (srvIssue && srvIssue.status !== optIssue.status) {
                allSynced = false
                break
            }
        }

        if (allSynced) {
            setOptimisticIssues(null)
        }
    }, [spr.tasks?.content, optimisticIssues])

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

    // --- Handlers para Native DnD ---
    const handleIssuePointerDown = (e: React.PointerEvent, issue: TaskProps) => {
        // Prevent default to avoid selection
        e.preventDefault()
        e.stopPropagation()

        // Only left click
        if (e.button !== 0) return

        const target = e.currentTarget as HTMLElement
        // No iniciar dragState aquí directamente. Guardar en pendingDrag.
        setPendingDrag({
            startPos: { x: e.clientX, y: e.clientY },
            item: issue,
            type: 'issue',
            target
        })
    }

    const handleColumnPointerDown = (e: React.PointerEvent, status: ConfigProjectStatusProps) => {
        e.preventDefault()
        e.stopPropagation()

        if (e.button !== 0) return

        const target = e.currentTarget as HTMLElement

        // No iniciar dragState aquí directamente. Guardar en pendingDrag.
        setPendingDrag({
            startPos: { x: e.clientX, y: e.clientY },
            item: status,
            type: 'column',
            target
        })
    }

    // Update refs on every render
    useEffect(() => {
        issuesRef.current = issues
        statusesRef.current = statuses
    }, [issues, statuses])

    const handleNativeDrop = async (activeId: string, indicator: NonNullable<typeof dropIndicator>) => {
        document.body.style.userSelect = ''

        const isColumn = activeId.startsWith('status-column-')

        if (isColumn) {
            // Column Reordering
            const activeStatusId = parseInt(activeId.replace('status-column-', ''))
            let targetStatusId = -1

            if (indicator.targetId.startsWith('status-column-')) {
                targetStatusId = parseInt(indicator.targetId.replace('status-column-', ''))
            } else if (indicator.targetId.startsWith('column-')) {
                // Fallback if normalized ID wasn't passed (shouldn' happen with latest move logic)
                targetStatusId = parseInt(indicator.targetId.replace('column-', ''))
            }

            if (!isNaN(targetStatusId) && !isNaN(activeStatusId) && activeStatusId !== targetStatusId) {
                await handleColumnReorder(activeId, indicator.targetId)
            }
            return
        }

        // Issue Drop
        const issueId = activeId
        // Find the issue being dragged using Ref to ensure freshness
        const issue = issuesRef.current.find(i => i.id === issueId)
        if (!issue) return

        if (indicator.type === 'rect') {
            // Dropped on a column (empty or not specific)
            const targetColumnId = indicator.targetId // "column-STATUSID"
            if (targetColumnId.startsWith('column-')) {
                const statusId = parseInt(targetColumnId.replace('column-', ''))

                // If status is different, move it
                if (issue.status !== statusId) {
                    await handleIssueMove(issueId, targetColumnId)
                }
            }
        } else if (indicator.type === 'line') {
            // Dropped relative to another issue
            const targetIssueId = indicator.targetId
            const targetIssue = issuesRef.current.find(i => i.id === targetIssueId)

            if (targetIssue) {
                // Check if same status
                if (targetIssue.status !== issue.status) {
                    const targetColumnId = `column-${spr.id}-${targetIssue.status}`
                    await handleIssueMove(issueId, targetColumnId)
                } else {
                    // Same status reorder - suppressed
                }
            }
        }
    }



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



    const handleColumnReorder = async (activeId: string, overId: string) => {
        const activeStatusId = parseInt(activeId.replace('status-column-', ''))
        const activeStatusIdClean = !isNaN(activeStatusId) ? activeStatusId : -1

        // Handle overId potentially being column-ID or status-column-ID
        let overStatusId = -1
        if (overId.startsWith('status-column-')) {
            overStatusId = parseInt(overId.replace('status-column-', ''))
        } else if (overId.startsWith('column-')) {
            overStatusId = parseInt(overId.replace('column-', ''))
        }

        if (activeStatusIdClean === -1 || overStatusId === -1 || activeStatusIdClean === overStatusId) {
            return
        }

        // Use Ref for statuses to ensure we have the latest list
        const currentStatuses = statusesRef.current

        // Reordenar columnas
        const activeIndex = currentStatuses.findIndex(s => s.id === activeStatusIdClean)
        const overIndex = currentStatuses.findIndex(s => s.id === overStatusId)

        if (activeIndex === -1 || overIndex === -1) {
            // console.error('Status not found for reordering in ref:', { activeStatusIdClean, overStatusId, currentStatuses })
            return
        }

        // --- OPTIMISTIC UPDATE INSTANTÁNEO ---
        // Crear nueva lista reordenada
        const reorderedStatuses = [...currentStatuses]
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
            console.error('Error updating issue status:', error)

            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            toast.error(
                `Error al mover la tarea: ${errorMessage}`,
                { id: toastId }
            )
            // Error real: revertir a los issues previos
            setOptimisticIssues(prevIssues)
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

    function handleIssueClick(issue: TaskProps) {
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
    function handleTaskDetailsModal(issue: TaskProps) {
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
            children: <CreateTaskForm onSubmit={handleUpdateIssue} onCancel={() => closeModal()} taskObject={issue} isEdit={true} />,
            desc: "Modifica la información de la tarea",
            Icon: <EditIcon size={20} stroke={1.75} />,
            closeOnBackdrop: false,
            title: "Editar Tarea",
            closeOnEscape: false,
            mode: "UPDATE",
            size: "md"
        })
    }

    const handleReasignModal = (issue: TaskProps) => {
        setSelectedIssue(issue)
        openModal({
            size: "md",
            title: "Reasignar Tarea",
            desc: "Asigna la tarea a otro miembro del equipo",
            children: (
                <ReasignIssue
                    taskObject={issue}
                    onSubmit={({ newUserId, issueId }) => handleReasignIssue({ newUserId, issueId, issue })}
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
            size: "md",
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
            size: "md",
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Sprint Header */}
            <div className="p-4 pb-0">
                <div className="flex flex-col items-center justify-between gap-2">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-shrink-0">
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
                                        <button className="p-2 hover:bg-gray-50 rounded-md transition-colors duration-200">
                                            <MenuIcon size={16} />
                                        </button>
                                        <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
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
                                )}
                            </div>
                            <h3 className="text-base font-medium text-gray-900 truncate" title={spr.title}>{spr.title}</h3>
                        </div>
                        {/* Filtro de participantes */}
                        {/* <span className="text-xs text-gray-500 whitespace-nowrap">Asignado a:</span> */}
                        <div className="relative" ref={userRef} style={{ minWidth: 180 }}>
                            <button
                                type="button"
                                className="bg-black/5 hover:bg-black/10 rounded-full px-2 flex items-center gap-2 w-full group py-2"
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
                                <div className="absolute z-[9999] top-full right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto overscroll-none min-w-md">
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
                    {/* Controles de desplazamiento horizontal */}
                    <div className="flex items-center justify-between w-full">
                        <button
                            onClick={() => {
                                if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' })
                            }}
                            className="p-1 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 shadow-sm transition-all"
                            title="Desplazar a la izquierda"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        <button
                            onClick={() => {
                                if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' })
                            }}
                            className="p-1 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 shadow-sm transition-all"
                            title="Desplazar a la derecha"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Kanban Columns */}
            <div className="p-4 pt-2 relative">
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 pb-4 overflow-x-auto min-h-[calc(100vh-12rem)] snap-x scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
                >

                    {statuses.map((status) => (
                        <StatusColumn
                            key={status.id}
                            status={status}
                            issues={issuesByStatus[status.id] || []}
                            sprintId={spr.id as string}
                            onViewDetails={handleViewDetails}
                            onEdit={handleEdit}
                            onReassign={handleReassign}
                            onDelete={handleDelete}
                            onHistory={handleHistory}
                            onCreateTaskInSprint={(statusId) => {
                                setSelectedStatusForNewTask(statusId)
                                handleCreateTaskModal()
                            }}
                            onIssuePointerDown={handleIssuePointerDown}
                            onColumnPointerDown={handleColumnPointerDown}
                            dropIndicator={dropIndicator}
                            isDraggingIssue={dragState?.type === 'issue'}
                            draggingId={dragState?.activeId || null}
                            isColumnDropTarget={dragState?.type === 'column' && dropIndicator?.targetId === `status-column-${status.id}`}
                        />
                    ))}

                    {/* Add new status button */}
                    <div className="min-w-[300px] flex-shrink-0 flex items-start justify-center pt-2">
                        <button
                            onClick={() => {
                                handleCreateStatusModal()
                            }}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
                        >
                            <PlusIcon size={20} />
                            <span>Añadir estado</span>
                        </button>
                    </div>
                </div>

                {/* Native Drag Overlay */}
                {dragState && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: dragState.startWidth,
                            height: dragState.startHeight,
                            transform: `translate(${dragState.currentPos.x - dragState.offset.x}px, ${dragState.currentPos.y - dragState.offset.y}px)`,
                            pointerEvents: 'none',
                            zIndex: 9999,
                            opacity: 0.9,
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            transformOrigin: 'top left',
                        }}
                        className="bg-white rounded-lg p-2 border border-blue-200 rotate-3 cursor-grabbing shadow-xl"
                    >
                        {dragState.type === 'issue' && (
                            <div className="text-sm font-medium text-blue-900 truncate flex items-center gap-2 px-2 py-1">
                                <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                                <span>Moviendo tarea</span>
                            </div>
                        )}
                        {dragState.type === 'column' && (
                            <div className="text-sm font-medium text-blue-900 truncate flex items-center gap-2 px-2 py-1 -translate-y-0.5">
                                <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                                <span>Moviendo columna</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
