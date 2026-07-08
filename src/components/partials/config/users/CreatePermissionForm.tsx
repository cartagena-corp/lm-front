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
        <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="permissionName" className="block text-[13px] font-medium" style={{ color: "var(--ds-text-secondary)" }}>
                        Nombre del permiso
                    </label>
                    <input
                        type="text"
                        id="permissionName"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full h-9 px-3 rounded-md text-sm bg-[var(--ds-card)] outline-none transition-shadow duration-150 placeholder:text-[var(--ds-text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                        style={{ color: "var(--ds-text)", boxShadow: errors.name ? "0 0 0 1px var(--red-700)" : "var(--shadow-border)" }}
                        placeholder="SPRINT_READ"
                    />
                    {errors.name && (
                        <p className="text-sm" style={{ color: "var(--red-700)" }}>{errors.name}</p>
                    )}
                    <p className="text-xs" style={{ color: "var(--ds-text-muted)" }}>
                        Use mayúsculas y guiones bajos. Ejemplos: SPRINT_READ, PROJECT_WRITE, USER_DELETE
                    </p>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--ds-card)] hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                        style={{ color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                        type="button"
                        onClick={() => onCancel()}>
                        Cancelar
                    </button>
                    <button className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                        style={{ color: "var(--primary-contrast-fg)" }}
                        type="submit">
                        Crear Permiso
                    </button>
                </div>
            </form>
        </div>
    )
}
