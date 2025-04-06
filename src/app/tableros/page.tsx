'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import CreateBoardForm from '@/components/CreateBoardForm';

interface Board {
  id: string;
  title: string;
  description: string;
  type: 'kanban' | 'scrum';
}

export default function TablerosPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-10 bg-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tableros</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Crear tablero
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
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
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    board.type === 'kanban'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {board.type.toUpperCase()}
                </span>
              </div>
            </Link>
          ))}
        </div>

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
      </main>
    </div>
  );
} 