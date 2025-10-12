"use client"
import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store/AuthStore'
import { useModalStore } from '@/lib/hooks/ModalStore'
import { ConfigIcon, PlusIcon, EditIcon, DeleteIcon } from '@/assets/Icon'
import RoleForm from './RoleForm'
import DeleteRoleForm from './DeleteRoleForm'
import toast from 'react-hot-toast'

interface RoleProps {
    name: string
    permissions: Array<{ name: string }>
}

interface PermissionProps {
    name: string
}

export default function RolesManagement() {
    const {
        roles,
        isLoading,
        error,
        getValidAccessToken,
        listRoles,
        createRole,
        updateRole,
        deleteRole,
        clearError,
        listPermissions
    } = useAuthStore()

    const { openModal, closeModal } = useModalStore()

    // Cargar datos iniciales
    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const token = await getValidAccessToken()
        if (token) {
            await listRoles(token)
        }
    }

    // Handlers para roles
    const handleCreateRole = async (data: { name: string, permissions: PermissionProps[] }) => {
        const token = await getValidAccessToken()
        if (token) {
            await createRole(token, data)
            closeModal()
            toast.success(`Rol ${data.name} creado`)
            loadData()
        }
    }

    const handleEditRole = async (role: RoleProps, data: { name: string, permissions: PermissionProps[] }) => {
        const token = await getValidAccessToken()
        if (token) {
            await updateRole(token, role.name, { permissions: data.permissions })
            closeModal()
            toast.success(`Rol ${data.name} actualizado`)
            loadData()
        }
    }

    const handleDeleteRole = async (role: RoleProps) => {
        const token = await getValidAccessToken()
        if (token) {
            await deleteRole(token, role.name)
            closeModal()
            toast.success(`Rol "${role.name}" eliminado`)
            loadData()
        }
    }

    const handleCreateRoleModal = () => {
        openModal({
            size: "lg",
            title: "Crear Rol",
            desc: "Define un nuevo rol con sus permisos",
            children: <RoleForm onSubmit={handleCreateRole} onCancel={() => closeModal()} />,
            Icon: <PlusIcon size={20} stroke={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "CREATE"
        })
    }

    const handleEditRoleModal = (role: RoleProps) => {
        openModal({
            size: "lg",
            title: "Editar Rol",
            desc: "Modifica los permisos del rol",
            children: <RoleForm role={role} onSubmit={(data) => handleEditRole(role, data)} onCancel={() => closeModal()} isEdit={true} />,
            Icon: <EditIcon size={20} stroke={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "UPDATE"
        })
    }

    const handleDeleteRoleModal = (role: RoleProps) => {
        openModal({
            size: "md",
            children: <DeleteRoleForm role={role} onSubmit={() => handleDeleteRole(role)} onCancel={() => closeModal()} />,
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
                        <ConfigIcon size={32} />
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
    const hasPermissionCreateRole = userRole?.permissions.some((p: PermissionProps) => p.name === "ROLE_CREATE") ?? false
    const hasPermissionEditRole = userRole?.permissions.some((p: PermissionProps) => p.name === "ROLE_UPDATE") ?? false
    const hasPermissionDeleteRole = userRole?.permissions.some((p: PermissionProps) => p.name === "ROLE_DELETE") ?? false

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-gray-400">
                            <ConfigIcon size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Roles</h2>
                            <p className="text-sm text-gray-500">Gestiona los roles del sistema</p>
                        </div>
                    </div>
                    {
                        hasPermissionCreateRole &&
                        <button
                            onClick={handleCreateRoleModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <PlusIcon size={16} />
                            Crear Rol
                        </button>
                    }
                </div>
            </div>

            {/* Roles List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Cargando roles...</p>
                    </div>
                ) : roles.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400 p-4 bg-gray-50 rounded-lg w-fit mx-auto mb-4">
                            <ConfigIcon size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay roles</h3>
                        <p className="text-gray-500">No se encontraron roles en el sistema.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {roles.map((role) => (
                            <div key={role.name} className="p-4">
                                <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 hover:shadow-md transition-all group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">
                                                {role.name}
                                            </h4>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {role.permissions.length === 0 ? (
                                                    <span className="text-sm text-gray-500 italic">
                                                        No hay permisos configurados
                                                    </span>
                                                ) : (
                                                    <>
                                                        {role.permissions.slice(0, 3).map((p, index) => (
                                                            <span key={index} className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
                                                                {p.name}
                                                            </span>
                                                        ))}
                                                        {role.permissions.length > 3 && (
                                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
                                                                +{role.permissions.length - 3}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            {
                                                hasPermissionEditRole &&
                                                <button
                                                    onClick={() => handleEditRoleModal(role)}
                                                    className="text-gray-400 hover:text-purple-600 transition-colors opacity-0 group-hover:opacity-100 p-2 hover:bg-purple-100 rounded-lg"
                                                >
                                                    <EditIcon size={16} />
                                                </button>
                                            }
                                            {
                                                hasPermissionDeleteRole &&
                                                <button
                                                    onClick={() => handleDeleteRoleModal(role)}
                                                    className="text-gray-400 hover:text-purple-600 transition-colors opacity-0 group-hover:opacity-100 p-2 hover:bg-purple-100 rounded-lg"
                                                >
                                                    <DeleteIcon size={16} />
                                                </button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
