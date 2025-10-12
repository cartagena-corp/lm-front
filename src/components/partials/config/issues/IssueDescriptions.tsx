import { DeleteIcon, EditIcon, PlusIcon, ConfigIcon } from "@/assets/Icon"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { useState } from "react"
import CreateEditDescription from "@/components/partials/config/issues/CreateEditDescription"
import { useAuthStore } from "@/lib/store/AuthStore"
import DeleteIssueDescription from "@/components/partials/config/issues/DeleteIssueDescription"
import { useModalStore } from "@/lib/hooks/ModalStore"

interface IssueDescriptionsProps {
   projectId: string
   onClose: () => void
}

export default function IssueDescriptions({ projectId, onClose }: IssueDescriptionsProps) {
   const { projectConfig, isLoading, addIssueDescription, editIssueDescription, deleteIssueDescription } = useConfigStore()
   const { getValidAccessToken } = useAuthStore()

   // Obtener las descripciones desde projectConfig
   const issueDescriptions = projectConfig?.issueDescriptions || []

   const handleCreateDescription = async (data: { name: string }) => {
      const token = await getValidAccessToken()
      if (token) await addIssueDescription(token, projectId, data)
      closeModal()
   }

   const handleEditDescription = async (data: { id: string, name: string }) => {
      const token = await getValidAccessToken()
      if (token) await editIssueDescription(token, projectId, data.id, { name: data.name })
      closeModal()
   }

   const handleDeleteDescription = async (id: string) => {
      const token = await getValidAccessToken()
      if (token) await deleteIssueDescription(token, projectId, id)
      closeModal()
   }

   const { openModal, closeModal } = useModalStore()

   const handleCreateDescriptionModal = () => {
      openModal({
         size: "lg",
         title: "Crear Nueva Descripción",
         desc: "Ingresa el nombre para la nueva descripción de tareas",
         children: <CreateEditDescription onSubmit={handleCreateDescription} onCancel={() => closeModal()} currentDescription={{ name: "" }} />,
         Icon: <PlusIcon size={20} stroke={1.75} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "CREATE"
      })
   }

   const handleUpdateDescriptionModal = ({ id, name }: { id: string, name: string }) => {
      openModal({
         size: "lg",
         title: "Editar Descripción",
         desc: "Modifica el nombre de la descripción",
         children: <CreateEditDescription onSubmit={(data) => handleEditDescription({ id, ...data })} onCancel={() => closeModal()} currentDescription={{ name }} />,
         Icon: <EditIcon size={20} stroke={1.75} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "UPDATE"
      })
   }

   const handleDeleteDescriptionModal = ({ id, name }: { id: string, name: string }) => {
      openModal({
         size: "md",
         children: <DeleteIssueDescription onSubmit={() => handleDeleteDescription(id)} onCancel={() => closeModal()} descriptionName={name} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "DELETE"
      })
   }

   return (
      <>
         <section className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
               <div>
                  <h4 className="text-lg font-semibold text-gray-900">Descripciones de Tareas</h4>
                  <p className="text-sm text-gray-500 mt-1">Gestiona las descripciones disponibles para las tareas de este proyecto</p>
               </div>
               <button className="whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium" onClick={() => handleCreateDescriptionModal()} >
                  <PlusIcon size={16} stroke={2.5} />
                  Nueva Descripción
               </button>
            </div>

            {/* Content */}
            <div className="max-h-72 overflow-y-auto">
               {isLoading ? (
                  <div className="text-center py-12">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                     <p className="text-gray-600">Cargando descripciones...</p>
                  </div>
               ) : !issueDescriptions || issueDescriptions.length === 0 ? (
                  <div className="text-center py-12">
                     <div className="bg-gray-50 text-gray-400 rounded-full w-fit mx-auto mb-4 p-3">
                        <ConfigIcon size={32} />
                     </div>
                     <h5 className="text-lg font-medium text-gray-900 mb-2">No hay descripciones configuradas</h5>
                     <p className="text-gray-500 mb-6">Crea tu primera descripción para comenzar a organizar las tareas</p>
                     <button onClick={() => handleCreateDescriptionModal()} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium mx-auto"  >
                        <PlusIcon size={16} />
                        Crear Primera Descripción
                     </button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                     {issueDescriptions.map((description) => (
                        <div
                           key={description.id}
                           className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300"
                        >
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                 <div className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0" />
                                 <span className="font-medium text-sm truncate text-gray-900">
                                    {description.name}
                                 </span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                 <button onClick={() => handleUpdateDescriptionModal({ id: description.id?.toString(), name: description.name })} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors duration-200" title="Editar descripción" >
                                    <EditIcon size={14} />
                                 </button>
                                 <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200" title="Eliminar descripción"
                                    onClick={() => handleDeleteDescriptionModal({ id: description.id?.toString(), name: description.name })}>
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
