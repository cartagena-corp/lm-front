"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useOrganizationStore } from "@/lib/store/OrganizationStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll"
import { UserProps, GlobalPagination } from "@/lib/types/types"
import { getUserAvatar } from "@/lib/utils/avatar.utils"
import { getUserRoleName } from "@/lib/utils/user.utils"
import CreateUserForm from "@/components/partials/config/users/CreateUserForm"
import Modal from "@/components/layout/Modal"
import { PlusIcon, UsersIcon } from "@/assets/Icon"
import toast from "react-hot-toast"
import ChangeUserOrganizationModal from "@/components/partials/config/users/ChangeUserOrganizationModal"

// Utilidad para normalizar el campo role (copiado de UserConfig.tsx)
function normalizeUsersRole(users: UserProps[]): UserProps[] {
    return users.map(user => ({
        ...user,
        role: typeof user.role === 'string' ? { name: user.role, permissions: [] } : user.role
    }))
}

interface UsersOrgProps {
    organization: { organizationId: string; organizationName: string; createdAt: string }
}

export default function UsersOrg({ organization }: UsersOrgProps) {
    const { users, error, getUsersByOrganization, loadMoreUsersByOrganization } = useOrganizationStore()
    const { getValidAccessToken, addUserWithOrganization } = useAuthStore()
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [page, setPage] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [showCreateUserModal, setShowCreateUserModal] = useState(false)
    
    // Referencia para el contenedor con scroll
    const containerRef = useRef<HTMLDivElement>(null)
    // Almacenar todos los usuarios mostrados
    const [displayedUsers, setDisplayedUsers] = useState<UserProps[]>([])
    // Debounce para la búsqueda
    const searchTimeout = useRef<NodeJS.Timeout | null>(null)

    // Cargar usuarios iniciales
    useEffect(() => {
        const loadUsers = async () => {
            const token = await getValidAccessToken()
            if (!token) return

            setIsLoading(true)
            try {
                await getUsersByOrganization(token, organization.organizationId, searchTerm, 0, 10)
            } catch (error) {
                console.error('Error loading users:', error)
                toast.error('Error al cargar usuarios')
            } finally {
                setIsLoading(false)
            }
        }

        loadUsers()
    }, [organization.organizationId])

    // Actualizar usuarios mostrados cuando cambia users en el store
    useEffect(() => {
        if (!users?.content) return
        const normalizedUsers = normalizeUsersRole(users.content)
        
        if (users.number === 0) {
            setDisplayedUsers(normalizedUsers)
        } else {
            setDisplayedUsers(prev => {
                const existingIds = new Set(prev.map(user => user.id))
                const newUsers = normalizedUsers.filter(user => !existingIds.has(user.id))
                return [...prev, ...newUsers]
            })
        }
    }, [users])

    // Manejar búsqueda con debounce
    useEffect(() => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current)
        }

        searchTimeout.current = setTimeout(async () => {
            const token = await getValidAccessToken()
            if (!token) return

            setIsLoading(true)
            try {
                // Resetear a la primera página en búsquedas
                setPage(0)
                await getUsersByOrganization(token, organization.organizationId, searchTerm, 0, 10)
            } catch (error) {
                console.error('Error searching users:', error)
                toast.error('Error al buscar usuarios')
            } finally {
                setIsLoading(false)
            }
        }, 500)

        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current)
            }
        }
    }, [searchTerm])

    // Manejar scroll infinito
    useEffect(() => {
        const handleScroll = async () => {
            if (!containerRef.current || !users || isLoading) return

            const { scrollTop, scrollHeight, clientHeight } = containerRef.current
            const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100

            if (scrollPercentage > 75 && page < users.totalPages - 1) {
                const token = await getValidAccessToken()
                if (!token) return

                setIsLoading(true)
                try {
                    const nextPage = page + 1
                    await loadMoreUsersByOrganization(token, organization.organizationId, searchTerm, nextPage, 10)
                    setPage(nextPage)
                } catch (error) {
                    console.error('Error loading more users:', error)
                    toast.error('Error al cargar más usuarios')
                } finally {
                    setIsLoading(false)
                }
            }
        }

        const container = containerRef.current
        if (container) {
            container.addEventListener('scroll', handleScroll)
            return () => container.removeEventListener('scroll', handleScroll)
        }
    }, [users, page, isLoading, organization.organizationId, searchTerm])

    // State for change organization modal
    const [showChangeOrgModal, setShowChangeOrgModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserProps | null>(null)
    const [showUserMenu, setShowUserMenu] = useState<string | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    // Effect to handle clicking outside of user menus
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleUserSubmit = async (data: { email: string, role: string, organizationId: string }) => {
        setShowCreateUserModal(false)
        try {
            const token = await getValidAccessToken()
            if (!token) return

            await addUserWithOrganization(token, data)
            // Después de añadir el usuario exitosamente, actualizamos la lista de usuarios de la organización
            await getUsersByOrganization(token, organization.organizationId, searchTerm, 0, 10)
            toast.success("Usuario añadido con éxito")
        } catch (error) {
            toast.error("Error al tratar de añadir el usuario")
        }
    }

    const handleChangeOrganization = async (data: { organizationId: string, role: string }) => {
        if (!selectedUser) return

        try {
            const token = await getValidAccessToken()
            if (!token) return

            const success = await useOrganizationStore.getState().changeUserOrganization(token, selectedUser.id, data)
            
            if (success) {
                // Actualizar la lista de usuarios
                await getUsersByOrganization(token, organization.organizationId, searchTerm, 0, 10)
                setShowChangeOrgModal(false)
                toast.success("Usuario movido exitosamente")
            }
        } catch (error) {
            toast.error("Error al cambiar la organización del usuario")
        }
    }

    return (
        <>
            <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">Usuarios de la Organización</h2>

                <div className="mb-4 flex justify-between items-center">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        className="p-2 border border-gray-300 rounded-md w-1/3"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                        }}
                    />
                    {/* Button to open the Add User modal */}
                    <button
                        onClick={() => setShowCreateUserModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <PlusIcon size={16} />
                        Agregar Usuario
                    </button>
                </div>

                {displayedUsers.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="p-4 bg-gray-50 text-gray-400 rounded-lg w-fit mx-auto mb-4">
                            <UsersIcon size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay usuarios</h3>
                        <p className="text-gray-600">Comienza agregando el primer usuario a la organización</p>
                    </div>
                ) : (
                    <div
                        ref={containerRef}
                        className="grid grid-cols-1 gap-4 pr-2 overflow-y-auto max-h-[calc(100vh-250px)]"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {displayedUsers.map((user) => (
                            <div key={user.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex items-center gap-4">
                                <img
                                    src={getUserAvatar(user, 48)}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">
                                        {user.firstName} {user.lastName}
                                    </h4>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                    <p className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full w-fit mt-1">
                                        {getUserRoleName(user) || 'Sin rol'}
                                    </p>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(showUserMenu === user.id ? null : user.id)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                                        </svg>
                                    </button>
                                    {showUserMenu === user.id && (
                                        <div ref={menuRef} className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
                                            <div className="py-1">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user)
                                                        setShowChangeOrgModal(true)
                                                        setShowUserMenu(null)
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Cambiar de Organización
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-center items-center p-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="text-sm text-gray-600 ml-3">Cargando usuarios...</span>
                            </div>
                        )}
                        {users && users.number >= users.totalPages - 1 && !isLoading && displayedUsers.length > 0 && (
                            <div className="text-center py-4 text-gray-500 text-sm border-t border-gray-100">
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
            {/* Modal for creating a new user */}
            <Modal
                isOpen={showCreateUserModal}
                onClose={() => setShowCreateUserModal(false)}
                title=""
            >
                <CreateUserForm
                    onSubmit={handleUserSubmit}
                    onCancel={() => setShowCreateUserModal(false)}
                    organizationId={organization.organizationId}
                />
            </Modal>

            {/* Modal for changing organization */}
            <Modal
                isOpen={showChangeOrgModal}
                onClose={() => setShowChangeOrgModal(false)}
                title=""
            >
                {selectedUser && (
                    <ChangeUserOrganizationModal
                        user={selectedUser}
                        currentOrganization={{
                            organizationId: organization.organizationId,
                            organizationName: organization.organizationName
                        }}
                        onSubmit={handleChangeOrganization}
                        onCancel={() => setShowChangeOrgModal(false)}
                    />
                )}
            </Modal>
        </>
    )
}
