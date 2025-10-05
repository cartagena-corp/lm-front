'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/AuthStore'
import { useIssueStore } from '@/lib/store/IssueStore'
import { CalendarIcon, ClockIcon, UsersIcon, ChevronRightIcon, EditIcon } from '@/assets/Icon'
import { TaskProps } from '@/lib/types/types'
import ShowComments from '@/components/partials/comments/ShowComments'
import { useCommentStore } from '@/lib/store/CommentStore'
import { useBoardStore } from '@/lib/store/BoardStore'
import { useConfigStore } from '@/lib/store/ConfigStore'
import Modal from '@/components/layout/Modal'
import CreateTaskForm from '@/components/partials/issues/CreateTaskForm'

export default function TaskDetailsPage() {
    const { getValidAccessToken } = useAuthStore()
    const { comments, getComments } = useCommentStore()
    const { selectedBoard, getBoard } = useBoardStore()
    const { issues, getIssues, updateIssue } = useIssueStore()
    const { projectConfig, setProjectConfig } = useConfigStore()
    const [task, setTask] = useState<TaskProps | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSidebarVisible, setIsSidebarVisible] = useState(false)
    const [isTaskUpdateModalOpen, setIsTaskUpdateModalOpen] = useState(false)
    const router = useRouter()
    const { id: boardId, taskId } = useParams()

    useEffect(() => {
        const loadData = async () => {
            const token = await getValidAccessToken()
            if (token && boardId && taskId) {
                // Cargar el board si no está cargado
                if (!selectedBoard || selectedBoard.id !== boardId) {
                    await getBoard(token, boardId as string)
                }

                // Cargar la configuración del proyecto si no está cargada
                if (!projectConfig || projectConfig.projectId !== boardId) {
                    await setProjectConfig(boardId as string, token)
                }

                // Cargar las issues si no están cargadas o están vacías
                if (!issues.content || issues.content.length === 0) {
                    await getIssues(token, boardId as string, { sprintId: '' })
                }

                // Buscar la tarea en los issues cargados
                const foundTask = issues.content.find((issue: any) => issue.id === taskId && 'title' in issue) as TaskProps
                if (foundTask) {
                    setTask(foundTask)
                    // Cargar comentarios de la tarea
                    await getComments(token, taskId as string)
                }
            }
            setLoading(false)
        }

        loadData()
    }, [boardId, taskId, getValidAccessToken, getBoard, getComments, getIssues, setProjectConfig, selectedBoard, projectConfig, issues, router])

    const handleGoBack = () => {
        router.push(`/tableros/${boardId}`)
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
        if (token) {
            await updateIssue(token, formData)
            // Recargar la tarea actualizada
            await getIssues(token, boardId as string, { sprintId: '' })
            const updatedTask = issues.content.find((issue: any) => issue.id === taskId && 'title' in issue) as TaskProps
            if (updatedTask) {
                setTask(updatedTask)
            }
        }
        setIsTaskUpdateModalOpen(false)
    }

    // Funciones auxiliares para obtener estilos de configuración
    const getStatusStyle = (id: number) => projectConfig?.issueStatuses?.find(status => status.id === id)
    const getPriorityStyle = (id: number) => projectConfig?.issuePriorities?.find(priority => priority.id === id)
    const getTypeStyle = (id: number) => projectConfig?.issueTypes?.find(type => type.id === id)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Cargando tarea...</div>
            </div>
        )
    }

    if (!task) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Tarea no encontrada</div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 flex flex-col overflow-hidden h-screen">
            <div className="mx-auto w-full px-4 flex-shrink-0">
                {/* Header con botón de regreso */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={handleGoBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4 text-sm"
                    >
                        <div className="transform rotate-180">
                            <ChevronRightIcon size={20} />
                        </div>
                        <span>Volver al tablero</span>
                    </button>

                    <button
                        onClick={() => setIsTaskUpdateModalOpen(true)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 mb-4 text-sm"
                    >
                        <span>Editar tarea</span>
                        <EditIcon size={20} />
                    </button>
                </div>
            </div>

            {/* Contenido principal con scroll independiente */}
            <div className="flex flex-col overflow-hidden px-4">
                <div className="flex items-stretch relative gap-6 h-full">
                    {/* Contenido principal - con scroll único para descripciones y comentarios */}
                    <div className={`flex-1 transition-all duration-300 ease-in-out pr-4 h-full overflow-y-auto ${!isSidebarVisible ? 'pr-0' : ''}`}>
                        <div className="flex flex-col space-y-4">
                            {/* Sección de descripción */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    Título
                                </h3>
                                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{task.title}</p>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    Descripciones
                                </h3>
                                <div className="bg-white rounded-lg p-4 border border-gray-100 space-y-1">
                                    {task.descriptions.length > 0 ? (
                                        <div className="space-y-4">
                                            {task.descriptions.map((desc, id) => (
                                                <div key={id} className="space-y-1">
                                                    <h4 className="font-semibold text-gray-900 text-sm">{desc.title}</h4>
                                                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{desc.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center text-gray-500 py-8">
                                            <p className="text-sm">No hay descripción disponible</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sección de comentarios */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                                <ShowComments arrayComments={comments} task={task} />
                            </div>
                        </div>
                    </div>

                    {/* Divider Line with Toggle Button */}
                    <div className="relative flex items-start justify-center group cursor-pointer z-20 pt-8"
                        onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                    >
                        <div className="w-px bg-gray-200 h-full absolute top-0" />
                        <div className="relative flex items-center justify-center w-6 h-8 bg-white border border-gray-200 rounded-md shadow-sm group-hover:bg-gray-50 group-hover:border-gray-300 transition-all duration-200">
                            <div className={`text-gray-400 group-hover:text-gray-600 transition-all duration-300 ${isSidebarVisible ? 'transform' : 'transform rotate-180'}`}>
                                <ChevronRightIcon
                                    size={14}
                                    stroke={2}
                                />
                            </div>
                        </div>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                            {isSidebarVisible ? 'Ocultar panel' : 'Mostrar panel'}
                        </div>
                    </div>

                    {/* Sidebar - con scroll independiente */}
                    <div className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden h-full ${isSidebarVisible ? 'opacity-100' : 'w-0 opacity-0'}`}>
                        <div className={`pl-4 h-full ${isSidebarVisible ? 'block' : 'hidden'}`}>
                            <div className="h-full overflow-y-auto space-y-4 min-w-80">
                                {/* Sección de personas */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                            <UsersIcon size={18} />
                                        </div>
                                        <h3 className="font-semibold text-gray-900">Personas</h3>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="text-sm text-gray-500">Asignado a:&nbsp;&nbsp;</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {typeof task.assignedId === 'object'
                                                    ? `${task.assignedId.firstName ?? "Sin"} ${task.assignedId.lastName ?? "asignar"}`
                                                    : task.assignedId || 'No asignado'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="text-sm text-gray-500">Informador:&nbsp;&nbsp;</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {task.reporterId ? `${task.reporterId.firstName} ${task.reporterId.lastName}` : 'No especificado'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Sección de fechas */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                            <CalendarIcon size={18} />
                                        </div>
                                        <h3 className="font-semibold text-gray-900">Fechas</h3>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="text-sm text-gray-500">Creación:&nbsp;&nbsp;</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatDate(task.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="text-sm text-gray-500">Actualización:&nbsp;&nbsp;</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatDate(task.updatedAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="text-sm text-gray-500">Fecha de inicio:&nbsp;&nbsp;</span>
                                            <span className="text-sm font-medium text-gray-900">{formatDate(task.startDate, false, true)}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="text-sm text-gray-500">Fecha de fin:&nbsp;&nbsp;</span>
                                            <span className="text-sm font-medium text-gray-900">{formatDate(task.endDate, false, true)}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="text-sm text-gray-500">Fecha real de finalización:&nbsp;&nbsp;</span>
                                            <span className="text-sm font-medium text-gray-900">{formatDate(task.realDate, false, true)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Sección de tiempo */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                            <ClockIcon size={18} />
                                        </div>
                                        <h3 className="font-semibold text-gray-900">Tiempo</h3>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="text-sm text-gray-500">Estimado:&nbsp;&nbsp;</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {task.estimatedTime ? `${task.estimatedTime} horas` : 'No especificado'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal para editar tarea */}
            <Modal isOpen={isTaskUpdateModalOpen} customWidth="sm:max-w-4xl" onClose={() => setIsTaskUpdateModalOpen(false)} title={``} showCloseButton={false}>
                <CreateTaskForm
                    onSubmit={handleUpdate}
                    onCancel={() => setIsTaskUpdateModalOpen(false)}
                    taskObject={task || undefined}
                    isEdit={true}
                />
            </Modal>
        </div>
    )
}

// Formatea fechas a formato legible
function formatDate(dateStr?: string, includeTime = false, onlyDate = false): string {
    if (!dateStr) return 'No especificado';
    let date: Date;
    if (dateStr.includes('T')) {
        date = new Date(dateStr);
    } else {
        const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
        date = new Date(year, month - 1, day);
    }
    if (onlyDate) {
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    }
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: includeTime ? '2-digit' : undefined,
        minute: includeTime ? '2-digit' : undefined,
        hour12: includeTime ? true : undefined
    });
}