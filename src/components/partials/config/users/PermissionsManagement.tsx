"use client"
import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store/AuthStore'
import { useModalStore } from '@/lib/hooks/ModalStore'
import { EyeIcon, PlusIcon, DeleteIcon } from '@/assets/Icon'
import DeletePermissionForm from './DeletePermissionForm'
import CreatePermissionForm from './CreatePermissionForm'
import toast from 'react-hot-toast'

interface PermissionProps {
    name: string
}

export default function PermissionsManagement() {
    const { permissions, isLoading, error, getValidAccessToken, listPermissions, createPermission, deletePermission, clearError } = useAuthStore()
    const { openModal, closeModal } = useModalStore()

    useEffect(() => { loadData() }, [])

    const loadData = async () => {
        const token = await getValidAccessToken()
        if (token) await listPermissions(token)
    }

    // Handlers para permisos
    const handleCreatePermission = async (data: { name: string }) => {
        const token = await getValidAccessToken()
        if (token) {
            await createPermission(token, data)
            closeModal()
            toast.success(`Permiso ${data.name} creado`)
            loadData()
        }
    }

    const handleDeletePermission = async (permission: PermissionProps) => {
        const token = await getValidAccessToken()
        if (token) {
            await deletePermission(token, permission.name)
            closeModal()
            toast.success(`Permiso "${permission.name}" eliminado`)
            loadData()
        }
    }

    const handleCreatePermissionModal = () => {
        openModal({
            size: "lg",
            title: "Crear Permiso",
            desc: "Define un nuevo permiso para el sistema",
            children: <CreatePermissionForm onSubmit={handleCreatePermission} onCancel={() => closeModal()} />,
            Icon: <PlusIcon size={20} stroke={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "CREATE"
        })
    }

    const handleDeletePermissionModal = (permission: PermissionProps) => {
        openModal({
            size: "md",
            children: <DeletePermissionForm permission={permission} onSubmit={() => handleDeletePermission(permission)} onCancel={() => closeModal()} />,
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
                        <EyeIcon size={32} />
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
    const hasPermissionCreatePermission = userRole?.permissions.some((p: PermissionProps) => p.name === "PERMISSION_CREATE") ?? false
    const hasPermissionDeletePermission = userRole?.permissions.some((p: PermissionProps) => p.name === "PERMISSION_DELETE") ?? false

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className='text-gray-400'>
                            <EyeIcon size={24} />
                        </span>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Permisos</h2>
                            <p className="text-sm text-gray-500">Gestiona los permisos del sistema</p>
                        </div>
                    </div>
                    {
                        hasPermissionCreatePermission &&
                        <button
                            onClick={handleCreatePermissionModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <PlusIcon size={16} />
                            Crear Permiso
                        </button>
                    }
                </div>
            </div>

            {/* Permissions List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Cargando permisos...</p>
                    </div>
                ) : permissions.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400 p-4 bg-gray-50 rounded-lg w-fit mx-auto mb-4">
                            <EyeIcon size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay permisos</h3>
                        <p className="text-gray-500">No se encontraron permisos en el sistema.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {permissions.map((permission) => (
                            <div key={permission.name} className="p-4">
                                <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all group">
                                    <div className="flex items-center justify-between">
                                        <div className='flex items-center gap-2'>
                                            <span className="p-1 rounded-full bg-green-500" />
                                            <h4 className="font-medium text-gray-900">
                                                {permission.name}
                                            </h4>
                                        </div>
                                        {
                                            hasPermissionDeletePermission &&
                                            <div>
                                                <button
                                                    onClick={() => handleDeletePermissionModal(permission)}
                                                    className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg"
                                                >
                                                    <DeleteIcon size={16} />
                                                </button>
                                            </div>
                                        }
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
