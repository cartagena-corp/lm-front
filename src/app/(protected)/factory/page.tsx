"use client"

import { useOrganizationStore } from "@/lib/store/OrganizationStore"
import { FactoryIcon, PlusIcon } from "@/assets/Icon"
import { useEffect } from "react"
import { useAuthStore } from "@/lib/store/AuthStore"

export default function FactoryPage() {
    const { getAllOrganizations, organizations } = useOrganizationStore()
    const { getValidAccessToken } = useAuthStore()

    useEffect(() => {
        const loadData = async () => {
            const token = await getValidAccessToken()
            await getAllOrganizations(token)
        }
        loadData()
    }, [])
    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Organizaciones</h1>
            <main className="bg-white border-gray-100 flex flex-col gap-6 border-b rounded-md p-6">
                {/* Header */}
                <section className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 text-blue-600 rounded-lg p-2">
                            <FactoryIcon size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Listado de Organizaciones</h3>
                            <p className="text-sm text-gray-500">Gestiona las organizaciones y sus propiedades</p>
                        </div>
                    </div>
                    <button
                        // onClick={() => {
                        //     setCurrentStatus({ name: "", color: "#000000" })
                        //     setIsCreateStatusOpen(true)
                        // }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
                    >
                        <PlusIcon size={16} stroke={4} />
                        Crear Organización
                    </button>
                </section>

                {/* Organizations List */}
                <section className="flex flex-col gap-4">
                    {
                        (organizations.length > 0) && organizations.map(org =>
                            <div key={org.organizationId} className="border-black/25 border rounded-md p-4">
                                {org.organizationName}
                            </div>
                        )
                    }
                </section>
            </main>

        </>
    )
}