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
    Users,
    Plus,
    X
} from "lucide-react"

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
            Icon: <Plus size={20} strokeWidth={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "CREATE"
        })
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="w-fit mx-auto mb-4 p-3 rounded-full" style={{ background: "var(--red-100)", color: "var(--red-900)" }}>
                    <Users size={32} strokeWidth={1.5} />
                </div>
                <h4 className="font-medium mb-2" style={{ fontSize: 16, color: "var(--ds-text)" }}>Error al cargar datos</h4>
                <p className="mb-6" style={{ color: "var(--ds-text-muted)" }}>{error}</p>
                <button
                    onClick={() => {
                        clearAuthError()
                        clearConfigError()
                    }}
                    className="flex items-center gap-2 px-[14px] transition-colors hover:bg-[var(--primary-800)] bg-[var(--primary-700)] text-sm font-medium mx-auto"
                    style={{ height: 36, color: "var(--primary-contrast-fg)", border: "1px solid var(--primary-700)", borderRadius: "var(--radius-md)" }}
                >
                    Reintentar
                </button>
            </div>
        )
    }

    return (
        <div className="mt-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-4">
                <div>
                    <h2 className="font-semibold" style={{ fontSize: 20, letterSpacing: "-0.02em", color: "var(--ds-text)", margin: "0 0 4px" }}>Participantes del Proyecto</h2>
                    <p style={{ fontSize: 14, color: "var(--ds-text-secondary)", margin: 0 }}>
                        {projectParticipants.length} participantes · gestiona quién colabora en este tablero
                    </p>
                </div>
                <button
                    onClick={handleOpenAddUsersModal}
                    className="flex items-center justify-center gap-[7px] transition-colors hover:bg-[var(--primary-800)] bg-[var(--primary-700)] text-sm font-medium flex-shrink-0"
                    style={{ height: 36, padding: "0 14px", color: "var(--primary-contrast-fg)", border: "1px solid var(--primary-700)", borderRadius: "var(--radius-md)" }}
                >
                    <Plus size={15} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Agregar Participantes</span>
                    <span className="sm:hidden">Agregar</span>
                </button>
            </div>

            {/* Participants Grid */}
            {(configLoading && projectParticipants.length === 0) ? (
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse"><div className="h-[92px]" style={{ background: "var(--gray-alpha-200)", borderRadius: "var(--radius-xl)" }} /></div>
                    ))}
                </div>
            ) : (projectParticipants.length === 0 && !configLoading) ? (
                <div className="text-center py-12">
                    <div className="w-fit mx-auto mb-4 p-3 rounded-full" style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text-muted)" }}>
                        <Users size={32} strokeWidth={1.5} />
                    </div>
                    <h4 className="font-medium mb-2" style={{ fontSize: 16, color: "var(--ds-text)" }}>No hay participantes</h4>
                    <p className="mb-6" style={{ color: "var(--ds-text-muted)" }}>Comienza agregando participantes al proyecto</p>
                    <button
                        onClick={handleOpenAddUsersModal}
                        className="flex items-center gap-2 px-[14px] transition-colors hover:bg-[var(--primary-800)] bg-[var(--primary-700)] text-sm font-medium mx-auto"
                        style={{ height: 36, color: "var(--primary-contrast-fg)", border: "1px solid var(--primary-700)", borderRadius: "var(--radius-md)" }}
                    >
                        <Plus size={16} strokeWidth={1.5} />
                        Agregar Participantes
                    </button>
                </div>
            ) : (
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                    {projectParticipants.map((user) => (
                        <div key={user.id} className="lm-card group relative flex flex-col gap-3 p-[18px]"
                            style={{ background: "var(--ds-card)", border: "1px solid var(--ds-border)", borderRadius: "var(--radius-xl)" }}>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3 min-w-0">
                                    <img
                                        src={getUserAvatar(user, 40)}
                                        alt={`${user.firstName || ''} ${user.lastName || ''}`}
                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                    />
                                    <div className="min-w-0">
                                        <h4 className="font-medium truncate" style={{ fontSize: 14, color: "var(--ds-text)" }}>
                                            {user.firstName && user.lastName
                                                ? `${user.firstName} ${user.lastName}`
                                                : user.email
                                            }
                                        </h4>
                                        <p className="text-xs truncate" style={{ color: "var(--ds-text-secondary)" }}>{user.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveUser(user.id)}
                                    className="p-1.5 rounded-md transition-colors duration-200 opacity-0 group-hover:opacity-100 hover:bg-[var(--red-100)] hover:text-[var(--red-900)] flex-shrink-0"
                                    style={{ color: "var(--ds-text-muted)" }}
                                    title="Eliminar del proyecto"
                                >
                                    <X size={16} strokeWidth={1.5} />
                                </button>
                            </div>
                            <span className="text-xs font-medium px-2 py-[2px] rounded-full w-fit" style={{ background: "var(--blue-100)", color: "var(--blue-900)", border: "1px solid var(--blue-400)" }}>
                                {getUserRoleName(user) || 'Sin rol'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
