"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useOrganizationStore } from "@/lib/store/OrganizationStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { UserProps } from "@/lib/types/types"
import { getUserAvatar } from "@/lib/utils/avatar.utils"
import { getUserRoleName } from "@/lib/utils/user.utils"
import CreateUserForm from "@/components/partials/config/users/CreateUserForm"
import { useModalStore } from "@/lib/hooks/ModalStore"
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll"
import { ArrowLeftRight, Plus, Users, MoreVertical } from "lucide-react"
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
    const { openModal, closeModal } = useModalStore()
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [page, setPage] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(true)

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

    // Cargar la siguiente página (atado al scroll principal de la app, no a un contenedor propio)
    const handleLoadMore = useCallback(async () => {
        if (!users) return

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
    }, [users, page, organization.organizationId, searchTerm, getValidAccessToken, loadMoreUsersByOrganization])

    useInfiniteScroll({
        loading: isLoading,
        hasMore: users ? page < users.totalPages - 1 : false,
        onLoadMore: handleLoadMore,
        threshold: 200
    })

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
        closeModal()
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

    const handleChangeOrganization = async (user: UserProps, data: { organizationId: string, role: string }) => {
        if (!user) return

        try {
            const token = await getValidAccessToken()
            if (!token) return

            const success = await useOrganizationStore.getState().changeUserOrganization(token, user.id, data)

            if (success) {
                // Actualizar la lista de usuarios
                await getUsersByOrganization(token, organization.organizationId, searchTerm, 0, 10)
                closeModal()
                toast.success("Usuario movido exitosamente")
            }
        } catch (error) {
            toast.error("Error al cambiar la organización del usuario")
        }
    }

    const handleCreateUserModal = () => {
        openModal({
            size: "lg",
            title: "Agregar Usuario",
            desc: "Añade un nuevo usuario a la organización",
            children: <CreateUserForm onSubmit={handleUserSubmit} onCancel={() => closeModal()} organizationId={organization.organizationId} />,
            Icon: <Plus size={20} strokeWidth={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "CREATE"
        })
    }

    const handleChangeOrgModal = (user: UserProps) => {
        openModal({
            size: "lg",
            title: "Cambiar Organización",
            desc: "Mueve el usuario a otra organización",
            children: <ChangeUserOrganizationModal user={user} currentOrganization={{ organizationId: organization.organizationId, organizationName: organization.organizationName }} onSubmit={(data) => handleChangeOrganization(user, data)} onCancel={() => closeModal()} />,
            Icon: <ArrowLeftRight size={20} strokeWidth={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "UPDATE"
        })
    }

    return (
        <>
            <div className="p-4">
                <h2 className="text-xl font-semibold mb-4" style={{ letterSpacing: "-0.02em", color: "var(--ds-text)" }}>Usuarios de la Organización</h2>

                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        className="h-9 px-3 rounded-md text-sm w-full sm:w-1/3 outline-none transition-shadow duration-150 shadow-[var(--shadow-border)] focus:shadow-[0_0_0_1px_var(--blue-700)] placeholder:text-[var(--ds-text-muted)]"
                        style={{ background: "var(--ds-card)", color: "var(--ds-text)" }}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                        }}
                    />
                    {/* Button to open the Add User modal */}
                    <button
                        onClick={() => handleCreateUserModal()}
                        className="px-4 h-9 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] flex items-center justify-center gap-2 flex-shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                        style={{ color: "var(--primary-contrast-fg)" }}
                    >
                        <Plus size={16} strokeWidth={1.5} />
                        Agregar Usuario
                    </button>
                </div>

                {displayedUsers.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="p-4 rounded-lg w-fit mx-auto mb-4" style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text-muted)" }}>
                            <Users size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-sm font-medium mb-1" style={{ color: "var(--ds-text)" }}>No hay usuarios</h3>
                        <p className="text-[13px]" style={{ color: "var(--ds-text-muted)" }}>Comienza agregando el primer usuario a la organización</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayedUsers.map((user) => (
                            <div key={user.id} className="flex flex-col gap-3 p-[18px]" style={{ background: "var(--ds-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-border)" }}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img
                                            src={getUserAvatar(user, 40)}
                                            alt={`${user.firstName} ${user.lastName}`}
                                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <h4 className="font-medium truncate" style={{ fontSize: 14, color: "var(--ds-text)" }}>
                                                {user.firstName} {user.lastName}
                                            </h4>
                                            <p className="text-xs truncate" style={{ color: "var(--ds-text-secondary)" }}>{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="relative flex-shrink-0">
                                        <button
                                            onClick={() => setShowUserMenu(showUserMenu === user.id ? null : user.id)}
                                            className="p-1 rounded-md transition-colors duration-150 hover:bg-[var(--gray-alpha-100)]"
                                            style={{ color: "var(--ds-text-muted)" }}
                                        >
                                            <MoreVertical size={18} strokeWidth={1.5} />
                                        </button>
                                        {showUserMenu === user.id && (
                                            <div ref={menuRef} className="absolute right-0 mt-2 w-56 z-10 overflow-hidden" style={{ background: "var(--ds-card)", border: "1px solid var(--ds-border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)" }}>
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => {
                                                            handleChangeOrgModal(user)
                                                            setShowUserMenu(null)
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm transition-colors duration-150 hover:bg-[var(--gray-alpha-100)]"
                                                        style={{ color: "var(--ds-text)" }}
                                                    >
                                                        Cambiar de Organización
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="text-xs font-medium px-2 py-[2px] rounded-full w-fit" style={{ background: "var(--blue-100)", color: "var(--blue-900)", border: "1px solid var(--blue-400)" }}>
                                    {getUserRoleName(user) || 'Sin rol'}
                                </span>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-center items-center p-4 col-span-full">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: "var(--blue-700)" }}></div>
                                <span className="text-sm ml-3" style={{ color: "var(--ds-text-secondary)" }}>Cargando usuarios...</span>
                            </div>
                        )}
                        {users && users.number >= users.totalPages - 1 && !isLoading && displayedUsers.length > 0 && (
                            <div className="text-center py-4 text-sm col-span-full" style={{ color: "var(--ds-text-muted)", borderTop: "1px solid var(--ds-border)" }}>
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
            {/* Modals are now managed by the modal store */}
        </>
    )
}
