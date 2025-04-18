'use client'

import BoardCard, { BoardCardSkeleton } from '@/components/partials/BoardCard'
import FilterProjectForm from '@/components/partials/FilterProjectForm'
import { FilterProjectProps, ProjectProps } from '@/lib/types/types'
import CreateBoardForm from '@/components/partials/CreateBoardForm'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { useBoardStore } from '@/lib/store/BoardStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import Modal from '@/components/layout/Modal'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function TablerosPage() {
  const { boards, setBoards, createBoard } = useBoardStore()
  // Extraemos el nuevo método getValidAccessToken y el flag isAuthenticated del store
  const { getValidAccessToken, isAuthenticated } = useAuthStore((state) => state)
  const params = useParams()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const { setConfig } = useConfigStore()

  // Función para crear un nuevo tablero utilizando un token validado
  const handleCreateBoard = async (newBoard: ProjectProps) => {
    const token = await getValidAccessToken()
    if (token) await createBoard(token, { ...newBoard, status: newBoard.status.id })
    setIsCreateModalOpen(false)
  }
  // Cargar los tableros desde la API asegurando que el token esté vigente.
  useEffect(() => {
    if (isAuthenticated) {
      (async () => {
        const token = await getValidAccessToken()
        if (token) {
          await setBoards(token)
        }
      })()
    }
  }, [isAuthenticated, setBoards, getValidAccessToken])

  useEffect(() => { if (isAuthenticated) setConfig() }, [isAuthenticated, setConfig])

  const handleFilter = async (filters: FilterProjectProps) => {
    setIsFilterModalOpen(false)
    const token = await getValidAccessToken()
    if (token) await setBoards(token, filters)
  }

  return (
    <main className="bg-gray-100 flex flex-col p-10 ml-64 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableros</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="border-blue-600 text-blue-600 hover:bg-blue-700 hover:text-white duration-150 px-4 py-2 rounded-md border whitespace-nowrap"
          >
            Filtrar
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 duration-150 whitespace-nowrap"
          >
            Crear tablero
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {
          boards.content ?
            boards.content.map((board, i) => <BoardCard key={i} board={board} />)
            :
            Array.from({ length: 8 }).map((_, i) => <BoardCardSkeleton key={i} />)
        }
      </div>

      {/* Modal para crear tablero */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear nuevo tablero"
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
        title="Filtros"
      >
        <FilterProjectForm
          onSubmit={handleFilter}
          onCancel={() => setIsFilterModalOpen(false)}
        />
      </Modal>
    </main >
  )
}
