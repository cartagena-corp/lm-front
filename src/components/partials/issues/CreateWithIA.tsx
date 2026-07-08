import { Paperclip, Send, X, Pencil, Trash2, Plus } from "lucide-react"
import AutoResizeTextarea from "@/components/ui/AutoResizeTextarea"
import { FormEvent, useState, useEffect, useRef, useMemo, ChangeEvent } from "react"
import { useIssueStore } from "@/lib/store/IssueStore"
import { useParams } from "next/navigation"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useBoardStore } from "@/lib/store/BoardStore"
import { UserProps } from "@/lib/types/types"
import { useModalStore } from "@/lib/hooks/ModalStore"
import ConfirmDeleteTaskWithIA from "./ConfirmDeleteTaskWithIA"
import CustomSelect from "@/components/ui/CustomSelect"
import toast from "react-hot-toast"

interface Message {
    text: string
    isUser: boolean
    isTaskList?: boolean
    preserveFormat?: boolean
    attachedFile?: string
}

interface Description {
    title: string
    text: string
}

interface DetectedTask {
    title: string
    descriptionsDTO: Description[]
    projectId: string
    assignedId: string
    suggestedAssignee?: string // Para guardar el nombre sugerido por la IA
}

interface FormProps {
    onSubmit: (data: DetectedTask[]) => void
    onCancel: () => void
    sprintId?: string // Opcional para asignar tareas creadas con IA a un sprint específico
}

