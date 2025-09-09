'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store/AuthStore'
import { useBoardStore } from '@/lib/store/BoardStore'
import { CalendarIcon, ClockIcon, EditIcon, BoardIcon, UsersIcon, ConfigIcon } from '@/assets/Icon'
import Image from 'next/image'
import { useConfigStore } from '@/lib/store/ConfigStore'
import SprintBoard from '@/components/partials/sprints/SprintBoard'
import { useIssueStore } from '@/lib/store/IssueStore'
import { useSprintStore } from '@/lib/store/SprintStore'
import Modal from '@/components/layout/Modal'
import UpdateProjectForm from '@/components/partials/boards/UpdateProjectForm'
import ProjectConfigModal from '@/components/partials/config/projects/ProjectConfigModal'
import { ProjectProps } from '@/lib/types/types'
import { CustomSwitch } from '@/components/ui/CustomSwitch'
import DiagramaGantt from '@/components/ui/DiagramaGantt'
import SprintList from '@/components/partials/sprints/SprintList'

const view = [
  {
    id: 1,
    name: "Lista",
    view: SprintList
  },
  {
    id: 2,
    name: "Tablero",
    view: SprintBoard
  },
  {
    id: 3,
    name: "Diagrama de Gantt",
    view: DiagramaGantt
  },
]

