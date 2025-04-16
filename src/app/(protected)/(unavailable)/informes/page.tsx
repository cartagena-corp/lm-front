'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'

interface Report {
  id: string
  title: string
  type: 'progress' | 'performance' | 'timeline'
  date: string
  status: 'completed' | 'in-progress' | 'pending'
}

const initialReports: Report[] = [
  {
    id: '1',
    title: 'Progreso del Sprint 1',
    type: 'progress',
    date: '2024-02-15',
    status: 'completed',
  },
  {
    id: '2',
    title: 'Rendimiento del Equipo',
    type: 'performance',
    date: '2024-02-18',
    status: 'in-progress',
  },
  {
    id: '3',
    title: 'Línea de Tiempo del Proyecto',
    type: 'timeline',
    date: '2024-02-20',
    status: 'pending',
  },
]

export default function InformesPage() {
  const [reports] = useState<Report[]>(initialReports)

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'progress':
        return '📊'
      case 'performance':
        return '📈'
      case 'timeline':
        return '⏱️'
    }
  }

  return (
    <main className="flex-1 p-10 bg-gray-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Informes</h1>
          <p className="text-sm text-gray-500">
            Visualiza y genera informes del proyecto
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Nuevo informe
        </button>
      </div>

      <div className="grid gap-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{getTypeIcon(report.type)}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Fecha: {report.date}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  report.status
                )}`}
              >
                {report.status === 'completed'
                  ? 'Completado'
                  : report.status === 'in-progress'
                    ? 'En progreso'
                    : 'Pendiente'}
              </span>
            </div>
            <div className="mt-4 flex space-x-3">
              <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700">
                Ver detalles
              </button>
              <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700">
                Descargar PDF
              </button>
              <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700">
                Compartir
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
} 