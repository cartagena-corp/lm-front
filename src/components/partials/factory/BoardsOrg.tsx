"use client"

import { useEffect, useState, useCallback } from "react"
import { useOrganizationStore } from "@/lib/store/OrganizationStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { ProjectProps } from "@/lib/types/types"
import BoardCard from "@/components/partials/boards/BoardCard"
import ChangeBoardOrganizationModal from "@/components/partials/config/boards/ChangeBoardOrganizationModal"
import { useModalStore } from "@/lib/hooks/ModalStore"
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll"
import { LayoutDashboard, Filter } from "lucide-react"
import toast from "react-hot-toast"

interface BoardsOrgProps {
    organization: { organizationId: string; organizationName: string; createdAt: string }
    idOrg: string
}

export default function BoardsOrg({ organization, idOrg }: BoardsOrgProps) {
    const { boards, error, getBoardsByOrganization, loadMoreBoardsByOrganization, changeBoardOrganization } = useOrganizationStore()
    const { getValidAccessToken } = useAuthStore()
    const { openModal, closeModal } = useModalStore()
    const [page, setPage] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const sortBy = 'name'
    const direction = 'asc'

    // Almacenar todos los tableros mostrados
    const [displayedBoards, setDisplayedBoards] = useState<ProjectProps[]>([])

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

    // Cargar la siguiente página (atado al scroll principal de la app, no a un contenedor propio)
    const handleLoadMore = useCallback(async () => {
        if (!idOrg || !boards) return

        const token = await getValidAccessToken()
        if (!token) return

        setIsLoading(true)
        try {
            const nextPage = page + 1
            await loadMoreBoardsByOrganization(token, idOrg, direction, sortBy, nextPage, 10)
            setPage(nextPage)
        } catch (error) {
            console.error('Error loading more boards:', error)
            toast.error('Error al cargar más tableros')
        } finally {
            setIsLoading(false)
        }
    }, [idOrg, boards, page, direction, sortBy, getValidAccessToken, loadMoreBoardsByOrganization])

    useInfiniteScroll({
        loading: isLoading,
        hasMore: boards ? page < boards.totalPages - 1 : false,
        onLoadMore: handleLoadMore,
        threshold: 200
    })

    const handleChangeOrganization = async (board: ProjectProps, data: { organizationId: string }) => {
        if (!board) return

        try {
            const token = await getValidAccessToken()
            if (!token) return

            const success = await changeBoardOrganization(token, board.id, data.organizationId)

            if (success) {
                // Actualizar la lista de tableros
                await getBoardsByOrganization(token, idOrg, direction, sortBy, 0, 10)
                // setDisplayedBoards([]) // Reset displayed boards
                setPage(0) // Reset page
                closeModal()
                toast.success("Tablero movido exitosamente")
            }
        } catch (error) {
            toast.error("Error al cambiar la organización del tablero")
        }
    }

    const handleChangeOrgModal = (board: ProjectProps) => {
        openModal({
            size: "lg",
            title: "Cambiar Organización",
            desc: "Selecciona la nueva organización en donde se guardará este tablero",
            children: <ChangeBoardOrganizationModal board={board} currentOrganization={{ organizationId: organization.organizationId, organizationName: organization.organizationName }} onSubmit={(data) => handleChangeOrganization(board, data)} onCancel={() => closeModal()} />,
            Icon: <Filter size={20} strokeWidth={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "UPDATE"
        })
    }

    return (
        <>
            <div className="py-4">
                <h2 className="text-xl font-semibold mb-4" style={{ letterSpacing: "-0.02em", color: "var(--ds-text)" }}>Tableros de la Organización</h2>

                {displayedBoards.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="p-4 rounded-lg w-fit mx-auto mb-4" style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text-muted)" }}>
                            <LayoutDashboard size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-sm font-medium mb-1" style={{ color: "var(--ds-text)" }}>No hay tableros</h3>
                        <p className="text-[13px]" style={{ color: "var(--ds-text-muted)" }}>No hay tableros en esta organización</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayedBoards.map((board) => (
                            <BoardCard
                                key={board.id}
                                board={board}
                                showCreatedBy
                                onChangeOrganization={() => handleChangeOrgModal(board)}
                                onDeleted={(id) => setDisplayedBoards(prev => prev.filter(b => b.id !== id))}
                            />
                        ))}
                        {isLoading && (
                            <div className="flex justify-center items-center p-4 col-span-full">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: "var(--blue-700)" }}></div>
                                <span className="text-sm ml-3" style={{ color: "var(--ds-text-secondary)" }}>Cargando tableros...</span>
                            </div>
                        )}
                        {boards && boards.number >= boards.totalPages - 1 && !isLoading && displayedBoards.length > 0 && (
                            <div className="text-center py-4 text-sm col-span-full" style={{ color: "var(--ds-text-muted)", borderTop: "1px solid var(--ds-border)" }}>
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: "var(--gray-alpha-300)" }}></div>
                                    <span>No hay más tableros para mostrar</span>
                                    <div className="w-2 h-2 rounded-full" style={{ background: "var(--gray-alpha-300)" }}></div>
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