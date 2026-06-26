import DeleteProjectStatus from "./DeleteProjectStatus"
import { DeleteIcon, EditIcon, PlusIcon, ConfigIcon, BoardIcon } from "@/assets/Icon"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import CreateEditStatus from "../CreateEditStatus"
import { useState, useEffect } from "react"
import { useModalStore } from "@/lib/hooks/ModalStore"

export default function ProjectConfig() {
   const { projectStatus, isLoading, addProjectStatus, editProjectStatus, deleteProjectStatus, setConfig } = useConfigStore()
   const { getValidAccessToken } = useAuthStore()

   useEffect(() => {
      const loadStatuses = async () => {
         const token = await getValidAccessToken()
         if (token) {
            await setConfig(token)
         }
      }
      loadStatuses()
   }, [getValidAccessToken, setConfig])

   const handleCreateStatus = async (data: { name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) await addProjectStatus(token, data)
      closeModal()
   }

   const handleEditStatus = async (data: { id: string, name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) editProjectStatus(token, data)
      closeModal()
   }

   const handleDeleteStatus = async (id: string) => {
      const token = await getValidAccessToken()
      if (token) deleteProjectStatus(token, id)
      closeModal()
   }

   const { openModal, closeModal } = useModalStore()

   const handleCreateStateModal = () => {
      const currentStatusVar = { name: "", color: "#000000" }
      openModal({
         size: "lg",
         title: "Crear Estado",
         desc: "Define un nuevo estado para las tareas",
         Icon: <BoardIcon size={20} stroke={1.75} />,
         children: <CreateEditStatus onSubmit={handleCreateStatus} onCancel={() => closeModal()} currentStatus={currentStatusVar} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "CREATE"
      })
   }

   const handleUpdateStateModal = ({ id, name, color }: { id: string, name: string, color: string }) => {
      const currentStatusVar = { name, color }
      openModal({
         size: "lg",
         title: "Editar Estado",
         desc: "Modifica la información del estado",
         Icon: <EditIcon size={20} stroke={1.75} />,
         children: <CreateEditStatus onSubmit={(data) => handleEditStatus({ id, ...data })} onCancel={() => closeModal()} currentStatus={currentStatusVar} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "UPDATE"
      })
   }

   const handleDeleteStateModal = ({ id, name, color }: { id: string, name: string, color: string }) => {
      const currentStatusVar = { name, color }
      openModal({
         size: "md",
         children: <DeleteProjectStatus onSubmit={() => handleDeleteStatus(id)} onCancel={() => closeModal()} status={currentStatusVar} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "DELETE"
      })
   }

   return (
      <>
         <section className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            {/* Header */}
            <div className="border-gray-100 border-b p-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="bg-blue-50 text-blue-600 rounded-lg p-2">
                        <ConfigIcon size={24} />
                     </div>
                     <div className="flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-900">Estados de Proyectos</h3>
                        <p className="text-sm text-gray-500">Gestiona los estados disponibles para tus proyectos</p>
                     </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium" onClick={() => handleCreateStateModal()} >
                     <PlusIcon size={16} stroke={4} />
                     Nuevo Estado
                  </button>
               </div>
            </div>

            {/* Content */}
            <div className="p-6">
               {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                     {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse"> <div className="bg-gray-200 rounded-lg h-12" /> </div>)}
                  </div>
               ) : projectStatus.length === 0 ? (
                  <div className="text-center py-12">
                     <div className="bg-gray-50 text-gray-400 rounded-full w-fit mx-auto mb-4 p-3">
                        <ConfigIcon size={32} />
                     </div>
                     <h4 className="text-lg font-medium text-gray-900 mb-2">No hay estados configurados</h4>
                     <p className="text-gray-500 mb-6">Crea tu primer estado para comenzar a organizar tus proyectos</p>
                     <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium mx-auto" onClick={() => handleCreateStateModal()} >
                        <PlusIcon size={16} />
                        Crear Primer Estado
                     </button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                     {projectStatus.map((status) => (
                        <div key={status.id} className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300" style={{ backgroundColor: `${status.color}08`, borderColor: `${status.color}20` }} >
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                 <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }} />
                                 <span className="font-medium text-sm truncate" style={{ color: status.color }}>
                                    {status.name}
                                 </span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                 <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                                    onClick={() => handleUpdateStateModal({ ...status, id: status.id?.toString() })} title="Editar estado">
                                    <EditIcon size={14} />
                                 </button>
                                 <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                                    onClick={() => handleDeleteStateModal({ ...status, id: status.id?.toString() })} title="Eliminar estado"
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