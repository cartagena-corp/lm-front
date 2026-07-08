"use client"

import { useState, useRef, useCallback } from "react"
import { Paperclip, Download, X, Plus } from "lucide-react"

interface ImportUsersFormProps {
    onSubmit: (file: File) => void
    onCancel: () => void
    isLoading?: boolean
}

export default function ImportUsersForm({ onSubmit, onCancel, isLoading = false }: ImportUsersFormProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Tipos de archivos permitidos
    const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
    ]

    const allowedExtensions = ['.xls', '.xlsx', '.csv']

    const validateFile = (file: File): boolean => {
        const newErrors: { [key: string]: string } = {}

        // Validar tipo de archivo
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            newErrors.file = 'Solo se permiten archivos .xls, .xlsx o .csv'
        }

        // Validar tamaño (máximo 512MB)
        if (file.size > 512 * 1024 * 1024) {
            newErrors.file = 'El archivo no debe superar los 512MB'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleFileSelect = (file: File) => {
        if (validateFile(file)) {
            setSelectedFile(file)
        }
    }

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)

        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            handleFileSelect(files[0])
        }
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedFile) {
            setErrors({ file: 'Debe seleccionar un archivo' })
            return
        }

        if (validateFile(selectedFile)) {
            onSubmit(selectedFile)
        }
    }

    const removeFile = () => {
        setSelectedFile(null)
        setErrors({})
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase()
        return <Paperclip size={20} strokeWidth={1.5} />
    }

    return (
        <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
                <div className="w-fit mx-auto p-3 rounded-md" style={{ background: "var(--blue-100)", color: "var(--blue-900)" }}>
                    <Download size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: "var(--ds-text)" }}>
                    Importar Usuarios
                </h3>
                <p className="text-sm" style={{ color: "var(--ds-text-muted)" }}>
                    Sube un archivo .xls, .xlsx o .csv con la información de los usuarios
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Zona de carga de archivos */}
                <div className="space-y-2">
                    <label className="block text-[13px] font-medium" style={{ color: "var(--ds-text-secondary)" }}>
                        Archivo de usuarios
                    </label>

                    {!selectedFile ? (
                        <div
                            className={`relative border-2 border-dashed rounded-md p-8 text-center transition-colors duration-150 ${
                                isDragOver
                                    ? 'border-[var(--blue-400)]'
                                    : errors.file
                                    ? 'border-[var(--red-400)]'
                                    : 'border-[var(--ds-border)] hover:border-[var(--ds-border-strong)]'
                            }`}
                            style={{ background: isDragOver ? "var(--blue-100)" : errors.file ? "var(--red-100)" : "var(--ds-card)" }}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xls,.xlsx,.csv"
                                onChange={handleFileInputChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isLoading}
                            />

                            <div className="space-y-4">
                                <div
                                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                                    style={isDragOver ? { background: "var(--blue-100)", color: "var(--blue-900)" } : { background: "var(--gray-100)", color: "var(--ds-text-muted)" }}
                                >
                                    <Download size={24} strokeWidth={1.5} />
                                </div>

                                <div>
                                    <p className="text-sm font-medium" style={{ color: "var(--ds-text)" }}>
                                        {isDragOver ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu archivo'}
                                    </p>
                                    <p className="text-sm" style={{ color: "var(--ds-text-muted)" }}>
                                        o{' '}
                                        <span className="font-medium" style={{ color: "var(--ds-link)" }}>
                                            haz clic para seleccionar
                                        </span>
                                    </p>
                                </div>

                                <div className="text-xs" style={{ color: "var(--ds-text-muted)" }}>
                                    Formatos soportados: .xls, .xlsx, .csv (máximo 512MB)
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Archivo seleccionado */
                        <div className="rounded-md p-4" style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2 rounded-md flex-shrink-0" style={{ background: "var(--blue-100)", color: "var(--blue-900)" }}>
                                        {getFileIcon(selectedFile.name)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: "var(--ds-text)" }}>
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-xs" style={{ color: "var(--ds-text-muted)" }}>
                                            {formatFileSize(selectedFile.size)}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={removeFile}
                                    disabled={isLoading}
                                    className="p-1 flex-shrink-0 transition-colors duration-150 hover:text-[var(--red-900)]"
                                    style={{ color: "var(--ds-text-muted)" }}
                                    title="Eliminar archivo"
                                >
                                    <X size={16} strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>
                    )}

                    {errors.file && (
                        <p className="text-sm" style={{ color: "var(--red-700)" }}>{errors.file}</p>
                    )}
                </div>

                {/* Información del formato esperado */}
                <div className="rounded-md p-4" style={{ background: "var(--blue-100)", border: "1px solid var(--blue-400)" }}>
                    <h4 className="text-sm font-medium mb-2" style={{ color: "var(--blue-900)" }}>
                        Formato esperado del archivo:
                    </h4>
                    <ul className="text-sm space-y-1" style={{ color: "var(--blue-900)" }}>
                        <li>• Primera fila: encabezado "Email"</li>
                        <li>• Filas siguientes: direcciones de correo electrónico válidas</li>
                        <li>• Los usuarios se crearán sin un rol especificado</li>
                        <li>• Ejemplo:</li>
                    </ul>
                    <div className="mt-2 rounded-md p-2 text-xs font-mono" style={{ background: "var(--ds-card)", border: "1px solid var(--blue-400)" }}>
                        <div style={{ color: "var(--blue-800)" }}>Email</div>
                        <div style={{ color: "var(--ds-text-secondary)" }}>usuario1@ejemplo.com</div>
                        <div style={{ color: "var(--ds-text-secondary)" }}>usuario2@ejemplo.com</div>
                        <div style={{ color: "var(--ds-text-secondary)" }}>usuario3@ejemplo.com</div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 h-9 rounded-md text-sm font-medium text-center transition-colors duration-150 bg-[var(--ds-card)] hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2 disabled:opacity-50"
                        style={{ color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!selectedFile || isLoading}
                        className="flex-1 h-9 flex items-center justify-center gap-2 rounded-md text-sm font-medium text-center transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ color: "var(--primary-contrast-fg)" }}
                    >
                        {isLoading ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                Importando...
                            </>
                        ) : (
                            <>
                                <Plus size={16} strokeWidth={1.5} />
                                Importar Usuarios
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
