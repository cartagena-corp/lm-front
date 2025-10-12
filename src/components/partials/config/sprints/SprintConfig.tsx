import DeleteSprintStatus from "./DeleteSprintStatus"
import { DeleteIcon, EditIcon, PlusIcon, ConfigIcon } from "@/assets/Icon"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useConfigStore } from "@/lib/store/ConfigStore"
import CreateEditStatus from "../CreateEditStatus"
import { useModalStore } from "@/lib/hooks/ModalStore"

export default function SprintConfig({ projectId }: { projectId: string }) {
   const { getValidAccessToken } = useAuthStore()
   const { projectConfig, isLoading, addSprintStatus, editSprintStatus, deleteSprintStatus } = useConfigStore()
   const { openModal, closeModal } = useModalStore()

   // Obtener los estados de sprint desde projectConfig
   const sprintStatuses = projectConfig?.sprintStatuses || []

   const handleCreateStatus = async (data: { name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) await addSprintStatus(token, projectId, data)
      closeModal()
   }

   const handleEditStatus = async (data: { id: string, name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) await editSprintStatus(token, projectId, data)
      closeModal()
   }

   const handleDeleteStatus = async (data: { id: string, name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) await deleteSprintStatus(token, projectId, data.id)
      closeModal()
   }

   const handleCreateStatusModal = () => {
      openModal({
         size: "lg",
         title: "Crear Nuevo Estado",
         desc: "Define un nuevo estado para los sprints",
         children: <CreateEditStatus onSubmit={handleCreateStatus} onCancel={() => closeModal()} currentStatus={{ name: "", color: "#000000" }} />,
         Icon: <PlusIcon size={20} stroke={1.75} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "CREATE"
      })
   }

   const handleUpdateStatusModal = ({ id, name, color }: { id: string, name: string, color: string }) => {
      openModal({
         size: "lg",
         title: "Editar Estado",
         desc: "Modifica la información del estado",
         children: <CreateEditStatus onSubmit={(data) => handleEditStatus({ id, ...data })} onCancel={() => closeModal()} currentStatus={{ name, color }} />,
         Icon: <EditIcon size={20} stroke={1.75} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "UPDATE"
      })
   }

   const handleDeleteStatusModal = ({ id, name, color }: { id: string, name: string, color: string }) => {
      openModal({
         size: "md",
         children: <DeleteSprintStatus onSubmit={() => handleDeleteStatus({ id, name, color })} onCancel={() => closeModal()} status={{ id, name, color }} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "DELETE"
      })
   }

   return (
      <>
         <section className="bg-white">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="bg-green-50 text-green-600 rounded-lg p-2">
                        <ConfigIcon size={24} />
                     </div>
                     <div>
                        <h3 className="text-lg font-semibold text-gray-900">Estados de Sprints</h3>
                        <p className="text-sm text-gray-500">Gestiona los estados disponibles para tus sprints</p>
                     </div>
                  </div>
                  <button
                     onClick={handleCreateStatusModal}
                     className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
                  >
                     <PlusIcon size={16} stroke={4} />
                     Nuevo Estado
                  </button>
               </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-80 overflow-y-auto">
               {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                     {[...Array(4)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                           <div className="bg-gray-200 rounded-lg h-12"></div>
                        </div>
                     ))}
                  </div>
               ) : sprintStatuses.length === 0 ? (
                  <div className="text-center py-12">
                     <div className="p-3 bg-gray-50 rounded-full w-fit mx-auto mb-4 text-gray-400">
                        <ConfigIcon size={32} />
                     </div>
                     <h4 className="text-lg font-medium text-gray-900 mb-2">No hay estados configurados</h4>
                     <p className="text-gray-500 mb-6">Crea tu primer estado para comenzar a organizar tus sprints</p>
                     <button
                        onClick={handleCreateStatusModal}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium mx-auto"
                     >
                        <PlusIcon size={16} />
                        Crear Primer Estado
                     </button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                     {sprintStatuses.map((status) => (
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
                                    onClick={() => handleUpdateStatusModal({ id: status.id?.toString() || "", name: status.name, color: status.color })}
                                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors duration-200"
                                    title="Editar estado"
                                 >
                                    <EditIcon size={14} />
                                 </button>
                                 <button
                                    onClick={() => handleDeleteStatusModal({ id: status.id?.toString() || "", name: status.name, color: status.color })}
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
      </>
   )
}