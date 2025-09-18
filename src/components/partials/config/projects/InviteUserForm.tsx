"use client"

import { useState, useEffect } from "react"
import { RoleProps } from "@/lib/types/types"
import { useAuthStore } from "@/lib/store/AuthStore"
import { UsersIcon, SendIcon } from "@/assets/Icon"

interface InviteUserFormProps {
    onSubmit: (data: { email: string; role: string }) => void
    onCancel: () => void
    isLoading?: boolean
    initialEmail?: string
    loadingMessage?: string
}

export default function InviteUserForm({ onSubmit, onCancel, isLoading = false, initialEmail = "", loadingMessage = "Invitando..." }: InviteUserFormProps) {
    const { getValidAccessToken, listRoles, roles } = useAuthStore()
    const [formData, setFormData] = useState({ email: initialEmail, role: "" })
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [isRoleSelectOpen, setIsRoleSelectOpen] = useState(false)

    useEffect(() => {
        const loadRoles = async () => {
            const token = await getValidAccessToken()
            if (token) {
                await listRoles(token)
            }
        }
        loadRoles()
    }, [])

    // Efecto para actualizar el email cuando cambia initialEmail
    useEffect(() => {
        if (initialEmail) {
            setFormData(prev => ({ ...prev, email: initialEmail }))
        }
    }, [initialEmail])

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}

        if (!formData.email) {
            newErrors.email = "El correo electrónico es requerido"
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = "Correo electrónico inválido"
        }

        if (!formData.role) {
            newErrors.role = "El rol es requerido"
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

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg w-fit mx-auto">
                    <UsersIcon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                    Invitar Usuario a La Muralla
                </h3>
                <p className="text-sm text-gray-500">
                    Este usuario no se encuentra en la plataforma. Invítalo ingresando su correo electrónico y asignándole un rol.
                </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="text-amber-600 mt-0.5">
                        <SendIcon size={16} />
                    </div>
                    <div>
                        <p className="text-sm text-amber-800 font-medium">
                            ¿Qué sucede al invitar?
                        </p>
                        <p className="text-sm text-amber-700 mt-1">
                            Se creará una cuenta para este usuario y se agregará automáticamente al proyecto.
                            El usuario recibirá una notificación para configurar su cuenta.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                    <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Correo Electrónico *
                    </label>
                    <input
                        type="email"
                        id="inviteEmail"
                        value={formData.email}
                        onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value })
                            if (errors.email) setErrors({ ...errors, email: "" })
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                            errors.email
                                ? "border-red-300 focus:ring-red-200"
                                : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                        }`}
                        placeholder="usuario@ejemplo.com"
                        disabled={isLoading}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                        Se enviará una invitación a este correo electrónico
                    </p>
                </div>

                {/* Role Select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rol del Usuario *
                    </label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => !isLoading && setIsRoleSelectOpen(!isRoleSelectOpen)}
                            disabled={isLoading}
                            className={`w-full px-3 py-2 text-left border rounded-lg focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                errors.role
                                    ? "border-red-300 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                            }`}
                        >
                            {formData.role || "Selecciona un rol"}
                            <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                                <svg
                                    className={`h-5 w-5 text-gray-400 transition-transform ${
                                        isRoleSelectOpen ? "transform rotate-180" : ""
                                    }`}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </span>
                        </button>

                        {isRoleSelectOpen && !isLoading && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                                <ul className="py-1 max-h-60 overflow-auto">
                                    {roles ? roles.map((role: RoleProps) => (
                                        <li
                                            key={role.name}
                                            onClick={() => {
                                                setFormData({ ...formData, role: role.name })
                                                setIsRoleSelectOpen(false)
                                                if (errors.role) setErrors({ ...errors, role: "" })
                                            }}
                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            {role.name}
                                        </li>
                                    )) : (
                                        <li className="px-3 py-2 text-gray-500">
                                            Cargando roles...
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                    {errors.role && (
                        <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                        El rol determina los permisos que tendrá el usuario en la plataforma
                    </p>
                </div>

                {/* Form Actions */}
                <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1 bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            {isLoading ? loadingMessage : "Invitar Usuario"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}