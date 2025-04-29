'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store/AuthStore'
import { useBoardStore } from '@/lib/store/BoardStore'
import { CalendarIcon, ClockIcon } from '@/assets/Icon'
import Image from 'next/image'
import { useConfigStore } from '@/lib/store/ConfigStore'
import SprintList from '@/components/partials/SprintList'
import { useIssueStore } from '@/lib/store/IssueStore'
import { useSprintStore } from '@/lib/store/SprintStore'
import Modal from '@/components/layout/Modal'
import UpdateProjectForm from '@/components/partials/UpdateProjectForm'
import { ProjectProps } from '@/lib/types/types'
import { CustomSwitch } from '@/components/ui/CustomSwitch'
import DiagramaGantt from '@/components/ui/DiagramaGantt'

export default function TableroDetalle() {
  const { setProjectConfig, projectStatus, setConfig } = useConfigStore()
  const { getValidAccessToken, isAuthenticated, getListUsers } = useAuthStore()
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [sprintMode, setSprintMode] = useState<'Tablero' | 'Diagrama de Gantt'>('Tablero')
  const { selectedBoard, setBoard, updateBoard } = useBoardStore()
  const { getSprints } = useSprintStore()
  const { setIssues } = useIssueStore()
  const { id } = useParams()

  useEffect(() => {
    if (isAuthenticated) {
      (async () => {
        const token = await getValidAccessToken()
        if (token) {
          await setBoard(token, id as string)
          await setIssues(token, id as string)
          await setProjectConfig(id as string, token)
          await getSprints(token, id as string)
          await getListUsers(token)
        }
      })()
    }
  }, [isAuthenticated, setBoard, setProjectConfig, getValidAccessToken])

  useEffect(() => { if (isAuthenticated) setConfig() }, [isAuthenticated, setConfig])

  const getStatusName = (id: number) => {
    if (projectStatus) return projectStatus?.find(status => status.id === id)
  }

  const handleUpdate = async (formData: { name: string, description?: string, startDate?: string, endDate?: string, status: number }) => {
    const token = await getValidAccessToken()
    if (token) await updateBoard(token, formData, selectedBoard?.id as string)
    setIsUpdateModalOpen(false)
  }

  return (
    <main className='bg-gray-100 flex flex-col ml-64 min-h-screen gap-6 p-10'>
      <section className='flex justify-between items-center'>
        <h4 className='font-bold text-2xl'>Detalles del tablero</h4>
        <CustomSwitch value={sprintMode} onChange={(value) => setSprintMode(value)} />
      </section>

      <section className='bg-white rounded-md flex flex-col gap-2 p-6'>
        <div className='flex justify-between items-start gap-2'>
          <aside className='flex justify-start items-center gap-4'>
            <h5 className='font-semibold text-xl'>{selectedBoard?.name}</h5>
            {
              selectedBoard &&
              <div className='rounded-full text-xs border px-2 whitespace-nowrap'
                style={{
                  backgroundColor: `${getStatusName(Number(selectedBoard.status))?.color}0f`,
                  color: getStatusName(Number(selectedBoard.status))?.color,
                }}>
                {getStatusName(Number(selectedBoard.status))?.name}
              </div>
            }
          </aside>

          <button
            onClick={() => setIsUpdateModalOpen(true)}
            className="border-blue-600 text-blue-600 hover:bg-blue-700 hover:text-white duration-150 px-4 py-2 rounded-md border whitespace-nowrap"
          >
            Editar Proyecto
          </button>
        </div>
        <p className='text-black/50 text-sm mb-4'>{selectedBoard?.description}</p>

        <div className='grid grid-cols-2 text-sm gap-2 w-2/3'>
          <div className='flex justify-start items-center gap-2'>
            <span className='text-black/50'>
              <CalendarIcon size={20} />
            </span>
            <div className='flex flex-col'>
              <h6 className='text-black/50 text-xs'>Fecha de inicio</h6>
              <p>
                {
                  (() => {
                    const dateStr = selectedBoard?.startDate
                    if (!dateStr) return ''

                    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10))
                    const date = new Date(year, month - 1, day)

                    return date.toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })
                  })()
                }
              </p>
            </div>
          </div>

          <div className='flex justify-start items-center gap-2'>
            <span className='text-black/50'>
              <CalendarIcon size={20} />
            </span>
            <div className='flex flex-col'>
              <h6 className='text-black/50 text-xs'>Fecha de fin</h6>
              <p>
                {
                  (() => {
                    const dateStr = selectedBoard?.endDate
                    if (!dateStr) return ''

                    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10))
                    const date = new Date(year, month - 1, day)

                    return date.toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })
                  })()
                }
              </p>
            </div>
          </div>

          <div className='flex justify-start items-center gap-2'>
            <span className='text-black/50'>
              <ClockIcon size={20} />
            </span>
            <div className='flex flex-col'>
              <h6 className='text-black/50 text-xs'>Creado</h6>
              <p>
                {
                  (() => {
                    const dateStr = selectedBoard?.createdAt
                    if (!dateStr) return ''

                    let date
                    if (dateStr.includes('T')) {
                      date = new Date(dateStr)
                    } else {
                      const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10))
                      date = new Date(year, month - 1, day)
                    }

                    return date.toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })
                  })()
                }
              </p>
            </div>
          </div>

          <div className='flex justify-start items-center gap-2'>
            <span className='text-black/50'>
              <ClockIcon size={20} />
            </span>
            <div className='flex flex-col'>
              <h6 className='text-black/50 text-xs'>Actualizado</h6>
              <p>
                {
                  (() => {
                    const dateStr = selectedBoard?.updatedAt
                    if (!dateStr) return ''

                    let date
                    if (dateStr.includes('T')) {
                      date = new Date(dateStr)
                    } else {
                      const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10))
                      date = new Date(year, month - 1, day)
                    }

                    return date.toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })
                  })()
                }
              </p>
            </div>
          </div>
        </div>

        <hr className='border-black/5 my-4' />

        <div className='flex justify-start items-center gap-2'>
          <div className='bg-black/10 overflow-hidden aspect-square rounded-full w-12'>
            {
              selectedBoard && selectedBoard.createdBy &&
              <Image src={selectedBoard?.createdBy.picture}
                alt='createdBy'
                width={48}
                height={48}
              />
            }
          </div>
          <div className='flex flex-col justify-center items-start'>
            <span className='text-black/50 text-xs'>Creado por</span>
            <span className='font-medium'>
              {selectedBoard?.createdBy?.firstName} {selectedBoard?.createdBy?.lastName}
            </span>
          </div>
        </div>
      </section>

      {sprintMode === "Tablero" ? <SprintList /> : <DiagramaGantt />}

      {/* Modal para updatear el project */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Actualizar Proyecto"
      >
        <UpdateProjectForm
          onSubmit={handleUpdate}
          onCancel={() => setIsUpdateModalOpen(false)}
          projectObject={selectedBoard as ProjectProps}
        />
      </Modal>
    </main>
  )
} 