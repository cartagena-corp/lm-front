"use client"

import { useOrganizationStore } from "@/lib/store/OrganizationStore"
import { ChevronRight, Factory, Plus, Calendar } from "lucide-react"
import CreateOrg from "@/components/partials/factory/createOrg"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Link from "next/link"
import { useModalStore } from "@/lib/hooks/ModalStore"
import EmptyState from "@/components/ui/EmptyState"

export default function FactoryPage() {
    const { getAllOrganizations, organizations, createOrganization } = useOrganizationStore()
    const { openModal, closeModal } = useModalStore()
    const { getValidAccessToken } = useAuthStore()

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
            closeModal()
            toast.success('Organización creada con éxito')
        }
    }

    const handleCreateOrganization = () => {
        openModal({
            size: "md",
            title: "Crear Nueva Organización",
            desc: "Completa los detalles de la nueva organización",
            Icon: <Plus size={20} strokeWidth={1.75} />,
            children: <CreateOrg onSubmit={handleCreate} onCancel={() => closeModal()} orgObject={viewOrganization} isEdit={false} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
        })
    }


    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-4">
                <div>
                    <h1 className="font-semibold" style={{ fontSize: 28, letterSpacing: "-1.1px", color: "var(--ds-text)", margin: "0 0 4px" }}>Organizaciones</h1>
                    <p style={{ fontSize: 14, color: "var(--ds-text-secondary)", margin: 0 }}>
                        {organizations.length} organizaciones · gestiona organizaciones y agrega usuarios
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={() => {
                            setViewOrganization(null)
                            handleCreateOrganization()
                        }}
                        className="flex items-center justify-center gap-[7px] transition-colors text-sm font-medium hover:bg-[var(--primary-800)] bg-[var(--primary-700)]"
                        style={{ height: 36, padding: "0 14px", color: "var(--primary-contrast-fg)", border: "1px solid var(--primary-700)", borderRadius: "var(--radius-md)" }}
                    >
                        <Plus size={15} strokeWidth={2.5} />
                        <span className="hidden sm:inline">Crear Organización</span>
                        <span className="sm:hidden">Crear</span>
                    </button>
                </div>
            </div>

            {/* Organizations List */}
            {
                (organizations.length > 0) ? (
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {organizations.map(org =>
                            <Link href={`/factory/${org.organizationId}`} key={org.organizationId}
                                className="lm-board-card group transition-shadow duration-150 flex flex-col gap-3 p-[18px] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                                style={{ background: "var(--ds-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-border)", color: "var(--ds-text)" }}>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, borderRadius: 8, background: "var(--gray-alpha-100)", color: "var(--ds-text-secondary)" }}>
                                            <Factory size={20} strokeWidth={1.5} />
                                        </div>
                                        <h3 className="font-semibold truncate min-w-0" style={{ fontSize: 15, letterSpacing: "-0.01em", color: "var(--ds-text)" }}>{org.organizationName}</h3>
                                    </div>
                                    <ChevronRight className="flex-shrink-0" size={18} strokeWidth={1.5} style={{ color: "var(--ds-text-muted)" }} />
                                </div>
                                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--ds-text-muted)" }}>
                                    <Calendar size={14} strokeWidth={1.5} />
                                    <span>{org.createdAt && formatDate(org.createdAt)}</span>
                                </div>
                            </Link>
                        )}
                    </section>
                ) : (
                    <EmptyState
                        icon={<Factory size={48} strokeWidth={1.5} />}
                        title="No hay organizaciones"
                        description="Aún no has creado ninguna organización. Comienza creando la primera para organizar tus tableros y usuarios."
                        action={{
                            label: "Crear Organización",
                            onClick: () => {
                                setViewOrganization(null)
                                handleCreateOrganization()
                            }
                        }}
                    />
                )
            }
        </div>
    )
}