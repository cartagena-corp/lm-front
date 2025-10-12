import { AttachIcon, IAIcon, SendIcon, XIcon, EditIcon, DeleteIcon, ChatIAIcon } from "@/assets/Icon"
import AutoResizeTextarea from "@/components/ui/AutoResizeTextarea"
import { FormEvent, useState, useEffect, useRef, useMemo, ChangeEvent } from "react"
import { useIssueStore } from "@/lib/store/IssueStore"
import { useParams } from "next/navigation"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useBoardStore } from "@/lib/store/BoardStore"
import { UserProps } from "@/lib/types/types"
import { getUserAvatar } from "@/lib/utils/avatar.utils"
import { useModalStore } from "@/lib/hooks/ModalStore"
import ConfirmDeleteTaskWithIA from "./ConfirmDeleteTaskWithIA"
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

    // Agregar estados para el selector de usuarios
    const [userSelections, setUserSelections] = useState<{ [key: number]: UserProps | null }>({})
    const [openSelectors, setOpenSelectors] = useState<{ [key: number]: boolean }>({})
    const userRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

    // Inicializar userSelections cuando se detectan las tareas
    useEffect(() => {
        const initialSelections: { [key: number]: UserProps | null } = {}
        detectedTasks.forEach((task, index) => {
            // Si ya existe una selección, la mantenemos
            if (userSelections[index]) {
                initialSelections[index] = userSelections[index]
            } else {
                initialSelections[index] = null
            }
        })
        setUserSelections(initialSelections)
    }, [detectedTasks])

    // Effect para manejar clics fuera de los selectores
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            Object.entries(userRefs.current).forEach(([index, ref]) => {
                if (ref && !ref.contains(event.target as Node)) {
                    setOpenSelectors(prev => ({
                        ...prev,
                        [index]: false
                    }))
                }
            })
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Función para actualizar el usuario seleccionado
    const handleUserSelect = (taskIndex: number, user: UserProps) => {
        setDetectedTasks(prev => {
            const newTasks = [...prev]
            newTasks[taskIndex] = {
                ...newTasks[taskIndex],
                assignedId: user.id
            }
            return newTasks
        })

        setUserSelections(prev => ({
            ...prev,
            [taskIndex]: user
        }))

        setOpenSelectors(prev => ({
            ...prev,
            [taskIndex]: false
        }))
    }

    // Función para alternar el selector
    const toggleUserSelector = (index: number) => {
        setOpenSelectors(prev => ({
            ...prev,
            [index]: !prev[index]
        }))
    }

    // Función auxiliar para obtener el nombre de visualización del usuario
    const getUserDisplayName = (user: UserProps | null) => {
        if (!user) return 'Seleccionar usuario'
        if (user.firstName || user.lastName) {
            return `${user.firstName || ''} ${user.lastName || ''}`.trim()
        }
        return user.email
    }

    // Función auxiliar para obtener la inicial del usuario
    const getUserInitial = (user: UserProps) => {
        if (user.firstName) return user.firstName[0].toUpperCase()
        if (user.lastName) return user.lastName[0].toUpperCase()
        if (user.email) return user.email[0].toUpperCase()
        return '?'
    }

    // Función para verificar si un usuario está seleccionado
    const isUserSelected = (user: UserProps, taskIndex: number) => {
        // Verificar tanto en userSelections como en detectedTasks
        const selectedUser = userSelections[taskIndex]
        const taskAssignedId = detectedTasks[taskIndex]?.assignedId

        if (!user || !user.id) return false

        return user.id === selectedUser?.id || user.id === taskAssignedId
    }

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

    // Función para obtener el usuario seleccionado actual
    const getCurrentSelection = (taskIndex: number) => {
        return userSelections[taskIndex] || null
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

    // Efecto para monitorear cambios en userSelections
    useEffect(() => {
    }, [userSelections])

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

        setUserSelections(prev => {
            const newSelections = { ...prev }
            delete newSelections[index]
            // Reindexar las selecciones restantes
            Object.keys(newSelections).forEach(key => {
                const numKey = parseInt(key)
                if (numKey > index) {
                    newSelections[numKey - 1] = newSelections[numKey]
                    delete newSelections[numKey]
                }
            })
            return newSelections
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
        <div className={`bg-white border-dashed rounded-xl shadow-sm flex flex-col relative border-2 min-h-[80vh] max-h-[80vh]
            ${isDragActive ? "border-blue-600" : "border-transparent"}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            {isDragActive && (
                <div className="absolute inset-0 bg-blue-50/90 flex flex-col items-center justify-center z-50 pointer-events-none">
                    <span className="mb-4 text-blue-500">
                        <AttachIcon size={48} stroke={2} />
                    </span>
                    <span className="text-lg font-semibold text-blue-700">Suelta aquí para adjuntar archivos</span>
                </div>
            )}
            {/* Content */}
            <section className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] ${message.isUser ? 'flex flex-col items-end' : ''}`}>
                            {/* Badge del archivo adjunto - solo para mensajes del usuario */}
                            {message.isUser && message.attachedFile && (
                                <div className="mb-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-md flex items-center gap-1">
                                    <AttachIcon size={12} stroke={2} />
                                    <span className="truncate max-w-[200px]">{message.attachedFile}</span>
                                </div>
                            )}

                            <div
                                className={`text-sm p-3 rounded-2xl ${message.isUser
                                    ? 'bg-blue-600 text-white rounded-br-none whitespace-pre-wrap'
                                    : 'bg-black/5 text-black flex items-center rounded-bl-none'
                                    } ${message.isTaskList ? 'font-mono whitespace-pre-wrap' : ''}`}
                            >
                                {message.text}
                                {/* Loader para el último mensaje de la IA cuando está procesando */}
                                {isProcessing && index === messages.length - 1 && !message.isUser && (
                                    <div className="flex items-center gap-1 scale-50">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '000ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
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
                            <h4 className="font-medium text-gray-900">Tareas Detectadas ({detectedTasks.length})</h4>
                            <span className="text-xs text-gray-500">Haz clic en el ícono de editar para modificar una tarea</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mb-4">
                            {detectedTasks.map((task, index) => (
                                <div
                                    key={index}
                                    className={`rounded-xl border ${editingTask === index
                                        ? 'border-blue-200 ring-1 ring-blue-200'
                                        : isValidAssignment(task.assignedId)
                                            ? 'border-gray-200'
                                            : 'border-orange-200'
                                        }  transition-all duration-200`}
                                >
                                    {editingTask === index ? (
                                        <div className="p-4 flex flex-col gap-2">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-semibold mb-1">Título de la tarea</label>
                                                    <input
                                                        type="text"
                                                        value={task.title}
                                                        onChange={(e) => handleUpdateTask(index, 'title', e.target.value)}
                                                        className="bg-white text-sm w-full p-2 border rounded-md border-black/15"
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    {task.descriptionsDTO.map((desc, descIndex) => (
                                                        <div key={descIndex} className="bg-black/5 p-4 rounded-md space-y-2">
                                                            <div>
                                                                <label className="block text-sm font-bold">Título de la sección</label>
                                                                <input
                                                                    type="text"
                                                                    value={desc.title}
                                                                    onChange={(e) => {
                                                                        const newDescriptions = [...task.descriptionsDTO]
                                                                        newDescriptions[descIndex].title = e.target.value
                                                                        handleUpdateTask(index, 'descriptionsDTO', newDescriptions)
                                                                    }}
                                                                    className="bg-white border-black/15 text-sm w-full p-2 rounded-md border"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-bold">Descripción</label>
                                                                <textarea
                                                                    value={desc.text}
                                                                    onChange={(e) => {
                                                                        const newDescriptions = [...task.descriptionsDTO]
                                                                        newDescriptions[descIndex].text = e.target.value
                                                                        handleUpdateTask(index, 'descriptionsDTO', newDescriptions)
                                                                    }}
                                                                    className="bg-white border-black/15 text-sm w-full p-2 rounded-md border"
                                                                    rows={3}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Reemplazar el select básico con el nuevo selector de usuarios */}
                                                <div>
                                                    <label className="block text-sm font-semibold mb-1">
                                                        Asignar a
                                                        {task.suggestedAssignee && (
                                                            <span className="text-xs text-gray-500 ml-2">
                                                                (Sugerido: {task.suggestedAssignee})
                                                            </span>
                                                        )}
                                                    </label>
                                                    <div className="relative" ref={(el) => {
                                                        if (el) userRefs.current[index] = el
                                                    }}>
                                                        <button
                                                            onClick={() => toggleUserSelector(index)}
                                                            type='button'
                                                            className='w-full text-left bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                                                        >
                                                            <div className='flex items-center justify-between'>
                                                                <div className='flex items-center gap-3'>
                                                                    <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden'>
                                                                        {getCurrentSelection(index) ? (
                                                                            getCurrentSelection(index)?.picture ? (
                                                                                <img
                                                                                    src={getUserAvatar(getCurrentSelection(index)!, 32)}
                                                                                    alt={getUserDisplayName(getCurrentSelection(index))}
                                                                                    className="w-full h-full object-cover rounded-full"
                                                                                />
                                                                            ) : (
                                                                                <span className='text-sm font-medium text-gray-600'>
                                                                                    {getUserInitial(getCurrentSelection(index)!)}
                                                                                </span>
                                                                            )
                                                                        ) : (
                                                                            <span className='text-sm font-medium text-gray-600'>?</span>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <span className='text-sm font-medium text-gray-900'>
                                                                            {getUserDisplayName(getCurrentSelection(index))}
                                                                        </span>
                                                                        {getCurrentSelection(index) && (
                                                                            <p className="text-xs text-gray-500">
                                                                                {getCurrentSelection(index)?.email}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <svg
                                                                    className={`text-gray-400 w-5 h-5 transition-transform duration-200 ${openSelectors[index] ? "rotate-180" : ""}`}
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={2}
                                                                    stroke="currentColor"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                                                </svg>
                                                            </div>
                                                        </button>

                                                        {openSelectors[index] && (
                                                            <div className='absolute z-[9999] top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto'>
                                                                {allParticipants.map((user, i) => (
                                                                    <button
                                                                        key={i}
                                                                        type="button"
                                                                        onClick={() => handleUserSelect(index, user)}
                                                                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${isUserSelected(user, index) ? 'bg-blue-50' : ''
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-2 h-2 rounded-full ${isUserSelected(user, index) ? 'bg-blue-600' : 'bg-transparent'}`} />
                                                                            <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden'>
                                                                                {user.picture ? (
                                                                                    <img
                                                                                        src={getUserAvatar(user, 32)}
                                                                                        alt={getUserDisplayName(user)}
                                                                                        className="w-full h-full object-cover rounded-full"
                                                                                    />
                                                                                ) : (
                                                                                    <span className='text-sm font-medium text-gray-600'>
                                                                                        {getUserInitial(user)}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <span className='text-sm font-medium text-gray-900 block'>
                                                                                    {getUserDisplayName(user)}
                                                                                </span>
                                                                                <span className="text-xs text-gray-500">
                                                                                    {user.email}
                                                                                </span>
                                                                            </div>
                                                                            {isUserSelected(user, index) && (
                                                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {!task.assignedId && (
                                                        <p className="text-xs text-orange-500 mt-1">
                                                            * Debes asignar esta tarea a un usuario del proyecto
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex justify-end gap-2 pt-2">
                                                    <button
                                                        onClick={() => setEditingTask(null)}
                                                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingTask(null)}
                                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
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
                                                    <h5 className={`font-semibold flex-1 ${!isValidAssignment(task.assignedId) ? 'text-orange-600' : ''}`}>
                                                        {task.title}
                                                    </h5>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <button
                                                            onClick={() => handleEditTask(index)}
                                                            className="p-1 text-gray-400 hover:text-gray-600"
                                                            title="Editar tarea"
                                                        >
                                                            <EditIcon size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTaskModal(index)}
                                                            className="p-1 text-gray-400 hover:text-red-600"
                                                            title="Eliminar tarea"
                                                        >
                                                            <DeleteIcon size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-3 space-y-3">
                                                    {task.descriptionsDTO.map((desc, descIndex) => (
                                                        <div key={descIndex} className="bg-black/5 p-3 rounded-md">
                                                            <h6 className="text-sm font-bold">{desc.title}</h6>
                                                            <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{desc.text}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-3 flex items-center gap-2">
                                                    {/* Botón para abrir el selector de usuario */}
                                                    <div className="relative" ref={el => { if (el) userRefs.current[index] = el }}>
                                                        <button
                                                            type="button"
                                                            className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-2 border transition-all duration-200
                                                                ${isValidAssignment(task.assignedId)
                                                                    ? 'bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-300'
                                                                    : 'bg-orange-50 text-orange-600 border-orange-100 hover:border-orange-300'
                                                                }`}
                                                            onClick={() => toggleUserSelector(index)}
                                                        >
                                                            {isValidAssignment(task.assignedId)
                                                                ? (
                                                                    <>
                                                                        <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                                            {getCurrentSelection(index)?.picture ? (
                                                                                <img
                                                                                    src={getUserAvatar(getCurrentSelection(index)!, 32)}
                                                                                    alt={getUserDisplayName(getCurrentSelection(index))}
                                                                                    className="w-full h-full object-cover rounded-full"
                                                                                />
                                                                            ) : (
                                                                                <span className="text-xs font-medium text-gray-600">
                                                                                    {getUserInitial(getCurrentSelection(index)!)}
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                        <span>
                                                                            {getUserDisplayName(getCurrentSelection(index)) || task.assignedId}
                                                                        </span>
                                                                    </>
                                                                )
                                                                : (
                                                                    <>
                                                                        <span className="text-xs">Sin asignar</span>
                                                                    </>
                                                                )
                                                            }
                                                            <svg className={`w-4 h-4 ml-1 ${isValidAssignment(task.assignedId) ? 'text-blue-400' : 'text-orange-400'} transition-transform duration-200 ${openSelectors[index] ? "rotate-180" : ""}`}
                                                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                                            </svg>
                                                        </button>
                                                        {/* Dropdown de usuarios */}
                                                        {openSelectors[index] && (
                                                            <div className="absolute z-[9999] top-full mt-2 w-[500px] bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                                                {allParticipants.map((user, i) => (
                                                                    <button
                                                                        key={i}
                                                                        type="button"
                                                                        onClick={() => handleUserSelect(index, user)}
                                                                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center gap-3
                                                                         ${isUserSelected(user, index) ? 'bg-blue-50' : ''}`}
                                                                    >
                                                                        <div className={`w-2 h-2 rounded-full ${isUserSelected(user, index) ? 'bg-blue-600' : 'bg-transparent'}`} />
                                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                                            {user.picture ? (
                                                                                <img
                                                                                    src={getUserAvatar(user, 32)}
                                                                                    alt={getUserDisplayName(user)}
                                                                                    className="w-full h-full object-cover rounded-full"
                                                                                />
                                                                            ) : (
                                                                                <span className="text-sm font-medium text-gray-600">
                                                                                    {getUserInitial(user)}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <span className="text-sm font-medium text-gray-900 block">
                                                                                {getUserDisplayName(user)}
                                                                            </span>
                                                                            <span className="text-xs text-gray-500">
                                                                                {user.email}
                                                                            </span>
                                                                        </div>
                                                                        {isUserSelected(user, index) && (
                                                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {!isValidAssignment(task.assignedId) && (
                                                        <span className="text-xs text-orange-500 font-medium">
                                                            * Requiere asignación
                                                        </span>
                                                    )}
                                                    {task.suggestedAssignee && !isValidAssignment(task.assignedId) && (
                                                        <span className="text-xs text-gray-500">
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
            <div className="border-t border-gray-200 mt-auto">
                {showTaskList ? (
                    <div className="p-6">
                        <button
                            onClick={handleSaveTasks}
                            disabled={isProcessing || !areAllTasksAssigned()}
                            className={`w-full px-4 py-2.5 text-sm font-medium text-white rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${!areAllTasksAssigned()
                                ? 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300'
                                : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300'
                                } disabled:cursor-not-allowed`}
                        >
                            {!areAllTasksAssigned() ? (
                                <>
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                    Asigna todas las tareas para continuar
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Crear {detectedTasks.length} Tareas
                                </>
                            )}
                        </button>
                        {!areAllTasksAssigned() && (
                            <p className="text-xs text-orange-500 mt-2 text-center">
                                Debes asignar un usuario a cada tarea antes de continuar
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-stretch gap-2 p-6">
                        {/* Mostrar archivo adjuntado */}
                        {attachedFile && (
                            <div className="mb-3">
                                <div className="text-xs text-gray-500 mb-2">Archivo adjuntado:</div>
                                <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <div className="text-gray-400">
                                            <AttachIcon size={14} />
                                        </div>
                                        <span className="text-sm text-gray-700 truncate">{attachedFile.name}</span>
                                        <span className="text-xs text-gray-400">
                                            ({(attachedFile.size / 1024).toFixed(1)} KB)
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleRemoveAttachedFile}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        title="Eliminar archivo"
                                        type="button"
                                    >
                                        <XIcon size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <AutoResizeTextarea
                            className="focus-within:ring-blue-500 focus-within:border-blue-500 focus-within:ring-2 transition-all max-h-28! w-full p-2.5 text-sm border resize-none focus:outline-none placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleAttachClick}
                                type="button"
                                title="Adjuntar archivos"
                                disabled={isProcessing}
                            >
                                <AttachIcon size={16} stroke={2} />
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
                                className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleSubmit}
                                type="button"
                                disabled={(!inputText.trim() && !attachedFile) || isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <SendIcon size={16} stroke={2} />
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
