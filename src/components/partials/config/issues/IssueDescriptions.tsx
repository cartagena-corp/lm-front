import { DeleteIcon, EditIcon, PlusIcon, ConfigIcon } from "@/assets/Icon"
import Modal from "@/components/layout/Modal"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { useState } from "react"
import CreateEditDescription from "@/components/partials/config/issues/CreateEditDescription"
import { useAuthStore } from "@/lib/store/AuthStore"
import DeleteIssueDescription from "@/components/partials/config/issues/DeleteIssueDescription"

interface IssueDescriptionsProps {
   projectId: string
   onClose: () => void
}

export default function IssueDescriptions({ projectId, onClose }: IssueDescriptionsProps) {
   const { 
      projectConfig,
      isLoading,
      addIssueDescription, 
      editIssueDescription, 
      deleteIssueDescription 
   } = useConfigStore()
   
   const { getValidAccessToken } = useAuthStore()

   const [isEditDescriptionOpen, setIsEditDescriptionOpen] = useState(false)
   const [isDeleteDescriptionOpen, setIsDeleteDescriptionOpen] = useState(false)
   const [isCreateDescriptionOpen, setIsCreateDescriptionOpen] = useState(false)
   const [currentDescription, setCurrentDescription] = useState<{ id?: string, name: string }>({ name: "" })

   // Obtener las descripciones desde projectConfig
   const issueDescriptions = projectConfig?.issueDescriptions || []

   const handleCreateDescription = async (data: { name: string }) => {
      const token = await getValidAccessToken()
      if (token) await addIssueDescription(token, projectId, data)
      setIsCreateDescriptionOpen(false)
   }

   const handleEditDescription = async (data: { name: string }) => {
      const token = await getValidAccessToken()
      if (token) await editIssueDescription(token, projectId, currentDescription.id as string, data)
      setIsEditDescriptionOpen(false)
   }

   const handleDeleteDescription = async () => {
      const token = await getValidAccessToken()
      if (token) await deleteIssueDescription(token, projectId, currentDescription.id as string)
      setIsDeleteDescriptionOpen(false)
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
               <button
                  onClick={() => {
                     setCurrentDescription({ name: "" })
                     setIsCreateDescriptionOpen(true)
                  }}
                  className="whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
               >
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
                     <button
                        onClick={() => {
                           setCurrentDescription({ name: "" })
                           setIsCreateDescriptionOpen(true)
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium mx-auto"
                     >
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
                                 <button
                                    onClick={() => {
                                       setCurrentDescription({ ...description, id: description.id?.toString() })
                                       setIsEditDescriptionOpen(true)
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors duration-200"
                                    title="Editar descripción"
                                 >
                                    <EditIcon size={14} />
                                 </button>
                                 <button
                                    onClick={() => {
                                       setCurrentDescription({ ...description, id: description.id?.toString() })
                                       setIsDeleteDescriptionOpen(true)
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                                    title="Eliminar descripción"
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

         {/* Modal para crear descripción */}
         <Modal isOpen={isCreateDescriptionOpen} onClose={() => setIsCreateDescriptionOpen(false)} title="">
            <CreateEditDescription 
               onSubmit={handleCreateDescription} 
               onCancel={() => setIsCreateDescriptionOpen(false)} 
               currentDescription={currentDescription} 
            />
         </Modal>

         {/* Modal para editar descripción */}
         <Modal isOpen={isEditDescriptionOpen} onClose={() => setIsEditDescriptionOpen(false)} title="">
            <CreateEditDescription 
               onSubmit={handleEditDescription} 
               onCancel={() => setIsEditDescriptionOpen(false)} 
               currentDescription={currentDescription} 
            />
         </Modal>

         {/* Modal para eliminar descripción */}
         <Modal isOpen={isDeleteDescriptionOpen} onClose={() => setIsDeleteDescriptionOpen(false)} title="">
            <DeleteIssueDescription 
               onSubmit={handleDeleteDescription} 
               onCancel={() => setIsDeleteDescriptionOpen(false)} 
               descriptionName={currentDescription.name} 
            />
         </Modal>
      </>
   )
}
