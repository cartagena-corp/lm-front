"use client"

import ConfigOrg from "@/components/partials/factory/ConfigOrg"
import BoardsOrg from "@/components/partials/factory/BoardsOrg"
import UsersOrg from "@/components/partials/factory/UsersOrg"
import { useParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { useOrganizationStore } from "@/lib/store/OrganizationStore"
import { useBoardStore } from "@/lib/store/BoardStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { DeleteIcon, EditIcon, FactoryIcon } from "@/assets/Icon"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useModalStore } from "@/lib/hooks/ModalStore"
import DeleteOrganization from "@/components/partials/factory/DeleteOrganization"
import UpdateOrganization from "@/components/partials/factory/UpdateOrganization"

export default function Factory() {
    const router = useRouter()
    const [organization, setOrganization] = useState<{ organizationId: string; organizationName: string; createdAt: string }>({ organizationId: '', organizationName: '', createdAt: '' })
    const [activeTab, setActiveTab] = useState<'boards' | 'users' | 'config'>('boards')
    const { getSpecificOrganization, updateOrganization, deleteOrganization } = useOrganizationStore()
    const { getBoardsByOrganization } = useBoardStore()
    const { getValidAccessToken } = useAuthStore()

    // Estados para los modales y menú
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const { id } = useParams()

    const renderTabContent = () => {
        if (!id) return null // Verificar que el ID existe

        switch (activeTab) {
            case 'boards': return <BoardsOrg organization={organization} idOrg={id as string} />
            case 'users': return <UsersOrg organization={organization} />
            case 'config': return <ConfigOrg id={id as string} />
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
            Icon: <EditIcon size={20} stroke={1.75} />,
            children: <UpdateOrganization organizationName={organization.organizationName} onClick={(newOrgName: string) => handleEdit(newOrgName)} onCancel={() => closeModal()} />,
            closeOnBackdrop: false,
            closeOnEscape: false,

            mode: "UPDATE"
        })
    }

    return (
        <>
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <FactoryIcon size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{organization ? organization.organizationName : 'Cargando...'}</h1>
                            <p className="text-gray-600 mt-1">Panel de configuración de la organización</p>
                        </div>
                    </div>

                    {/* Menú de opciones */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                            </svg>
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setShowMenu(false)
                                            handleEditOrganizacion()
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Editar Organización
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowMenu(false)
                                            handleDeleteOrganizacion()
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        Eliminar Organización
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {/* Tabs */}
                <nav className="flex space-x-4 border-b border-gray-200 mb-4">
                    <button className={`px-4 py-2 rounded-t-lg font-medium ${activeTab === 'boards' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('boards')}>Tableros</button>
                    <button className={`px-4 py-2 rounded-t-lg font-medium ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('users')}>Usuarios</button>
                    {/* <button className={`px-4 py-2 rounded-t-lg font-medium ${activeTab === 'config' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('config')}>Configuración</button> */}
                </nav>
                {renderTabContent()}
            </section>
        </>
    )
}