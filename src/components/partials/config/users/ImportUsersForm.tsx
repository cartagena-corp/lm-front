"use client"

import { useState, useRef, useCallback } from "react"
import { AttachIcon, DownloadIcon, XIcon, PlusIcon } from "@/assets/Icon"

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

        // Validar tamaño (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
            newErrors.file = 'El archivo no debe superar los 10MB'
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
        return <AttachIcon size={20} />
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg w-fit mx-auto">
                    <DownloadIcon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                    Importar Usuarios
                </h3>
                <p className="text-sm text-gray-500">
                    Sube un archivo .xls, .xlsx o .csv con la información de los usuarios
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Zona de carga de archivos */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Archivo de usuarios
                    </label>
                    
                    {!selectedFile ? (
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                                isDragOver
                                    ? 'border-blue-400 bg-blue-50'
                                    : errors.file
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
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
                                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                                    isDragOver ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                                }`}>
                                    <DownloadIcon size={24} />
                                </div>
                                
                                <div>
                                    <p className="text-lg font-medium text-gray-900">
                                        {isDragOver ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu archivo'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        o{' '}
                                        <span className="text-blue-600 font-medium">
                                            haz clic para seleccionar
                                        </span>
                                    </p>
                                </div>
                                
                                <div className="text-xs text-gray-400">
                                    Formatos soportados: .xls, .xlsx, .csv (máximo 10MB)
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Archivo seleccionado */
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        {getFileIcon(selectedFile.name)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(selectedFile.size)}
                                        </p>
                                    </div>
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={removeFile}
                                    disabled={isLoading}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Eliminar archivo"
                                >
                                    <XIcon size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {errors.file && (
                        <p className="text-sm text-red-600">{errors.file}</p>
                    )}
                </div>

                {/* Información del formato esperado */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                        Formato esperado del archivo:
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Primera fila: encabezado "Email"</li>
                        <li>• Filas siguientes: direcciones de correo electrónico válidas</li>
                        <li>• Los usuarios se crearán sin un rol especificado</li>
                        <li>• Ejemplo:</li>
                    </ul>
                    <div className="mt-2 bg-white border border-blue-200 rounded p-2 text-xs font-mono">
                        <div className="text-blue-800">Email</div>
                        <div className="text-gray-600">usuario1@ejemplo.com</div>
                        <div className="text-gray-600">usuario2@ejemplo.com</div>
                        <div className="text-gray-600">usuario3@ejemplo.com</div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="bg-white hover:bg-gray-50 hover:border-gray-300 border-gray-200 border flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!selectedFile || isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white border-transparent border hover:shadow-md flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Importando...
                            </>
                        ) : (
                            <>
                                <PlusIcon size={16} />
                                Importar Usuarios
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