export default function CreateWithIA({ onSubmit, onCancel, sprintId }: FormProps) {
    const params = useParams()
    const { detectIssues, createIssuesFromIA } = useIssueStore()
    const { getValidAccessToken } = useAuthStore()
    const { projectParticipants, getProjectParticipants, selectedBoard } = useBoardStore()
    const { listUsers } = useAuthStore()
    const { openModal, closeModal } = useModalStore()

    // Estados
    const [messages, setMessages] = useState<Message[]>([
        { text: "¡Hola! Soy tu asistente de IA. Puedes enviarme cualquier texto y te ayudaré a convertirlo en tareas.", isUser: false }
    ])

    // Combinar participantes con el creador del proyecto
    const allParticipants = useMemo(() => {
        const participants = [...projectParticipants]

        // Agregar el creador si no está ya en la lista
        if (selectedBoard?.createdBy && !participants.some(p => p.id === selectedBoard.createdBy?.id)) {
            // Buscar el creador en la lista completa de usuarios para obtener su email
            const creatorFromUserList = listUsers.find(user => user.id === selectedBoard.createdBy?.id)

            if (creatorFromUserList) {
                participants.push({
                    ...selectedBoard.createdBy,
                    email: creatorFromUserList.email,
                    role: 'ADMIN'
                })
            }
        }

        return participants
    }, [projectParticipants, selectedBoard?.createdBy, listUsers])

    // Cargar participantes del proyecto al inicio
    useEffect(() => {
        const loadParticipants = async () => {
            const token = await getValidAccessToken()
            if (token) {
                await getProjectParticipants(token, params.id as string)
            }
        }
        loadParticipants()
    }, [])

    const [inputText, setInputText] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [showTaskList, setShowTaskList] = useState(false)
    const [detectedTasks, setDetectedTasks] = useState<DetectedTask[]>([])
    const [editingTask, setEditingTask] = useState<number | null>(null)
    const [isDragActive, setIsDragActive] = useState(false)
    const [attachedFile, setAttachedFile] = useState<File | null>(null)  // Cambiado a un solo archivo
    const [dragCounter, setDragCounter] = useState(0)  // Contador para manejar drag events anidados

    const fileInputRef = useRef<HTMLInputElement | null>(null)

    // Función unificada para detectar issues usando el endpoint unificado
    const detectIssuesUnified = async (token: string, projectId: string, text?: string, file?: File) => {
        try {
            // Usar la función detectIssues del store que ya maneja el endpoint unificado
            const result = await detectIssues(token, projectId, text, file)
            return result
        } catch (error) {
            console.error('Error en detectIssuesUnified:', error)
            throw error
        }
    }

    const handleAttachClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
            fileInputRef.current.click()
        }
    }

    // Maneja el archivo seleccionado - solo lo adjunta, no lo procesa inmediatamente y reemplaza el anterior
    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Reemplazar el archivo anterior con el nuevo
        setAttachedFile(file)
        // No mostrar mensaje en el chat al adjuntar archivo
    }

    const handleSubmit = async () => {
        // Si no hay texto ni archivo adjuntado, no hacer nada
        if (!inputText.trim() && !attachedFile) return
        if (isProcessing) return

        setIsProcessing(true)
        setShowTaskList(false)

        // Guardar referencia al archivo antes de limpiarlo
        const fileToSend = attachedFile

        // Limpiar el archivo adjuntado inmediatamente al enviar
        setAttachedFile(null)

        try {
            const token = await getValidAccessToken()
            if (!token) throw new Error("No se pudo obtener el token de autenticación")

            // Determinar el texto a enviar
            let textToSend = inputText.trim()

            // Si hay archivo adjuntado pero no hay texto, usar mensaje por defecto
            if (fileToSend && !textToSend) {
                textToSend = "Del siguiente archivo, necesito que obtengas todas las tareas posibles"
            }

            // Agregar mensaje del usuario con archivo adjunto si existe
            setMessages(prev => [...prev, {
                text: textToSend,
                isUser: true,
                preserveFormat: true,
                attachedFile: fileToSend ? fileToSend.name : undefined
            }])

            setMessages(prev => [...prev, {
                text: "",
                isUser: false
            }])

            // Usar la función unificada
            const result = await detectIssuesUnified(token, params.id as string, textToSend, fileToSend || undefined)

            // Extraer las tareas de la propiedad 'issues' del resultado
            const issuesFromAPI = result.issues || []

            interface APITask {
                assignedId: string
                [key: string]: any
            }

            const tasksWithEmptyAssignment = issuesFromAPI.map((task: APITask) => ({
                ...task,
                assignedId: "",
                suggestedAssignee: task.assignedId
            }))

            setDetectedTasks(tasksWithEmptyAssignment)

            const taskSummary = tasksWithEmptyAssignment.map((task: DetectedTask) =>
                `• ${task.title} (Sugerido: ${task.suggestedAssignee})`
            ).join('\n')

            setMessages(prev => [
                ...prev.slice(0, -1),
                // Mostrar la respuesta de la IA si existe
                ...(result.response ? [{
                    text: result.response,
                    isUser: false
                }] : []),
                {
                    text: `He detectado ${issuesFromAPI.length} tareas. Debes asignar cada tarea a un usuario del proyecto:`,
                    isUser: false
                },
                {
                    text: taskSummary,
                    isUser: false,
                    isTaskList: true
                },
                {
                    text: "Selecciona un usuario para cada tarea antes de crearlas.",
                    isUser: false
                }
            ])

            setShowTaskList(true)
            setInputText("")
        } catch (error) {
            setMessages(prev => [...prev, {
                text: error instanceof Error ? error.message : "Lo siento, hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.",
                isUser: false
            }])
            setDetectedTasks([])
        } finally {
            setIsProcessing(false)
        }
    }

    const handleEditTask = (index: number) => {
        setEditingTask(index)
    }

    // Función para actualizar una tarea
    const handleUpdateTask = (index: number, field: string, value: string | Description[]) => {
        setDetectedTasks(prev => {
            const newTasks = prev.map((task, i) =>
                i === index ? { ...task, [field]: value } : task
            )
            return newTasks
        })
    }

    // Efecto para monitorear cambios en detectedTasks
    useEffect(() => {
    }, [detectedTasks])

    const handleSaveTasks = async () => {
        if (detectedTasks.length > 0) {
            try {
                const token = await getValidAccessToken()
                if (!token) throw new Error("No se pudo obtener el token de autenticación")

                // Formatear las tareas según la interfaz IssueFromIA
                const formattedTasks = detectedTasks.map(task => ({
                    title: task.title,
                    descriptionsDTO: task.descriptionsDTO,
                    projectId: params.id as string,
                    assignedId: task.assignedId,
                    ...(sprintId && sprintId !== 'null' ? { sprintId } : {}) // Agregar sprintId si se proporciona
                }))

                await createIssuesFromIA(token, formattedTasks)
                onSubmit(detectedTasks)
            } catch (error) {
                setMessages(prev => [...prev, {
                    text: error instanceof Error ? error.message : "Hubo un error al crear las tareas. Por favor, intenta de nuevo.",
                    isUser: false
                }])
            }
        }
    }

    // Función para verificar si una tarea tiene un usuario asignado válido
    const isValidAssignment = (assignedId: string) => {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assignedId)
    }

    // Función para verificar si todas las tareas tienen usuarios asignados válidos
    const areAllTasksAssigned = () => {
        return detectedTasks.every(task => isValidAssignment(task.assignedId))
    }

    // Función para eliminar el archivo adjuntado
    const handleRemoveAttachedFile = () => {
        setAttachedFile(null)
    }

    // Función para eliminar una tarea detectada
    const handleDeleteTask = (index: number) => {
        setDetectedTasks(prev => {
            const newTasks = prev.filter((_, i) => i !== index)
            // Si no quedan tareas, ocultar la lista y mostrar el textarea
            if (newTasks.length === 0) {
                setShowTaskList(false)
            }
            return newTasks
        })

        closeModal()
    }

    // Handler para abrir el modal de confirmación de eliminación
    const handleDeleteTaskModal = (index: number) => {
        const task = detectedTasks[index]
        openModal({
            size: "md",
            children: <ConfirmDeleteTaskWithIA task={task} onSubmit={() => handleDeleteTask(index)} onCancel={() => closeModal()} />,
            closeOnBackdrop: false,
            closeOnEscape: true,
            mode: "DELETE"
        })
    }

    // Maneja el drop de archivos - solo adjunta el primer archivo y reemplaza el anterior
    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(false)
        setDragCounter(0)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const firstFile = e.dataTransfer.files[0]

            // Reemplazar el archivo anterior con el nuevo (solo el primero)
            setAttachedFile(firstFile)
            // No mostrar mensaje en el chat al adjuntar archivo
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragCounter(prev => prev + 1)
        if (!isDragActive) {
            setIsDragActive(true)
        }
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragCounter(prev => {
            const newCounter = prev - 1
            if (newCounter === 0) {
                setIsDragActive(false)
            }
            return newCounter
        })
    }

    return (
        <div className="flex flex-col relative h-full transition-colors"
            style={{ border: isDragActive ? "2px dashed var(--blue-700)" : "2px solid transparent" }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            {isDragActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none" style={{ background: "color-mix(in srgb, var(--blue-100) 92%, transparent)" }}>
                    <span className="mb-4" style={{ color: "var(--blue-700)" }}>
                        <Paperclip size={48} strokeWidth={2} />
                    </span>
                    <span className="text-lg font-semibold" style={{ color: "var(--blue-900)" }}>Suelta aquí para adjuntar archivos</span>
                </div>
            )}
            {/* Content */}
            <section className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] ${message.isUser ? 'flex flex-col items-end gap-1.5' : ''}`}>
                            {/* Badge del archivo adjunto - solo para mensajes del usuario */}
                            {message.isUser && message.attachedFile && (
                                <span className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium" style={{ background: "var(--blue-100)", color: "var(--blue-900)", boxShadow: "0 0 0 1px var(--blue-400)" }}>
                                    <Paperclip size={12} strokeWidth={1.75} />
                                    <span className="truncate max-w-[200px]">{message.attachedFile}</span>
                                </span>
                            )}

                            <div
                                className={`text-sm rounded-md px-4 py-2.5 ${message.isUser
                                    ? 'whitespace-pre-wrap'
                                    : 'flex items-center'
                                    } ${message.isTaskList ? 'font-mono whitespace-pre-wrap' : ''}`}
                                style={message.isUser
                                    ? { background: "var(--gray-alpha-200)", color: "var(--ds-text)" }
                                    : { background: "var(--gray-alpha-100)", color: "var(--ds-text)" }}
                            >
                                {message.text}
                                {/* Loader para el último mensaje de la IA cuando está procesando */}
                                {isProcessing && index === messages.length - 1 && !message.isUser && (
                                    <div className="flex items-center gap-1 scale-50">
                                        <div className="w-2 h-2 rounded-full animate-bounce bg-[var(--gray-700)]" style={{ animationDelay: '000ms' }}></div>
                                        <div className="w-2 h-2 rounded-full animate-bounce bg-[var(--gray-700)]" style={{ animationDelay: '300ms' }}></div>
                                        <div className="w-2 h-2 rounded-full animate-bounce bg-[var(--gray-700)]" style={{ animationDelay: '600ms' }}></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Lista de tareas detectadas */}
                {(showTaskList && detectedTasks.length > 0) && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium" style={{ color: "var(--ds-text)" }}>Tareas Detectadas ({detectedTasks.length})</h4>
                            <span className="text-xs" style={{ color: "var(--ds-text-muted)" }}>Haz clic en el ícono de editar para modificar una tarea</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mb-4">
                            {detectedTasks.map((task, index) => (
                                <div
                                    key={index}
                                    className={`rounded-md border transition-all duration-200 ${editingTask === index
                                        ? 'border-[var(--blue-400)] ring-1 ring-[var(--blue-200)]'
                                        : isValidAssignment(task.assignedId)
                                            ? 'border-[var(--ds-border)]'
                                            : 'border-[var(--amber-400)]'
                                        }`}
                                >
                                    {editingTask === index ? (
                                        <div className="p-4 flex flex-col gap-2">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[13px] font-medium mb-1" style={{ color: "var(--ds-text-secondary)" }}>Título de la tarea</label>
                                                    <input
                                                        type="text"
                                                        value={task.title}
                                                        onChange={(e) => handleUpdateTask(index, 'title', e.target.value)}
                                                        className="text-sm w-full p-2 rounded-md focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                                                        style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    {task.descriptionsDTO.map((desc, descIndex) => (
                                                        <div key={descIndex} className="p-4 rounded-md space-y-2" style={{ background: "var(--gray-alpha-100)" }}>
                                                            <div>
                                                                <label className="block text-[13px] font-medium" style={{ color: "var(--ds-text-secondary)" }}>Título de la sección</label>
                                                                <input
                                                                    type="text"
                                                                    value={desc.title}
                                                                    onChange={(e) => {
                                                                        const newDescriptions = [...task.descriptionsDTO]
                                                                        newDescriptions[descIndex].title = e.target.value
                                                                        handleUpdateTask(index, 'descriptionsDTO', newDescriptions)
                                                                    }}
                                                                    className="text-sm w-full p-2 rounded-md focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                                                                    style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[13px] font-medium" style={{ color: "var(--ds-text-secondary)" }}>Descripción</label>
                                                                <textarea
                                                                    value={desc.text}
                                                                    onChange={(e) => {
                                                                        const newDescriptions = [...task.descriptionsDTO]
                                                                        newDescriptions[descIndex].text = e.target.value
                                                                        handleUpdateTask(index, 'descriptionsDTO', newDescriptions)
                                                                    }}
                                                                    className="text-sm w-full p-2 rounded-md focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                                                                    style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                                                                    rows={3}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Selector de usuario */}
                                                <div>
                                                    <label className="block text-[13px] font-medium mb-1" style={{ color: "var(--ds-text-secondary)" }}>
                                                        Asignar a
                                                        {task.suggestedAssignee && (
                                                            <span className="text-xs ml-2" style={{ color: "var(--ds-text-muted)" }}>
                                                                (Sugerido: {task.suggestedAssignee})
                                                            </span>
                                                        )}
                                                    </label>
                                                    <CustomSelect
                                                        value={task.assignedId || null}
                                                        onChange={(value) => handleUpdateTask(index, 'assignedId', (value as string) || '')}
                                                        options={allParticipants.map(user => ({
                                                            value: user.id,
                                                            label: user.firstName || user.lastName ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : (user.email || 'Sin nombre'),
                                                            image: user.picture || undefined,
                                                            subtitle: user.email
                                                        }))}
                                                        placeholder="Sin asignar"
                                                        variant="user"
                                                    />
                                                    {!task.assignedId && (
                                                        <p className="text-xs mt-1" style={{ color: "var(--ds-warning)" }}>
                                                            * Debes asignar esta tarea a un usuario del proyecto
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex justify-end gap-2 pt-2">
                                                    <button
                                                        onClick={() => setEditingTask(null)}
                                                        className="px-4 py-2 text-sm font-medium transition-colors text-[var(--ds-text-secondary)] hover:text-[var(--ds-text)]"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingTask(null)}
                                                        className="px-4 py-2 text-sm font-medium rounded-md transition-colors bg-[var(--primary-700)] hover:bg-[var(--primary-800)] text-[var(--primary-contrast-fg)]"
                                                    >
                                                        Guardar cambios
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="group">
                                            <div className="p-4 flex flex-col gap-2">
                                                <div className="flex items-start justify-between">
                                                    <h5 className={`font-semibold flex-1 ${!isValidAssignment(task.assignedId) ? 'text-[var(--amber-800)]' : 'text-[var(--ds-text)]'}`}>
                                                        {task.title}
                                                    </h5>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <button
                                                            onClick={() => handleEditTask(index)}
                                                            className="p-1 rounded-md transition-colors text-[var(--ds-text-muted)] hover:text-[var(--ds-text)] hover:bg-[var(--gray-alpha-100)]"
                                                            title="Editar tarea"
                                                        >
                                                            <Pencil size={16} strokeWidth={1.5} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTaskModal(index)}
                                                            className="p-1 rounded-md transition-colors text-[var(--ds-text-muted)] hover:text-[var(--red-700)] hover:bg-[var(--red-100)]"
                                                            title="Eliminar tarea"
                                                        >
                                                            <Trash2 size={16} strokeWidth={1.5} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-3 space-y-3">
                                                    {task.descriptionsDTO.map((desc, descIndex) => (
                                                        <div key={descIndex} className="p-3 rounded-md" style={{ background: "var(--gray-alpha-100)" }}>
                                                            <h6 className="text-sm font-bold" style={{ color: "var(--ds-text)" }}>{desc.title}</h6>
                                                            <p className="text-xs mt-1 whitespace-pre-wrap" style={{ color: "var(--ds-text-secondary)" }}>{desc.text}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-3 flex items-center gap-2 flex-wrap">
                                                    <CustomSelect
                                                        value={task.assignedId || null}
                                                        onChange={(value) => handleUpdateTask(index, 'assignedId', (value as string) || '')}
                                                        options={allParticipants.map(user => ({
                                                            value: user.id,
                                                            label: user.firstName || user.lastName ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : (user.email || 'Sin nombre'),
                                                            image: user.picture || undefined,
                                                            subtitle: user.email
                                                        }))}
                                                        placeholder="Sin asignar"
                                                        variant="user"
                                                        className="w-56 flex-shrink-0"
                                                    />
                                                    {!isValidAssignment(task.assignedId) && (
                                                        <span className="text-xs font-medium" style={{ color: "var(--ds-warning)" }}>
                                                            * Requiere asignación
                                                        </span>
                                                    )}
                                                    {task.suggestedAssignee && !isValidAssignment(task.assignedId) && (
                                                        <span className="text-xs" style={{ color: "var(--ds-text-muted)" }}>
                                                            (Sugerido: {task.suggestedAssignee})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Footer con input o botón de crear */}
            <div className="mt-auto" style={{ borderTop: "1px solid var(--ds-border)" }}>
                {showTaskList ? (
                    <div className="p-6">
                        <button
                            onClick={handleSaveTasks}
                            disabled={isProcessing || !areAllTasksAssigned()}
                            className={`w-full px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed ${!areAllTasksAssigned()
                                ? 'bg-[var(--amber-600)] hover:bg-[var(--amber-700)] disabled:bg-[var(--amber-300)] text-[var(--ds-contrast-inverse)]'
                                : 'bg-[var(--primary-700)] hover:bg-[var(--primary-800)] disabled:bg-[var(--primary-300)] text-[var(--primary-contrast-fg)]'
                                }`}
                        >
                            {!areAllTasksAssigned() ? (
                                <>
                                    <span className="w-2 h-2 bg-[var(--ds-contrast-inverse)] rounded-full animate-pulse"></span>
                                    Asigna todas las tareas para continuar
                                </>
                            ) : (
                                <>
                                    <Plus size={16} strokeWidth={2} />
                                    Crear {detectedTasks.length} Tareas
                                </>
                            )}
                        </button>
                        {!areAllTasksAssigned() && (
                            <p className="text-xs mt-2 text-center" style={{ color: "var(--ds-warning)" }}>
                                Debes asignar un usuario a cada tarea antes de continuar
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-stretch gap-2 p-6">
                        {/* Mostrar archivo adjuntado */}
                        {attachedFile && (
                            <div className="mb-3">
                                <div className="text-xs mb-2" style={{ color: "var(--ds-text-muted)" }}>Archivo adjuntado:</div>
                                <div className="flex items-center justify-between px-3 py-2 rounded-md" style={{ background: "var(--gray-alpha-100)" }}>
                                    <div className="flex items-center gap-2">
                                        <div style={{ color: "var(--ds-text-muted)" }}>
                                            <Paperclip size={14} strokeWidth={1.5} />
                                        </div>
                                        <span className="text-sm truncate" style={{ color: "var(--ds-text-secondary)" }}>{attachedFile.name}</span>
                                        <span className="text-xs" style={{ color: "var(--ds-text-muted)" }}>
                                            ({(attachedFile.size / 1024).toFixed(1)} KB)
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleRemoveAttachedFile}
                                        className="transition-colors p-1 rounded-md text-[var(--ds-text-muted)] hover:text-[var(--red-700)] hover:bg-[var(--red-100)]"
                                        title="Eliminar archivo"
                                        type="button"
                                    >
                                        <X size={14} strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <AutoResizeTextarea
                            className="transition-all max-h-28! w-full p-2.5 text-sm resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-md bg-[var(--ds-card)] text-[var(--ds-text)] shadow-[var(--shadow-border)] placeholder:text-[var(--ds-text-muted)] focus-within:ring-2 focus-within:ring-[var(--blue-700)]"
                            value={inputText}
                            onChange={setInputText}
                            placeholder={attachedFile
                                ? "Escribe tu mensaje o deja vacío para usar el texto por defecto..."
                                : "Puedes pegar transcripciones de reuniones u otros textos para convertirlos automáticamente en tareas."
                            }
                            onPaste={() => { }}
                            disabled={isProcessing}
                        />

                        <div className="flex justify-between items-center">
                            <button
                                className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-150 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                                style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                                onClick={handleAttachClick}
                                type="button"
                                title="Adjuntar archivos"
                                disabled={isProcessing}
                            >
                                <Paperclip size={16} strokeWidth={1.75} />
                                Adjuntar
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".doc,.docx"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={isProcessing}
                            />

                            <button
                                className="flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--primary-700)] hover:bg-[var(--primary-800)] focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                                style={{ color: "var(--primary-contrast-fg)" }}
                                onClick={handleSubmit}
                                type="button"
                                disabled={(!inputText.trim() && !attachedFile) || isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-4 h-4 rounded-full animate-spin border-2 border-t-transparent border-[var(--blue-700)]"></div>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} strokeWidth={2} />
                                        Enviar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals are now managed by the modal store */}
        </div>
    )
}
