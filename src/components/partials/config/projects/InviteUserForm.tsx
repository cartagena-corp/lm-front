"use client"

import { useState, useEffect } from "react"
import { RoleProps } from "@/lib/types/types"
import { useAuthStore } from "@/lib/store/AuthStore"
import { Send } from "lucide-react"

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
        <div className="space-y-6 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                    <label htmlFor="inviteEmail" className="block text-[13px] font-medium" style={{ color: "var(--ds-text-secondary)" }}>
                        Correo Electrónico <b style={{ color: "var(--red-700)" }}>*</b>
                    </label>
                    <input
                        type="email"
                        id="inviteEmail"
                        value={formData.email}
                        onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value })
                            if (errors.email) setErrors({ ...errors, email: "" })
                        }}
                        className="w-full h-9 px-3 rounded-md text-sm outline-none transition-shadow duration-150 placeholder:text-[var(--ds-text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                        style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: errors.email ? "0 0 0 1px var(--red-700)" : "var(--shadow-border)" }}
                        placeholder="usuario@ejemplo.com"
                        disabled={isLoading}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm" style={{ color: "var(--red-700)" }}>{errors.email}</p>
                    )}
                </div>

                {/* Role Select */}
                <div className="space-y-2">
                    <label className="block text-[13px] font-medium" style={{ color: "var(--ds-text-secondary)" }}>
                        Rol del Usuario <b style={{ color: "var(--red-700)" }}>*</b>
                    </label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => !isLoading && setIsRoleSelectOpen(!isRoleSelectOpen)}
                            disabled={isLoading}
                            className="w-full h-9 px-3 text-left rounded-md text-sm outline-none transition-shadow duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                            style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: errors.role ? "0 0 0 1px var(--red-700)" : "var(--shadow-border)" }}
                        >
                            {formData.role || "Selecciona un rol"}
                            <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                                <svg
                                    className="h-5 w-5 transition-transform duration-150"
                                    style={{ color: "var(--ds-text-muted)", transform: isRoleSelectOpen ? "rotate(180deg)" : undefined }}
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
                            <div
                                className="absolute z-10 w-full mt-1 rounded-md overflow-hidden"
                                style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-lg)", border: "1px solid var(--ds-border)" }}
                            >
                                <ul className="py-1 max-h-60 overflow-auto">
                                    {roles ? roles.map((role: RoleProps) => (
                                        <li
                                            key={role.name}
                                            onClick={() => {
                                                setFormData({ ...formData, role: role.name })
                                                setIsRoleSelectOpen(false)
                                                if (errors.role) setErrors({ ...errors, role: "" })
                                            }}
                                            className="px-3 py-2 text-sm cursor-pointer transition-colors duration-150 hover:bg-[var(--gray-alpha-100)]"
                                            style={{ color: "var(--ds-text)" }}
                                        >
                                            {role.name}
                                        </li>
                                    )) : (
                                        <li className="px-3 py-2 text-sm" style={{ color: "var(--ds-text-muted)" }}>
                                            Cargando roles...
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                    {errors.role && (
                        <p className="mt-1 text-sm" style={{ color: "var(--red-700)" }}>{errors.role}</p>
                    )}
                    <p className="mt-1 text-xs" style={{ color: "var(--ds-text-muted)" }}>
                        El rol determina los permisos que tendrá el usuario en la plataforma
                    </p>
                </div>

                <div className="rounded-md p-4" style={{ background: "var(--amber-100)", border: "1px solid var(--amber-400)" }}>
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5" style={{ color: "var(--amber-900)" }}>
                            <Send size={16} strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-sm font-medium" style={{ color: "var(--amber-900)" }}>
                                ¿Qué sucede al invitar?
                            </p>
                            <p className="text-sm mt-1" style={{ color: "var(--amber-900)" }}>
                                Se creará una cuenta para este usuario y se agregará automáticamente al proyecto.
                            </p>
                        </div>
                    </div>
                </div>


                {/* Form Actions */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                        style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 h-9 px-4 rounded-md text-sm font-medium transition-opacity duration-150 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                        style={{ background: "var(--primary-700)", color: "var(--primary-contrast-fg)" }}
                    >
                        {isLoading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--primary-contrast-fg)]"></div>
                        )}
                        {isLoading ? loadingMessage : "Invitar Usuario"}
                    </button>
                </div>
            </form>
        </div>
    )
}
