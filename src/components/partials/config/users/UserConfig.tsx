"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuthStore } from "@/lib/store/AuthStore"
import CreateUserForm from "./CreateUserForm"
import DeleteUserForm from "./DeleteUserForm"
import ImportUsersForm from "./ImportUsersForm"
import Modal from "@/components/layout/Modal"
import { UserProps } from "@/lib/types/types"
import { getUserRoleName } from "@/lib/utils/user.utils"
import { getUserAvatar } from "@/lib/utils/avatar.utils"
import {
    UsersIcon,
    ConfigIcon,
    PlusIcon,
    EditIcon,
    DeleteIcon,
    EyeIcon,
    DownloadIcon
} from "@/assets/Icon"

type UserPagination = {
  content: UserProps[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}

interface RoleProps {
    name: string
    permissions: Array<{ name: string }>
}

interface PermissionProps {
    name: string
}

// Formulario para crear/editar roles
interface RoleFormProps {
    role?: RoleProps | null
    allPermissions: PermissionProps[]
    onSubmit: (data: { name: string, permissions: PermissionProps[] }) => void
    onCancel: () => void
    isEdit?: boolean
}

function RoleForm({ role, allPermissions, onSubmit, onCancel, isEdit = false }: RoleFormProps) {
    const [formData, setFormData] = useState({
        name: role?.name || '',
        permissions: role?.permissions || []
    })
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre del rol es requerido'
        }

        if (formData.permissions.length === 0) {
            newErrors.permissions = 'Debe seleccionar al menos un permiso'
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

    const handlePermissionToggle = (permission: PermissionProps) => {
        const isSelected = formData.permissions.some(p => p.name === permission.name)

        if (isSelected) {
            setFormData(prev => ({
                ...prev,
                permissions: prev.permissions.filter(p => p.name !== permission.name)
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                permissions: [...prev.permissions, permission]
            }))
        }

        if (errors.permissions) {
            setErrors(prev => ({ ...prev, permissions: '' }))
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                    {isEdit ? 'Editar Rol' : 'Crear Nuevo Rol'}
                </h3>
                <p className="text-sm text-gray-500">
                    {isEdit ? 'Modifica los permisos del rol' : 'Define un nuevo rol y sus permisos'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre del rol */}
                <div className="space-y-2">
                    <label htmlFor="roleName" className="block text-sm font-medium text-gray-700">
                        Nombre del rol
                    </label>
                    <input
                        type="text"
                        id="roleName"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={isEdit}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${isEdit ? 'bg-gray-50 text-gray-500' : ''
                            } ${errors.name
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                        placeholder="Ej: manager, developer, viewer"
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                </div>

                {/* Permisos */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Permisos del rol
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                        {allPermissions.map((permission) => {
                            const isSelected = formData.permissions.some(p => p.name === permission.name)
                            return (
                                <label
                                    key={permission.name}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handlePermissionToggle(permission)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 flex-1">
                                        {permission.name}
                                    </span>
                                </label>
                            )
                        })}
                    </div>
                    {errors.permissions && (
                        <p className="text-sm text-red-600">{errors.permissions}</p>
                    )}
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-white hover:bg-gray-50 hover:border-gray-300 border-gray-200 border flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white border-transparent border hover:shadow-md flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {isEdit ? 'Actualizar Rol' : 'Crear Rol'}
                    </button>
                </div>
            </form>
        </div>
    )
}

// Formulario para eliminar roles
interface DeleteRoleFormProps {
    role: RoleProps
    onSubmit: () => void
    onCancel: () => void
}

function DeleteRoleForm({ role, onSubmit, onCancel }: DeleteRoleFormProps) {
    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg w-fit mx-auto">
                    <DeleteIcon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                    Eliminar Rol
                </h3>
                <p className="text-sm text-gray-500">
                    Esta acción no se puede deshacer
                </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Rol a eliminar:</h4>
                <div className="text-sm text-gray-600">
                    <p><strong>Nombre:</strong> {role.name}</p>
                    <p><strong>Permisos:</strong> {role.permissions.length} asignados</p>
                </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">
                    ⚠️ Al eliminar este rol, todos los usuarios que lo tengan asignado perderán estos permisos.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-white hover:bg-gray-50 hover:border-gray-300 border-gray-200 border flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={onSubmit}
                    className="bg-red-600 hover:bg-red-700 text-white border-transparent border hover:shadow-md flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    Eliminar Rol
                </button>
            </div>
        </div>
    )
}

// Formulario para crear permisos
interface CreatePermissionFormProps {
    onSubmit: (data: { name: string }) => void
    onCancel: () => void
}

function CreatePermissionForm({ onSubmit, onCancel }: CreatePermissionFormProps) {
    const [formData, setFormData] = useState({ name: '' })
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre del permiso es requerido'
        } else if (!/^[A-Z_]+$/.test(formData.name)) {
            newErrors.name = 'El nombre debe estar en mayúsculas y usar guiones bajos (ej: SPRINT_READ)'
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

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value.toUpperCase() }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                    Crear Nuevo Permiso
                </h3>
                <p className="text-sm text-gray-500">
                    Define un nuevo permiso para el sistema
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="permissionName" className="block text-sm font-medium text-gray-700">
                        Nombre del permiso
                    </label>
                    <input
                        type="text"
                        id="permissionName"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.name
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                        placeholder="SPRINT_READ"
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        Use mayúsculas y guiones bajos. Ejemplos: SPRINT_READ, PROJECT_WRITE, USER_DELETE
                    </p>
                </div>

                <div className="flex items-center gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-white hover:bg-gray-50 hover:border-gray-300 border-gray-200 border flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white border-transparent border hover:shadow-md flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Crear Permiso
                    </button>
                </div>
            </form>
        </div>
    )
}

// Formulario para eliminar permisos
interface DeletePermissionFormProps {
    permission: PermissionProps
    onSubmit: () => void
    onCancel: () => void
}

function DeletePermissionForm({ permission, onSubmit, onCancel }: DeletePermissionFormProps) {
    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg w-fit mx-auto">
                    <DeleteIcon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                    Eliminar Permiso
                </h3>
                <p className="text-sm text-gray-500">
                    Esta acción no se puede deshacer
                </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Permiso a eliminar:</h4>
                <p className="text-sm text-gray-600">
                    <strong>Nombre:</strong> {permission.name}
                </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">
                    ⚠️ Al eliminar este permiso, será removido de todos los roles que lo tengan asignado.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-white hover:bg-gray-50 hover:border-gray-300 border-gray-200 border flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={onSubmit}
                    className="bg-red-600 hover:bg-red-700 text-white border-transparent border hover:shadow-md flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    Eliminar Permiso
                </button>
            </div>
        </div>
    )
}

