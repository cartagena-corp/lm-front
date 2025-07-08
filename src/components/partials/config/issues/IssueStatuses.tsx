import { DeleteIcon, EditIcon, PlusIcon, ConfigIcon } from "@/assets/Icon"
import Modal from "@/components/layout/Modal"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { useState } from "react"
import CreateEditStatus from "../CreateEditStatus"
import { useAuthStore } from "@/lib/store/AuthStore"
import DeleteIssueStatus from "./DeleteIssueStatus"

interface IssueConfigProps {
   projectId: string
   onClose: () => void
}

export default function IssueStatuses({ projectId, onClose }: IssueConfigProps) {
   const { projectConfig, addIssueStatus, editIssueStatus, deleteIssueStatus } = useConfigStore()
   const { getValidAccessToken } = useAuthStore()

   const [isEditStatusOpen, setIsEditStatusOpen] = useState(false)
   const [isDeleteStatusOpen, setIsDeleteStatusOpen] = useState(false)
   const [isCreateStatusOpen, setIsCreateStatusOpen] = useState(false)
   const [currentStatus, setCurrentStatus] = useState<{ id?: string, name: string, color: string }>({ name: "", color: "#000000" })

   const handleCreateStatus = async (data: { name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) addIssueStatus(token, projectId, data)
      setIsCreateStatusOpen(false)
   }

   const handleEditStatus = async (data: { name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) editIssueStatus(token, projectId, { id: currentStatus.id as string, ...data })
      setIsEditStatusOpen(false)
   }

   const handleDeleteStatus = async () => {
      const token = await getValidAccessToken()
      if (token) deleteIssueStatus(token, projectId, currentStatus.id as string)
      setIsDeleteStatusOpen(false)
   }

   return (
      <>
         <section className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
               <div>
                  <h4 className="text-lg font-semibold text-gray-900">Estados de Tareas</h4>
                  <p className="text-sm text-gray-500 mt-1">Gestiona los estados disponibles para las tareas de este proyecto</p>
               </div>
               <button
                  onClick={() => {
                     setCurrentStatus({ name: "", color: "#000000" })
                     setIsCreateStatusOpen(true)
                  }}
                  className="whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
               >
                  <PlusIcon size={16} stroke={2.5} />
                  Nuevo Estado
               </button>
            </div>

            {/* Content */}
            <div className="max-h-72 overflow-y-auto">
               {!projectConfig?.issueStatuses || projectConfig.issueStatuses.length === 0 ? (
                  <div className="text-center py-12">
                     <div className="bg-gray-50 text-gray-400 rounded-full w-fit mx-auto mb-4 p-3">
                        <ConfigIcon size={32} />
                     </div>
                     <h5 className="text-lg font-medium text-gray-900 mb-2">No hay estados configurados</h5>
                     <p className="text-gray-500 mb-6">Crea tu primer estado para comenzar a organizar las tareas</p>
                     <button
                        onClick={() => {
                           setCurrentStatus({ name: "", color: "#000000" })
                           setIsCreateStatusOpen(true)
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium mx-auto"
                     >
                        <PlusIcon size={16} />
                        Crear Primer Estado
                     </button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                     {projectConfig.issueStatuses.map((status) => (
                        <div
                           key={status.id}
                           className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300"
                           style={{
                              backgroundColor: `${status.color}08`,
                              borderColor: `${status.color}20`
                           }}
                        >
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                 <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: status.color }}
                                 />
                                 <span
                                    className="font-medium text-sm truncate"
                                    style={{ color: status.color }}
                                 >
                                    {status.name}
                                 </span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                 <button
                                    onClick={() => {
                                       setCurrentStatus({ ...status, id: status.id?.toString() })
                                       setIsEditStatusOpen(true)
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors duration-200"
                                    title="Editar estado"
                                 >
                                    <EditIcon size={14} />
                                 </button>
                                 <button
                                    onClick={() => {
                                       setCurrentStatus({ ...status, id: status.id?.toString() })
                                       setIsDeleteStatusOpen(true)
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                                    title="Eliminar estado"
                                 >
                                    <DeleteIcon size={14} />
                                 </button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </section>

         {/* Modal para crear estado */}
         <Modal isOpen={isCreateStatusOpen} onClose={() => setIsCreateStatusOpen(false)} title="">
            <CreateEditStatus onSubmit={handleCreateStatus} onCancel={() => setIsCreateStatusOpen(false)} currentStatus={currentStatus} />
         </Modal>

         {/* Modal para editar estado */}
         <Modal isOpen={isEditStatusOpen} onClose={() => setIsEditStatusOpen(false)} title="">
            <CreateEditStatus onSubmit={handleEditStatus} onCancel={() => setIsEditStatusOpen(false)} currentStatus={currentStatus} />
         </Modal>

         {/* Modal para eliminar estado */}
         <Modal isOpen={isDeleteStatusOpen} onClose={() => setIsDeleteStatusOpen(false)} title="">
            <DeleteIssueStatus onSubmit={handleDeleteStatus} onCancel={() => setIsDeleteStatusOpen(false)} statusName={currentStatus.name} />
         </Modal>
      </>
   )
}