"use client"

import { useState, useEffect, useRef } from "react"
import { useAuthStore } from "@/lib/store/AuthStore"
import { UserProps } from "@/lib/types/types"
import { getUserAvatar } from "@/lib/utils/avatar.utils"
import { getUserRoleName } from "@/lib/utils/user.utils"
import Modal from "@/components/layout/Modal"
import InviteUserForm from "./InviteUserForm"
import {
    UsersIcon,
    FilterIcon,
    EditIcon,
    PlusIcon,
    XIcon,
    CheckmarkIcon
} from "@/assets/Icon"

interface AddUsersModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (userIds: string[]) => void
    onInviteUser?: (data: { email: string; role: string }) => void
    projectParticipants: UserProps[]
    isLoading?: boolean
    inviteLoadingMessage?: string
}

export default function AddUsersModal({
    isOpen,
    onClose,
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
    const modalUsersListRef = useRef<HTMLDivElement>(null)

    // Verificar permisos del usuario
    const userRole = normalizeUserRole(user)
    const hasUserCreatePermission = userRole?.permissions.some((p: any) => p.name === "USER_CREATE") ?? false

    // Efecto para búsqueda con debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (isOpen) {
                handleSearch()
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [searchQuery, isOpen])

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
        if (listElement && isOpen) {
            listElement.addEventListener('scroll', handleScroll)
            return () => listElement.removeEventListener('scroll', handleScroll)
        }
    }, [isLoadingMore, usersPagination, isOpen])

    // Efecto para cargar usuarios al abrir el modal
    useEffect(() => {
        if (isOpen) {
            handleSearch()
        }
    }, [isOpen])

    // Efecto para limpiar estado al cerrar
    useEffect(() => {
        if (!isOpen) {
            setSelectedUsers(new Set())
            setSearchQuery('')
            setShowInviteForm(false)
        }
    }, [isOpen])

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

    const handleClose = () => {
        setSelectedUsers(new Set())
        setSearchQuery('')
        setShowInviteForm(false)
        onClose()
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
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title=""
            customWidth="sm:max-w-2xl"
        >
            {showInviteForm ? (
                <InviteUserForm
                    onSubmit={handleInviteUser}
                    onCancel={() => setShowInviteForm(false)}
                    isLoading={isLoading}
                    initialEmail={searchQuery}
                    loadingMessage={inviteLoadingMessage}
                />
            ) : (
                <div className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Agregar Participantes
                    </h3>
                    <p className="text-sm text-gray-600">
                        Selecciona los usuarios que quieres agregar al proyecto
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <FilterIcon size={16} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar usuarios por nombre o correo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* User List */}
                <div
                    ref={modalUsersListRef}
                    className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg"
                >
                    <div className="p-4">
                        {(authLoading && availableUsers.length === 0) ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Cargando usuarios...</p>
                            </div>
                        ) : (availableUsers.length === 0 && !authLoading) ? (
                            <div className="text-center py-8">
                                <div className="p-4 bg-gray-50 text-gray-400 rounded-lg w-fit mx-auto mb-4">
                                    <UsersIcon size={32} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No hay usuarios disponibles
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {searchQuery
                                        ? 'No se encontraron usuarios que coincidan con la búsqueda'
                                        : 'Todos los usuarios ya están participando en el proyecto'
                                    }
                                </p>
                                {hasUserCreatePermission && searchQuery && (
                                    <button
                                        onClick={() => setShowInviteForm(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                                    >
                                        <PlusIcon size={16} />
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
                                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${selectedUsers.has(user.id)
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={getUserAvatar(user, 40)}
                                                    alt={`${user.firstName || ''} ${user.lastName || ''}`}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {user.firstName && user.lastName
                                                            ? `${user.firstName} ${user.lastName}`
                                                            : user.email
                                                        }
                                                    </h4>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                    <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit mt-1">
                                                        {getUserRoleName(user)}
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedUsers.has(user.id) && (
                                                <div className="text-blue-600">
                                                    <CheckmarkIcon size={20} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Indicador de carga para más usuarios */}
                                {isLoadingMore && (
                                    <div className="py-4">
                                        <div className="flex items-center justify-center gap-3 text-blue-600">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                            <span className="text-sm">Cargando más usuarios...</span>
                                        </div>
                                    </div>
                                )}

                                {/* Indicador de fin de lista */}
                                {usersPagination && usersPagination.number >= usersPagination.totalPages - 1 && !isLoadingMore && availableUsers.length > 0 && (
                                    <div className="text-center py-4 text-gray-500 text-sm">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                            <span>No hay más usuarios para mostrar</span>
                                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            {selectedUsers.size} usuarios seleccionados
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={selectedUsers.size === 0 || isLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {isLoading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                )}
                                Agregar Participantes
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            )}
        </Modal>
    )
}
