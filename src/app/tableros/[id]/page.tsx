'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Modal from '@/components/Modal'
import CreateTaskForm from '@/components/CreateTaskForm'
import CreateUserStoryForm from '@/components/CreateUserStoryForm'
import Scrum from '@/components/Scrum'
import Kanban from '@/components/Kanban'
import { CustomSwitch } from '@/components/CustomSwitch'

export default function TableroDetalle() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [boardType, setBoardType] = useState<'kanban' | 'scrum'>('kanban')

  const [viewType, setViewType] = useState<"Tablero" | "Diagrama de Gantt">("Tablero")

  const handleCreateItem = (data: any) => {
    // Aquí se implementaría la lógica para agregar la tarea o historia
    console.log('Nuevo item:', data)
    setIsCreateModalOpen(false)
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="bg-gray-100 flex flex-col w-full p-10">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
            >
              {boardType === 'kanban' ? 'Nueva tarea' : 'Nueva historia'}
            </button>
          </div>
        </div>

        {/* const [viewType, setViewType] = useState<"Tablero" | "Diagrama de Gantt">("Tablero") */}
        <CustomSwitch value={viewType} onChange={setViewType} />

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