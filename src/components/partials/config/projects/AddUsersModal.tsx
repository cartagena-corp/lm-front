"use client"

import { useState, useEffect, useRef } from "react"
import { useAuthStore } from "@/lib/store/AuthStore"
import { UserProps } from "@/lib/types/types"
import { getUserAvatar } from "@/lib/utils/avatar.utils"
import { getUserRoleName } from "@/lib/utils/user.utils"
import InviteUserForm from "./InviteUserForm"
import {
    Users,
    Filter,
    Plus,
    CircleCheck
} from "lucide-react"

interface AddUsersModalProps {
    onSubmit: (userIds: string[]) => void
    onInviteUser?: (data: { email: string; role: string }) => void
    projectParticipants: UserProps[]
    isLoading?: boolean
    inviteLoadingMessage?: string
}

export default function AddUsersModal({
    onSubmit,
    onInviteUser,
    projectParticipants,
    isLoading = false,
    inviteLoadingMessage = "Invitando..."
}: AddUsersModalProps) {
    const {
        listUsers,
        usersPagination,
        isLoading: authLoading,
        getValidAccessToken,
        getListUsers,
        loadMoreUsers,
        user,
        normalizeUserRole
    } = useAuthStore()

    // Estados locales
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [showInviteForm, setShowInviteForm] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(true)
    const modalUsersListRef = useRef<HTMLDivElement>(null)

    // Verificar permisos del usuario
    const userRole = normalizeUserRole(user)
    const hasUserCreatePermission = userRole?.permissions.some((p: any) => p.name === "USER_CREATE") ?? false

    // Efecto para búsqueda con debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (isModalOpen) {
                handleSearch()
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [searchQuery, isModalOpen])

    // Efecto para detectar scroll y cargar más usuarios
    useEffect(() => {
        const handleScroll = () => {
            if (!modalUsersListRef.current || isLoadingMore || !usersPagination) return

            const { scrollTop, scrollHeight, clientHeight } = modalUsersListRef.current
            const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200

            if (isNearBottom && usersPagination.number < usersPagination.totalPages - 1) {
                loadMoreUsersData()
            }
        }

        const listElement = modalUsersListRef.current
        if (listElement && isModalOpen) {
            listElement.addEventListener('scroll', handleScroll)
            return () => listElement.removeEventListener('scroll', handleScroll)
        }
    }, [isLoadingMore, usersPagination, isModalOpen])

    // Efecto para cargar usuarios al abrir el modal
    useEffect(() => {
        if (isModalOpen) {
            handleSearch()
        }
    }, [isModalOpen])

    // Efecto para limpiar estado al cerrar
    useEffect(() => {
        if (!isModalOpen) {
            setSelectedUsers(new Set())
            setSearchQuery('')
            setShowInviteForm(false)
        }
    }, [isModalOpen])

    const handleSearch = async () => {
        const token = await getValidAccessToken()
        if (token) {
            await getListUsers(token, searchQuery, 0, 10)
        }
    }

    const loadMoreUsersData = async () => {
        if (isLoadingMore || !usersPagination) return

        setIsLoadingMore(true)
        const token = await getValidAccessToken()
        if (token) {
            await loadMoreUsers(token, searchQuery)
        }
        setIsLoadingMore(false)
    }

    const toggleUserSelection = (userId: string) => {
        const newSelection = new Set(selectedUsers)
        if (newSelection.has(userId)) {
            newSelection.delete(userId)
        } else {
            newSelection.add(userId)
        }
        setSelectedUsers(newSelection)
    }

    const handleSubmit = () => {
        if (selectedUsers.size === 0) return
        onSubmit(Array.from(selectedUsers))
    }

    const handleInviteUser = (data: { email: string; role: string }) => {
        if (onInviteUser) {
            onInviteUser(data)
        }
        setShowInviteForm(false)
    }

    // Filtrar usuarios que ya están en el proyecto
    const availableUsers = listUsers.filter(user =>
        !projectParticipants.some(participant => participant.id === user.id)
    )

    return (
        <>
            {showInviteForm ? (
                <InviteUserForm
                    onSubmit={handleInviteUser}
                    onCancel={() => setShowInviteForm(false)}
                    isLoading={isLoading}
                    initialEmail={searchQuery}
                    loadingMessage={inviteLoadingMessage}
                />
            ) : (
                <div className="space-y-6 p-6">

                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "var(--ds-text-muted)" }}>
                        <Filter size={16} strokeWidth={1.5} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar usuarios por nombre o correo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 pl-10 pr-4 rounded-md text-sm outline-none transition-shadow duration-150 placeholder:text-[var(--ds-text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                        style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                    />
                </div>

                {/* User List */}
                <div
                    ref={modalUsersListRef}
                    className="max-h-96 overflow-y-auto rounded-md"
                    style={{ boxShadow: "var(--shadow-border)" }}
                >
                    <div className="p-4">
                        {(authLoading && availableUsers.length === 0) ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: "var(--blue-700)" }}></div>
                                <p className="text-sm" style={{ color: "var(--ds-text-secondary)" }}>Cargando usuarios...</p>
                            </div>
                        ) : (availableUsers.length === 0 && !authLoading) ? (
                            <div className="text-center py-8">
                                <div className="w-fit mx-auto mb-4 p-4" style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text-muted)", borderRadius: "var(--radius-md)" }}>
                                    <Users size={32} strokeWidth={1.5} />
                                </div>
                                <h3 className="font-semibold mb-2" style={{ fontSize: 16, color: "var(--ds-text)" }}>
                                    No hay usuarios disponibles
                                </h3>
                                <p className="mb-4 text-sm" style={{ color: "var(--ds-text-secondary)" }}>
                                    {searchQuery
                                        ? 'No se encontraron usuarios que coincidan con la búsqueda'
                                        : 'Todos los usuarios ya están participando en el proyecto'
                                    }
                                </p>
                                {hasUserCreatePermission && searchQuery && (
                                    <button
                                        onClick={() => setShowInviteForm(true)}
                                        className="flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium mx-auto transition-opacity duration-150 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                                        style={{ background: "var(--primary-700)", color: "var(--primary-contrast-fg)" }}
                                    >
                                        <Plus size={16} strokeWidth={1.5} />
                                        Invitar "{searchQuery}" a La Muralla
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {availableUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => toggleUserSelection(user.id)}
                                        className="p-4 rounded-md cursor-pointer transition-colors duration-150 hover:bg-[var(--gray-alpha-100)]"
                                        style={selectedUsers.has(user.id)
                                            ? { boxShadow: "0 0 0 1px var(--blue-700)", background: "var(--blue-100)" }
                                            : { boxShadow: "var(--shadow-border)" }}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <img
                                                    src={getUserAvatar(user, 40)}
                                                    alt={`${user.firstName || ''} ${user.lastName || ''}`}
                                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <h4 className="font-medium text-sm truncate" style={{ color: "var(--ds-text)" }}>
                                                        {user.firstName && user.lastName
                                                            ? `${user.firstName} ${user.lastName}`
                                                            : user.email
                                                        }
                                                    </h4>
                                                    <p className="text-sm truncate" style={{ color: "var(--ds-text-secondary)" }}>{user.email}</p>
                                                    <p className="inline-block text-xs px-2 py-1 rounded-full w-fit mt-1" style={{ background: "var(--blue-100)", color: "var(--blue-900)" }}>
                                                        {getUserRoleName(user)}
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedUsers.has(user.id) && (
                                                <div className="flex-shrink-0" style={{ color: "var(--blue-700)" }}>
                                                    <CircleCheck size={20} strokeWidth={1.5} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Indicador de carga para más usuarios */}
                                {isLoadingMore && (
                                    <div className="py-4">
                                        <div className="flex items-center justify-center gap-3" style={{ color: "var(--blue-700)" }}>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: "var(--blue-700)" }}></div>
                                            <span className="text-sm">Cargando más usuarios...</span>
                                        </div>
                                    </div>
                                )}

                                {/* Indicador de fin de lista */}
                                {usersPagination && usersPagination.number >= usersPagination.totalPages - 1 && !isLoadingMore && availableUsers.length > 0 && (
                                    <div className="text-center py-4 text-sm" style={{ color: "var(--ds-text-muted)" }}>
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ background: "var(--gray-alpha-300)" }}></div>
                                            <span>No hay más usuarios para mostrar</span>
                                            <div className="w-2 h-2 rounded-full" style={{ background: "var(--gray-alpha-300)" }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-6" style={{ borderTop: "1px solid var(--ds-border)" }}>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-sm" style={{ color: "var(--ds-text-secondary)" }}>
                            {selectedUsers.size} usuarios seleccionados
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSubmit}
                                disabled={selectedUsers.size === 0 || isLoading}
                                className="flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium transition-opacity duration-150 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                                style={{ background: "var(--primary-700)", color: "var(--primary-contrast-fg)" }}
                            >
                                {isLoading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--primary-contrast-fg)]"></div>
                                )}
                                Agregar Participantes
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            )}
        </>
    )
}
