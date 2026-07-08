"use client"

import BoardsOrg from "@/components/partials/factory/BoardsOrg"
import UsersOrg from "@/components/partials/factory/UsersOrg"
import { useParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { useOrganizationStore } from "@/lib/store/OrganizationStore"
import { useBoardStore } from "@/lib/store/BoardStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { Pencil, Factory as FactoryIcon, MoreVertical } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useModalStore } from "@/lib/hooks/ModalStore"
import DeleteOrganization from "@/components/partials/factory/DeleteOrganization"
import UpdateOrganization from "@/components/partials/factory/UpdateOrganization"
import { CustomSwitch, valueProps } from "@/components/ui/CustomSwitch"

const ORG_TABS: valueProps[] = [
    { id: 1, name: "Tableros", view: () => <></> },
    { id: 2, name: "Usuarios", view: () => <></> },
]

export default function Factory() {
    const router = useRouter()
    const [organization, setOrganization] = useState<{ organizationId: string; organizationName: string; createdAt: string }>({ organizationId: '', organizationName: '', createdAt: '' })
    const [activeTab, setActiveTab] = useState<valueProps>(ORG_TABS[0])
    const { getSpecificOrganization, updateOrganization, deleteOrganization } = useOrganizationStore()
    const { getBoardsByOrganization } = useBoardStore()
    const { getValidAccessToken } = useAuthStore()

    // Estados para los modales y menú
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const { id } = useParams()

    const renderTabContent = () => {
        if (!id) return null // Verificar que el ID existe

        switch (activeTab.id) {
            case 1: return <BoardsOrg organization={organization} idOrg={id as string} />
            case 2: return <UsersOrg organization={organization} />
            default: return null
        }
    }

    // Efecto para cerrar el menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Cargar datos iniciales
    useEffect(() => {
        const loadData = async () => {
            if (!id) return // Verificar que el ID existe

            const token = await getValidAccessToken()
            if (!token) return

            // Fetch organization details
            const orgRes = await getSpecificOrganization(token, id as string)
            if (orgRes) setOrganization(orgRes)

            // Fetch boards for the organization
            await getBoardsByOrganization(token, id as string)
        }

        loadData()
    }, [id]) // Agregar id como dependencia

    const handleEdit = async (newOrgName: string) => {
        const token = await getValidAccessToken()
        if (!token) return

        const success = await updateOrganization(token, organization.organizationId, newOrgName)
        if (success) {
            const updatedOrg = await getSpecificOrganization(token, organization.organizationId)
            if (updatedOrg) setOrganization(updatedOrg)
            toast.success('Organización actualizada exitosamente')
            closeModal()
        }
    }

    const handleDelete = async () => {
        const token = await getValidAccessToken()
        if (!token) return

        const success = await deleteOrganization(token, organization.organizationId)
        if (success) {
            router.push('/factory')
            toast.success('Organización eliminada exitosamente')
            closeModal()
        }
    }

    const { openModal, closeModal } = useModalStore()

    const handleDeleteOrganizacion = () => {
        openModal({
            size: "md",
            children: <DeleteOrganization organizationName={organization.organizationName} organizationDate={organization.createdAt} onClick={() => handleDelete()} onCancel={() => closeModal()} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "DELETE"
        })
    }

    const handleEditOrganizacion = () => {
        openModal({
            size: "md",
            title: "Editar Organización",
            desc: "Edita el nombre de la organización",
            Icon: <Pencil size={20} strokeWidth={1.75} />,
            children: <UpdateOrganization organizationName={organization.organizationName} onClick={(newOrgName: string) => handleEdit(newOrgName)} onCancel={() => closeModal()} />,
            closeOnBackdrop: false,
            closeOnEscape: false,

            mode: "UPDATE"
        })
    }

    return (
        <div className="space-y-4" style={{ background: "var(--ds-card)" }}>
            <div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 10, background: "var(--gray-alpha-100)", color: "var(--ds-text-secondary)" }}>
                            <FactoryIcon size={24} />
                        </div>
                        <div>
                            <h1 className="font-semibold" style={{ fontSize: 24, letterSpacing: "-0.96px", color: "var(--ds-text)" }}>{organization ? organization.organizationName : 'Cargando...'}</h1>
                            <p style={{ fontSize: 13, color: "var(--ds-text-secondary)", marginTop: 2 }}>Panel de configuración de la organización</p>
                        </div>
                    </div>

                    {/* Menú de opciones */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 rounded-md transition-colors duration-150 hover:bg-[var(--gray-alpha-100)]"
                            style={{ color: "var(--ds-text-muted)" }}
                        >
                            <MoreVertical size={20} strokeWidth={1.5} />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-56 z-10 overflow-hidden" style={{ background: "var(--ds-card)", border: "1px solid var(--ds-border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)" }}>
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setShowMenu(false)
                                            handleEditOrganizacion()
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm transition-colors duration-150 hover:bg-[var(--gray-alpha-100)]"
                                        style={{ color: "var(--ds-text)" }}
                                    >
                                        Editar Organización
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowMenu(false)
                                            handleDeleteOrganizacion()
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm transition-colors duration-150 hover:bg-[var(--red-100)]"
                                        style={{ color: "var(--ds-error)" }}
                                    >
                                        Eliminar Organización
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div>
                <CustomSwitch tabs={ORG_TABS} value={activeTab} onChange={setActiveTab} />
                {renderTabContent()}
            </div>
        </div>
    )
}