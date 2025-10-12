"use client"

import { useState, useEffect } from "react"
import { useOrganizationStore } from "@/lib/store/OrganizationStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { ProjectProps } from "@/lib/types/types"
import { ChevronRightIcon } from "@/assets/Icon"

interface ChangeBoardOrganizationModalProps {
    board: ProjectProps
    currentOrganization: { organizationId: string; organizationName: string }
    onSubmit: (data: { organizationId: string }) => void
    onCancel: () => void
}

export default function ChangeBoardOrganizationModal({ board, currentOrganization, onSubmit, onCancel }: ChangeBoardOrganizationModalProps) {
    const { organizations, getAllOrganizations } = useOrganizationStore()
    const { getValidAccessToken } = useAuthStore()

    const [selectedOrganization, setSelectedOrganization] = useState("")

    // Cargar organizaciones al montar el componente
    useEffect(() => {
        const loadOrganizations = async () => {
            const token = await getValidAccessToken()
            if (!token) return
            await getAllOrganizations(token)
        }
        loadOrganizations()
    }, [getValidAccessToken, getAllOrganizations])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedOrganization) {
            onSubmit({
                organizationId: selectedOrganization
            })
        }
    }

    // Filtrar la organización actual de la lista
    const availableOrganizations = organizations.filter(
        org => org.organizationId !== currentOrganization.organizationId
    )

    return (
        <div className="space-y-6 p-6">

            {/* Board Info */}
            <div className="p-4 bg-purple-50 text-purple-600 rounded-lg">
                <div>
                    <h4 className="font-medium">
                        {board.name}
                    </h4>
                    <p className="text-sm text-black">{board.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Creado: {new Date(board.createdAt).toLocaleDateString()}
                    </p>
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

                {/* Visual Representation */}
                {selectedOrganization && (
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
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex justify-end gap-3 mt-4">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200 text-sm font-medium" type="button"
                        onClick={() => onCancel()}>
                        Cancelar
                    </button>
                    <button disabled={!selectedOrganization} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium" type="submit">
                        Confirmar Cambio
                    </button>
                </div>
            </form>
        </div>
    )
}
