'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/AuthStore'
import { useIssueStore } from '@/lib/store/IssueStore'
import { CalendarIcon, ClockIcon, UsersIcon, ChevronRightIcon, EditIcon, DownloadIcon } from '@/assets/Icon'
import ShowComments from '@/components/partials/comments/ShowComments'
import { useCommentStore } from '@/lib/store/CommentStore'
import { useBoardStore } from '@/lib/store/BoardStore'
import { useConfigStore } from '@/lib/store/ConfigStore'
import CreateTaskForm from '@/components/partials/issues/CreateTaskForm'
import Link from 'next/link'
import Image from 'next/image'
import { useModalStore } from '@/lib/hooks/ModalStore'

export default function TaskDetailsPage() {
    const { getValidAccessToken } = useAuthStore()
    const { comments, getComments } = useCommentStore()
    const { selectedBoard, getBoard } = useBoardStore()
    const { selectedIssue, getSpecificIssue, updateIssue } = useIssueStore()
    const { projectConfig, setProjectConfig } = useConfigStore()
    const [loading, setLoading] = useState(true)
    const [isSidebarVisible, setIsSidebarVisible] = useState(false)
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

                // Cargar la issue específica usando su ID
                await getSpecificIssue(token, taskId as string)

                // Cargar comentarios de la tarea
                await getComments(token, taskId as string)
            }
            setLoading(false)
        }

        loadData()
    }, [boardId, taskId, getValidAccessToken, getBoard, getComments, getSpecificIssue, setProjectConfig, selectedBoard, projectConfig, router])

    const handleGoBack = () => router.push(`/tableros/${boardId}`)

    const handleUpdate = async (formData: {
        descriptions: { id?: string, title: string, text: string }[],
        estimatedTime: number,
        priority: number,
        status: number,
        title: string,
        type: number
    }, filesMap?: Map<string, File[]>) => {
        const token = await getValidAccessToken()
        if (token) {
            await updateIssue(token, formData, filesMap)
            // Recargar la tarea actualizada directamente por su ID
            await getSpecificIssue(token, taskId as string)
        }
        closeModal()
    }

    const { openModal, closeModal } = useModalStore()

    const handleUpdateBoardModal = () => {
        openModal({
            size: "lg",
            title: "Editar Tarea",
            desc: "Modifica los detalles de la tarea",
            Icon: <EditIcon size={20} stroke={1.75} />,
            children: <CreateTaskForm onSubmit={handleUpdate} onCancel={() => closeModal()} taskObject={selectedIssue || undefined} isEdit={true} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            
            mode: "UPDATE"
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Cargando tarea...</div>
            </div>
        )
    }

    if (!selectedIssue) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Tarea no encontrada</div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 flex flex-col overflow-hidden h-[94vh]">
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
                        onClick={() => handleUpdateBoardModal()}
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
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                {selectedIssue.title}
                            </h3>
                            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    Descripciones
                                </h3>
                                <div className="bg-white rounded-lg p-4 border border-gray-100 space-y-1">
                                    {selectedIssue.descriptions.length > 0 ? (
                                        <div className="space-y-4">
                                            {selectedIssue.descriptions.map((desc, id) => (
                                                <div key={id} className="space-y-1">
                                                    <h4 className="font-semibold text-gray-900 text-sm">{desc.title}</h4>
                                                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{desc.text}</p>

                                                    {/* Mostrar imágenes si existen */}
                                                    {desc.attachments && desc.attachments.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            {desc.attachments.map((file) => {
                                                                const fileSplitted = file.fileName.split(".")
                                                                const extension = fileSplitted[fileSplitted.length - 1]
                                                                const isImage = ["jpg", "png", "jpeg", "gif", "bmp", "webp"].includes(extension.toLowerCase())
                                                                const url = file.fileUrl

                                                                return (
                                                                    <div key={file.id} className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-sm transition-all">
                                                                        {isImage && url ? (
                                                                            <Link href={url} target="_blank">
                                                                                <div className="w-16 h-16 relative">
                                                                                    <Image
                                                                                        src={url}
                                                                                        alt={file.fileName}
                                                                                        fill
                                                                                        className="object-cover hover:scale-105 transition-transform"
                                                                                        unoptimized
                                                                                    />
                                                                                </div>
                                                                            </Link>
                                                                        ) : (
                                                                            <Link
                                                                                href={url}
                                                                                target="_blank"
                                                                                className="flex items-center gap-2 p-3 min-w-0 hover:bg-gray-50 transition-colors"
                                                                            >
                                                                                <div className="flex-shrink-0">
                                                                                    <DownloadIcon size={16} stroke={2} />
                                                                                </div>
                                                                                <span className="text-xs text-gray-600 truncate">
                                                                                    {file.fileName}
                                                                                </span>
                                                                            </Link>
                                                                        )}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
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
                                <ShowComments arrayComments={comments} task={selectedIssue} />
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
                                                {typeof selectedIssue.assignedId === 'object'
                                                    ? `${selectedIssue.assignedId.firstName ?? "Sin"} ${selectedIssue.assignedId.lastName ?? "asignar"}`
                                                    : selectedIssue.assignedId || 'No asignado'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="text-sm text-gray-500">Informador:&nbsp;&nbsp;</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {selectedIssue.reporterId ? `${selectedIssue.reporterId.firstName} ${selectedIssue.reporterId.lastName}` : 'No especificado'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Sección de detalles */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-gray-900">Detalles</h3>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="text-sm text-gray-500">Estado:&nbsp;&nbsp;</span>
                                            {(() => {
                                                const status = projectConfig?.issueStatuses?.find((s: { id: number }) => s.id === selectedIssue.status)
                                                return status ? (
                                                    <span 
                                                        className="px-3 py-1 rounded-full text-xs font-medium"
                                                        style={{ 
                                                            backgroundColor: `${status.color}20`,
                                                            color: status.color,
                                                            border: `1px solid ${status.color}40`
                                                        }}
                                                    >
                                                        {status.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm font-medium text-gray-400">No especificado</span>
                                                )
                                            })()}
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="text-sm text-gray-500">Tipo:&nbsp;&nbsp;</span>
                                            {(() => {
                                                const type = projectConfig?.issueTypes?.find((t: { id: number }) => t.id === selectedIssue.type)
                                                return type ? (
                                                    <span 
                                                        className="px-3 py-1 rounded-full text-xs font-medium"
                                                        style={{ 
                                                            backgroundColor: `${type.color}20`,
                                                            color: type.color,
                                                            border: `1px solid ${type.color}40`
                                                        }}
                                                    >
                                                        {type.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm font-medium text-gray-400">No especificado</span>
                                                )
                                            })()}
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="text-sm text-gray-500">Prioridad:&nbsp;&nbsp;</span>
                                            {(() => {
                                                const priority = projectConfig?.issuePriorities?.find((p: { id: number }) => p.id === selectedIssue.priority)
                                                return priority ? (
                                                    <span 
                                                        className="px-3 py-1 rounded-full text-xs font-medium"
                                                        style={{ 
                                                            backgroundColor: `${priority.color}20`,
                                                            color: priority.color,
                                                            border: `1px solid ${priority.color}40`
                                                        }}
                                                    >
                                                        {priority.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm font-medium text-gray-400">No especificado</span>
                                                )
                                            })()}
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
                                                {formatDate(selectedIssue.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="text-sm text-gray-500">Actualización:&nbsp;&nbsp;</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatDate(selectedIssue.updatedAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="text-sm text-gray-500">Fecha de inicio:&nbsp;&nbsp;</span>
                                            <span className="text-sm font-medium text-gray-900">{formatDate(selectedIssue.startDate, false, true)}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="text-sm text-gray-500">Fecha de fin:&nbsp;&nbsp;</span>
                                            <span className="text-sm font-medium text-gray-900">{formatDate(selectedIssue.endDate, false, true)}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="text-sm text-gray-500">Fecha real de finalización:&nbsp;&nbsp;</span>
                                            <span className="text-sm font-medium text-gray-900">{formatDate(selectedIssue.realDate, false, true)}</span>
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
                                                {selectedIssue.estimatedTime ? `${selectedIssue.estimatedTime} horas` : 'No especificado'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

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