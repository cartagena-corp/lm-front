import { ImportIcon, SendIcon, XIcon } from "@/assets/Icon"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useIssueStore } from "@/lib/store/IssueStore"
import { usePathname } from "next/navigation"
import { useRef, useState } from "react"
import toast from "react-hot-toast"

interface FormProps {
    onCancel: () => void
    sprintId?: string // Opcional para asignar tareas importadas a un sprint específico
}

const ACCEPTED_FORMATS = [
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "text/csv", // .csv
]
const ACCEPTED_EXTENSIONS = [".xls", ".xlsx", ".csv"]

const ISSUE_FIELDS = [
    { key: "title", label: "Título", multi: false },
    { key: "descriptions", label: "Descripciones", multi: true },
    { key: "assignedId", label: "Persona Asignada", multi: false },
    // { key: "estimatedTime", label: "Tiempo Estimado", multi: false },
    // { key: "createdAt", label: "Fecha de Creación", multi: false },
    // { key: "updatedAt", label: "Fecha de Última Actualización", multi: false },
]

export default function ImportIssuesModal({ onCancel, sprintId }: FormProps) {
    const pathname = usePathname()
    const { getValidAccessToken } = useAuthStore()
    const { getColumnsFromExcel, importIssuesFromExcel } = useIssueStore()
    const [file, setFile] = useState<File | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [columns, setColumns] = useState<string[] | null>(null)
    const [mapping, setMapping] = useState<Record<string, string[]>>({})
    const [draggedColumn, setDraggedColumn] = useState<string | null>(null)
    const [hoveredField, setHoveredField] = useState<string | null>(null)
    const [sampleRow, setSampleRow] = useState<Record<string, string> | null>(null)

    const inputRef = useRef<HTMLInputElement>(null)
    const dragPreviewRef = useRef<HTMLDivElement>(null)

    function isAcceptedFile(f: File) {
        const ext = f.name.split(".").pop()?.toLowerCase()
        return (
            (f.type && ACCEPTED_FORMATS.includes(f.type)) ||
            (ext && ACCEPTED_EXTENSIONS.includes("." + ext))
        )
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selected = e.target.files?.[0]
        if (selected) {
            if (isAcceptedFile(selected)) {
                setFile(selected)
            } else {
                setFile(null)
                window.alert("Solo se permiten archivos .xls, .xlsx o .csv")
            }
        }
    }

    function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
        e.preventDefault()
        setDragActive(false)
        const dropped = e.dataTransfer.files?.[0]
        if (dropped) {
            if (isAcceptedFile(dropped)) {
                setFile(dropped)
            } else {
                setFile(null)
                window.alert("Solo se permiten archivos .xls, .xlsx o .csv")
            }
        }
    }

    function handleDragOver(e: React.DragEvent<HTMLLabelElement>) {
        e.preventDefault()
        setDragActive(true)
    }

    function handleDragLeave(e: React.DragEvent<HTMLLabelElement>) {
        e.preventDefault()
        setDragActive(false)
    }

    function handleRemoveFile() {
        setFile(null)
        setColumns(null)
        setMapping({})
        if (inputRef.current) inputRef.current.value = ""
    }

    // Drag and drop handlers for mapping
    function handleColumnDragStart(col: string) {
        setDraggedColumn(col)
    }

    function handleColumnDragEnd() {
        setDraggedColumn(null)
    }

    function handleFieldDrop(fieldKey: string, multi: boolean) {
        if (!draggedColumn) return
        setMapping(prev => {
            // Remove from all fields first
            const newMapping: Record<string, string[]> = {}
            for (const field of ISSUE_FIELDS) {
                if (field.multi) {
                    newMapping[field.key] = (prev[field.key] || []).filter(c => c !== draggedColumn)
                } else {
                    newMapping[field.key] = prev[field.key]?.[0] === draggedColumn ? [] : prev[field.key] || []
                }
            }
            // Add to target field
            if (multi) {
                newMapping[fieldKey] = [...(newMapping[fieldKey] || []), draggedColumn]
            } else {
                newMapping[fieldKey] = [draggedColumn]
            }
            return newMapping
        })
        setDraggedColumn(null)
    }

    function handleRemoveMappedColumn(fieldKey: string, col: string) {
        setMapping(prev => ({
            ...prev,
            [fieldKey]: (prev[fieldKey] || []).filter(c => c !== col)
        }))
    }

    const handleSendFile = async () => {
        const token = await getValidAccessToken()
        if (file && token) {
            const cols = await getColumnsFromExcel(token, file)
            setColumns(cols.columns)
            setSampleRow(cols.sampleRow)
            setMapping({})
        }
    }

    const handleSendColumns = async () => {
        if (!mapping.title || mapping.title.length === 0) {
            toast.error("Debes mapear al menos la columna de Título")
            return;
        }
        const mappingToSend: Record<string, string> = {}
        Object.entries(mapping).forEach(([key, arr]) => {
            if (arr && arr.length > 0) {
                mappingToSend[key] = arr.join(",")
            }
        })
        const token = await getValidAccessToken()
        const projectId = pathname.split("/").pop()
        if (file && token && projectId) {
            const res = await importIssuesFromExcel(token, file, projectId, mappingToSend, sprintId)
            if (res !== "Successful import") {
                toast.error("Error al importar las tareas: " + res)
                return;
            }
            const sprintText = sprintId && sprintId !== 'null' ? ' al sprint' : ''
            toast.success(`Tareas importadas correctamente${sprintText}`)
            setInterval(() => {
                onCancel()
                window.location.reload()
            }, 3000)
        }
    }

    return (
        <div className="bg-white border-gray-100 rounded-xl shadow-sm border">
            {/* Content */}
            <div className="p-6">
                {!columns ? (
                    <label
                        htmlFor="file-upload"
                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
                            ${dragActive ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50"}
                            min-h-[120px] px-4 py-6 relative`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <input
                            id="file-upload"
                            ref={inputRef}
                            type="file"
                            accept=".xls,.xlsx,.csv"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        {!file ? (
                            <>
                                <span className="text-blue-400 mb-2">
                                    <ImportIcon size={24} />
                                </span>
                                <span className="text-base font-medium text-gray-700">
                                    Haz clic o arrastra un archivo aquí
                                </span>
                                <span className="text-xs text-gray-400 mt-1">
                                    Archivos permitidos: .xls, .xlsx, .csv
                                </span>
                            </>
                        ) : (
                            <div className="flex justify-between items-center gap-10">
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-400">
                                        <ImportIcon size={24} />
                                    </span>
                                    <span className="text-gray-800 font-medium text-sm">{file.name}</span>
                                </div>
                                <div className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation()
                                            handleRemoveFile()
                                        }}
                                        className="text-gray-400 hover:text-red-500 rounded-full p-1 transition"
                                        aria-label="Eliminar archivo"
                                    >
                                        <XIcon size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation()
                                            handleSendFile()
                                        }}
                                        className="text-gray-400 hover:text-green-500 rounded-full p-1 transition"
                                        aria-label="Enviar archivo"
                                    >
                                        <SendIcon size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </label>
                ) : (
                    <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
                        {/* Columnas del archivo */}
                        <div className="flex-1 min-w-[200px]">
                            <h4 className="font-semibold text-gray-700 mb-2">Columnas del archivo</h4>
                            <div className={`bg-blue-600/10 text-blue-600 pointer-events-none rounded-md border top-[-9999px] left-[-9999px] w-fit h-fit z-10 py-2 pl-8 pr-4
                            ${draggedColumn ? "absolute" : "hidden"}`}
                                ref={dragPreviewRef}>
                                {draggedColumn}
                            </div>
                            <div className="flex flex-col gap-3 max-h-[500px] min-h-[460px] overflow-y-auto pr-1 relative">
                                {columns.filter(col => !Object.values(mapping).flat().includes(col)).length === 0 ? (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-center pointer-events-none select-none bg-white/90 z-10">
                                        Ya no hay columnas por mapear
                                    </div>
                                ) : (
                                    columns.map(col => {
                                        const isMapped = Object.values(mapping).flat().includes(col)
                                        if (isMapped) return null
                                        return (
                                            <div
                                                key={col}
                                                draggable
                                                onDragStart={e => {
                                                    handleColumnDragStart(col)
                                                    // Drag preview custom
                                                    if (dragPreviewRef.current) {
                                                        dragPreviewRef.current.innerText = col
                                                        e.dataTransfer.setDragImage(dragPreviewRef.current, 20, 20)
                                                    }
                                                }}
                                                onDragEnd={handleColumnDragEnd}
                                                className={`bg-white text-blue-800 border-blue-300 hover:bg-blue-50 hover:border-blue-500 ${draggedColumn === col && "opacity-40 scale-95"}
                                                    border group p-3 rounded-lg shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all select-none`}
                                                style={{ zIndex: draggedColumn === col ? 1000 : 1 }}
                                                title={sampleRow && sampleRow[col] !== undefined ? sampleRow[col] : ""}
                                            >
                                                <div className="font-semibold text-blue-700">{col}</div>
                                                {sampleRow && sampleRow[col] !== undefined && (
                                                    <div className="text-xs text-gray-500 group-hover:text-blue-600 line-clamp-1">
                                                        <b>Ej:</b> {sampleRow[col] || "Sin datos"}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>

                        {/* Flecha */}
                        <div className="self-center">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <path d="M16 24h16m0 0-6-6m6 6-6 6" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* Estructura de la tarea */}
                        <div className="flex-1 min-w-[220px]">
                            <div className="flex justify-between items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-700">Estructura de una tarea</h4>
                                <button className="bg-blue-600/10 text-blue-600 disabled:opacity-35 not-disabled:border flex items-center gap-2 rounded-md text-sm px-2 py-0.5"
                                    disabled={!mapping.title || mapping.title.length === 0}
                                    onClick={handleSendColumns}>
                                    <SendIcon size={12} stroke={2} />
                                    Importar tareas
                                </button>
                            </div>
                            <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                                {ISSUE_FIELDS.map(field => (
                                    <div
                                        key={field.key}
                                        onDragOver={e => {
                                            e.preventDefault()
                                            setHoveredField(field.key)
                                        }}
                                        onDragLeave={e => {
                                            e.preventDefault()
                                            setHoveredField(null)
                                        }}
                                        onDrop={e => {
                                            e.preventDefault()
                                            handleFieldDrop(field.key, field.multi)
                                            setHoveredField(null)
                                        }}
                                        className={`border-2 border-dashed rounded-lg p-3 flex flex-col gap-2 transition-all
                                        ${draggedColumn ? hoveredField === field.key
                                                ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50" : "border-gray-300 bg-gray-50"}`}
                                    >
                                        <span className="font-medium text-gray-800 mb-1">{field.label}</span>
                                        <div className="flex flex-wrap gap-2 min-h-[28px]">
                                            {(mapping[field.key] || []).map(col => (
                                                <div
                                                    key={col}
                                                    className="flex items-center bg-blue-600/10 text-blue-600 rounded px-2 py-0.5 shadow-sm text-sm"
                                                >
                                                    {col}
                                                    <button
                                                        type="button"
                                                        className="ml-1 text-red-500 hover:text-red-700 transition-colors"
                                                        onClick={() => handleRemoveMappedColumn(field.key, col)}
                                                        aria-label="Quitar columna"
                                                    >
                                                        <XIcon size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        {field.multi
                                            ? <span className="text-xs text-gray-400">Puedes soltar varias columnas aquí</span>
                                            : <span className="text-xs text-gray-400">Solo una columna</span>
                                        }
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}