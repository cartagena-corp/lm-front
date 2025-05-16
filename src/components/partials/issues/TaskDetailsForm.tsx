'use client'

import { CommentProps, TaskProps } from '@/lib/types/types'
import { FormEvent, useEffect } from 'react'
import { useConfigStore } from '@/lib/store/ConfigStore'
import ShowComments from '../comments/ShowComments'
import { useCommentStore } from '@/lib/store/CommentStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { CalendarIcon, ClockIcon, UsersIcon } from '@/assets/Icon'

interface TaskDetailsFormProps {
   onSubmit: () => void
   onCancel: () => void
   task: TaskProps
}

export default function TaskDetailsForm({ onSubmit, onCancel, task }: TaskDetailsFormProps) {
   const { comments, getComments } = useCommentStore()
   const { getValidAccessToken } = useAuthStore()

   const handleSubmit = (e: FormEvent) => {
      e.preventDefault()
      onSubmit()
   }

   useEffect(() => {
      const getCommentsByIssueId = async () => {
         const token = await getValidAccessToken()
         if (token) {
            await getComments(token, task?.id as string)
         }
      }

      getCommentsByIssueId()
   }, [])

   return (
      <form onSubmit={handleSubmit}>
         <article className='flex justify-between items-stretch gap-5 mt-4'>
            <aside className='flex flex-col justify-between w-[75%] space-y-4'>
               <article className='space-y-1'>
                  <h6 className='font-semibold'>Descripción</h6>
                  <div className='border-black/15 text-black/75 flex flex-col rounded-md text-sm border h-60 p-4 overflow-y-auto gap-4'>

                     {
                        task.descriptions.map(t =>
                           <div key={t.id} className='flex flex-col'>
                              <h6 className='font-bold text-base'>{t.title}</h6>
                              <p className='text-xs'>{t.text}</p>
                           </div>
                        )
                     }
                  </div>
               </article>

               <ShowComments arrayComments={comments} task={task} />
            </aside>

            <aside className='border-black/15 rounded-md flex flex-col space-y-5 w-[45%] border p-4'>
               <section className='flex flex-col text-sm gap-4'>
                  <div className='flex items-center gap-2'>
                     <UsersIcon size={18} />
                     <h6 className='font-semibold'>Personas</h6>
                  </div>
                  <div className='text-xs flex flex-col gap-2'>
                     <span className='flex items-center justify-between'>
                        <p className='text-black/50'>Asignado a:</p>
                        <p>
                           {
                              typeof task.assignedId === 'object'
                                 ? `${task.assignedId.firstName} ${task.assignedId.lastName}`
                                 : task.assignedId
                           }
                        </p>
                     </span>
                     <span className='flex items-center justify-between'>
                        <p className='text-black/50'>Informador:</p>
                        <p>
                           {task.reporterId?.firstName}  {task.reporterId?.lastName}
                        </p>
                     </span>
                  </div>
               </section>
               <section className='flex flex-col text-sm gap-4'>
                  <div className='flex items-center gap-2'>
                     <CalendarIcon size={18} />
                     <h6 className='font-semibold'>Fechas</h6>
                  </div>
                  <div className='text-xs flex flex-col gap-2'>
                     <span className='flex items-center justify-between'>
                        <p className='text-black/50'>Creación:</p>
                        <p>
                           {
                              (() => {
                                 const dateStr = task.createdAt
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
                     </span>
                     <span className='flex items-center justify-between'>
                        <p className='text-black/50'>Actualización:</p>
                        <p>
                           {
                              (() => {
                                 const dateStr = task.updatedAt
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
                     </span>
                  </div>
               </section>
               <section className='flex flex-col text-sm gap-4'>
                  <div className='flex items-center gap-2'>
                     <ClockIcon size={18} />
                     <h6 className='font-semibold'>Tiempo</h6>
                  </div>
                  <div className='text-xs flex flex-col gap-2'>
                     <span className='flex items-center justify-between'>
                        <p className='text-black/50'>Estimado:</p>
                        <p>{task.estimatedTime} horas</p>
                     </span>
                  </div>
               </section>
            </aside>
         </article>
      </form>
   )
}
