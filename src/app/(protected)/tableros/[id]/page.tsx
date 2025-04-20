'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store/AuthStore'
import { useBoardStore } from '@/lib/store/BoardStore'
import { CalendarIcon, ClockIcon } from '@/assets/Icon'
import Image from 'next/image'
import { useConfigStore } from '@/lib/store/ConfigStore'
import SprintList from '@/components/partials/SprintList'
import { useIssueStore } from '@/lib/store/IssueStore'
import { useSprintStore } from '@/lib/store/SprintStore'

export default function TableroDetalle() {
  const { setProjectConfig, projectConfig, projectStatus, setConfig } = useConfigStore()
  const { getValidAccessToken, isAuthenticated, getListUsers } = useAuthStore()
  const { selectedBoard, setBoard } = useBoardStore()
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

  const formatDate = (fecha: string | null, includeTime: boolean = false): string => {
    if (!fecha) return "No definida";

    const dateObj = new Date(fecha);
    if (isNaN(dateObj.getTime())) return "Fecha inválida";

    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = dateObj
      .toLocaleString('es-ES', { month: 'short' })
      .replace('.', '')
      .toLowerCase();
    const year = dateObj.getFullYear();

    let formatted = `${day} ${month} ${year}`;

    if (includeTime) {
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
      formatted += ` ${hours}:${minutes}`;
    }

    return formatted;
  };

  const getStatusName = (id: number) => {
    if (projectStatus) return projectStatus?.find(status => status.id === id)
  }

  return (

    <main className='bg-gray-100 flex flex-col ml-64 min-h-screen gap-6 p-10'>
      <h4 className='font-bold text-2xl'>Detalles del tablero</h4>

      <section className='bg-white rounded-md flex flex-col gap-2 p-6'>
        <div className='flex justify-start items-center gap-4'>
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
        </div>
        <p className='text-black/50 text-sm mb-4'>{selectedBoard?.description}</p>

        <div className='grid grid-cols-2 text-sm gap-2 w-2/3'>
          <div className='flex justify-start items-center gap-2'>
            <span className='text-black/50'>
              <CalendarIcon size={20} />
            </span>
            <div className='flex flex-col'>
              <h6 className='text-black/50 text-xs'>Fecha de inicio</h6>
              <p>{selectedBoard ? formatDate(selectedBoard.startDate, false) : formatDate(null)}</p>
            </div>
          </div>

          <div className='flex justify-start items-center gap-2'>
            <span className='text-black/50'>
              <CalendarIcon size={20} />
            </span>
            <div className='flex flex-col'>
              <h6 className='text-black/50 text-xs'>Fecha de fin</h6>
              <p>{selectedBoard ? formatDate(selectedBoard.endDate, false) : formatDate(null)}</p>
            </div>
          </div>

          <div className='flex justify-start items-center gap-2'>
            <span className='text-black/50'>
              <ClockIcon size={20} />
            </span>
            <div className='flex flex-col'>
              <h6 className='text-black/50 text-xs'>Creado</h6>
              <p>{selectedBoard ? formatDate(selectedBoard.createdAt, true) : formatDate(null)}</p>
            </div>
          </div>

          <div className='flex justify-start items-center gap-2'>
            <span className='text-black/50'>
              <ClockIcon size={20} />
            </span>
            <div className='flex flex-col'>
              <h6 className='text-black/50 text-xs'>Actualizado</h6>
              <p>{selectedBoard ? formatDate(selectedBoard.updatedAt, true) : formatDate(null)}</p>
            </div>
          </div>
        </div>

        <hr className='border-black/5 my-4' />

        <div className='flex justify-start items-center gap-2'>
          <div className='bg-black/10 overflow-hidden aspect-square rounded-full w-12'>
            {
              selectedBoard &&
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
              {selectedBoard?.createdBy.firstName} {selectedBoard?.createdBy.lastName}
            </span>
          </div>
        </div>
      </section>

      <SprintList />
    </main >
  )
} 