import { SprintProps, TaskProps } from "@/lib/types/types"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { CalendarIcon, MenuIcon } from "@/assets/Icon"
import { Draggable } from "./dnd-kit/Draggable"
import { Droppable } from "./dnd-kit/Droppable"
import Image from "next/image"
import { Dispatch, SetStateAction, useState } from "react"
import Modal from "../layout/Modal"
import TaskDetailsForm from "../partials/TaskDetailsForm"

export default function IssuesRow({ spr, setIsOpen }: { spr: SprintProps, setIsOpen: Dispatch<SetStateAction<boolean>> }) {
   const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false)
   const [taskActive, setTaskActive] = useState<TaskProps>()
   const { projectConfig } = useConfigStore()

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

   const getStatusStyle = (id: number) => {
      if (projectConfig) return projectConfig.issueStatuses?.find(status => status.id === id)
   }

   const getPriorityStyle = (id: number) => {
      if (projectConfig) return projectConfig.issuePriorities?.find(priority => priority.id === id)
   }

   const getTypeStyle = (id: number) => {
      if (projectConfig) return projectConfig.issueTypes?.find(type => type.id === id)
   }

   const handleDetails = () => {
      setIsTaskDetailsModalOpen(false)
   }
   return (
      <>
         <Droppable id={spr.id as string} key={spr.id} styleClass='bg-white rounded-md flex flex-col p-6'>
            <div className="flex flex-col justify-center items-start gap-2">
               <div className="flex justify-between items-center w-full gap-2">
                  <div className="flex justify-start items-center gap-4">
                     <h5 className='font-medium text-xl'>{spr.title}</h5>
                     {
                        spr.id !== "null" &&
                        <div className='rounded-full text-xs border px-2 whitespace-nowrap'
                           style={{
                              backgroundColor: `${spr.statusObject?.color}0f`,
                              color: spr.statusObject?.color,
                           }}>
                           {(spr.statusObject?.name ?? "").charAt(0).toUpperCase() + (spr.statusObject?.name ?? "").slice(1).toLowerCase()}
                        </div>
                     }
                  </div>
                  {
                     spr.id !== "null" ?
                        <div className='text-black/75 flex items-center text-xs gap-2.5'>
                           <span className='text-black/50'>
                              <CalendarIcon size={20} />
                           </span>
                           {formatDate(spr.startDate, false)} - {formatDate(spr.endDate, false)}
                        </div>
                        :
                        <button
                           onClick={() => setIsOpen(true)}
                           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 duration-150 whitespace-nowrap"
                        >
                           Crear Tarea
                        </button>
                  }
               </div>
               <p className='text-black/50 text-sm'>{spr.goal}</p>
            </div>
            {
               spr.tasks?.content.length !== 0 ?
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
                        spr.tasks?.content.map((task: TaskProps) =>
                           <Draggable key={task.id} id={task.id as string}
                              styleClass="bg-white active:bg-sky-100 active:border-transparent active:rounded-md border-black/10 hover:bg-black/5 duration-150 grid grid-cols-12 items-center border-b gap-2 px-2 py-4 
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
                              <button
                                 id="custom-ellipsis"
                                 onPointerDown={(e) => e.stopPropagation()}
                                 onClick={() => { setIsTaskDetailsModalOpen(true), setTaskActive(task) }}
                                 className="flex justify-center items-center gap-1 p-2 w-full"
                              >
                                 <span id="dot" />
                                 <span id="dot" />
                                 <span id="dot" />
                              </button>
                           </Draggable>
                        )
                     }
                  </div>
                  : <span className="text-center text-sm text-black/50">No hay tareas disponibles</span>
            }
         </Droppable>

         {/* Modal para detalle de tareas */}
         <Modal customWidth={'sm:max-w-4xl'}
            isOpen={isTaskDetailsModalOpen}
            onClose={() => setIsTaskDetailsModalOpen(false)}
            title={taskActive?.title as string}
         >
            <TaskDetailsForm task={taskActive as TaskProps}
               onSubmit={handleDetails}
               onCancel={() => setIsTaskDetailsModalOpen(false)}
            />
         </Modal>
      </>
   )
}