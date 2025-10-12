"use client"

import { useState } from "react"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { getUserAvatar } from "@/lib/utils/avatar.utils"
import { getUserRoleName } from "@/lib/utils/user.utils"
import { UserProps } from "@/lib/types/types"
import { API_ROUTES } from "@/lib/routes/oauth.routes"
import AddUsersModal from "./AddUsersModal"
import { useModalStore } from "@/lib/hooks/ModalStore"
import {
    UsersIcon,
    PlusIcon,
    XIcon
} from "@/assets/Icon"

interface UserProjectConfigProps {
    projectId: string
}

export default function UserProjectConfig({ projectId }: UserProjectConfigProps) {
    const { projectParticipants, isLoading: configLoading, error: configError, addParticipantsToProject, removeParticipantsFromProject, clearError: clearConfigError } = useConfigStore()
    const { getValidAccessToken, clearError: clearAuthError, addUser } = useAuthStore()
    const { openModal, closeModal } = useModalStore()

    const [inviteLoading, setInviteLoading] = useState(false)
    const [inviteLoadingMessage, setInviteLoadingMessage] = useState("Invitando...")

    const error = configError

    const handleAddUsers = async (userIds: string[]) => {
        const token = await getValidAccessToken()
        if (token) {
            await addParticipantsToProject(token, projectId, userIds)
            closeModal()
        }
    }

    const handleRemoveUser = async (userId: string) => {
        const token = await getValidAccessToken()
        if (token) {
            await removeParticipantsFromProject(token, projectId, [userId])
        }
    }

    const handleInviteUser = async (data: { email: string; role: string }) => {
        const token = await getValidAccessToken()
        if (token) {
            setInviteLoading(true)

            try {
                // Paso 1: Crear el usuario en el sistema
                setInviteLoadingMessage("Creando usuario en La Muralla...")
                await addUser(token, data)

                // Paso 2: Buscar el usuario creado directamente con la API
                setInviteLoadingMessage("Buscando usuario creado...")

                const params = new URLSearchParams()
                params.append('search', data.email)
                params.append('page', '0')
                params.append('size', '50')

                const response = await fetch(`${API_ROUTES.LIST_USERS}?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                })

                if (response.ok) {
                    const searchResult = await response.json()

                    let createdUser = null

                    // Si la respuesta tiene el formato paginado
                    if (searchResult.content && Array.isArray(searchResult.content)) {
                        createdUser = searchResult.content.find((user: UserProps) =>
                            user.email.toLowerCase() === data.email.toLowerCase()
                        )
                    }
                    // Si la respuesta es un array directo
                    else if (Array.isArray(searchResult)) {
                        createdUser = searchResult.find((user: UserProps) =>
                            user.email.toLowerCase() === data.email.toLowerCase()
                        )
                    }

                    if (createdUser) {
                        // Paso 3: Agregar el usuario al proyecto/tablero
                        setInviteLoadingMessage("Agregando usuario al proyecto...")
                        await addParticipantsToProject(token, projectId, [createdUser.id])
                    }
                } else {
                    console.error('❌ Error en la búsqueda de usuario:', response.status, response.statusText)
                }

                closeModal()

            } catch (error) {
                console.error('Error al invitar usuario:', error)
                // Mantener el modal abierto en caso de error para que el usuario pueda reintentar
            } finally {
                setInviteLoading(false)
                setInviteLoadingMessage("Invitando...")
            }
        }
    }

    const handleOpenAddUsersModal = () => {
        openModal({
            size: "lg",
            title: "Agregar Participantes",
            desc: "Selecciona los usuarios que quieres agregar al proyecto",
            children: <AddUsersModal onSubmit={handleAddUsers} onInviteUser={handleInviteUser} projectParticipants={projectParticipants} isLoading={configLoading || inviteLoading} inviteLoadingMessage={inviteLoadingMessage} />,
            Icon: <PlusIcon size={20} stroke={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "CREATE"
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
        <div className="bg-white">
            {/* Header */}
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
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
                    <button onClick={handleOpenAddUsersModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center text-sm gap-2" >
                        <PlusIcon size={16} stroke={2.5} />
                        Agregar Participantes
                    </button>
                </div>
            </div>

            {/* Participants List */}
            <div className="bg-white">
                {(configLoading && projectParticipants.length === 0) ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando participantes...</p>
                    </div>
                ) : (projectParticipants.length === 0 && !configLoading) ? (
                    <div className="p-8 text-center">
                        <div className="p-4 bg-gray-50 text-gray-400 rounded-lg w-fit mx-auto mb-4">
                            <UsersIcon size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay participantes</h3>
                        <p className="text-gray-600">Comienza agregando participantes al proyecto</p>
                    </div>
                ) : (
                    <div className="divide-gray-100 divide-y max-h-[50vh] overflow-y-auto">
                        {projectParticipants.map((user) => (
                            <div key={user.id} className="py-2 px-6 hover:bg-gray-50 transition-colors">
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
                                            className="p-2 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
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
        </div>
    )
}
