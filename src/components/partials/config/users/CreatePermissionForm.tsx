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
        <div className="space-y-6 p-6">
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

                <div className="flex justify-end gap-3 mt-4">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200 text-sm font-medium" type="button"
                        onClick={() => onCancel()}>
                        Cancelar
                    </button>
                    <button className={`bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white focus:ring-2 rounded-md focus:ring-offset-2 transition-all duration-200 text-sm font-medium px-4 py-2`} type="submit">
                        Crear Permiso
                    </button>
                </div>
            </form>
        </div>
    )
}
