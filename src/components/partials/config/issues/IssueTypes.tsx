import { DeleteIcon, EditIcon, PlusIcon, ConfigIcon } from "@/assets/Icon"
import Modal from "@/components/layout/Modal"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { useState } from "react"
import { useAuthStore } from "@/lib/store/AuthStore"
import DeleteIssueTypes from "./DeleteIssueTypes"
import CreateEditTypes from "../CreateEditTypes"

interface IssueConfigProps {
   projectId: string
   onClose: () => void
}

export default function IssueTypes({ projectId, onClose }: IssueConfigProps) {
   const { projectConfig, addIssueTypes, editIssueTypes, deleteIssueTypes } = useConfigStore()
   const { getValidAccessToken } = useAuthStore()

   const [isEditTypesOpen, setIsEditTypesOpen] = useState(false)
   const [isDeleteTypesOpen, setIsDeleteTypesOpen] = useState(false)
   const [isCreateTypesOpen, setIsCreateTypesOpen] = useState(false)
   const [currentTypes, setCurrentTypes] = useState<{ id?: string, name: string, color: string }>({ name: "", color: "#000000" })

   const handleCreateTypes = async (data: { name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) addIssueTypes(token, projectId, data)
      setIsCreateTypesOpen(false)
   }

   const handleEditTypes = async (data: { name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) editIssueTypes(token, projectId, { id: currentTypes.id as string, ...data })
      setIsEditTypesOpen(false)
   }

   const handleDeleteTypes = async () => {
      const token = await getValidAccessToken()
      if (token) deleteIssueTypes(token, projectId, currentTypes.id as string)
      setIsDeleteTypesOpen(false)
   }

   return (
      <>
         <section className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
               <div>
                  <h4 className="text-lg font-semibold text-gray-900">Tipos de Tareas</h4>
                  <p className="text-sm text-gray-500 mt-1">Gestiona los tipos disponibles para las tareas de este proyecto</p>
               </div>
               <button
                  onClick={() => {
                     setCurrentTypes({ name: "", color: "#000000" })
                     setIsCreateTypesOpen(true)
                  }}
                  className="whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
               >
                  <PlusIcon size={16} stroke={2.5} />
                  Nuevo Tipo
               </button>
            </div>

            {/* Content */}
            <div className="max-h-72 overflow-y-auto">
               {!projectConfig?.issueTypes || projectConfig.issueTypes.length === 0 ? (
                  <div className="text-center py-12">
                     <div className="bg-gray-50 text-gray-400 rounded-full w-fit mx-auto mb-4 p-3">
                        <ConfigIcon size={32} />
                     </div>
                     <h5 className="text-lg font-medium text-gray-900 mb-2">No hay tipos configurados</h5>
                     <p className="text-gray-500 mb-6">Crea tu primer tipo para comenzar a categorizar las tareas</p>
                     <button
                        onClick={() => {
                           setCurrentTypes({ name: "", color: "#000000" })
                           setIsCreateTypesOpen(true)
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium mx-auto"
                     >
                        <PlusIcon size={16} />
                        Crear Primer Tipo
                     </button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                     {projectConfig.issueTypes.map((type) => (
                        <div
                           key={type.id}
                           className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300"
                           style={{
                              backgroundColor: `${type.color}08`,
                              borderColor: `${type.color}20`
                           }}
                        >
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                 <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: type.color }}
                                 />
                                 <span
                                    className="font-medium text-sm truncate"
                                    style={{ color: type.color }}
                                 >
                                    {type.name}
                                 </span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                 <button
                                    onClick={() => {
                                       setCurrentTypes({ ...type, id: type.id?.toString() })
                                       setIsEditTypesOpen(true)
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors duration-200"
                                    title="Editar tipo"
                                 >
                                    <EditIcon size={14} />
                                 </button>
                                 <button
                                    onClick={() => {
                                       setCurrentTypes({ ...type, id: type.id?.toString() })
                                       setIsDeleteTypesOpen(true)
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                                    title="Eliminar tipo"
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

         {/* Modal para crear tipo */}
         <Modal isOpen={isCreateTypesOpen} onClose={() => setIsCreateTypesOpen(false)} title="">
            <CreateEditTypes onSubmit={handleCreateTypes} onCancel={() => setIsCreateTypesOpen(false)} currentTypes={currentTypes} />
         </Modal>

         {/* Modal para editar tipo */}
         <Modal isOpen={isEditTypesOpen} onClose={() => setIsEditTypesOpen(false)} title="">
            <CreateEditTypes onSubmit={handleEditTypes} onCancel={() => setIsEditTypesOpen(false)} currentTypes={currentTypes} />
         </Modal>

         {/* Modal para eliminar tipo */}
         <Modal isOpen={isDeleteTypesOpen} onClose={() => setIsDeleteTypesOpen(false)} title="">
            <DeleteIssueTypes onSubmit={handleDeleteTypes} onCancel={() => setIsDeleteTypesOpen(false)} typesName={currentTypes.name} />
         </Modal>
      </>
   )
}