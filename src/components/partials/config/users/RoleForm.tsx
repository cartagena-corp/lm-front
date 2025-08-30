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
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                    {isEdit ? 'Editar Rol' : 'Crear Nuevo Rol'}
                </h3>
                <p className="text-sm text-gray-500">
                    {isEdit ? 'Modifica los permisos del rol' : 'Define un nuevo rol y sus permisos'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre del rol */}
                <div className="space-y-2">
                    <label htmlFor="roleName" className="block text-sm font-medium text-gray-700">
                        Nombre del rol
                    </label>
                    <input
                        type="text"
                        id="roleName"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={isEdit}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${isEdit ? 'bg-gray-50 text-gray-500' : ''
                            } ${errors.name
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                        placeholder="Ej: manager, developer, viewer"
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                </div>

                {/* Permisos */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Permisos del rol
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                        {allPermissions.map((permission) => (
                            <label
                                key={permission.name}
                                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.permissions.some(p => p.name === permission.name)}
                                    onChange={() => handlePermissionToggle(permission)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{permission.name}</span>
                            </label>
                        ))}
                    </div>
                    {errors.permissions && (
                        <p className="text-sm text-red-600">{errors.permissions}</p>
                    )}
                </div>

                {/* Botones de acción */}
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
                        {isEdit ? 'Actualizar Rol' : 'Crear Rol'}
                    </button>
                </div>
            </form>
        </div>
    )
}
