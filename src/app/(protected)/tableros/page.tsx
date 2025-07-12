'use client'

import BoardCard, { BoardCardSkeleton } from '@/components/partials/boards/BoardCard'
import FilterProjectForm from '@/components/partials/boards/FilterProjectForm'
import { FilterProjectProps, ProjectProps } from '@/lib/types/types'
import CreateBoardForm from '@/components/partials/boards/CreateBoardForm'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { useBoardStore } from '@/lib/store/BoardStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import { BoardIcon, FilterIcon, PlusIcon } from '@/assets/Icon'
import Modal from '@/components/layout/Modal'
import { useEffect, useState } from 'react'

export default function TablerosPage() {
  const { boards, getBoards, createBoard, importFromJira, isLoading, error } = useBoardStore()
  const { getValidAccessToken, isAuthenticated } = useAuthStore((state) => state)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<FilterProjectProps | null>(null)
  const { setConfig } = useConfigStore()

  // Función para crear un nuevo tablero utilizando un token validado
  const handleCreateBoard = async (newBoard: ProjectProps, jiraImport: File | null) => {
    try {
      const token = await getValidAccessToken()
      if (!token) {
        console.error('No se pudo obtener un token válido')
        return
      }

      const statusId = typeof newBoard.status === 'object' ? newBoard.status.id : newBoard.status

      // Only send necessary fields for board creation
      const boardData = {
        name: newBoard.name,
        description: newBoard.description,
        startDate: newBoard.startDate,
        endDate: newBoard.endDate,
        status: statusId
      }

      if (jiraImport) {
        await importFromJira(token, boardData, jiraImport)
      } else {
        await createBoard(token, boardData)
      }
    } catch (error) {
      console.error('Error creando tablero:', error)
    } finally {
      setIsCreateModalOpen(false)
    }
  }

  // Cargar configuración inicial y tableros
  useEffect(() => {
    const initializeData = async () => {
      if (!isAuthenticated) return

      try {
        const token = await getValidAccessToken()
        if (!token) return

        // Ejecutar configuración inicial y carga de tableros en paralelo
        await Promise.all([
          getBoards(token),
          setConfig(token)
        ])
      } catch (error) {
        console.error('Error inicializando datos:', error)
      }
    }

    initializeData()
  }, [isAuthenticated, getBoards, getValidAccessToken, setConfig])

  const handleFilter = async (filters: FilterProjectProps) => {
    try {
      setIsFilterModalOpen(false)
      setCurrentFilters(filters)

      const token = await getValidAccessToken()
      if (!token) {
        console.error('No se pudo obtener un token válido')
        return
      }

      // Transform FilterProjectProps to BoardFilters
      const boardFilters = {
        name: filters.name || undefined,
        status: filters.status || undefined,
        createdBy: filters.createdBy || undefined,
        page: filters.page || undefined,
        size: filters.size || undefined,
        sortBy: filters.sortBy?.id === 'createdAt' || filters.sortBy?.id === 'updatedAt'
          ? filters.sortBy.id as 'createdAt' | 'updatedAt'
          : 'createdAt' as 'createdAt' | 'updatedAt',
        direction: filters.direction === 'asc' || filters.direction === 'desc'
          ? filters.direction as 'asc' | 'desc'
          : 'desc' as 'asc' | 'desc'
      }

      await getBoards(token, boardFilters)
    } catch (error) {
      console.error('Error aplicando filtros:', error)
    }
  }

  const handlePageChange = async (page: number) => {
    try {
      const token = await getValidAccessToken()
      if (!token) {
        console.error('No se pudo obtener un token válido')
        return
      }

      // Use current filters with new page
      const boardFilters = currentFilters ? {
        name: currentFilters.name || undefined,
        status: currentFilters.status || undefined,
        createdBy: currentFilters.createdBy || undefined,
        page: page - 1, // API uses 0-based pagination
        size: currentFilters.size || 12,
        sortBy: currentFilters.sortBy?.id === 'createdAt' || currentFilters.sortBy?.id === 'updatedAt'
          ? currentFilters.sortBy.id as 'createdAt' | 'updatedAt'
          : 'createdAt' as 'createdAt' | 'updatedAt',
        direction: currentFilters.sortBy?.sort === 'asc' || currentFilters.sortBy?.sort === 'desc'
          ? currentFilters.sortBy.sort as 'asc' | 'desc'
          : 'desc' as 'asc' | 'desc'
      } : {
        page: page - 1,
        size: 12
      }

      await getBoards(token, boardFilters)
    } catch (error) {
      console.error('Error cambiando página:', error)
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 md:mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Tableros</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium shadow-sm"
          >
            <FilterIcon size={16} stroke={2} />
            <span className="hidden sm:inline">Filtrar tableros</span>
            <span className="sm:hidden">Filtrar</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            <PlusIcon size={16} stroke={2.5} />
            <span className="hidden sm:inline">{isLoading ? 'Creando tablero...' : 'Crear tablero'}</span>
            <span className="sm:hidden">{isLoading ? 'Creando...' : 'Crear'}</span>
          </button>
        </div>
      </div>

      {/* Información de paginación */}
      {boards.content && boards.content.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          Mostrando {boards.content.length} de {boards.totalElements} tableros
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 md:gap-6 min-h-[60vh]">
        {
          isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <BoardCardSkeleton key={i} />)
          ) : boards.content && boards.content.length > 0 ? (
            boards.content.map((board, i) => <BoardCard key={i} board={board as ProjectProps} />)
          ) : (
            <div className="col-span-full flex items-center justify-center">
              <EmptyState
                icon={<BoardIcon size={48} stroke={1.5} />}
                title={currentFilters ? "No se encontraron tableros" : "No hay tableros disponibles"}
                description={currentFilters ? "No hay tableros que coincidan con los filtros aplicados. Intenta ajustar los criterios de búsqueda." : "Aún no has creado ningún tablero. Comienza creando tu primer tablero para organizar tus proyectos."}
                action={{
                  label: currentFilters ? "Limpiar filtros" : "Crear mi primer tablero",
                  onClick: currentFilters ? () => {
                    setCurrentFilters(null)
                    handlePageChange(1)
                  } : () => setIsCreateModalOpen(true)
                }}
              />
            </div>
          )
        }
      </div>

      {/* Paginación */}
      {boards.content && boards.content.length > 0 && (
        <Pagination
          currentPage={boards.number + 1} // API uses 0-based pagination
          totalPages={boards.totalPages}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      )}

      {/* Modal para crear tablero */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title=""
        showCloseButton={false}
        customWidth='max-w-xl'
      >
        <CreateBoardForm
          onSubmit={handleCreateBoard}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Modal para filtros */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title=""
        showCloseButton={false}
        customWidth='max-w-xl'
      >
        <FilterProjectForm
          onSubmit={handleFilter}
          onCancel={() => setIsFilterModalOpen(false)}
        />
      </Modal>
    </>
  )
}
