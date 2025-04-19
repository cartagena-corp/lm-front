import { PlusIcon } from "@/assets/Icon"

import { useBoardStore } from "@/lib/store/BoardStore"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { useIssueStore } from "@/lib/store/IssueStore"
import Image from "next/image"
import { useState } from "react"

export default function SprintList(sprint: any) {
   const { selectedBoard } = useBoardStore()
   const { projectConfig } = useConfigStore()
   const { issues } = useIssueStore()
   const [newSprint, setNewSprint] = useState("")

   const handleSubmit = () => {
      // console.log("Sprint creado:", newSprint)
      setNewSprint("")
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

   return (
      <>
         <section className='bg-white rounded-md flex flex-col gap-4 p-6'>
            <div className="flex justify-between items-center gap-2">
               <h5 className='font-medium text-xl'>Backlog</h5>

               <button className="bg-blue-600 text-white hover:bg-blue-700 flex justify-center items-center gap-2 rounded-md duration-150 whitespace-nowrap text-sm px-4 py-2">
                  <PlusIcon size={16} stroke={2.5} />
                  Nueva tarea
               </button>
            </div>
            {
               issues && issues.content.length > 0 ?
                  <div className="text-sm">
                     <div className="border-black/10 font-semibold grid grid-cols-12 border-b gap-2 p-2">
                        <h5 className="col-span-1">Tipo</h5>
                        <h5 className="col-span-6">Tarea</h5>
                        <h5 className="col-span-1">Estado</h5>
                        <h5 className="col-span-1">Prioridad</h5>
                        <h5 className="col-span-3">Asignado a</h5>
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
                              <div className="col-span-6">
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
                                 <div className='bg-black/10 overflow-hidden aspect-square rounded-full w-6'>
                                    {
                                       selectedBoard &&
                                       <Image src={selectedBoard?.createdBy.picture}
                                          alt='createdBy'
                                          width={24}
                                          height={24}
                                       />
                                    }
                                 </div>
                                 <p className='text-xs'>
                                    {selectedBoard?.createdBy.firstName} {selectedBoard?.createdBy.lastName}
                                 </p>
                              </div>
                           </div>
                        )
                     }
                  </div> : <p className="text-black/50 text-center text-sm">Tu Backlog se encuentra vacío</p>
            }
         </section>

         <form onSubmit={(e) => { e.preventDefault(), handleSubmit() }} className='bg-white rounded-md flex flex-col gap-4 p-6'>
            <div className="flex justify-between items-center gap-2">
               <input className="placeholder:text-black focus:placeholder:text-black/50 focus:border-black/15 font-medium text-xl
               outline-none border-transparent border rounded-md p-2"
                  placeholder="Crear Nuevo Sprint"
                  type="text"
                  value={newSprint}
                  onChange={(e) => setNewSprint(e.target.value)}
                  required
               />

               <button className="bg-blue-600 text-white hover:bg-blue-700 flex justify-center items-center gap-2 rounded-md duration-150 whitespace-nowrap text-sm px-4 py-2">
                  Crear Sprint
               </button>
            </div>
         </form>
      </>
   )
}