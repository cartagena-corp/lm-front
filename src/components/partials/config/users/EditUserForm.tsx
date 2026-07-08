"use client"
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuthStore } from '@/lib/store/AuthStore'
import { UserProps } from '@/lib/types/types'
import { getUserAvatar } from '@/lib/utils/avatar.utils'
import { ChevronDown, Check } from 'lucide-react'
import { computeDropdownPosition } from '@/lib/utils/dropdown.utils'

const ROLE_DROPDOWN_MAX_HEIGHT = 160 // px, debe coincidir con max-h-40 del panel

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
    const roleDropdownRef = useRef<HTMLDivElement>(null)
    const [mounted, setMounted] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState<{ top?: number, bottom?: number, left: number, width: number, openUpward: boolean }>({ left: 0, width: 0, openUpward: false })

    // Necesario para el portal del dropdown: document solo existe en el cliente
    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            if (roleSelectRef.current?.contains(target)) return
            if (roleDropdownRef.current?.contains(target)) return
            setIsRoleSelectOpen(false)
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
        <div className="p-6 space-y-6">
            {/* Información del usuario */}
            <div className="rounded-md p-4" style={{ background: "var(--gray-alpha-100)" }}>
                <div className="flex items-center gap-4">
                    <img
                        src={getUserAvatar(user)}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                        <h4 className="font-medium truncate" style={{ color: "var(--ds-text)" }}>
                            {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-sm truncate" style={{ color: "var(--ds-text-muted)" }}>{user.email}</p>
                        <p className="text-xs truncate" style={{ color: "var(--ds-text-muted)" }}>
                            Rol actual: {typeof user.role === 'string' ? user.role : user.role?.name}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Select */}
                <div className="space-y-2 relative" ref={roleSelectRef}>
                    <label htmlFor="role" className="block text-[13px] font-medium" style={{ color: "var(--ds-text-secondary)" }}>
                        Nuevo rol del usuario
                    </label>
                    <button
                        onClick={() => setIsRoleSelectOpen(!isRoleSelectOpen)}
                        type="button"
                        className="w-full flex items-center justify-between h-9 px-3 rounded-md text-sm transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                        style={{ background: "var(--ds-card)", boxShadow: errors.role ? "0 0 0 1px var(--red-700)" : "var(--shadow-border)" }}
                    >
                        <span className="truncate" style={{ color: selectedRole ? "var(--ds-text)" : "var(--ds-text-muted)" }}>
                            {selectedRole || 'Seleccionar rol'}
                        </span>
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
                            className="fixed z-[9999] rounded-md text-sm max-h-40 overflow-y-auto"
                            style={{
                                ...(dropdownPosition.openUpward ? { bottom: dropdownPosition.bottom } : { top: dropdownPosition.top }),
                                left: dropdownPosition.left,
                                width: dropdownPosition.width,
                                background: "var(--ds-card)", border: "1px solid var(--ds-border)", boxShadow: "var(--shadow-lg)"
                            }}
                        >
                            {roles.map((role) => (
                                <button
                                    key={role.name}
                                    type="button"
                                    onClick={() => {
                                        setSelectedRole(role.name)
                                        setIsRoleSelectOpen(false)
                                        if (errors.role) setErrors(prev => ({ ...prev, role: '' }))
                                    }}
                                    className="w-full flex items-center justify-between gap-2 px-4 py-2 text-left truncate transition-colors duration-150 hover:bg-[var(--gray-alpha-100)]"
                                    style={{ color: "var(--ds-text-secondary)" }}
                                >
                                    <span className="truncate">{role.name}</span>
                                    {selectedRole === role.name && (
                                        <Check size={16} strokeWidth={2} className="flex-shrink-0" style={{ color: "var(--blue-700)" }} />
                                    )}
                                </button>
                            ))}
                        </div>,
                        document.body
                    )}

                    {errors.role && (
                        <p className="text-sm" style={{ color: "var(--red-700)" }}>{errors.role}</p>
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
                        Actualizar Rol
                    </button>
                </div>
            </form>
        </div>
    )
}
