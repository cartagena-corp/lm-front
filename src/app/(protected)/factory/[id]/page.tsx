"use client"

import ConfigOrg from "@/components/partials/factory/ConfigOrg"
import BoardsOrg from "@/components/partials/factory/BoardsOrg"
import UsersOrg from "@/components/partials/factory/UsersOrg"
import { useParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { useOrganizationStore } from "@/lib/store/OrganizationStore"
import { useBoardStore } from "@/lib/store/BoardStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { FactoryIcon } from "@/assets/Icon"
import Modal from "@/components/layout/Modal"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function Factory() {
    const router = useRouter()
    const [organization, setOrganization] = useState<{ organizationId: string; organizationName: string; createdAt: string }>({ organizationId: '', organizationName: '', createdAt: '' })
    const [activeTab, setActiveTab] = useState<'boards' | 'users' | 'config'>('boards')
    const { getSpecificOrganization, updateOrganization, deleteOrganization } = useOrganizationStore()
    const { getBoardsByOrganization } = useBoardStore()
    const { getValidAccessToken } = useAuthStore()

    // Estados para los modales y menú
    const [showMenu, setShowMenu] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [newOrgName, setNewOrgName] = useState('')
    const menuRef = useRef<HTMLDivElement>(null)

    const { id } = useParams()

    const renderTabContent = () => {
        switch (activeTab) {
            case 'boards': return <BoardsOrg organization={organization} />
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
            const token = await getValidAccessToken()
            if (!token) return

            // Fetch organization details
            const orgRes = await getSpecificOrganization(token, id as string)
            if (orgRes) {
                setOrganization(orgRes)
                setNewOrgName(orgRes.organizationName)
            }

            // Fetch boards for the organization
            await getBoardsByOrganization(token, id as string)
        }

        loadData()
    }, [id])

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const token = await getValidAccessToken()
        if (!token) return

        const success = await updateOrganization(token, organization.organizationId, newOrgName)
        if (success) {
            const updatedOrg = await getSpecificOrganization(token, organization.organizationId)
            if (updatedOrg) setOrganization(updatedOrg)
            setShowEditModal(false)
            toast.success('Organización actualizada exitosamente')
        }
    }

    const handleDelete = async () => {
        const token = await getValidAccessToken()
        if (!token) return

        const success = await deleteOrganization(token, organization.organizationId)
        if (success) {
            router.push('/factory')
            toast.success('Organización eliminada exitosamente')
        }
    }

    return (
        <>
            <header className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
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
                                            setShowEditModal(true)
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Editar Organización
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowMenu(false)
                                            setShowDeleteModal(true)
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

                {/* Modal de edición */}
                <Modal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    title="Editar Organización"
                >
                    <form onSubmit={handleEditSubmit} className="space-y-6 py-4">
                        <div className="space-y-2">
                            <label htmlFor="orgName" className="block text-sm font-medium text-gray-700">
                                Nombre de la organización
                            </label>
                            <input
                                type="text"
                                id="orgName"
                                value={newOrgName}
                                onChange={(e) => setNewOrgName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* Modal de eliminación */}
                <Modal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    title="Eliminar Organización"
                >
                    <div className="space-y-6 py-4">
                        <div className="text-center space-y-2">
                            <p className="text-gray-500">
                                ¿Estás seguro de que deseas eliminar la organización{' '}
                                <span className="font-semibold text-red-500">{organization.organizationName}</span>?
                                <br />
                                Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </Modal>
            </header>
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