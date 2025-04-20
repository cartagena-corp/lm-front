'use client'

import { useState } from 'react'

interface CreateUserStoryFormProps {
  onSubmit: (data: {
    title: string
    description: string
    points: number
    priority: 'low' | 'medium' | 'high'
    assigned: string
  }) => void
  onCancel: () => void
}

export default function CreateUserStoryForm({
  onSubmit,
  onCancel,
}: CreateUserStoryFormProps) {
    const [formData, setFormData] = useState<{
        title: string
        description: string
        points: number
        priority: 'low' | 'medium' | 'high'
        assigned: string
      }>({
        title: '',
        description: '',
        points: 1,
        priority: 'medium', // Se elimina `as const`
        assigned: '',
      })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Título
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div>
        <label
          htmlFor="points"
          className="block text-sm font-medium text-gray-700"
        >
          Puntos
        </label>
        <input
          type="number"
          id="points"
          name="points"
          min="1"
          max="13"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={formData.points}
          onChange={(e) =>
            setFormData({ ...formData, points: parseInt(e.target.value) })
          }
        />
      </div>

      <div>
        <label
          htmlFor="priority"
          className="block text-sm font-medium text-gray-700"
        >
          Prioridad
        </label>
        <select
          id="priority"
          name="priority"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={formData.priority}
          onChange={(e) =>
            setFormData({
              ...formData,
              priority: e.target.value as 'low' | 'medium' | 'high',
            })
          }
        >
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="assigned"
          className="block text-sm font-medium text-gray-700"
        >
          Asignar a
        </label>
        <input
          type="text"
          id="assigned"
          name="assigned"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={formData.assigned}
          onChange={(e) =>
            setFormData({ ...formData, assigned: e.target.value })
          }
        />
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
        >
          Crear historia
        </button>
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
} 