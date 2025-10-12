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
        <div className="space-y-6 p-6">
            {/* User Info */}
            <div className="flex flex-col justify-center items-center gap-1 p-4 bg-purple-50 rounded-lg">
                <img src={getUserAvatar(user, 40)} alt={`${user.firstName} ${user.lastName}`} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex flex-col items-center">
                    <h4 className="font-medium text-purple-600">{user.firstName} {user.lastName}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 text-center">
                                <div className="text-sm font-medium text-gray-500 mb-1">Organización Actual</div>
                                <div className="text-purple-600 font-medium">{currentOrganization.organizationName}</div>
                            </div>
                            <div className="text-purple-500 mx-4">
                                <ChevronRightIcon size={24} />
                            </div>
                            <div className="flex-1 text-center">
                                <div className="text-sm font-medium text-gray-500 mb-1">Nueva Organización</div>
                                <div className="text-purple-600 font-medium">
                                    {organizations.find(org => org.organizationId === selectedOrganization)?.organizationName}
                                </div>
                                <div className="text-sm text-purple-500 mt-1">
                                    Rol: {selectedRole}
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                <div className="flex justify-end gap-3 mt-4">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200 text-sm font-medium" type="button"
                        onClick={() => onCancel()}>
                        Cancelar
                    </button>
                    <button disabled={!selectedOrganization || !selectedRole} className={`bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 text-white focus:ring-2 rounded-md focus:ring-offset-2 transition-all duration-200 text-sm font-medium px-4 py-2`} type="submit">
                        Confirmar Cambio
                    </button>
                </div>
            </form>
        </div>
    )
}
