"use client"
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store/AuthStore'
import Modal from '@/components/layout/Modal'
import { EyeIcon, PlusIcon, DeleteIcon, MenuIcon } from '@/assets/Icon'
import DeletePermissionForm from './DeletePermissionForm'
import CreatePermissionForm from './CreatePermissionForm'

interface PermissionProps {
    name: string
}

export default function PermissionsManagement() {
    const {
        permissions,
        isLoading,
        error,
        getValidAccessToken,
        listPermissions,
        createPermission,
        deletePermission,
        clearError
    } = useAuthStore()

    // Estados para modales
    const [showCreatePermissionModal, setShowCreatePermissionModal] = useState(false)
    const [showDeletePermissionModal, setShowDeletePermissionModal] = useState(false)
    const [selectedPermission, setSelectedPermission] = useState<PermissionProps | null>(null)

    // Cargar datos iniciales
    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const token = await getValidAccessToken()
        if (token) {
            await listPermissions(token)
        }
    }

    // Handlers para permisos
    const handleCreatePermission = async (data: { name: string }) => {
        const token = await getValidAccessToken()
        if (token) {
            await createPermission(token, data)
            setShowCreatePermissionModal(false)
            loadData()
        }
    }

    const handleDeletePermission = async () => {
        if (!selectedPermission) return

        const token = await getValidAccessToken()
        if (token) {
            await deletePermission(token, selectedPermission.name)
            setShowDeletePermissionModal(false)
            setSelectedPermission(null)
            loadData()
        }
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
                                        <div>
                                            <button
                                                onClick={() => {
                                                    setSelectedPermission(permission)
                                                    setShowDeletePermissionModal(true)
                                                }}
                                                className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg"
                                            >
                                                <DeleteIcon size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modales */}
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
