'use client';

import Sidebar from '@/components/Sidebar';
import Calendar from '@/components/Calendar';

export default function CalendarioPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <div className="p-6">
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
        </div>
        <Calendar />
      </main>
    </div>
  );
} 