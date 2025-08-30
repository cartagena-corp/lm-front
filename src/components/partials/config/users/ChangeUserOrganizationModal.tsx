"use client"

import { useState, useEffect } from "react"
import { useOrganizationStore } from "@/lib/store/OrganizationStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { UserProps } from "@/lib/types/types"
import { getUserAvatar } from "@/lib/utils/avatar.utils"
import { ChevronRightIcon } from "@/assets/Icon"
interface ChangeUserOrganizationModalProps {
    user: UserProps
    currentOrganization: { organizationId: string; organizationName: string }
    onSubmit: (data: { organizationId: string, role: string }) => void
    onCancel: () => void
}

export default function ChangeUserOrganizationModal({ user, currentOrganization, onSubmit, onCancel }: ChangeUserOrganizationModalProps) {
    const { organizations, organizationRoles, getAllOrganizations, getOrganizationRoles } = useOrganizationStore()
    const { getValidAccessToken } = useAuthStore()

    const [selectedOrganization, setSelectedOrganization] = useState("")
    const [selectedRole, setSelectedRole] = useState("")
    const [isLoadingRoles, setIsLoadingRoles] = useState(false)

    // Cargar organizaciones al montar el componente
    useEffect(() => {
        const loadOrganizations = async () => {
            const token = await getValidAccessToken()
            if (!token) return
            await getAllOrganizations(token)
        }
        loadOrganizations()
    }, [getValidAccessToken, getAllOrganizations])

    // Cargar roles cuando se selecciona una organización
    useEffect(() => {
        const loadRoles = async () => {
            if (!selectedOrganization) return

            setIsLoadingRoles(true)
            const token = await getValidAccessToken()
            if (token) {
                await getOrganizationRoles(token, selectedOrganization)
                if (organizationRoles.length > 0) {
                    setSelectedRole(organizationRoles[0].name)
                }
            }
            setIsLoadingRoles(false)
        }
        loadRoles()
    }, [selectedOrganization, getValidAccessToken, getOrganizationRoles])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedOrganization && selectedRole) {
            onSubmit({
                organizationId: selectedOrganization,
                role: selectedRole
            })
        }
    }

    // Filtrar la organización actual de la lista
    const availableOrganizations = organizations.filter(
        org => org.organizationId !== currentOrganization.organizationId
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                    Cambiar Organización del Usuario
                </h3>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
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
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Organization Select */}
                <div className="space-y-2">
                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                        Nueva Organización
                    </label>
                    <select
                        id="organization"
                        value={selectedOrganization}
                        onChange={(e) => setSelectedOrganization(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    >
                        <option value="">Seleccionar organización</option>
                        {availableOrganizations.map(org => (
                            <option key={org.organizationId} value={org.organizationId}>
                                {org.organizationName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Role Select */}
                <div className="space-y-2">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Rol en la nueva organización
                    </label>
                    <select
                        id="role"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={!selectedOrganization || isLoadingRoles}
                        required
                    >
                        {isLoadingRoles ? (
                            <option>Cargando roles...</option>
                        ) : (
                            <>
                                <option value="">Seleccionar rol</option>
                                {organizationRoles.map(role => (
                                    <option key={role.name} value={role.name}>
                                        {role.name}
                                    </option>
                                ))}
                            </>
                        )}
                    </select>
                </div>

                {/* Visual Representation */}
                {selectedOrganization && selectedRole && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 text-center">
                                <div className="text-sm font-medium text-gray-500 mb-1">Organización Actual</div>
                                <div className="text-blue-600 font-medium">{currentOrganization.organizationName}</div>
                            </div>
                            <div className="text-blue-500 mx-4">
                                <ChevronRightIcon size={24} />
                            </div>
                            <div className="flex-1 text-center">
                                <div className="text-sm font-medium text-gray-500 mb-1">Nueva Organización</div>
                                <div className="text-blue-600 font-medium">
                                    {organizations.find(org => org.organizationId === selectedOrganization)?.organizationName}
                                </div>
                                <div className="text-sm text-blue-500 mt-1">
                                    Rol: {selectedRole}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!selectedOrganization || !selectedRole}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Confirmar Cambio
                    </button>
                </div>
            </form>
        </div>
    )
}
