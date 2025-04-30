import { EditIcon, PlusIcon, XIcon } from "@/assets/Icon"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useBoardStore } from "@/lib/store/BoardStore"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { TaskProps } from "@/lib/types/types"
import Image from "next/image"
import { useRef, useState } from "react"
import Modal from "../layout/Modal"
import AddNewDescription from "./AddNewDescription"

interface DescProps {
   id?: string
   title: string
   text: string
}

interface FormProps {
   descriptions: DescProps[]
   estimatedTime: number
   priority: number
   status: number
   title: string
   type: number
}

interface UpdateTaskFormProps {
   onSubmit: (data: FormProps) => void
   onCancel: () => void
   taskObject: TaskProps
}


export default function UpdateTaskForm({ onSubmit, onCancel, taskObject }: UpdateTaskFormProps) {
   const { projectConfig } = useConfigStore()

   const [descSelected, setDescSelected] = useState<DescProps>({ id: "", title: "", text: "" })
   const [arrayDescriptions, setArrayDescriptions] = useState<DescProps[]>(taskObject.descriptions)
   const [isCreateDescriptionOpen, setIsCreateDescriptionOpen] = useState(false)
   const [isPriorityOpen, setIsPriorityOpen] = useState(false)
   const [isStatusOpen, setIsStatusOpen] = useState(false)
   const [isTypeOpen, setIsTypeOpen] = useState(false)

   const [formData, setFormData] = useState<TaskProps>({
      id: taskObject.id,
      title: taskObject.title,
      descriptions: taskObject.descriptions,
      priority: taskObject.priority,
      status: taskObject.status,
      type: taskObject.type,
      projectId: taskObject.projectId,
      assignedId: taskObject.assignedId,
      estimatedTime: taskObject.estimatedTime,
   })

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit({ ...formData, descriptions: arrayDescriptions })
   }

   const handleUpdateDescription = (descFormData: DescProps) => {
      if (!descFormData.id) {
         setArrayDescriptions([...arrayDescriptions, { id: descFormData.id, title: descFormData.title, text: descFormData.text }])
      } else {
         setArrayDescriptions(arrayDescriptions.map(desc => desc.id === descFormData.id ?
            { ...desc, title: descFormData.title, text: descFormData.text }
            : desc
         ))
      }
      setIsCreateDescriptionOpen(false)
   }

   const priorityRef = useRef(null)
   const statusRef = useRef(null)
   const typeRef = useRef(null)
   return (
      <>
         <form onSubmit={handleSubmit}>
            <div className='pt-4 pb-14 space-y-2'>
               <div className='space-y-1'>
                  <label htmlFor="title" className="text-gray-700 text-sm font-medium">
                     Título
                  </label>
                  <div className='border-gray-300 flex justify-center items-center rounded-md border px-2 gap-2'>
                     <input onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="outline-none text-sm w-full py-2"
                        value={formData.title}
                        name="title"
                        type="text"
                        id="title"
                        required
                     />
                  </div>
               </div>

               <div className='space-y-1'>
                  <label htmlFor="desc" className="text-gray-700 text-sm font-medium">
                     Descripción
                  </label>
                  <button type='button' className='border-gray-300 hover:bg-blue-600 hover:text-white hover:border-transparent duration-150 rounded-md flex justify-center items-center gap-2 text-xs border w-full p-2'
                     onClick={() => { setIsCreateDescriptionOpen(true); setDescSelected({ title: "", text: "" }) }}>
                     <PlusIcon stroke={2} size={14} />
                     Agregar Nueva Descripción
                  </button>
                  {
                     arrayDescriptions.length > 0 &&
                     <div className='border-black/15 flex flex-col rounded-md border mt-2 max-h-40 overflow-y-auto'>
                        {
                           arrayDescriptions.map((obj, i) =>
                              <div key={i}>
                                 <div className='flex flex-col gap-1 p-4'>
                                    <div className='flex justify-between items-start gap-2.5'>
                                       <span className='text-sm/tight font-bold'>{obj.title}</span>
                                       <div className="flex items-center gap-2">
                                          <button type='button' onClick={() => { setIsCreateDescriptionOpen(true); setDescSelected(obj) }}
                                             className='text-blue-500 translate-y-0.5'>
                                             <EditIcon stroke={2} size={16} />
                                          </button>
                                          <button type='button' onClick={() => { setArrayDescriptions(arrayDescriptions.filter((_, index) => index !== i)) }}
                                             className='text-red-500 translate-y-0.5'>
                                             <XIcon stroke={2.5} size={16} />
                                          </button>
                                       </div>
                                    </div>
                                    <span className='text-xs/tight'>{obj.text}</span>
                                 </div>
                                 {i !== (arrayDescriptions.length - 1) && <hr className="border-gray-300 mx-4" />}
                              </div>
                           )
                        }
                     </div>
                  }
               </div>

               <div className='space-y-1 relative' ref={typeRef}>
                  <label className="text-gray-700 text-sm font-medium">
                     Tipo
                  </label>
                  <button onClick={() => {
                     setIsTypeOpen(!isTypeOpen)
                  }} type='button'
                     className='border-gray-300 flex justify-center items-center select-none rounded-md border w-full px-2 gap-2'>
                     <div className='py-2 w-full text-start text-sm'>
                        <span className='rounded-full text-xs border px-2 whitespace-nowrap h-fit w-fit'
                           style={{
                              backgroundColor: `${projectConfig?.issueTypes.find(type => formData.type === type.id)?.color}0f`,
                              color: projectConfig?.issueTypes.find(type => formData.type === type.id)?.color,
                           }}>
                           {projectConfig?.issueTypes.find(type => formData.type === type.id)?.name}
                        </span>
                     </div>

                     <svg className={`text-gray-500 size-4 duration-150 ${isTypeOpen ? "-rotate-180" : ""}`}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                     </svg>

                     {
                        isTypeOpen &&
                        <div className='border-gray-300 bg-white shadow-md absolute z-10 top-[105%] left-0  flex flex-col items-start rounded-md border text-sm w-full max-h-28 overflow-y-auto'>{
                           projectConfig && projectConfig.issueTypes.map((obj, i) =>
                              <span key={i} onClick={() => { setFormData({ ...formData, type: obj.id }), setIsTypeOpen(false) }}
                                 className='hover:bg-black/5 duration-150 w-full text-start py-2 px-2 flex items-center gap-2'>
                                 {
                                    obj.id === formData.type ?
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                       </svg>
                                       :
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" className='hidden' />
                                       </svg>

                                 }
                                 {obj.name}
                              </span>
                           )
                        }</div>
                     }
                  </button>
               </div>

               <div className='space-y-1 relative' ref={statusRef}>
                  <label className="text-gray-700 text-sm font-medium">
                     Estado
                  </label>
                  <button onClick={() => {
                     setIsStatusOpen(!isStatusOpen)
                  }} type='button'
                     className='border-gray-300 flex justify-center items-center select-none rounded-md border w-full px-2 gap-2'>
                     <div className='py-2 w-full text-start text-sm'>
                        <span className='rounded-full text-xs border px-2 whitespace-nowrap h-fit w-fit'
                           style={{
                              backgroundColor: `${projectConfig?.issueStatuses.find(status => formData.status === status.id)?.color}0f`,
                              color: projectConfig?.issueStatuses.find(status => formData.status === status.id)?.color,
                           }}>
                           {projectConfig?.issueStatuses.find(status => formData.status === status.id)?.name}
                        </span>
                     </div>

                     <svg className={`text-gray-500 size-4 duration-150 ${isStatusOpen ? "-rotate-180" : ""}`}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                     </svg>

                     {
                        isStatusOpen &&
                        <div className='border-gray-300 bg-white shadow-md absolute z-10 top-[105%] left-0  flex flex-col items-start rounded-md border text-sm w-full max-h-28 overflow-y-auto'>{
                           projectConfig && projectConfig.issueStatuses.map((obj, i) =>
                              <span key={i} onClick={() => { setFormData({ ...formData, status: obj.id }), setIsStatusOpen(false) }}
                                 className='hover:bg-black/5 duration-150 w-full text-start py-2 px-2 flex items-center gap-2'>
                                 {
                                    obj.id === formData.status ?
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                       </svg>
                                       :
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" className='hidden' />
                                       </svg>

                                 }
                                 {obj.name}
                              </span>
                           )
                        }</div>
                     }
                  </button>
               </div>

               <div className='space-y-1 relative' ref={priorityRef}>
                  <label className="text-gray-700 text-sm font-medium">
                     Prioridad
                  </label>
                  <button onClick={() => {
                     setIsPriorityOpen(!isPriorityOpen)
                  }} type='button'
                     className='border-gray-300 flex justify-center items-center select-none rounded-md border w-full px-2 gap-2'>
                     <div className='py-2 w-full text-start text-sm'>
                        <span className='rounded-full text-xs border px-2 whitespace-nowrap h-fit w-fit'
                           style={{
                              backgroundColor: `${projectConfig?.issuePriorities.find(priority => formData.priority === priority.id)?.color}0f`,
                              color: projectConfig?.issuePriorities.find(priority => formData.priority === priority.id)?.color,
                           }}>
                           {projectConfig?.issuePriorities.find(priority => formData.priority === priority.id)?.name}
                        </span>
                     </div>

                     <svg className={`text-gray-500 size-4 duration-150 ${isPriorityOpen ? "-rotate-180" : ""}`}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                     </svg>

                     {
                        isPriorityOpen &&
                        <div className='border-gray-300 bg-white shadow-md absolute z-10 top-[105%] left-0  flex flex-col items-start rounded-md border text-sm w-full max-h-28 overflow-y-auto'>{
                           projectConfig && projectConfig.issuePriorities.map((obj, i) =>
                              <span key={i} onClick={() => { setFormData({ ...formData, priority: obj.id }), setIsPriorityOpen(false) }}
                                 className='hover:bg-black/5 duration-150 w-full text-start py-2 px-2 flex items-center gap-2'>
                                 {
                                    obj.id === formData.priority ?
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                       </svg>
                                       :
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" className='hidden' />
                                       </svg>

                                 }
                                 {obj.name}
                              </span>
                           )
                        }</div>
                     }
                  </button>
               </div>

               <div className='space-y-1'>
                  <label htmlFor="estimatedTime" className="text-gray-700 text-sm font-medium">
                     Tiempo estimado
                  </label>
                  <div className='border-gray-300 flex justify-center items-center rounded-md border px-2 gap-2'>
                     <input onChange={(e) => setFormData({ ...formData, estimatedTime: Number(e.target.value) })}
                        className="outline-none text-sm w-full py-2"
                        value={formData.estimatedTime == 0 ? "" : formData.estimatedTime}
                        placeholder='Inserta un tiempo estimado en horas'
                        name="estimatedTime"
                        id="estimatedTime"
                        type="number"
                        required
                        min={0}
                     />
                  </div>
               </div>
            </div>

            <div className="pb-3 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
               <button
                  type="submit"
                  className="text-white inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold textWhite shadow-sm hover:bg-blue-500 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
               >
                  Actualizar Tarea
               </button>
               <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                  onClick={onCancel}
               >
                  Cancelar
               </button>
            </div>
         </form>

         {/* Modal de editar tarea */}
         <Modal isOpen={isCreateDescriptionOpen} customWidth="sm:max-w-sm" onClose={() => setIsCreateDescriptionOpen(false)} title={"Agregar Nueva Descripción"}>
            <AddNewDescription onSubmit={handleUpdateDescription} onCancel={() => setIsCreateDescriptionOpen(false)} desc={descSelected as DescProps} />
         </Modal>
      </>
   )
}