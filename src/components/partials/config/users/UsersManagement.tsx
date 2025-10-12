"use client"
import { useRef, useEffect, useState } from 'react'

// Components
import CreateUserFormConfig from './CreateUserFormConfig'
import DeleteUserForm from './DeleteUserForm'
import ImportUsersForm from './ImportUsersForm'
import EditUserForm from './EditUserForm'

// Store
import { useAuthStore } from '@/lib/store/AuthStore'
import { useModalStore } from '@/lib/hooks/ModalStore'

// Utils
import { getUserAvatar } from '@/lib/utils/avatar.utils'
import { getUserRoleName } from '@/lib/utils/user.utils'

// Types
import { PermissionProps, UserProps } from '@/lib/types/types'

// Icons
import { UsersIcon, PlusIcon, EditIcon, DownloadIcon, DeleteIcon } from '@/assets/Icon'
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
    const usersListRef = useRef<HTMLDivElement>(null)
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

    // Efecto para detectar scroll y cargar más usuarios
    useEffect(() => {
        const handleScroll = () => {
            if (!usersListRef.current || isLoadingMore || !usersPagination) return

            const { scrollTop, scrollHeight, clientHeight } = usersListRef.current
            const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200

            if (isNearBottom && usersPagination.number < usersPagination.totalPages - 1) {
                loadMoreUsersData()
            }
        }

        const listElement = usersListRef.current
        if (listElement) {
            listElement.addEventListener('scroll', handleScroll)
            return () => listElement.removeEventListener('scroll', handleScroll)
        }
    }, [isLoadingMore, usersPagination])

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

    const loadMoreUsersData = async () => {
        if (isLoadingMore || !usersPagination) return

        setIsLoadingMore(true)
        const token = await getValidAccessToken()
        if (token) {
            await loadMoreUsers(token, searchQuery)
            const { listUsers } = useAuthStore.getState()
            setDisplayedUsers(normalizeUsersRole(listUsers || []))
        }
        setIsLoadingMore(false)
    }

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
            Icon: <PlusIcon size={20} stroke={1.75} />,
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
            Icon: <DownloadIcon size={20} stroke={1.75} />,
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
            Icon: <EditIcon size={20} stroke={1.75} />,
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="text-center py-8">
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg w-fit mx-auto mb-4">
                        <UsersIcon size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar datos</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => {
                            clearError()
                            loadData()
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <UsersIcon size={24} />
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Usuarios</h2>
                            {usersPagination && (
                                <p className="text-sm text-gray-500">
                                    {usersPagination.totalElements} usuarios en total
                                </p>
                            )}
                        </div>
                    </div>
                    {
                        hasPermissionCreateUser &&
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleImportUsersModal}
                                className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <DownloadIcon size={16} />
                                Importar
                            </button>
                            <button
                                onClick={handleCreateUserModal}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <PlusIcon size={16} />
                                Agregar Usuario
                            </button>
                        </div>
                    }
                </div>

                {/* Search Bar */}
                <div className="max-w-md">
                    <input
                        type="text"
                        placeholder="Buscar usuarios por nombre o correo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            {/* Users List */}
            <div
                ref={usersListRef}
                className="bg-white rounded-xl shadow-sm border border-gray-100 max-h-[calc(100vh-16rem)] overflow-y-auto"
            >
                {isLoading && displayedUsers.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Cargando usuarios...</p>
                    </div>
                ) : displayedUsers.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="p-4 bg-gray-50 rounded-lg w-fit mx-auto mb-4">
                            <UsersIcon size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay usuarios</h3>
                        <p className="text-gray-500">No se encontraron usuarios en el sistema.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {displayedUsers.map((user) => (
                            <div key={user.id} className="p-4">
                                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 hover:shadow-md transition-all group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={getUserAvatar(user)}
                                                alt={`${user.firstName} ${user.lastName}`}
                                                className="w-10 h-10 rounded-full object-cover bg-gray-100 ring-2 ring-white shadow-sm"
                                            />
                                            <div>
                                                <h4 className="font-medium text-gray-900">
                                                    {user.firstName} {user.lastName}
                                                </h4>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                                <p className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full w-fit mt-1">
                                                    {getUserRoleName(user)}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            {
                                                hasPermissionUpdateUser &&
                                                <button
                                                    onClick={() => handleEditUserModal(user)}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 p-2 hover:bg-blue-100 rounded-lg"
                                                >
                                                    <EditIcon size={16} />
                                                </button>
                                            }
                                            {
                                                (hasPermissionDeleteUser) &&
                                                <button
                                                    onClick={() => handleDeleteUserModal(user)}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 p-2 hover:bg-blue-100 rounded-lg"
                                                >
                                                    <DeleteIcon size={16} />
                                                </button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoadingMore && (
                            <div className="p-4 text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    )
}
