"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { getUserAvatar } from "@/lib/utils/avatar.utils"
import { getUserRoleName } from "@/lib/utils/user.utils"
import AddUsersModal from "./AddUsersModal"
import {
    UsersIcon,
    PlusIcon,
    XIcon
} from "@/assets/Icon"

interface UserProjectConfigProps {
    projectId: string
}

export default function UserProjectConfig({ projectId }: UserProjectConfigProps) {
    const {
        getValidAccessToken,
        clearError: clearAuthError
    } = useAuthStore()

    const {
        projectParticipants,
        isLoading: configLoading,
        error: configError,
        addParticipantsToProject,
        removeParticipantsFromProject,
        clearError: clearConfigError
    } = useConfigStore()

    // Estados para modales
    const [showAddUsersModal, setShowAddUsersModal] = useState(false)

    const error = configError

    const handleAddUsers = async (userIds: string[]) => {
        const token = await getValidAccessToken()
        if (token) {
            await addParticipantsToProject(token, projectId, userIds)
            setShowAddUsersModal(false)
        }
    }

    const handleRemoveUser = async (userId: string) => {
        const token = await getValidAccessToken()
        if (token) {
            await removeParticipantsFromProject(token, projectId, [userId])
        }
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
                            clearAuthError()
                            clearConfigError()
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
                        <div className="p-2 rounded-lg bg-green-50 text-green-600">
                            <UsersIcon size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Participantes del Proyecto
                            </h2>
                            <p className="text-sm text-gray-600">
                                {projectParticipants.length} participantes asignados
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddUsersModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <PlusIcon size={16} />
                        Agregar Participantes
                    </button>
                </div>
            </div>

            {/* Participants List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                {configLoading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando participantes...</p>
                    </div>
                ) : projectParticipants.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="p-4 bg-gray-50 text-gray-400 rounded-lg w-fit mx-auto mb-4">
                            <UsersIcon size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay participantes</h3>
                        <p className="text-gray-600">Comienza agregando participantes al proyecto</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {projectParticipants.map((user) => (
                            <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={getUserAvatar(user, 48)}
                                            alt={`${user.firstName || ''} ${user.lastName || ''}`}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <h4 className="font-medium text-gray-900">
                                                {user.firstName && user.lastName 
                                                    ? `${user.firstName} ${user.lastName}` 
                                                    : user.email
                                                }
                                            </h4>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                            <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit mt-1">
                                                {getUserRoleName(user)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleRemoveUser(user.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar del proyecto"
                                        >
                                            <XIcon size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal para agregar usuarios */}
            <AddUsersModal
                isOpen={showAddUsersModal}
                onClose={() => setShowAddUsersModal(false)}
                onSubmit={handleAddUsers}
                projectParticipants={projectParticipants}
                isLoading={configLoading}
            />
        </div>
    )
}
