'use client';

import { useState } from 'react';

interface CreateBoardFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    type: 'kanban' | 'scrum';
  }) => void;
  onCancel: () => void;
}

export default function CreateBoardForm({
  onSubmit,
  onCancel,
}: CreateBoardFormProps) {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: 'kanban' | 'scrum';
  }>({
    title: '',
    description: '',
    type: 'kanban', // Aquí ya está correctamente tipado
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Título
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Tipo de tablero
        </label>
        <select
          id="type"
          name="type"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={formData.type}
          onChange={(e) =>
            setFormData({ ...formData, type: e.target.value as 'kanban' | 'scrum' })
          }
        >
          <option value="kanban">Kanban</option>
          <option value="scrum">Scrum</option>
        </select>
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
        >
          Crear tablero
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
  );
}
