'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import CreateBoardForm from '@/components/CreateBoardForm';
import { CustomSwitch } from '@/components/CustomSwitch';
import FilterForm from '@/components/FilterForm';

interface Board {
  id: string;
  title: string;
  description: string;
  type: 'kanban' | 'scrum';
}

export default function TablerosPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [boards, setBoards] = useState<Board[]>([
    {
      id: '1',
      title: 'Proyecto Alpha',
      description: 'Tablero del proyecto principal',
      type: 'kanban',
    },
    {
      id: '2',
      title: 'Desarrollo Web',
      description: 'Frontend y Backend',
      type: 'scrum',
    },
    {
      id: '3',
      title: 'Marketing',
      description: 'Calendario de campaña',
      type: 'kanban',
    },
  ]);

  const handleCreateBoard = (data: {
    title: string;
    description: string;
    type: 'kanban' | 'scrum';
  }) => {
    const newBoard: Board = {
      id: String(Date.now()),
      ...data,
    };
    setBoards([...boards, newBoard]);
    setIsCreateModalOpen(false);
  };

  const handleFilter = (data: { keyword: string, state: string, sort: string, isAsc: boolean }) => {
    console.log("handleFilter", data)
    setIsFilterModalOpen(false)
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="bg-gray-100 w-full flex flex-col p-10">
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
                  {board.title}
                </h3>
                <p className="text-gray-600 mt-1">{board.description}</p>
                <div className="mt-4 flex items-center">
                  <span className={`px-2 py-1 text-xs rounded ${board.type === 'kanban'
                    ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {board.type.toUpperCase()}
                  </span>
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
          <FilterForm
            onSubmit={handleFilter}
            onCancel={() => setIsFilterModalOpen(false)}
          />
        </Modal>
      </main>
    </div>
  );
} 