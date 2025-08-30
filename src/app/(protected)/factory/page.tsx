"use client"

import { useOrganizationStore } from "@/lib/store/OrganizationStore"
import { ChevronRightIcon, FactoryIcon, PlusIcon } from "@/assets/Icon"
import CreateOrg from "@/components/partials/factory/createOrg"
import { useAuthStore } from "@/lib/store/AuthStore"
import Modal from "@/components/layout/Modal"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Link from "next/link"

export default function FactoryPage() {
    const { getAllOrganizations, organizations, createOrganization } = useOrganizationStore()
    const { getValidAccessToken } = useAuthStore()

    const [isCreateOrganizationOpen, setIsCreateOrganizationOpen] = useState(false)
    const [viewOrganization, setViewOrganization] = useState<{ organizationId: string; organizationName: string; createdAt: string } | null>(null)

    useEffect(() => {
        const loadData = async () => {
            const token = await getValidAccessToken()
            await getAllOrganizations(token)
        }
        loadData()
    }, [])

    const formatDate = (dateStr: string) => {
        if (!dateStr) return ''

        let date
        if (dateStr.includes('T')) {
            date = new Date(dateStr)
        } else {
            const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10))
            date = new Date(year, month - 1, day)
        }

        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    const handleCreate = async (data: string) => {
        const token = await getValidAccessToken()
        if (!token) return

        const newOrg = await createOrganization(token, data)

        if (newOrg) {
            setIsCreateOrganizationOpen(false)
            toast.success('Organización creada con éxito')
        }
    }
    return (
        <>
            <main className="bg-white border-gray-100 flex flex-col gap-6 border-b rounded-md shadow-md p-6">
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
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
                        onClick={() => {
                            setViewOrganization(null)
                            setIsCreateOrganizationOpen(true)
                        }}>
                        <PlusIcon size={16} stroke={4} />
                        Crear Organización
                    </button>
                </section>

                {/* Organizations List */}
                <section className="flex flex-col gap-2">
                    {
                        (organizations.length > 0) && organizations.map(org =>
                            <Link href={`/factory/${org.organizationId}`} key={org.organizationId} className="border-black/5 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-colors flex justify-between items-center rounded-md border p-4">
                                <aside className="flex items-center gap-4">
                                    <div className="text-blue-600 rounded-lg">
                                        <FactoryIcon size={24} />
                                    </div>
                                    <hgroup className="flex flex-col items-start">
                                        <h6 className="font-semibold">{org.organizationName}</h6>
                                        <p className="opacity-50 text-xs">{org.createdAt && formatDate(org.createdAt)}</p>
                                    </hgroup>
                                </aside>

                                <ChevronRightIcon />
                            </Link>
                        )
                    }
                </section>
            </main>

            {/* Modal de crear organización */}
            <Modal isOpen={isCreateOrganizationOpen} customWidth="sm:max-w-xl" onClose={() => setIsCreateOrganizationOpen(false)} title="" showCloseButton={false}>
                <CreateOrg
                    onSubmit={handleCreate}
                    onCancel={() => setIsCreateOrganizationOpen(false)}
                    orgObject={viewOrganization}
                    isEdit={false}
                />
            </Modal>
        </>
    )
}