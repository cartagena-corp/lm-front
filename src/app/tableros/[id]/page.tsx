'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import KanbanBoard from '@/components/KanbanBoard'
import ScrumBoard from '@/components/ScrumBoard'
import Modal from '@/components/Modal'
import CreateTaskForm from '@/components/CreateTaskForm'
import CreateUserStoryForm from '@/components/CreateUserStoryForm'
import Scrum from '@/components/Scrum'
import Kanban from '@/components/Kanban'

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  assignee: string
  dueDate: string
}

export default function TableroDetalle() {
  const params = useParams()
  const boardId = params.id
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [boardType, setBoardType] = useState<'kanban' | 'scrum'>('kanban')

  const handleCreateItem = (data: any) => {
    // Aquí se implementaría la lógica para agregar la tarea o historia
    console.log('Nuevo item:', data)
    setIsCreateModalOpen(false)
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-10 bg-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Proyecto Alpha
            </h1>
            <p className="text-sm text-gray-500">
              Tablero del proyecto principal
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              value={boardType}
              onChange={(e) =>
                setBoardType(e.target.value as 'kanban' | 'scrum')
              }
            >
              <option value="kanban">Kanban</option>
              <option value="scrum">Scrum</option>
            </select>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {boardType === 'kanban' ? 'Nueva tarea' : 'Nueva historia'}
            </button>
          </div>
        </div>

        {/* {boardType === 'kanban' ? <KanbanBoard /> : <ScrumBoard />} */}
        {boardType === 'kanban' ? <Kanban /> : <Scrum />}

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={
            boardType === 'kanban' ? 'Crear nueva tarea' : 'Crear nueva historia'
          }
        >
          {boardType === 'kanban' ? (
            <CreateTaskForm
              onSubmit={handleCreateItem}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          ) : (
            <CreateUserStoryForm
              onSubmit={handleCreateItem}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          )}
        </Modal>
      </main>
    </div>
  )
} 