"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { RoleProps } from "@/lib/types/types"
import { useAuthStore } from "@/lib/store/AuthStore"
import { ChevronDown } from "lucide-react"
import { computeDropdownPosition } from "@/lib/utils/dropdown.utils"

const ROLE_DROPDOWN_MAX_HEIGHT = 240 // px, debe coincidir con max-h-60 del panel

interface CreateUserFormConfigProps {
    onSubmit: (data: { email: string; role: string }) => void
    onCancel: () => void
}

export default function CreateUserFormConfig({ onSubmit, onCancel }: CreateUserFormConfigProps) {
    const { getValidAccessToken, listRoles, roles } = useAuthStore()
    const [formData, setFormData] = useState({ email: "", role: "" })
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [isRoleSelectOpen, setIsRoleSelectOpen] = useState(false)
    const roleSelectRef = useRef<HTMLDivElement>(null)
    const roleDropdownRef = useRef<HTMLDivElement>(null)
    const [mounted, setMounted] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState<{ top?: number, bottom?: number, left: number, width: number, openUpward: boolean }>({ left: 0, width: 0, openUpward: false })

    // Necesario para el portal del dropdown: document solo existe en el cliente
    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const loadRoles = async () => {
            const token = await getValidAccessToken()
            if (token) {
                await listRoles(token)
            }
        }
        loadRoles()
    }, [])

    // El dropdown se porta a document.body para no quedar recortado por el overflow-y-auto
    // del contenido de la modal (Modal.tsx), que además rompe position:fixed al animar con
    // un transform en framer-motion.
    useEffect(() => {
        if (isRoleSelectOpen && roleSelectRef.current) {
            const rect = roleSelectRef.current.getBoundingClientRect()
            setDropdownPosition(computeDropdownPosition(rect, { maxHeight: ROLE_DROPDOWN_MAX_HEIGHT, gap: 4 }))
        }
    }, [isRoleSelectOpen])

    useEffect(() => {
        if (!isRoleSelectOpen) return
        const handleScroll = (event: Event) => {
            const target = event.target as Node
            if (roleDropdownRef.current?.contains(target)) return
            setIsRoleSelectOpen(false)
        }
        window.addEventListener('scroll', handleScroll, true)
        return () => window.removeEventListener('scroll', handleScroll, true)
    }, [isRoleSelectOpen])

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
        <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-[13px] font-medium" style={{ color: "var(--ds-text-secondary)" }}>
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
                        className="w-full h-9 px-3 rounded-md text-sm bg-[var(--ds-card)] outline-none transition-shadow duration-150 placeholder:text-[var(--ds-text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                        style={{ color: "var(--ds-text)", boxShadow: errors.email ? "0 0 0 1px var(--red-700)" : "var(--shadow-border)" }}
                        placeholder="usuario@ejemplo.com"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm" style={{ color: "var(--red-700)" }}>{errors.email}</p>
                    )}
                </div>

                {/* Role Select */}
                <div className="space-y-2 relative" ref={roleSelectRef}>
                    <label className="block text-[13px] font-medium" style={{ color: "var(--ds-text-secondary)" }}>
                        Rol del Usuario
                    </label>
                    <button
                        type="button"
                        onClick={() => setIsRoleSelectOpen(!isRoleSelectOpen)}
                        className="w-full flex items-center justify-between h-9 px-3 rounded-md text-sm transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                        style={{ background: "var(--ds-card)", boxShadow: errors.role ? "0 0 0 1px var(--red-700)" : "var(--shadow-border)", color: formData.role ? "var(--ds-text)" : "var(--ds-text-muted)" }}
                    >
                        <span className="truncate">{formData.role || "Selecciona un rol"}</span>
                        <ChevronDown
                            size={16}
                            strokeWidth={2}
                            className={`flex-shrink-0 transition-transform duration-200 ${isRoleSelectOpen ? "rotate-180" : ""}`}
                            style={{ color: "var(--ds-text-muted)" }}
                        />
                    </button>

                    {isRoleSelectOpen && mounted && createPortal(
                        <div
                            ref={roleDropdownRef}
                            className="fixed z-[9999] rounded-md text-sm max-h-60 overflow-auto"
                            style={{
                                ...(dropdownPosition.openUpward ? { bottom: dropdownPosition.bottom } : { top: dropdownPosition.top }),
                                left: dropdownPosition.left,
                                width: dropdownPosition.width,
                                background: "var(--ds-card)", border: "1px solid var(--ds-border)", boxShadow: "var(--shadow-lg)"
                            }}
                        >
                            <ul className="py-1">
                                {roles ? roles.map((role: RoleProps) => (
                                    <li
                                        key={role.name}
                                        onClick={() => {
                                            setFormData({ ...formData, role: role.name })
                                            setIsRoleSelectOpen(false)
                                            if (errors.role) setErrors({ ...errors, role: "" })
                                        }}
                                        className="px-3 py-2 cursor-pointer transition-colors duration-150 hover:bg-[var(--gray-alpha-100)]"
                                        style={{ color: "var(--ds-text)" }}
                                    >
                                        {role.name}
                                    </li>
                                )) : (
                                    <li className="px-3 py-2" style={{ color: "var(--ds-text-muted)" }}>
                                        Cargando roles...
                                    </li>
                                )}
                            </ul>
                        </div>,
                        document.body
                    )}
                    {errors.role && (
                        <p className="mt-1 text-sm" style={{ color: "var(--red-700)" }}>{errors.role}</p>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--ds-card)] hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                        style={{ color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                        type="button"
                        onClick={() => onCancel()}>
                        Cancelar
                    </button>
                    <button
                        className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                        style={{ color: "var(--primary-contrast-fg)" }}
                        type="submit">
                        Agregar Usuario
                    </button>
                </div>
            </form>
        </div>
    )
}
