import { DeleteIcon, EditIcon, PlusIcon, ConfigIcon } from "@/assets/Icon"
import Modal from "@/components/layout/Modal"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { useState } from "react"
import { useAuthStore } from "@/lib/store/AuthStore"
import CreateEditPriorities from "../CreateEditPriorities"
import DeleteIssuePriorities from "./DeleteIssuePriorities"
import { useModalStore } from "@/lib/hooks/ModalStore"

interface IssueConfigProps {
   projectId: string
   onClose: () => void
}

export default function IssuePriorities({ projectId, onClose }: IssueConfigProps) {
   const { projectConfig, addIssuePriorities, editIssuePriorities, deleteIssuePriorities } = useConfigStore()
   const { getValidAccessToken } = useAuthStore()

   const handleCreatePriorities = async (data: { name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) addIssuePriorities(token, projectId, data)
      closeModal()
   }

   const handleEditPriorities = async (data: { id: string, name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) editIssuePriorities(token, projectId, data)
      closeModal()
   }

   const handleDeletePriorities = async (data: { id: string, name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) deleteIssuePriorities(token, projectId, data.id)
      closeModal()
   }

   const { openModal, closeModal } = useModalStore()

   const handleCreatePrioritiesModal = () => {
      const currentPriorityVar = { name: "", color: "#000000" }
      openModal({
         size: "lg",
         title: "Crear Prioridad",
         desc: "Define una nueva prioridad para las tareas",
         children: <CreateEditPriorities onSubmit={handleCreatePriorities} onCancel={() => closeModal()} currentPriorities={currentPriorityVar} />,
         Icon: <PlusIcon size={20} stroke={1.75} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "CREATE"
      })
   }

   const handleUpdatePrioritiesModal = ({ id, name, color }: { id: string, name: string, color: string }) => {
      const currentPriorityVar = { name, color }
      openModal({
         size: "lg",
         title: "Editar Prioridad",
         desc: "Modifica la información de la prioridad",
         children: <CreateEditPriorities onSubmit={(data) => handleEditPriorities({ id, ...data })} onCancel={() => closeModal()} currentPriorities={currentPriorityVar} />,
         Icon: <EditIcon size={20} stroke={1.75} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "UPDATE"
      })
   }

   const handleDeletePrioritiesModal = ({ id, name, color }: { id: string, name: string, color: string }) => {
      const currentPriorityVar = { id, name, color }
      openModal({
         size: "md",
         children: <DeleteIssuePriorities onSubmit={() => handleDeletePriorities(currentPriorityVar)} onCancel={() => closeModal()} prioritiesName={currentPriorityVar.name} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "DELETE"
      })
   }

   return (
      <section className="space-y-6">
         {/* Header */}
         <div className="flex items-center justify-between gap-2">
            <div>
               <h4 className="text-lg font-semibold text-gray-900">Prioridades de Tareas</h4>
               <p className="text-sm text-gray-500 mt-1">Gestiona las prioridades disponibles para las tareas de este proyecto</p>
            </div>
            <button onClick={() => handleCreatePrioritiesModal()} className="whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium">
               <PlusIcon size={16} stroke={2.5} />
               Nueva Prioridad
            </button>
         </div>

         {/* Content */}
         <div className="max-h-72 overflow-y-auto">
            {!projectConfig?.issuePriorities || projectConfig.issuePriorities.length === 0 ? (
               <div className="text-center py-12">
                  <div className="bg-gray-50 text-gray-400 rounded-full w-fit mx-auto mb-4 p-3">
                     <ConfigIcon size={32} />
                  </div>
                  <h5 className="text-lg font-medium text-gray-900 mb-2">No hay prioridades configuradas</h5>
                  <p className="text-gray-500 mb-6">Crea tu primera prioridad para comenzar a jerarquizar las tareas</p>
                  <button onClick={() => handleCreatePrioritiesModal()} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium mx-auto">
                     <PlusIcon size={16} />
                     Crear Primera Prioridad
                  </button>
               </div>
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                  {projectConfig.issuePriorities.map((priority) =>
                     <div key={priority.id} className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300" style={{ backgroundColor: `${priority.color}08`, borderColor: `${priority.color}20` }}>
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: priority.color }} />
                              <span className="font-medium text-sm truncate" style={{ color: priority.color }}>
                                 {priority.name}
                              </span>
                           </div>
                           <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button onClick={() => handleUpdatePrioritiesModal({ id: priority.id?.toString(), name: priority.name, color: priority.color })} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors duration-200" title="Editar prioridad" >
                                 <EditIcon size={14} />
                              </button>
                              <button onClick={() => handleDeletePrioritiesModal({ id: priority.id?.toString(), name: priority.name, color: priority.color })} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200" title="Eliminar prioridad" >
                                 <DeleteIcon size={14} />
                              </button>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            )}
         </div>
      </section>
   )
}