export default function TableroDetalle() {
  const { setProjectConfig, projectStatus, setConfig } = useConfigStore()
  const { getValidAccessToken, isAuthenticated, getListUsers } = useAuthStore()
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [sprintMode, setSprintMode] = useState(view[0])
  const { selectedBoard, getBoard, updateBoard, isLoading, error } = useBoardStore()
  const { getSprints } = useSprintStore()
  const { getIssues } = useIssueStore()
  const { id } = useParams()

  useEffect(() => {
    if (isAuthenticated) {
      (async () => {
        const token = await getValidAccessToken()
        if (token) {
          await getBoard(token, id as string)
          // Get backlog issues (issues without sprint assigned)
          await getIssues(token, id as string, { sprintId: '' })
          await setProjectConfig(id as string, token)
          await getSprints(token, id as string)
          await getListUsers(token)
        }
      })()
    }
  }, [isAuthenticated, getBoard, setProjectConfig, getValidAccessToken, getIssues, getSprints, getListUsers, id])

  useEffect(() => {
    if (isAuthenticated) {
      (async () => {
        const token = await getValidAccessToken()
        if (token) {
          await setConfig(token)
        }
      })()
    }
  }, [isAuthenticated, setConfig, getValidAccessToken])

  const getStatus = (id: number) => {
    if (projectStatus) return projectStatus?.find(status => status.id === id)
  }

  const handleUpdate = async (formData: ProjectProps, jiraImport: File | null) => {
    const token = await getValidAccessToken()
    if (token) {
      // Convertir ProjectProps a formato esperado por updateBoard
      const updateData = {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: typeof formData.status === 'object' ? formData.status.id : formData.status
      }
      await updateBoard(token, updateData, selectedBoard?.id as string)
    }
    setIsUpdateModalOpen(false)
  }

  const getStatusName = (statusId: number) => {
    const statusObj = projectStatus?.find(status => status.id === statusId)
    return statusObj?.name || "Estado desconocido"
  }

  const getStatusColor = (statusId: number) => {
    const statusObj = projectStatus?.find(status => status.id === statusId)
    return statusObj?.color || "#6B7280"
  }

  return (
    <>
      <div className=" mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <BoardIcon size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Detalles del Tablero</h1>
                <p className="text-gray-600 mt-1">Gestiona tu proyecto y sus sprints</p>
              </div>
            </div>
            <CustomSwitch value={sprintMode} onChange={(value) => setSprintMode(value)} />
          </div>
        </div>

        {/* Project Details - Solo mostrar si NO está en vista Tablero */}
        {sprintMode.name !== "Tablero" && (
          <>
            {isLoading && !selectedBoard ? (
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse'>
                <div className='flex justify-between items-start gap-4 mb-6'>
                  <div className='flex items-center gap-4 flex-1'>
                    <div className='h-8 bg-gray-300 rounded w-64'></div>
                    <div className='h-6 bg-gray-300 rounded w-24'></div>
                  </div>
                  <div className='h-10 bg-gray-300 rounded w-32'></div>
                </div>
                <div className='h-4 bg-gray-300 rounded w-full mb-6'></div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className='space-y-2'>
                      <div className='h-4 bg-gray-300 rounded w-20'></div>
                      <div className='h-6 bg-gray-300 rounded w-32'></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Project Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className='flex justify-between items-start gap-4'>
                    <div className='flex flex-col'>
                      <h2 className='text-2xl font-bold text-gray-900 mb-2'>{selectedBoard?.name}</h2>
                      {selectedBoard && (
                        <div className="rounded-full text-xs font-medium px-3 py-1 whitespace-nowrap flex-shrink-0 w-fit"
                          style={{
                            backgroundColor: `${getStatusColor(Number(selectedBoard.status))}20`,
                            color: getStatusColor(Number(selectedBoard.status)),
                            border: `1px solid ${getStatusColor(Number(selectedBoard.status))}40`
                          }}
                        >
                          {getStatusName(Number(selectedBoard.status)).charAt(0).toUpperCase() + getStatusName(Number(selectedBoard.status)).slice(1).toLowerCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsConfigModalOpen(true)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ConfigIcon size={16} />
                        <span className="hidden sm:inline">Configuración</span>
                        <span className="sm:hidden">Config</span>
                      </button>

                      <button
                        onClick={() => setIsUpdateModalOpen(true)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <EditIcon size={16} />
                        <span className="hidden sm:inline">{isLoading ? 'Cargando...' : 'Editar Proyecto'}</span>
                        <span className="sm:hidden">Editar</span>
                      </button>
                    </div>
                  </div>

                  {selectedBoard?.description && (
                    <p className='text-gray-600 mt-4 leading-relaxed'>{selectedBoard.description}</p>
                  )}
                </div>

                {/* Project Metadata */}
                <div className="p-6">
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                    {/* Start Date */}
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-blue-50 text-blue-600 rounded-lg'>
                        <CalendarIcon size={20} />
                      </div>
                      <div>
                        <h6 className='text-sm font-bold text-gray-900'>Fecha de inicio</h6>
                        <p className='text-sm text-gray-600'>
                          {selectedBoard?.startDate ? (() => {
                            const [year, month, day] = selectedBoard.startDate.split('-').map(num => parseInt(num, 10))
                            const date = new Date(year, month - 1, day)
                            return date.toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          })() : 'No definida'}
                        </p>
                      </div>
                    </div>

                    {/* End Date */}
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-green-50 text-green-600 rounded-lg'>
                        <CalendarIcon size={20} />
                      </div>
                      <div>
                        <h6 className='text-sm font-bold text-gray-900'>Fecha de fin</h6>
                        <p className='text-sm text-gray-600'>
                          {selectedBoard?.endDate ? (() => {
                            const [year, month, day] = selectedBoard.endDate.split('-').map(num => parseInt(num, 10))
                            const date = new Date(year, month - 1, day)
                            return date.toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          })() : 'No definida'}
                        </p>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-purple-50 text-purple-600 rounded-lg'>
                        <ClockIcon size={20} />
                      </div>
                      <div>
                        <h6 className='text-sm font-bold text-gray-900'>Creado</h6>
                        <p className='text-sm text-gray-600'>
                          {selectedBoard?.createdAt ? (() => {
                            let date
                            if (selectedBoard.createdAt.includes('T')) {
                              date = new Date(selectedBoard.createdAt)
                            } else {
                              const [year, month, day] = selectedBoard.createdAt.split('-').map(num => parseInt(num, 10))
                              date = new Date(year, month - 1, day)
                            }
                            return date.toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          })() : 'No disponible'}
                        </p>
                      </div>
                    </div>

                    {/* Updated Date */}
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-orange-50 text-orange-600 rounded-lg'>
                        <ClockIcon size={20} />
                      </div>
                      <div>
                        <h6 className='text-sm font-bold text-gray-900'>Actualizado</h6>
                        <p className='text-sm text-gray-600'>
                          {selectedBoard?.updatedAt ? (() => {
                            let date
                            if (selectedBoard.updatedAt.includes('T')) {
                              date = new Date(selectedBoard.updatedAt)
                            } else {
                              const [year, month, day] = selectedBoard.updatedAt.split('-').map(num => parseInt(num, 10))
                              date = new Date(year, month - 1, day)
                            }
                            return date.toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          })() : 'No disponible'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Created By Section */}
                  {selectedBoard?.createdBy && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className='flex items-center gap-4'>
                        <div className='p-2 bg-indigo-50 text-indigo-600 rounded-lg'>
                          <UsersIcon size={20} />
                        </div>
                        <div>
                          <h6 className='text-sm font-bold text-gray-900'>Creado por</h6>
                          <div className='flex items-center gap-2'>
                            <div className='w-8 h-8 bg-gray-100 rounded-full overflow-hidden'>
                              <Image
                                src={selectedBoard.createdBy.picture}
                                alt={`${selectedBoard.createdBy.firstName} ${selectedBoard.createdBy.lastName}`}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className='text-sm text-gray-600'>
                              {selectedBoard.createdBy.firstName} {selectedBoard.createdBy.lastName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Sprint Content */}
        <sprintMode.view />
      </div>

      {/* Modal para updatear el project */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title=""
        showCloseButton={false}
        customWidth='max-w-xl'
      >
        <UpdateProjectForm
          onSubmit={handleUpdate}
          onCancel={() => setIsUpdateModalOpen(false)}
          projectObject={selectedBoard as ProjectProps}
        />
      </Modal>

      {/* Modal para configuración del proyecto */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title=""
        customWidth="max-w-6xl"
        showCloseButton={false}
      >
        <ProjectConfigModal
          onClose={() => setIsConfigModalOpen(false)}
          projectId={id as string}
        />
      </Modal>
    </>
  )
} 