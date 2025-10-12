"use client"
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/lib/store/AuthStore'
import { UserProps } from '@/lib/types/types'
import { getUserAvatar } from '@/lib/utils/avatar.utils'

interface EditUserFormProps {
    user: UserProps
    onSubmit: (data: { userId: string, newRole: string }) => void
    onCancel: () => void
}

export default function EditUserForm({ user, onSubmit, onCancel }: EditUserFormProps) {
    const { getValidAccessToken, listRoles, roles } = useAuthStore()
    const [selectedRole, setSelectedRole] = useState(
        typeof user.role === 'string' ? user.role : user.role?.name || ''
    )
    const [isRoleSelectOpen, setIsRoleSelectOpen] = useState(false)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const roleSelectRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadRoles()
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (roleSelectRef.current && !roleSelectRef.current.contains(event.target as Node)) {
                setIsRoleSelectOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const loadRoles = async () => {
        const token = await getValidAccessToken()
        if (token) {
            await listRoles(token)
        }
    }

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}

        if (!selectedRole) {
            newErrors.role = 'Debe seleccionar un rol'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            onSubmit({ userId: user.id, newRole: selectedRole })
        }
    }

    return (
        <div className="space-y-6 p-6">
            {/* Información del usuario */}
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-4">
                    <img
                        src={getUserAvatar(user)}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                        <h4 className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">
                            Rol actual: {typeof user.role === 'string' ? user.role : user.role?.name}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Select */}
                <div className="space-y-2 relative" ref={roleSelectRef}>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Nuevo rol del usuario
                    </label>
                    <button
                        onClick={() => setIsRoleSelectOpen(!isRoleSelectOpen)}
                        type="button"
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 flex items-center justify-between ${errors.role
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        <span className="text-sm text-gray-700">
                            {selectedRole || 'Seleccionar rol'}
                        </span>
                        <svg
                            className={`text-gray-400 w-4 h-4 transition-transform duration-200 ${isRoleSelectOpen ? "rotate-180" : ""}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>

                    {isRoleSelectOpen && (
                        <div className="border-gray-200 bg-white shadow-lg absolute z-10 top-full mt-1 flex flex-col rounded-lg border text-sm w-full max-h-40 overflow-y-auto">
                            {roles.map((role) => (
                                <button
                                    key={role.name}
                                    type="button"
                                    onClick={() => {
                                        setSelectedRole(role.name)
                                        setIsRoleSelectOpen(false)
                                        if (errors.role) setErrors(prev => ({ ...prev, role: '' }))
                                    }}
                                    className={`px-4 py-2 text-left hover:bg-gray-50 ${selectedRole === role.name ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                        }`}
                                >
                                    {role.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {errors.role && (
                        <p className="text-sm text-red-600">{errors.role}</p>
                    )}
                </div>


                <div className="flex justify-end gap-3 mt-4">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200 text-sm font-medium" type="button"
                        onClick={() => onCancel()}>
                        Cancelar
                    </button>
                    <button className={`bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 text-white focus:ring-2 rounded-md focus:ring-offset-2 transition-all duration-200 text-sm font-medium px-4 py-2`} type="submit">
                        Actualizar Rol
                    </button>
                </div>
            </form>
        </div>
    )
}
