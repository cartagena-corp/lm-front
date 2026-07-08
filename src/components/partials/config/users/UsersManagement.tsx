"use client"
import { useCallback, useEffect, useState } from 'react'

// Components
import CreateUserFormConfig from './CreateUserFormConfig'
import DeleteUserForm from './DeleteUserForm'
import ImportUsersForm from './ImportUsersForm'
import EditUserForm from './EditUserForm'

// Store
import { useAuthStore } from '@/lib/store/AuthStore'
import { useModalStore } from '@/lib/hooks/ModalStore'
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll'

// Utils
import { getUserAvatar } from '@/lib/utils/avatar.utils'
import { getUserRoleName } from '@/lib/utils/user.utils'

// Types
import { PermissionProps, UserProps } from '@/lib/types/types'

// Icons
import { Users, Plus, Pencil, Download, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'

// Utilidad para normalizar el campo role
function normalizeUsersRole(users: UserProps[]): UserProps[] {
    return users.map(user => ({
        ...user,
        role: typeof user.role === 'string' ? { name: user.role, permissions: [] } : user.role
    }))
}

export default function UsersManagement() {
    const {
        listUsers,
        usersPagination,
        isLoading,
        error,
        getValidAccessToken,
        getListUsers,
        loadMoreUsers,
        addUser,
        editUser,
        deleteUser,
        clearError,
        importUsers
    } = useAuthStore()

    const { openModal, closeModal } = useModalStore()

    // Estados para búsqueda y paginación
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [displayedUsers, setDisplayedUsers] = useState<UserProps[]>([])

    // Cargar datos iniciales
    useEffect(() => {
        const initializeData = async () => {
            const token = await getValidAccessToken()
            if (token) {
                await loadData()
            }
        }
        initializeData()
    }, [])

    // Efecto para búsqueda con debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch()
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [searchQuery])

    const loadData = async () => {
        const token = await getValidAccessToken()
        if (token) {
            await getListUsers(token, '', 0, 10)
            const { listUsers } = useAuthStore.getState()
            setDisplayedUsers(normalizeUsersRole(listUsers || []))
        }
    }

    const handleSearch = async () => {
        const token = await getValidAccessToken()
        if (token) {
            await getListUsers(token, searchQuery, 0, 10)
            const { listUsers } = useAuthStore.getState()
            setDisplayedUsers(normalizeUsersRole(listUsers || []))
        }
    }

    // Infinite scroll: atado al scroll principal de la app (ver useInfiniteScroll), no a un contenedor propio
    const hasMoreUsers = usersPagination ? usersPagination.number < usersPagination.totalPages - 1 : false

    const loadMoreUsersData = useCallback(async () => {
        if (isLoadingMore || !usersPagination) return

        setIsLoadingMore(true)
        const token = await getValidAccessToken()
        if (token) {
            await loadMoreUsers(token, searchQuery)
            const { listUsers } = useAuthStore.getState()
            setDisplayedUsers(normalizeUsersRole(listUsers || []))
        }
        setIsLoadingMore(false)
    }, [isLoadingMore, usersPagination, getValidAccessToken, loadMoreUsers, searchQuery])

    useInfiniteScroll({
        loading: isLoading || isLoadingMore,
        hasMore: hasMoreUsers,
        onLoadMore: loadMoreUsersData,
        threshold: 200
    })

    const handleCreateUser = async (data: { email: string, role: string }) => {
        const token = await getValidAccessToken()
        if (token) {
            await addUser(token, data)
            closeModal()
            loadData()
            toast.success('Usuario creado correctamente')
        }
    }

    const handleDeleteUser = async (user: UserProps) => {
        const token = await getValidAccessToken()
        if (token) {
            await deleteUser(token, user.id)
            closeModal()
            loadData()
            toast.success('Usuario eliminado correctamente')
        }
    }

    const handleEditUser = async (user: UserProps, data: { userId: string, newRole: string }) => {
        const token = await getValidAccessToken()
        if (token) {
            await editUser(token, data.userId, { role: data.newRole })
            closeModal()
            loadData()
            toast.success('Usuario editado correctamente')
        }
    }

    const handleImportUsers = async (file: File) => {
        const token = await getValidAccessToken()
        if (token) {
            await importUsers(token, file)
            closeModal()
            loadData()
        }
    }

    const handleCreateUserModal = () => {
        openModal({
            size: "lg",
            title: "Crear Usuario",
            desc: "Agrega un nuevo usuario al sistema",
            children: <CreateUserFormConfig onSubmit={handleCreateUser} onCancel={() => closeModal()} />,
            Icon: <Plus size={20} strokeWidth={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "CREATE"
        })
    }

    const handleImportUsersModal = () => {
        openModal({
            size: "lg",
            title: "Importar Usuarios",
            desc: "Importa múltiples usuarios desde un archivo",
            children: <ImportUsersForm onSubmit={handleImportUsers} onCancel={() => closeModal()} isLoading={isLoading} />,
            Icon: <Download size={20} strokeWidth={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "CREATE"
        })
    }

    const handleEditUserModal = (user: UserProps) => {
        openModal({
            size: "lg",
            title: "Editar Usuario",
            desc: "Modifica la información del usuario",
            children: <EditUserForm user={user} onSubmit={(data) => handleEditUser(user, data)} onCancel={() => closeModal()} />,
            Icon: <Pencil size={20} strokeWidth={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "UPDATE"
        })
    }

    const handleDeleteUserModal = (user: UserProps) => {
        openModal({
            size: "md",
            children: <DeleteUserForm user={user} onSubmit={() => handleDeleteUser(user)} onCancel={() => closeModal()} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "DELETE"
        })
    }

    if (error) {
        return (
            <div className="p-6" style={{ background: 'var(--ds-card)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-border)' }}>
                <div className="text-center py-8">
                    <div className="w-fit mx-auto mb-4 p-4 rounded-full" style={{ background: 'var(--red-100)', color: 'var(--red-900)' }}>
                        <Users size={32} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text)' }}>Error al cargar datos</h3>
                    <p className="mb-4" style={{ color: 'var(--ds-text-secondary)' }}>{error}</p>
                    <button
                        onClick={() => {
                            clearError()
                            loadData()
                        }}
                        className="transition-colors hover:bg-[var(--primary-800)] bg-[var(--primary-700)] text-sm font-medium focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                        style={{ height: 36, padding: '0 16px', color: 'var(--primary-contrast-fg)', border: '1px solid var(--primary-700)', borderRadius: 'var(--radius-md)' }}
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    const { user, normalizeUserRole } = useAuthStore()
    const userRole = normalizeUserRole(user)

    const hasPermissionDeleteUser = userRole?.permissions.some((p: PermissionProps) => p.name === "USER_DELETE") ?? false
    const hasPermissionUpdateUser = userRole?.permissions.some((p: PermissionProps) => p.name === "USER_UPDATE") ?? false
    const hasPermissionCreateUser = userRole?.permissions.some((p: PermissionProps) => p.name === "USER_CREATE") ?? false

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                    <div>
                        <h2 className="font-semibold" style={{ fontSize: 20, letterSpacing: "-0.02em", color: 'var(--ds-text)', margin: "0 0 4px" }}>Usuarios</h2>
                        <p style={{ fontSize: 14, color: 'var(--ds-text-secondary)', margin: 0 }}>
                            {usersPagination ? `${usersPagination.totalElements} usuarios en total` : 'Gestiona los usuarios de la plataforma'}
                        </p>
                    </div>
                    {
                        hasPermissionCreateUser &&
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={handleImportUsersModal}
                                className="flex items-center gap-2 transition-colors hover:bg-[var(--gray-alpha-100)] text-sm font-medium focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                                style={{ height: 36, padding: '0 16px', color: 'var(--ds-text)', background: 'var(--ds-card)', boxShadow: 'var(--shadow-border)', borderRadius: 'var(--radius-md)' }}
                            >
                                <Download size={16} strokeWidth={1.5} />
                                Importar
                            </button>
                            <button
                                onClick={handleCreateUserModal}
                                className="flex items-center gap-2 transition-colors hover:bg-[var(--primary-800)] bg-[var(--primary-700)] text-sm font-medium focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                                style={{ height: 36, padding: '0 16px', color: 'var(--primary-contrast-fg)', border: '1px solid var(--primary-700)', borderRadius: 'var(--radius-md)' }}
                            >
                                <Plus size={16} strokeWidth={1.5} />
                                <span className="hidden sm:inline">Agregar Usuario</span>
                                <span className="sm:hidden">Agregar</span>
                            </button>
                        </div>
                    }
                </div>

                {/* Search Bar */}
                <div
                    className="max-w-md flex items-center gap-2 px-3 transition-colors focus-within:outline-2 focus-within:outline-[var(--blue-700)] focus-within:outline-offset-2"
                    style={{ height: 40, background: 'var(--ds-card)', boxShadow: 'var(--shadow-border)', borderRadius: 'var(--radius-md)' }}
                >
                    <Search size={16} strokeWidth={1.5} className="flex-shrink-0" style={{ color: 'var(--ds-text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Buscar usuarios por nombre o correo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm placeholder:text-[var(--ds-text-muted)]"
                        style={{ color: 'var(--ds-text)' }}
                    />
                </div>
            </div>

            {/* Users List */}
            <div style={{ borderTop: '1px solid var(--ds-border)' }}>
                {isLoading && displayedUsers.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--blue-700)] mx-auto mb-4"></div>
                        <p style={{ color: 'var(--ds-text-muted)' }}>Cargando usuarios...</p>
                    </div>
                ) : displayedUsers.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-fit mx-auto mb-4 p-3 rounded-full" style={{ background: 'var(--gray-alpha-100)', color: 'var(--ds-text-muted)' }}>
                            <Users size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text)' }}>No hay usuarios</h3>
                        <p style={{ color: 'var(--ds-text-muted)' }}>No se encontraron usuarios en el sistema.</p>
                    </div>
                ) : (
                    <div className="grid pt-4 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                        {displayedUsers.map((user) => (
                            <div key={user.id} className="group flex flex-col gap-3 p-[18px]" style={{ background: 'var(--ds-card)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-border)' }}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img
                                            src={getUserAvatar(user)}
                                            alt={`${user.firstName} ${user.lastName}`}
                                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                            style={{ background: 'var(--gray-alpha-100)' }}
                                        />
                                        <div className="min-w-0">
                                            <h4 className="font-medium truncate" style={{ fontSize: 14, color: 'var(--ds-text)' }}>
                                                {user.firstName} {user.lastName}
                                            </h4>
                                            <p className="text-xs truncate" style={{ color: 'var(--ds-text-secondary)' }}>{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                                        {
                                            hasPermissionUpdateUser &&
                                            <button
                                                onClick={() => handleEditUserModal(user)}
                                                className="p-1.5 rounded-md transition-colors duration-150 hover:bg-[var(--gray-alpha-100)]"
                                                style={{ color: 'var(--ds-text-muted)' }}
                                            >
                                                <Pencil size={14} strokeWidth={1.5} />
                                            </button>
                                        }
                                        {
                                            (hasPermissionDeleteUser) &&
                                            <button
                                                onClick={() => handleDeleteUserModal(user)}
                                                className="p-1.5 rounded-md transition-colors duration-150 hover:bg-[var(--red-100)] hover:text-[var(--red-900)]"
                                                style={{ color: 'var(--ds-text-muted)' }}
                                            >
                                                <Trash2 size={14} strokeWidth={1.5} />
                                            </button>
                                        }
                                    </div>
                                </div>
                                <span className="text-xs font-medium px-2 py-[2px] rounded-full w-fit" style={{ background: 'var(--blue-100)', color: 'var(--blue-900)', border: '1px solid var(--blue-400)' }}>
                                    {getUserRoleName(user)}
                                </span>
                            </div>
                        ))}
                        {isLoadingMore && (
                            <div className="col-span-full flex items-center justify-center gap-2 p-4 text-sm" style={{ color: 'var(--ds-text-muted)' }}>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--blue-700)]"></div>
                                Cargando más usuarios...
                            </div>
                        )}
                        {!hasMoreUsers && !isLoadingMore && (
                            <div className="col-span-full text-center py-4 text-sm" style={{ color: 'var(--ds-text-muted)' }}>
                                No hay más usuarios para mostrar
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    )
}
