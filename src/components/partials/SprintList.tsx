import { CalendarIcon, MenuIcon, PlusIcon } from "@/assets/Icon"

import { useBoardStore } from "@/lib/store/BoardStore"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { useIssueStore } from "@/lib/store/IssueStore"
import Image from "next/image"
import { useState } from "react"
import Modal from "../layout/Modal"
import CreateTaskForm from "./CreateTaskForm"
import { SprintProps, TaskProps } from "@/lib/types/types"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useSprintStore } from "@/lib/store/SprintStore"
import CreateSprintForm from "./CreateSprintForm"

export default function SprintList() {
   const { getValidAccessToken } = useAuthStore()
   const { issues, createTask } = useIssueStore()
   const { projectConfig } = useConfigStore()
   const { selectedBoard } = useBoardStore()
   const { sprints, createSprint } = useSprintStore()


   const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
   const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false)

   const handleCreateTask = async (newTask: TaskProps) => {
      const token = await getValidAccessToken()
      if (token) await createTask(token, newTask)
      setIsCreateTaskOpen(false)
   }

   const handleCreateSprint = async (newSprint: SprintProps) => {
      const token = await getValidAccessToken()
      if (token) await createSprint(token, { ...newSprint, projectId: selectedBoard?.id as string, status: newSprint.status })
      setIsCreateSprintOpen(false)
   }

   const getStatusStyle = (id: number) => {
      if (projectConfig) return projectConfig.issueStatuses?.find(status => status.id === id)
   }

   const getPriorityStyle = (id: number) => {
      if (projectConfig) return projectConfig.issuePriorities?.find(priority => priority.id === id)
   }
   const getTypeStyle = (id: number) => {
      if (projectConfig) return projectConfig.issueTypes?.find(type => type.id === id)
   }

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
   }

   return (
      <>
         <section className='bg-white rounded-md flex flex-col gap-4 p-6'>
            <div className="flex justify-between items-center gap-2">
               <h5 className='font-medium text-xl'>Backlog</h5>

               <button onClick={() => setIsCreateTaskOpen(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700 flex justify-center items-center gap-2 rounded-md duration-150 whitespace-nowrap text-sm px-4 py-2">
                  <PlusIcon size={16} stroke={2.5} />
                  Nueva tarea
               </button>
            </div>
            {
               issues && issues.content.length > 0 ?
                  <div className="text-sm">
                     <div className="border-black/10 font-semibold grid grid-cols-12 border-b gap-2 px-2 py-4">
                        <h5 className="col-span-1">Tipo</h5>
                        <h5 className="col-span-5">Tarea</h5>
                        <h5 className="col-span-1">Estado</h5>
                        <h5 className="col-span-1">Prioridad</h5>
                        <h5 className="col-span-3">Asignado a</h5>
                        <h5 className="col-span-1 flex justify-center">Acciones</h5>
                     </div>
                     {
                        issues.content.map(task =>
                           <div key={task.id} className="border-black/10 hover:bg-black/5 duration-150 grid grid-cols-12 items-center border-b gap-2 px-2 py-4 
                     select-none cursor-grab active:cursor-grabbing">
                              <div className='col-span-1 rounded-full text-xs border px-2 whitespace-nowrap h-fit w-fit'
                                 style={{
                                    backgroundColor: `${getTypeStyle(Number(task.type))?.color}0f`,
                                    color: getTypeStyle(Number(task.type))?.color,
                                 }}>
                                 {getTypeStyle(Number(task.type))?.name}
                              </div>
                              <div className="col-span-5">
                                 <div className="flex flex-col">
                                    <h6 className="font-medium line-clamp-1">{task.title}</h6>
                                    <p className="text-black/75 line-clamp-1 text-xs">{task.descriptions[0].text}</p>
                                 </div>
                              </div>
                              <div className='col-span-1 rounded-full text-xs border px-2 whitespace-nowrap h-fit w-fit'
                                 style={{
                                    backgroundColor: `${getStatusStyle(Number(task.status))?.color}0f`,
                                    color: getStatusStyle(Number(task.status))?.color,
                                 }}>
                                 {getStatusStyle(Number(task.status))?.name}
                              </div>
                              <div className='col-span-1 rounded-full text-xs border px-2 whitespace-nowrap h-fit w-fit'
                                 style={{
                                    backgroundColor: `${getPriorityStyle(Number(task.priority))?.color}0f`,
                                    color: getPriorityStyle(Number(task.priority))?.color,
                                 }}>
                                 {getPriorityStyle(Number(task.priority))?.name}
                              </div>
                              <div className='col-span-3 flex justify-start items-center gap-2'>
                                 <div className='bg-black/10 overflow-hidden aspect-square rounded-full flex justify-center items-center w-6'>
                                    {
                                       typeof task.assignedId === 'object' && task.assignedId.picture ?
                                          <Image src={task.assignedId.picture}
                                             alt='assignedto'
                                             width={24}
                                             height={24}
                                          />
                                          :
                                          <span className='font-medium text-sm'>
                                             {typeof task.assignedId === 'object' ? task.assignedId.firstName?.charAt(0).toUpperCase() : ''}
                                          </span>
                                    }
                                 </div>
                                 <p className='text-xs'>
                                    {typeof task.assignedId === 'object' ? `${task.assignedId.firstName} ${task.assignedId.lastName}` : ''}
                                 </p>
                              </div>
                              <button type="button" className="col-span-1 flex justify-center w-fit mx-auto">
                                 <MenuIcon size={24} stroke={2.5} />
                              </button>
                           </div>
                        )
                     }
                  </div> : <p className="text-black/50 text-center text-sm">Tu Backlog se encuentra vacío</p>
            }
         </section>
         {
            sprints && sprints.length > 0 && sprints.map(spr =>
               <section key={spr.id} className='bg-white rounded-md flex flex-col gap-4 p-6'>
                  <div className="flex flex-col justify-center items-start gap-2">
                     <div className="flex justify-between items-center w-full gap-2">
                        <div className="flex justify-start items-center gap-4">
                           <h5 className='font-medium text-xl'>{spr.title}</h5>
                           <div className='rounded-full text-xs border px-2 whitespace-nowrap'
                              style={{
                                 backgroundColor: `${spr.statusObject?.color}0f`,
                                 color: spr.statusObject?.color,
                              }}>
                              {(spr.statusObject?.name ?? "").charAt(0).toUpperCase() + (spr.statusObject?.name ?? "").slice(1).toLowerCase()}
                           </div>
                        </div>
                        <div className='text-black/75 flex items-center text-xs gap-2.5'>
                           <span className='text-black/50'>
                              <CalendarIcon size={20} />
                           </span>
                           {formatDate(spr.startDate, false)} - {formatDate(spr.endDate, false)}
                        </div>
                     </div>
                     <p className='text-black/50 text-sm'>{spr.goal}</p>
                  </div>
               </section>
            )
         }

         <button onClick={() => setIsCreateSprintOpen(true)}
            className='border-black/20 text-black/20 hover:border-black/75 hover:text-black/75 duration-150 border-dashed border rounded-md flex flex-col justify-center items-center py-6'>
            Crear Nuevo Sprint
         </button>

         <Modal
            isOpen={isCreateTaskOpen}
            onClose={() => setIsCreateTaskOpen(false)}
            title="Crear nueva tarea"
         >
            <CreateTaskForm
               onSubmit={handleCreateTask}
               onCancel={() => setIsCreateTaskOpen(false)}
            />
         </Modal>

         <Modal
            isOpen={isCreateSprintOpen}
            onClose={() => setIsCreateSprintOpen(false)}
            title="Crear nuevo sprint"
         >
            <CreateSprintForm
               onSubmit={handleCreateSprint}
               onCancel={() => setIsCreateSprintOpen(false)}
            />
         </Modal>
      </>
   )
}