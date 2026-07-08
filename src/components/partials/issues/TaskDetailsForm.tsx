'use client'

import { TaskProps } from '@/lib/types/types'
import { useEffect, useState } from 'react'
import ShowComments from '../comments/ShowComments'
import { useCommentStore } from '@/lib/store/CommentStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { ChevronRight, Pencil, ExternalLink, X } from 'lucide-react'
import Link from 'next/link'
import { useModalStore } from '@/lib/hooks/ModalStore'
import CreateTaskForm from './CreateTaskForm'
import { useIssueStore } from '@/lib/store/IssueStore'
import TaskDescriptionSection from './TaskDescriptionSection'
import TaskSubtasksSection from './TaskSubtasksSection'
import TaskDetailsSidebar from './TaskDetailsSidebar'

interface TaskDetailsFormProps {
   onSubmit: () => void
   onCancel: () => void
   task: TaskProps
}

export default function TaskDetailsForm({ onSubmit, onCancel, task }: TaskDetailsFormProps) {
   const { comments, getComments } = useCommentStore()
   const { getValidAccessToken } = useAuthStore()
   const { updateIssue, getSpecificIssue, selectedIssue } = useIssueStore()
   const { openModal, closeModal } = useModalStore()
   const [isSidebarVisible, setIsSidebarVisible] = useState(true)

   // Usar selectedIssue del store si está disponible, sino usar la prop task
   const currentTask = (selectedIssue?.id === task.id ? selectedIssue : task)

   useEffect(() => {
      const getCommentsByIssueId = async () => {
         const token = await getValidAccessToken()
         if (token) {
            await getComments(token, currentTask?.id as string)
         }
      }

      getCommentsByIssueId()
   }, [currentTask?.id])

   const handleUpdate = async (formData: {
      descriptions: { id?: string, title: string, text: string }[],
      estimatedTime: number,
      priority: number,
      status: number,
      title: string,
      type: number
   }, filesMap?: Map<string, File[]>) => {
      const token = await getValidAccessToken()
      if (token && currentTask?.id) {
         await updateIssue(token, formData, filesMap)
         await getSpecificIssue(token, currentTask.id as string)
      }
      closeModal()
   }

   const handleUpdateBoardModal = () => {
      openModal({
         size: "lg",
         title: "Editar Tarea",
         desc: "Modifica los detalles de la tarea",
         Icon: <Pencil size={20} strokeWidth={1.75} />,
         children: <CreateTaskForm onSubmit={handleUpdate} onCancel={() => closeModal()} taskObject={currentTask || undefined} isEdit={true} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "UPDATE"
      })
   }

   if (!currentTask) {
      return null
   }

   return (
      <div className="rounded-xl flex flex-col overflow-hidden h-full" style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
         {/* Header */}
         <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid var(--ds-border)" }}>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Link
                     href={`/tableros/${currentTask.projectId}/${currentTask.id}`}
                     className="flex gap-2 pr-4 items-center text-lg font-semibold transition-colors min-w-0 flex-1 text-[var(--ds-text)] hover:text-[var(--blue-700)]"
                     onClick={() => onCancel()}
                     target="_blank"
                  >
                     <span className="truncate">{currentTask.title}</span>
                     <span className="flex-shrink-0"><ExternalLink size={18} strokeWidth={2} /></span>
                  </Link>
               </div>
               <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                     onClick={() => handleUpdateBoardModal()}
                     className="flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200 hover:bg-[var(--gray-alpha-100)]"
                     style={{ color: "var(--ds-text-secondary)" }}
                     title="Editar tarea"
                  >
                     <Pencil size={20} strokeWidth={1.5} />
                  </button>
                  <button
                     type="button"
                     onClick={onCancel}
                     className="flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200 hover:bg-[var(--gray-alpha-100)]"
                     style={{ color: "var(--ds-text-muted)" }}
                  >
                     <X size={20} strokeWidth={1.5} />
                  </button>
               </div>
            </div>
         </div>

         {/* Contenido principal */}
         <div className="flex-1 overflow-hidden min-h-0">
            <div className="flex flex-col lg:flex-row items-stretch h-full gap-4 px-6">
               {/* Contenido principal - con scroll independiente */}
               <div className={`flex-1 overflow-y-auto py-4 ${!isSidebarVisible ? 'pr-0' : 'pr-2'}`}>
                  <div className="flex flex-col min-h-full">
                     <div className="flex-1">
                        <TaskDescriptionSection task={currentTask} />
                     </div>
                     <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--ds-border)" }}>
                        <TaskSubtasksSection task={currentTask} />
                     </div>
                     <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--ds-border)" }}>
                        <ShowComments arrayComments={comments} task={currentTask} />
                     </div>
                  </div>
               </div>

               {/* Divider Line with Toggle Button - solo aplica en el layout de dos columnas (lg+) */}
               <div
                  className="hidden lg:flex relative items-start justify-center group cursor-pointer flex-shrink-0 py-4"
                  onClick={() => setIsSidebarVisible(!isSidebarVisible)}
               >
                  <div className="w-px h-full absolute top-0 bg-[var(--ds-border)]" />
                  <div className="sticky top-8 flex items-center justify-center w-6 h-8 rounded-md border transition-all duration-200 bg-[var(--ds-card)] border-[var(--ds-border)] shadow-[var(--shadow-border)] group-hover:bg-[var(--gray-alpha-100)] group-hover:border-[var(--ds-border-strong)]">
                     <div className={`transition-all duration-300 text-[var(--ds-text-muted)] group-hover:text-[var(--ds-text-secondary)] ${isSidebarVisible ? 'transform' : 'transform rotate-180'}`}>
                        <ChevronRight
                           size={14}
                           strokeWidth={2}
                        />
                     </div>
                  </div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs px-2 py-1 rounded-md shadow-[var(--shadow-lg)] whitespace-nowrap pointer-events-none bg-[var(--gray-1000)] text-[var(--ds-contrast-inverse)]">
                     {isSidebarVisible ? 'Ocultar panel' : 'Mostrar panel'}
                  </div>
               </div>

               {/* Sidebar - con scroll independiente. El colapso solo aplica en el layout de dos columnas (lg+); en mobile siempre se muestra apilado debajo */}
               <div className={`w-full flex-shrink-0 transition-all duration-300 ease-in-out lg:overflow-hidden ${isSidebarVisible ? 'lg:w-80 lg:opacity-100' : 'lg:w-0 lg:opacity-0'}`}>
                  <div className={`lg:h-full overflow-y-auto py-4 ${isSidebarVisible ? 'lg:pl-2' : 'lg:pl-0'}`}>
                     <TaskDetailsSidebar task={currentTask} />
                  </div>
               </div>
            </div>
         </div>
      </div>
   )

}
