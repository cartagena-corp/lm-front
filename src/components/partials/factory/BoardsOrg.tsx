"use client"

import { useEffect, useState, useRef } from "react"
import { useOrganizationStore } from "@/lib/store/OrganizationStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { ProjectProps } from "@/lib/types/types"
import ChangeBoardOrganizationModal from "@/components/partials/config/boards/ChangeBoardOrganizationModal"
import FilterBoardsOrgForm from "@/components/partials/factory/FilterBoardsOrgForm"
import { useModalStore } from "@/lib/hooks/ModalStore"
import { BoardIcon, FilterIcon } from "@/assets/Icon"
import toast from "react-hot-toast"

interface BoardsOrgProps {
    organization: { organizationId: string; organizationName: string; createdAt: string }
    idOrg: string
}

export default function BoardsOrg({ organization, idOrg }: BoardsOrgProps) {
    const { boards, error, getBoardsByOrganization, loadMoreBoardsByOrganization, changeBoardOrganization } = useOrganizationStore()
    const { getValidAccessToken } = useAuthStore()
    const { openModal, closeModal } = useModalStore()
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [page, setPage] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [sortBy, setSortBy] = useState<string>('name')
    const [direction, setDirection] = useState<string>('asc')

    // Referencia para el contenedor con scroll
    const containerRef = useRef<HTMLDivElement>(null)
    // Almacenar todos los tableros mostrados
    const [displayedBoards, setDisplayedBoards] = useState<ProjectProps[]>([])
    // Debounce para la búsqueda
    const searchTimeout = useRef<NodeJS.Timeout | null>(null)

    const [showBoardMenu, setShowBoardMenu] = useState<string | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    // Cargar tableros iniciales
    useEffect(() => {
        const loadBoards = async () => {
            if (!idOrg) return // Verificar que idOrg existe

            const token = await getValidAccessToken()
            if (!token) return

            setIsLoading(true)
            try {
                await getBoardsByOrganization(token, idOrg, direction, sortBy, 0, 10)
            } catch (error) {
                console.error('Error loading boards:', error)
                toast.error('Error al cargar tableros')
            } finally {
                setIsLoading(false)
            }
        }

        loadBoards()
    }, [idOrg, direction, sortBy]) // Agregar las dependencias necesarias

    // Actualizar tableros mostrados cuando cambia boards en el store
    useEffect(() => {
        if (!boards?.content) return

        if (boards.number === 0) {
            setDisplayedBoards(boards.content)
        } else {
            setDisplayedBoards(prev => {
                const existingIds = new Set(prev.map(board => board.id))
                const newBoards = boards.content.filter(board => !existingIds.has(board.id))
                return [...prev, ...newBoards]
            })
        }
    }, [boards])

    // Manejar búsqueda con debounce
    useEffect(() => {
        if (!idOrg) return // Verificar que idOrg existe

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current)
        }

        searchTimeout.current = setTimeout(async () => {
            const token = await getValidAccessToken()
            if (!token) return

            setIsLoading(true)
            try {
                // Resetear a la primera página en búsquedas
                setPage(0)
                await getBoardsByOrganization(token, idOrg, direction, sortBy, 0, 10, searchTerm)
            } catch (error) {
                console.error('Error searching boards:', error)
                toast.error('Error al buscar tableros')
            } finally {
                setIsLoading(false)
            }
        }, 500)

        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current)
            }
        }
    }, [searchTerm, idOrg, direction, sortBy])

    // Manejar scroll infinito
    useEffect(() => {
        const handleScroll = async () => {
            if (!containerRef.current || !boards || isLoading || !idOrg) return

            const { scrollTop, scrollHeight, clientHeight } = containerRef.current
            const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100

            if (scrollPercentage > 75 && page < boards.totalPages - 1) {
                const token = await getValidAccessToken()
                if (!token) return

                setIsLoading(true)
                try {
                    const nextPage = page + 1
                    await loadMoreBoardsByOrganization(token, idOrg, direction, sortBy, nextPage, 10, searchTerm)
                    setPage(nextPage)
                } catch (error) {
                    console.error('Error loading more boards:', error)
                    toast.error('Error al cargar más tableros')
                } finally {
                    setIsLoading(false)
                }
            }
        }

        const container = containerRef.current
        if (container) {
            container.addEventListener('scroll', handleScroll)
            return () => container.removeEventListener('scroll', handleScroll)
        }
    }, [boards, page, isLoading, idOrg, searchTerm, sortBy, direction])

    // Effect to handle clicking outside of board menus
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowBoardMenu(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleChangeOrganization = async (board: ProjectProps, data: { organizationId: string }) => {
        if (!board) return

        try {
            const token = await getValidAccessToken()
            if (!token) return

            const success = await changeBoardOrganization(token, board.id, data.organizationId)

            if (success) {
                // Actualizar la lista de tableros
                await getBoardsByOrganization(token, idOrg, direction, sortBy, 0, 10, searchTerm)
                // setDisplayedBoards([]) // Reset displayed boards
                setPage(0) // Reset page
                closeModal()
                toast.success("Tablero movido exitosamente")
            }
        } catch (error) {
            toast.error("Error al cambiar la organización del tablero")
        }
    }

    const handleFilterSubmit = async (filterData: { sortBy: string; direction: string }) => {
        setSortBy(filterData.sortBy)
        setDirection(filterData.direction)
        closeModal()

        // Resetear la paginación y recargar los datos
        setPage(0)
        setDisplayedBoards([])

        try {
            const token = await getValidAccessToken()
            if (!token) return

            await getBoardsByOrganization(token, idOrg, filterData.direction, filterData.sortBy, 0, 10, searchTerm)
        } catch (error) {
            console.error('Error applying filters:', error)
            toast.error('Error al aplicar filtros')
        }
    }

    const getStatusColor = (status: any) => {
        if (typeof status === 'object' && status?.color) {
            return status.color
        }
        return '#6B7280' // Default gray color
    }

    const getStatusName = (status: any) => {
        if (typeof status === 'object' && status?.name) { return status.name }
        return 'Sin estado'
    }

    const handleFilterModal = () => {
        openModal({
            size: "lg",
            title: "Ordenar Tableros",
            desc: "Configura cómo se muestran los tableros",
            children: <FilterBoardsOrgForm initialData={{ sortBy, direction }} onSubmit={handleFilterSubmit} onCancel={() => closeModal()} />,
            Icon: <FilterIcon size={20} stroke={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
        })
    }

    const handleChangeOrgModal = (board: ProjectProps) => {
        openModal({
            size: "lg",
            title: "Cambiar Organización",
            desc: "Selecciona la nueva organización en donde se guardará este tablero",
            children: <ChangeBoardOrganizationModal board={board} currentOrganization={{ organizationId: organization.organizationId, organizationName: organization.organizationName }} onSubmit={(data) => handleChangeOrganization(board, data)} onCancel={() => closeModal()} />,
            Icon: <FilterIcon size={20} stroke={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "UPDATE"
        })
    }

    return (
        <>
            <div className="p-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold mb-4">Tableros de la Organización</h2>

                    <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" onClick={() => handleFilterModal()} >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Filtros</span>
                        </button>
                    </div>
                </div>

                {displayedBoards.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="p-4 bg-gray-50 text-gray-400 rounded-lg w-fit mx-auto mb-4">
                            <BoardIcon size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay tableros</h3>
                        <p className="text-gray-600">No hay tableros en esta organización</p>
                    </div>
                ) : (
                    <div
                        ref={containerRef}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-2 overflow-y-auto max-h-[calc(100vh-250px)]"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {displayedBoards.map((board) => (
                            <div key={board.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 mb-1">
                                            {board.name}
                                        </h4>
                                        <p className="text-sm text-gray-500 line-clamp-2">
                                            {board.description}
                                        </p>
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowBoardMenu(showBoardMenu === board.id ? null : board.id)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <svg className="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                                            </svg>
                                        </button>
                                        {showBoardMenu === board.id && (
                                            <div ref={menuRef} className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => {
                                                            handleChangeOrgModal(board)
                                                            setShowBoardMenu(null)
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        Cambiar de Organización
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <span
                                        className="text-xs px-2 py-1 rounded-full text-white"
                                        style={{ backgroundColor: getStatusColor(board.status) }}
                                    >
                                        {getStatusName(board.status)}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(board.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                {board.createdBy && (
                                    <div className="flex items-center mt-2 pt-2 border-t border-gray-100">
                                        <img
                                            src={board.createdBy.picture}
                                            alt={`${board.createdBy.firstName} ${board.createdBy.lastName}`}
                                            className="w-6 h-6 rounded-full object-cover mr-2"
                                        />
                                        <span className="text-xs text-gray-500">
                                            {board.createdBy.firstName} {board.createdBy.lastName}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-center items-center p-4 col-span-full">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="text-sm text-gray-600 ml-3">Cargando tableros...</span>
                            </div>
                        )}
                        {boards && boards.number >= boards.totalPages - 1 && !isLoading && displayedBoards.length > 0 && (
                            <div className="text-center py-4 text-gray-500 text-sm border-t border-gray-100 col-span-full">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                    <span>No hay más tableros para mostrar</span>
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals are now managed by the modal store */}
        </>
    )
}