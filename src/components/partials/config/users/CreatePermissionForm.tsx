"use client"
import { useState } from 'react'

interface CreatePermissionFormProps {
    onSubmit: (data: { name: string }) => void
    onCancel: () => void
}

export default function CreatePermissionForm({ onSubmit, onCancel }: CreatePermissionFormProps) {
    const [formData, setFormData] = useState({ name: '' })
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre del permiso es requerido'
        } else if (!/^[A-Z_]+$/.test(formData.name)) {
            newErrors.name = 'El nombre debe estar en mayúsculas y usar guiones bajos (ej: SPRINT_READ)'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            onSubmit(formData)
        }
    }

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value.toUpperCase() }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                    Crear Nuevo Permiso
                </h3>
                <p className="text-sm text-gray-500">
                    Define un nuevo permiso para el sistema
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="permissionName" className="block text-sm font-medium text-gray-700">
                        Nombre del permiso
                    </label>
                    <input
                        type="text"
                        id="permissionName"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.name
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                        placeholder="SPRINT_READ"
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        Use mayúsculas y guiones bajos. Ejemplos: SPRINT_READ, PROJECT_WRITE, USER_DELETE
                    </p>
                </div>

                <div className="flex items-center gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-white hover:bg-gray-50 hover:border-gray-300 border-gray-200 border flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white border-transparent border hover:shadow-md flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Crear Permiso
                    </button>
                </div>
            </form>
        </div>
    )
}