// Formulario para editar usuario (cambiar rol)
interface EditUserFormProps {
    user: UserProps
    availableRoles: RoleProps[]
    onSubmit: (data: { userId: string, newRole: string }) => void
    onCancel: () => void
}

function EditUserForm({ user, availableRoles, onSubmit, onCancel }: EditUserFormProps) {
    const [selectedRole, setSelectedRole] = useState(
        getUserRoleName(user)
    )
    const [isRoleSelectOpen, setIsRoleSelectOpen] = useState(false)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const roleSelectRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                roleSelectRef.current &&
                !roleSelectRef.current.contains(event.target as Node)
            ) {
                setIsRoleSelectOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

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
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                    Reasignar Rol de Usuario
                </h3>
                <p className="text-sm text-gray-500">
                    Cambia el rol asignado al usuario
                </p>
            </div>

            {/* Información del usuario */}
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-4">
                    <img
                        src={getUserAvatar(user, 48)}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                        <h4 className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">
                            Rol actual: {getUserRoleName(user)}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Select */}
                <div className="space-y-2 relative" ref={roleSelectRef}>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Nuevo rol del usuario
                    </label>
                    <button
                        onClick={() => setIsRoleSelectOpen(!isRoleSelectOpen)}
                        type="button"
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 flex items-center justify-between ${errors.role
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        <span className="text-sm text-gray-700">
                            {availableRoles.find(role => role.name === selectedRole)?.name || 'Seleccionar rol'}
                        </span>
                        <svg
                            className={`text-gray-400 w-4 h-4 transition-transform duration-200 ${isRoleSelectOpen ? "rotate-180" : ""}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>

                    {isRoleSelectOpen && (
                        <div className="border-gray-200 bg-white shadow-lg absolute z-10 top-full mt-1 flex flex-col rounded-lg border text-sm w-full max-h-20 overflow-y-auto">
                            {availableRoles.map((role) => (
                                <div
                                    key={role.name}
                                    onClick={() => {
                                        setSelectedRole(role.name)
                                        setIsRoleSelectOpen(false)
                                        if (errors.role) {
                                            setErrors(prev => ({ ...prev, role: '' }))
                                        }
                                    }}
                                    className="hover:bg-blue-50 duration-150 w-full text-start py-3 px-4 flex items-center justify-between cursor-pointer"
                                >
                                    <span className="text-gray-700 capitalize">{role.name}</span>
                                    {role.name === selectedRole && (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-blue-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {errors.role && (
                        <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-white hover:bg-gray-50 hover:border-gray-300 border-gray-200 border flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white border-transparent border hover:shadow-md flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Actualizar Rol
                    </button>
                </div>
            </form>
        </div>
    )
}

// Utilidad para normalizar el campo role
function normalizeUsersRole(users: UserProps[]): UserProps[] {
  return users.map(user => ({
    ...user,
    role: typeof user.role === 'string' ? { name: user.role, permissions: [] } : user.role
  }))
}

export default function UserConfig() {
    const {
        listUsers,
        usersPagination,
        roles,
        permissions,
        isLoading,
        error,
        getValidAccessToken,
        getListUsers,
        loadMoreUsers,
        addUser,
        editUser,
        deleteUser,
        importUsers,
        listRoles,
        getPermissionsByRole,
        createRole,
        updateRole,
        deleteRole,
        listPermissions,
        createPermission,
        deletePermission,
        clearError
    } = useAuthStore()

    // Estados para tabs
    const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users')

    // Estados para búsqueda y paginación de usuarios
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const usersListRef = useRef<HTMLDivElement>(null)
    // Estado local para lista acumulada de usuarios
    const [displayedUsers, setDisplayedUsers] = useState<UserProps[]>([])

    // Estados para modales de usuarios
    const [showCreateUserModal, setShowCreateUserModal] = useState(false)
    const [showImportUsersModal, setShowImportUsersModal] = useState(false)
    const [showEditUserModal, setShowEditUserModal] = useState(false)
    const [showDeleteUserModal, setShowDeleteUserModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserProps | null>(null)

    // Estados para modales de roles
    const [showCreateRoleModal, setShowCreateRoleModal] = useState(false)
    const [showEditRoleModal, setShowEditRoleModal] = useState(false)
    const [showDeleteRoleModal, setShowDeleteRoleModal] = useState(false)
    const [selectedRole, setSelectedRole] = useState<RoleProps | null>(null)

    // Estados para modales de permisos
    const [showCreatePermissionModal, setShowCreatePermissionModal] = useState(false)
    const [showDeletePermissionModal, setShowDeletePermissionModal] = useState(false)
    const [selectedPermission, setSelectedPermission] = useState<PermissionProps | null>(null)

    // Cargar datos iniciales y reiniciar lista acumulada
    useEffect(() => {
        loadData()
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

    // Debug: log displayedUsers cada vez que cambie
    useEffect(() => {
      console.log('displayedUsers', displayedUsers);
    }, [displayedUsers]);

    // Cargar datos iniciales y reiniciar lista acumulada
    const loadData = async () => {
        const token = await getValidAccessToken()
        if (token) {
            await getListUsers(token, '', 0, 10)
            const { listUsers } = useAuthStore.getState()
            setDisplayedUsers(normalizeUsersRole(listUsers || []))
            await listRoles(token)
            await listPermissions(token)
        }
    }

    // Buscar usuarios y reiniciar lista acumulada
    const handleSearch = async () => {
        const token = await getValidAccessToken()
        if (token) {
            await getListUsers(token, searchQuery, 0, 10)
            const { listUsers } = useAuthStore.getState()
            setDisplayedUsers(normalizeUsersRole(listUsers || []))
        }
    }

    // Cargar más usuarios y agregarlos a la lista acumulada
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

    // Handlers para usuarios
    const handleCreateUser = async (data: { email: string, role: string }) => {
        const token = await getValidAccessToken()
        if (token) {
            await addUser(token, data)
            setShowCreateUserModal(false)
        }
    }

    const handleImportUsers = async (file: File) => {
        const token = await getValidAccessToken()
        if (token) {
            await importUsers(token, file)
            setShowImportUsersModal(false)
        }
    }

    const handleDeleteUser = async () => {
        if (!selectedUser) return

        const token = await getValidAccessToken()
        if (token) {
            await deleteUser(token, selectedUser.id)
            setShowDeleteUserModal(false)
            setSelectedUser(null)
        }
    }

    const handleEditUser = async (data: { userId: string, newRole: string }) => {
        const token = await getValidAccessToken()
        if (token) {
            await editUser(token, data.userId, { role: data.newRole })
            setShowEditUserModal(false)
            setSelectedUser(null)
        }
    }

    // Handlers para roles
    const handleCreateRole = async (data: { name: string, permissions: PermissionProps[] }) => {
        const token = await getValidAccessToken()
        if (token) {
            await createRole(token, data)
            setShowCreateRoleModal(false)
        }
    }

    const handleEditRole = async (data: { name: string, permissions: PermissionProps[] }) => {
        if (!selectedRole) return

        const token = await getValidAccessToken()
        if (token) {
            await updateRole(token, selectedRole.name, { permissions: data.permissions })
            setShowEditRoleModal(false)
            setSelectedRole(null)
        }
    }

    const handleDeleteRole = async () => {
        if (!selectedRole) return

        const token = await getValidAccessToken()
        if (token) {
            await deleteRole(token, selectedRole.name)
            setShowDeleteRoleModal(false)
            setSelectedRole(null)
        }
    }

    // Handlers para permisos
    const handleCreatePermission = async (data: { name: string }) => {
        const token = await getValidAccessToken()
        if (token) {
            await createPermission(token, data)
            setShowCreatePermissionModal(false)
        }
    }

    const handleDeletePermission = async () => {
        if (!selectedPermission) return

        const token = await getValidAccessToken()
        if (token) {
            await deletePermission(token, selectedPermission.name)
            setShowDeletePermissionModal(false)
            setSelectedPermission(null)
        }
    }

    const tabs = [
        {
            id: 'users' as const,
            name: 'Gestión de Usuarios',
            icon: UsersIcon,
            description: 'Administra los usuarios del sistema'
        },
        {
            id: 'roles' as const,
            name: 'Roles y Permisos',
            icon: ConfigIcon,
            description: 'Configura roles y sus permisos'
        },
        {
            id: 'permissions' as const,
            name: 'Gestión de Permisos',
            icon: EyeIcon,
            description: 'Administra los permisos del sistema'
        }
    ]

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

    return (
        <div className="space-y-6">
            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
                <nav className="flex space-x-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon size={18} />
                                <span className="hidden sm:inline">{tab.name}</span>
                                <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* Content Area */}
            {activeTab === 'users' ? (
                <div className="space-y-6">
                    {/* Users Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                    <UsersIcon size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Gestión de Usuarios
                                    </h2>
                                    {/* Indicador de mostrando X de Y y barra de porcentaje */}
                                    {usersPagination && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">
                                                Mostrando {displayedUsers.length} de {usersPagination.totalElements} usuarios
                                            </span>
                                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-300"
                                                    style={{ width: `${Math.min(100, (displayedUsers.length / usersPagination.totalElements) * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {Math.round((displayedUsers.length / usersPagination.totalElements) * 100)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowImportUsersModal(true)}
                                    className="bg-white hover:bg-blue-50 text-blue-600 border-blue-600 border px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <DownloadIcon size={16} />
                                    Importar Usuarios
                                </button>
                                <button
                                    onClick={() => setShowCreateUserModal(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <PlusIcon size={16} />
                                    Agregar Usuario
                                </button>
                            </div>
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
                        className="bg-white rounded-xl shadow-sm border border-gray-100 max-h-96 overflow-y-auto"
                    >
                        {isLoading && displayedUsers.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Cargando usuarios...</p>
                            </div>
                        ) : displayedUsers.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="p-4 bg-gray-50 text-gray-400 rounded-lg w-fit mx-auto mb-4">
                                    <UsersIcon size={32} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay usuarios</h3>
                                <p className="text-gray-600">Comienza agregando el primer usuario al sistema</p>
                            </div>
                        ) : (
                            <div>
                                <div className="divide-y divide-gray-100">
                                    {displayedUsers.map((user) => (
                                        <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={getUserAvatar(user, 48)}
                                                        alt={`${user.firstName} ${user.lastName}`}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">
                                                            {user.firstName} {user.lastName}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                        <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit mt-1">
                                                            {getUserRoleName(user)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user)
                                                            setShowEditUserModal(true)
                                                        }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Cambiar rol"
                                                    >
                                                        <EditIcon size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Indicador de carga para más usuarios */}
                                {isLoadingMore && (
                                    <div className="p-4 border-t border-gray-100">
                                        <div className="flex items-center justify-center gap-3 text-blue-600">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                            <span className="text-sm">Cargando más usuarios...</span>
                                        </div>
                                    </div>
                                )}

                                {/* Indicador de fin de lista */}
                                {usersPagination && usersPagination.number >= usersPagination.totalPages - 1 && !isLoadingMore && (
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
                </div>
            ) : activeTab === 'permissions' ? (
                <div className="space-y-6">
                    {/* Permissions Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                                    <EyeIcon size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Gestión de Permisos
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Total: {permissions.length} permisos configurados
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreatePermissionModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <PlusIcon size={16} />
                                Crear Permiso
                            </button>
                        </div>
                    </div>

                    {/* Permissions List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        {isLoading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Cargando permisos...</p>
                            </div>
                        ) : permissions.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="p-4 bg-gray-50 text-gray-400 rounded-lg w-fit mx-auto mb-4">
                                    <EyeIcon size={32} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay permisos</h3>
                                <p className="text-gray-600">Comienza creando el primer permiso del sistema</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {permissions.map((permission) => (
                                    <div key={permission.name} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                                    <EyeIcon size={16} />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {permission.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        Permiso del sistema
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPermission(permission)
                                                        setShowDeletePermissionModal(true)
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar permiso"
                                                >
                                                    <DeleteIcon size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // Tab de roles (código existente)
                <div className="space-y-6">
                    {/* Roles Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-50 text-green-600">
                                    <ConfigIcon size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Roles y Permisos
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Total: {roles.length} roles configurados
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreateRoleModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <PlusIcon size={16} />
                                Crear Rol
                            </button>
                        </div>
                    </div>

                    {/* Roles List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        {isLoading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Cargando roles...</p>
                            </div>
                        ) : roles.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="p-4 bg-gray-50 text-gray-400 rounded-lg w-fit mx-auto mb-4">
                                    <ConfigIcon size={32} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay roles</h3>
                                <p className="text-gray-600">Comienza creando el primer rol del sistema</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {roles.map((role) => (
                                    <div key={role.name} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                                        <ConfigIcon size={16} />
                                                    </div>
                                                    <h4 className="font-medium text-gray-900 capitalize">
                                                        {role.name}
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {role.permissions.length} permisos asignados
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {role.permissions.slice(0, 5).map((permission) => (
                                                        <span
                                                            key={permission.name}
                                                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                                                        >
                                                            {permission.name}
                                                        </span>
                                                    ))}
                                                    {role.permissions.length > 5 && (
                                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                            +{role.permissions.length - 5} más
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRole(role)
                                                        setShowEditRoleModal(true)
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar rol"
                                                >
                                                    <EditIcon size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedRole(role)
                                                        setShowDeleteRoleModal(true)
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar rol"
                                                >
                                                    <DeleteIcon size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modales para usuarios */}
            <Modal
                isOpen={showCreateUserModal}
                onClose={() => setShowCreateUserModal(false)}
                title=""
            >
                <CreateUserForm
                    onSubmit={handleCreateUser}
                    onCancel={() => setShowCreateUserModal(false)}
                />
            </Modal>

            <Modal
                isOpen={showImportUsersModal}
                onClose={() => setShowImportUsersModal(false)}
                title=""
            >
                <ImportUsersForm
                    onSubmit={handleImportUsers}
                    onCancel={() => setShowImportUsersModal(false)}
                    isLoading={isLoading}
                />
            </Modal>

            <Modal
                isOpen={showEditUserModal}
                onClose={() => setShowEditUserModal(false)}
                title=""
            >
                {selectedUser && (
                    <EditUserForm
                        user={selectedUser}
                        availableRoles={roles}
                        onSubmit={handleEditUser}
                        onCancel={() => {
                            setShowEditUserModal(false)
                            setSelectedUser(null)
                        }}
                    />
                )}
            </Modal>

            <Modal
                isOpen={showDeleteUserModal}
                onClose={() => setShowDeleteUserModal(false)}
                title=""
            >
                <DeleteUserForm
                    user={selectedUser}
                    onSubmit={handleDeleteUser}
                    onCancel={() => {
                        setShowDeleteUserModal(false)
                        setSelectedUser(null)
                    }}
                />
            </Modal>

            {/* Modales para roles */}
            <Modal
                isOpen={showCreateRoleModal}
                onClose={() => setShowCreateRoleModal(false)}
                title=""
            >
                <RoleForm
                    allPermissions={permissions}
                    onSubmit={handleCreateRole}
                    onCancel={() => setShowCreateRoleModal(false)}
                />
            </Modal>

            <Modal
                isOpen={showEditRoleModal}
                onClose={() => setShowEditRoleModal(false)}
                title=""
            >
                <RoleForm
                    role={selectedRole}
                    allPermissions={permissions}
                    onSubmit={handleEditRole}
                    onCancel={() => {
                        setShowEditRoleModal(false)
                        setSelectedRole(null)
                    }}
                    isEdit={true}
                />
            </Modal>

            <Modal
                isOpen={showDeleteRoleModal}
                onClose={() => setShowDeleteRoleModal(false)}
                title=""
            >
                {selectedRole && (
                    <DeleteRoleForm
                        role={selectedRole}
                        onSubmit={handleDeleteRole}
                        onCancel={() => {
                            setShowDeleteRoleModal(false)
                            setSelectedRole(null)
                        }}
                    />
                )}
            </Modal>

            {/* Modales para permisos */}
            <Modal
                isOpen={showCreatePermissionModal}
                onClose={() => setShowCreatePermissionModal(false)}
                title=""
            >
                <CreatePermissionForm
                    onSubmit={handleCreatePermission}
                    onCancel={() => setShowCreatePermissionModal(false)}
                />
            </Modal>

            <Modal
                isOpen={showDeletePermissionModal}
                onClose={() => setShowDeletePermissionModal(false)}
                title=""
            >
                {selectedPermission && (
                    <DeletePermissionForm
                        permission={selectedPermission}
                        onSubmit={handleDeletePermission}
                        onCancel={() => {
                            setShowDeletePermissionModal(false)
                            setSelectedPermission(null)
                        }}
                    />
                )}
            </Modal>
        </div>
    )
}