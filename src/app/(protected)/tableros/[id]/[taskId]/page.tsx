'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store/AuthStore'
import { useIssueStore } from '@/lib/store/IssueStore'
import { ChevronRight, Pencil } from 'lucide-react'
import ShowComments from '@/components/partials/comments/ShowComments'
import { useCommentStore } from '@/lib/store/CommentStore'
import { useBoardStore } from '@/lib/store/BoardStore'
import { useConfigStore } from '@/lib/store/ConfigStore'
import CreateTaskForm from '@/components/partials/issues/CreateTaskForm'
import Link from 'next/link'
import { useModalStore } from '@/lib/hooks/ModalStore'
import TaskDescriptionSection from '@/components/partials/issues/TaskDescriptionSection'
import TaskSubtasksSection from '@/components/partials/issues/TaskSubtasksSection'
import TaskDetailsSidebar from '@/components/partials/issues/TaskDetailsSidebar'

export default function TaskDetailsPage() {
    const { getValidAccessToken } = useAuthStore()
    const { comments, getComments } = useCommentStore()
    const { selectedBoard, getBoard } = useBoardStore()
    const { selectedIssue, getSpecificIssue, updateIssue } = useIssueStore()
    const { projectConfig, setProjectConfig } = useConfigStore()
    const [loading, setLoading] = useState(true)
    const [isSidebarVisible, setIsSidebarVisible] = useState(true)
    const { id: boardId, taskId } = useParams()
    const { openModal, closeModal } = useModalStore()

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
    }, [boardId, taskId, getValidAccessToken, getBoard, getComments, getSpecificIssue, setProjectConfig, selectedBoard, projectConfig])

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

    const handleUpdateBoardModal = () => {
        openModal({
            size: "lg",
            title: "Editar Tarea",
            desc: "Modifica los detalles de la tarea",
            Icon: <Pencil size={20} strokeWidth={1.75} />,
            children: <CreateTaskForm onSubmit={handleUpdate} onCancel={() => closeModal()} taskObject={selectedIssue || undefined} isEdit={true} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "UPDATE"
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div style={{ color: "var(--ds-text-secondary)" }}>Cargando tarea...</div>
            </div>
        )
    }

    if (!selectedIssue) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div style={{ color: "var(--ds-text-secondary)" }}>Tarea no encontrada</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full" style={{ color: "var(--ds-text)" }}>
            {/* Header con botón de regreso */}
            <div className="flex-shrink-0 flex justify-between items-center flex-wrap gap-2 mb-4">
                <Link
                    href={selectedIssue?.parent?.id ? `/tableros/${boardId}/${selectedIssue.parent.id}` : `/tableros/${boardId}`}
                    className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--ds-text)]"
                    style={{ color: "var(--ds-text-secondary)" }}
                >
                    <div className="transform rotate-180">
                        <ChevronRight size={18} strokeWidth={1.5} />
                    </div>
                    <span>{selectedIssue?.parent ? 'Volver a tarea padre' : 'Volver al tablero'}</span>
                </Link>

                <button
                    onClick={() => handleUpdateBoardModal()}
                    className="flex items-center gap-2 text-sm font-medium transition-colors hover:bg-[var(--gray-alpha-100)] rounded-md px-3 py-1.5"
                    style={{ color: "var(--ds-text)" }}
                >
                    <Pencil size={16} strokeWidth={1.5} />
                    <span>Editar tarea</span>
                </button>
            </div>

            {/* Título de la tarea */}
            <h1 className="flex-shrink-0 font-semibold truncate mb-4" style={{ fontSize: 24, letterSpacing: "-0.96px", color: "var(--ds-text)" }}>
                {selectedIssue.title}
            </h1>

            {/* Contenido principal con scroll independiente */}
            <div className="flex-1 min-h-0">
                <div className="flex flex-col lg:flex-row items-stretch h-full gap-4">
                    {/* Contenido principal - con scroll único para descripciones y comentarios */}
                    <div className={`flex-1 overflow-y-auto ${isSidebarVisible ? 'pr-2' : 'pr-0'}`}>
                        <div className="flex flex-col min-h-full pb-4">
                            <div className="flex-1">
                                <TaskDescriptionSection task={selectedIssue} />
                            </div>
                            <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--ds-border)" }}>
                                <TaskSubtasksSection task={selectedIssue} />
                            </div>
                            <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--ds-border)" }}>
                                <ShowComments arrayComments={comments} task={selectedIssue} />
                            </div>
                        </div>
                    </div>

                    {/* Divider Line with Toggle Button - solo aplica en el layout de dos columnas (lg+) */}
                    <div
                        className="hidden lg:flex relative items-start justify-center group cursor-pointer flex-shrink-0"
                        onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                    >
                        <div className="w-px h-full absolute top-0 bg-[var(--ds-border)]" />
                        <div className="sticky top-0 flex items-center justify-center w-6 h-8 rounded-md border transition-all duration-200 bg-[var(--ds-card)] border-[var(--ds-border)] shadow-[var(--shadow-border)] group-hover:bg-[var(--gray-alpha-100)] group-hover:border-[var(--ds-border-strong)]">
                            <div className={`transition-all duration-300 text-[var(--ds-text-muted)] group-hover:text-[var(--ds-text-secondary)] ${isSidebarVisible ? 'transform' : 'transform rotate-180'}`}>
                                <ChevronRight size={14} strokeWidth={2} />
                            </div>
                        </div>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs px-2 py-1 rounded-md shadow-[var(--shadow-lg)] whitespace-nowrap pointer-events-none bg-[var(--gray-1000)] text-[var(--ds-contrast-inverse)]">
                            {isSidebarVisible ? 'Ocultar panel' : 'Mostrar panel'}
                        </div>
                    </div>

                    {/* Sidebar - con scroll independiente. El colapso solo aplica en el layout de dos columnas (lg+); en mobile siempre se muestra apilado debajo */}
                    <div className={`w-full flex-shrink-0 transition-all duration-300 ease-in-out lg:overflow-hidden ${isSidebarVisible ? 'lg:w-80 lg:opacity-100' : 'lg:w-0 lg:opacity-0'}`}>
                        <div className={`lg:h-full overflow-y-auto pb-4 ${isSidebarVisible ? 'lg:pl-2' : 'lg:pl-0'}`}>
                            <TaskDetailsSidebar task={selectedIssue} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
