'use client'

import Sidebar from '@/components/layout/Sidebar'
import Calendar from '@/components/ui/Calendar'

export default function CalendarioPage() {
  return (
    <main className="flex-1 p-10 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
          <p className="text-sm text-gray-500">
            Gestiona los eventos y reuniones del equipo
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Filtrar eventos
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Nuevo evento
          </button>
        </div>
      </div>
      <Calendar />
    </main>
  )
}

// CAMBIAR EL NOMBRE DEL ARCHIVO "calendario.tsx" A "page.tsx" CUANDO SE DESEE ACTIVAR