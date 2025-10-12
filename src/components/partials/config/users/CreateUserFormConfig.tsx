"use client"

import { useState, useEffect } from "react"
import { RoleProps } from "@/lib/types/types"
import { useAuthStore } from "@/lib/store/AuthStore"
import { ChevronRightIcon } from "@/assets/Icon"

interface CreateUserFormConfigProps {
    onSubmit: (data: { email: string; role: string }) => void
    onCancel: () => void
}

export default function CreateUserFormConfig({ onSubmit, onCancel }: CreateUserFormConfigProps) {
    const { getValidAccessToken, listRoles, roles } = useAuthStore()
    const [formData, setFormData] = useState({ email: "", role: "" })
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
        <div className="space-y-6 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Correo Electrónico
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value })
                            if (errors.email) setErrors({ ...errors, email: "" })
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.email
                            ? "border-red-300 focus:ring-red-200"
                            : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                            }`}
                        placeholder="usuario@ejemplo.com"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                </div>

                {/* Role Select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rol del Usuario
                    </label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsRoleSelectOpen(!isRoleSelectOpen)}
                            className={`w-full px-3 py-2 text-left border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.role
                                ? "border-red-300 focus:ring-red-200"
                                : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                                }`}
                        >
                            {formData.role || "Selecciona un rol"}
                            <span className={`${isRoleSelectOpen ? "-rotate-180" : "rotate-0"} absolute inset-y-0 right-0 flex items-center p-2 duration-200`}>
                                <span className="rotate-90">
                                    <ChevronRightIcon size={18} stroke={1.75} />
                                </span>
                            </span>
                        </button>

                        {isRoleSelectOpen && (
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
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200 text-sm font-medium" type="button"
                        onClick={() => onCancel()}>
                        Cancelar
                    </button>
                    <button className={`bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white focus:ring-2 rounded-md focus:ring-offset-2 transition-all duration-200 text-sm font-medium px-4 py-2`} type="submit">
                        Agregar Usuario
                    </button>
                </div>
            </form>
        </div>
    )
}
