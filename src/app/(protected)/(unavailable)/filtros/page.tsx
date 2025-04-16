'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in-progress' | 'done'
  assignee: string
  dueDate: string
  project: string
}

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Diseñar interfaz',
    description: 'Crear mockups en Figma',
    priority: 'high',
    status: 'in-progress',
    assignee: 'Ana García',
    dueDate: '2024-02-25',
    project: 'Proyecto Alpha',
  },
  {
    id: '2',
    title: 'Implementar autenticación',
    description: 'Usar NextAuth.js',
    priority: 'medium',
    status: 'todo',
    assignee: 'Carlos López',
    dueDate: '2024-02-28',
    project: 'Desarrollo Web',
  },
  {
    id: '3',
    title: 'Configurar proyecto',
    description: 'Instalar dependencias',
    priority: 'low',
    status: 'done',
    assignee: 'María Rodríguez',
    dueDate: '2024-02-15',
    project: 'Marketing',
  },
]

export default function FiltrosPage() {
  const [tasks] = useState<Task[]>(initialTasks)
  const [filters, setFilters] = useState({
    priority: '',
    status: '',
    project: '',
  })

  const filteredTasks = tasks.filter((task) => {
    if (filters.priority && task.priority !== filters.priority) return false
    if (filters.status && task.status !== filters.status) return false
    if (filters.project && task.project !== filters.project) return false
    return true
  })

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'done':
        return 'bg-green-100 text-green-800'
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
    }
  }

  return (
    <main className="flex-1 p-10 bg-gray-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Filtros</h1>
          <p className="text-sm text-gray-500">
            Encuentra y organiza tus tareas
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            value={filters.priority}
            onChange={(e) =>
              setFilters({ ...filters, priority: e.target.value })
            }
          >
            <option value="">Todas las prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>

          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Todos los estados</option>
            <option value="todo">Por hacer</option>
            <option value="in-progress">En progreso</option>
            <option value="done">Completado</option>
          </select>

          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            value={filters.project}
            onChange={(e) =>
              setFilters({ ...filters, project: e.target.value })
            }
          >
            <option value="">Todos los proyectos</option>
            <option value="Proyecto Alpha">Proyecto Alpha</option>
            <option value="Desarrollo Web">Desarrollo Web</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {task.description}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority === 'high'
                    ? 'Alta'
                    : task.priority === 'medium'
                      ? 'Media'
                      : 'Baja'}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    task.status
                  )}`}
                >
                  {task.status === 'todo'
                    ? 'Por hacer'
                    : task.status === 'in-progress'
                      ? 'En progreso'
                      : 'Completado'}
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>Asignado a: {task.assignee}</span>
                <span>Fecha límite: {task.dueDate}</span>
              </div>
              <span>Proyecto: {task.project}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
} 