"use client"
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store/AuthStore'

interface RoleProps {
    name: string
    permissions: Array<{ name: string }>
}

interface PermissionProps {
    name: string
}

interface RoleFormProps {
    role?: RoleProps | null
    onSubmit: (data: { name: string, permissions: PermissionProps[] }) => void
    onCancel: () => void
    isEdit?: boolean
}

export default function RoleForm({ role, onSubmit, onCancel, isEdit = false }: RoleFormProps) {
    const { getValidAccessToken, listPermissions, permissions: allPermissions } = useAuthStore()

    const [formData, setFormData] = useState({
        name: role?.name || '',
        permissions: role?.permissions || []
    })
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    useEffect(() => {
        loadPermissions()
    }, [])

    const loadPermissions = async () => {
        const token = await getValidAccessToken()
        if (token) {
            await listPermissions(token)
        }
    }

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre del rol es requerido'
        }

        if (formData.permissions.length === 0) {
            newErrors.permissions = 'Debe seleccionar al menos un permiso'
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

    const handlePermissionToggle = (permission: PermissionProps) => {
        const isSelected = formData.permissions.some(p => p.name === permission.name)

        if (isSelected) {
            setFormData(prev => ({
                ...prev,
                permissions: prev.permissions.filter(p => p.name !== permission.name)
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                permissions: [...prev.permissions, permission]
            }))
        }

        if (errors.permissions) {
            setErrors(prev => ({ ...prev, permissions: '' }))
        }
    }

    return (
        <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre del rol */}
                <div className="space-y-2">
                    <label htmlFor="roleName" className="block text-[13px] font-medium" style={{ color: "var(--ds-text-secondary)" }}>
                        Nombre del rol
                    </label>
                    <input
                        type="text"
                        id="roleName"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={isEdit}
                        className="w-full h-9 px-3 rounded-md text-sm outline-none transition-shadow duration-150 placeholder:text-[var(--ds-text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2 disabled:cursor-not-allowed"
                        style={{
                            background: isEdit ? "var(--gray-100)" : "var(--ds-card)",
                            color: isEdit ? "var(--ds-text-muted)" : "var(--ds-text)",
                            boxShadow: errors.name ? "0 0 0 1px var(--red-700)" : "var(--shadow-border)"
                        }}
                        placeholder="Ej: manager, developer, viewer"
                    />
                    {errors.name && (
                        <p className="text-sm" style={{ color: "var(--red-700)" }}>{errors.name}</p>
                    )}
                </div>

                {/* Permisos */}
                <div className="space-y-2">
                    <label className="block text-[13px] font-medium" style={{ color: "var(--ds-text-secondary)" }}>
                        Permisos del rol
                    </label>
                    <div className="rounded-md p-4 max-h-[40vh] overflow-y-auto" style={{ border: "1px solid var(--ds-border)" }}>
                        {allPermissions.map((permission) => (
                            <label
                                key={permission.name}
                                className="flex items-center gap-2 p-2 rounded-md cursor-pointer min-w-0 transition-colors duration-150 hover:bg-[var(--gray-alpha-100)]"
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.permissions.some(p => p.name === permission.name)}
                                    onChange={() => handlePermissionToggle(permission)}
                                    className="w-4 h-4 rounded flex-shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                                    style={{ accentColor: "var(--blue-700)" }}
                                />
                                <span className="text-sm truncate min-w-0" style={{ color: "var(--ds-text-secondary)" }}>{permission.name}</span>
                            </label>
                        ))}
                    </div>
                    {errors.permissions && (
                        <p className="text-sm" style={{ color: "var(--red-700)" }}>{errors.permissions}</p>
                    )}
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
                        {isEdit ? "Guardar cambios" : "Crear Rol"}
                    </button>
                </div>
            </form>
        </div>
    )
}
