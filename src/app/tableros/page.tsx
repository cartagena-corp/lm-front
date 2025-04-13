'use client'

import { useState } from 'react'
import Link from 'next/link'
import Modal from '@/components/Modal'
import CreateBoardForm from '@/components/CreateBoardForm'
import FilterProjectForm from '@/components/FilterProjectForm'
import { ProjectProps } from '@/lib/types/types'

export default function TablerosPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [boards, setBoards] = useState<ProjectProps[]>([
    {
      id: "proyecto-1",
      name: "La Muralla Frontend",
      description: "Listado de actividades del Frontend del proyecto La Muralla.",
      startDate: "01/01/2025",
      endDate: "31/12/2025",
      status: "Activo",
      createdAt: "01/01/2025",
      updatedAt: "13/04/2025",
      createdBy: "KennMarcucciUUID",
    },
  ])

  const handleCreateBoard = (newBoard: ProjectProps) => {
    setBoards([...boards, newBoard])
    setIsCreateModalOpen(false)
  }

  const handleFilter = (data: { keyword: string, state: string, sort: string, isAsc: boolean }) => {
    console.log("handleFilter", data)
    setIsFilterModalOpen(false)
  }

  return (
    <main className="bg-gray-100 flex flex-col p-10 ml-64 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableros</h1>
        <div className='flex gap-2'>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {
          boards.map(board =>
            <Link
              key={board.id}
              href={`/tableros/${board.id}`}
              className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {board.name}
              </h3>
              <p className="text-gray-600 mt-1">{board.description}</p>
              <div className="mt-4 flex items-center">
                {/* <span className={`px-2 py-1 text-xs rounded ${board.type === 'kanban'
                  ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {board.type.toUpperCase()}
                </span> */}
              </div>
            </Link>
          )
        }
      </div>

      {/* Modal para Tableros */}
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

      {/* Modal para Filtros */}
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
    </main>
  )
} 