import { Upload, Send, X, ArrowRight } from "lucide-react"
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
            setTimeout(() => {
                onCancel()
                window.location.reload()
            }, 3000)
        }
    }

    return (
        <div>
            {/* Content */}
            <div className="p-6">
                {!columns ? (
                    <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center rounded-md cursor-pointer transition-colors duration-150 min-h-[120px] px-4 py-6 relative"
                        style={{
                            border: `2px dashed ${dragActive ? "var(--blue-700)" : "var(--ds-border-strong)"}`,
                            background: dragActive ? "var(--blue-100)" : "var(--gray-alpha-100)",
                        }}
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
                                <span className="mb-2" style={{ color: "var(--blue-700)" }}>
                                    <Upload size={24} strokeWidth={1.5} />
                                </span>
                                <span className="text-base font-medium" style={{ color: "var(--ds-text)" }}>
                                    Haz clic o arrastra un archivo aquí
                                </span>
                                <span className="text-xs mt-1" style={{ color: "var(--ds-text-muted)" }}>
                                    Archivos permitidos: .xls, .xlsx, .csv
                                </span>
                            </>
                        ) : (
                            <div className="flex justify-between items-center gap-10">
                                <div className="flex items-center gap-2">
                                    <span style={{ color: "var(--blue-700)" }}>
                                        <Upload size={24} strokeWidth={1.5} />
                                    </span>
                                    <span className="font-medium text-sm" style={{ color: "var(--ds-text)" }}>{file.name}</span>
                                </div>
                                <div className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation()
                                            handleRemoveFile()
                                        }}
                                        className="rounded-full p-1 transition-colors duration-150 hover:bg-[var(--red-100)] hover:text-[var(--red-900)]"
                                        style={{ color: "var(--ds-text-muted)" }}
                                        aria-label="Eliminar archivo"
                                    >
                                        <X size={18} strokeWidth={1.5} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation()
                                            handleSendFile()
                                        }}
                                        className="rounded-full p-1 transition-colors duration-150 hover:bg-[var(--green-100)] hover:text-[var(--green-900)]"
                                        style={{ color: "var(--ds-text-muted)" }}
                                        aria-label="Enviar archivo"
                                    >
                                        <Send size={18} strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </label>
                ) : (
                    <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
                        {/* Columnas del archivo */}
                        <div className="flex-1 min-w-[200px]">
                            <h4 className="font-semibold mb-2" style={{ color: "var(--ds-text)" }}>Columnas del archivo</h4>
                            <div className={`pointer-events-none rounded-md top-[-9999px] left-[-9999px] w-fit h-fit z-10 py-2 pl-8 pr-4
                            ${draggedColumn ? "absolute" : "hidden"}`}
                                style={{ background: "var(--blue-100)", color: "var(--blue-900)", border: "1px solid var(--blue-400)" }}
                                ref={dragPreviewRef}>
                                {draggedColumn}
                            </div>
                            <div className="flex flex-col gap-3 max-h-[500px] min-h-[460px] overflow-y-auto pr-1 relative">
                                {columns.filter(col => !Object.values(mapping).flat().includes(col)).length === 0 ? (
                                    <div className="absolute inset-0 flex items-center justify-center text-center pointer-events-none select-none z-10"
                                        style={{ color: "var(--ds-text-muted)", background: "color-mix(in srgb, var(--ds-card) 90%, transparent)" }}>
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
                                                className={`bg-[var(--blue-100)] text-[var(--blue-900)] border border-[var(--blue-400)] hover:bg-[var(--blue-200)] hover:border-[var(--blue-600)] ${draggedColumn === col && "opacity-40 scale-95"}
                                                    group p-3 rounded-md shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-md)] cursor-grab active:cursor-grabbing transition-all duration-150 select-none`}
                                                style={{ zIndex: draggedColumn === col ? 1000 : 1 }}
                                                title={sampleRow && sampleRow[col] !== undefined ? sampleRow[col] : ""}
                                            >
                                                <div className="font-semibold" style={{ color: "var(--blue-900)" }}>{col}</div>
                                                {sampleRow && sampleRow[col] !== undefined && (
                                                    <div className="text-xs line-clamp-1" style={{ color: "var(--ds-text-muted)" }}>
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
                            <ArrowRight size={40} strokeWidth={2} style={{ color: "var(--blue-700)" }} />
                        </div>

                        {/* Estructura de la tarea */}
                        <div className="flex-1 min-w-[220px]">
                            <div className="flex justify-between items-center gap-2 mb-2">
                                <h4 className="font-semibold" style={{ color: "var(--ds-text)" }}>Estructura de una tarea</h4>
                                <button className="disabled:opacity-35 flex items-center gap-2 rounded-md text-sm px-3 h-7 transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)]"
                                    style={{ color: "var(--primary-contrast-fg)" }}
                                    disabled={!mapping.title || mapping.title.length === 0}
                                    onClick={handleSendColumns}>
                                    <Send size={12} strokeWidth={2} />
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
                                        className="rounded-md p-3 flex flex-col gap-2 transition-colors duration-150"
                                        style={{
                                            border: `2px dashed ${draggedColumn && hoveredField === field.key ? "var(--blue-700)" : "var(--ds-border-strong)"}`,
                                            background: draggedColumn && hoveredField === field.key ? "var(--blue-100)" : "var(--gray-alpha-100)",
                                        }}
                                    >
                                        <span className="font-medium mb-1" style={{ color: "var(--ds-text)" }}>{field.label}</span>
                                        <div className="flex flex-wrap gap-2 min-h-[28px]">
                                            {(mapping[field.key] || []).map(col => (
                                                <div
                                                    key={col}
                                                    className="flex items-center rounded px-2 py-0.5 shadow-[var(--shadow-border)] text-sm"
                                                    style={{ background: "var(--blue-100)", color: "var(--blue-900)" }}
                                                >
                                                    {col}
                                                    <button
                                                        type="button"
                                                        className="ml-1 transition-colors duration-150 text-[var(--red-700)] hover:text-[var(--red-900)]"
                                                        onClick={() => handleRemoveMappedColumn(field.key, col)}
                                                        aria-label="Quitar columna"
                                                    >
                                                        <X size={12} strokeWidth={1.5} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        {field.multi
                                            ? <span className="text-xs" style={{ color: "var(--ds-text-muted)" }}>Puedes soltar varias columnas aquí</span>
                                            : <span className="text-xs" style={{ color: "var(--ds-text-muted)" }}>Solo una columna</span>
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
