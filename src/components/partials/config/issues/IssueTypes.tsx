import { DeleteIcon, EditIcon, PlusIcon } from "@/assets/Icon"
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
      <section className="space-y-4 mt-2">
         <div className="flex items-center justify-between gap-2">
            <h6 className="font-semibold">Tipos de tareas</h6>
            <button onClick={() => {
               setCurrentTypes({ name: "", color: "#000000" })
               setIsCreateTypesOpen(true)
            }} className="bg-blue-600 hover:bg-blue-800 text-white duration-150 flex items-center rounded-md text-sm gap-2 py-1.5 px-2">
               <PlusIcon size={16} stroke={2.5} />
               Crear tipo
            </button>
         </div>
         <div className="flex flex-wrap gap-2 text-sm">
            {
               projectConfig?.issueTypes.map(types =>
                  <div key={types.id} className="border-black/15 rounded-full border flex items-center justify-between px-2 py-1 gap-2"
                     style={{ backgroundColor: `${types.color}15`, color: types.color }}>
                     {types.name}
                     <div className="flex items-center">
                        <button onClick={() => {
                           setCurrentTypes({ ...types, id: types.id?.toString() })
                           setIsEditTypesOpen(true)
                        }}>
                           <EditIcon size={18} />
                        </button>
                        <button onClick={() => {
                           setCurrentTypes({ ...types, id: types.id?.toString() })
                           setIsDeleteTypesOpen(true)
                        }}>

                           <DeleteIcon size={18} />
                        </button>
                     </div>
                  </div>
               )
            }
         </div>

         {/* Modal para crear estado */}
         <Modal isOpen={isCreateTypesOpen} onClose={() => setIsCreateTypesOpen(false)} title="Crear Tipo">
            <CreateEditTypes onSubmit={handleCreateTypes} onCancel={() => setIsCreateTypesOpen(false)} currentTypes={currentTypes} />
         </Modal>

         {/* Modal para editar estado */}
         <Modal isOpen={isEditTypesOpen} onClose={() => setIsEditTypesOpen(false)} title="Editar Tipo">
            <CreateEditTypes onSubmit={handleEditTypes} onCancel={() => setIsEditTypesOpen(false)} currentTypes={currentTypes} />
         </Modal>

         {/* Modal para eliminar estado */}
         <Modal isOpen={isDeleteTypesOpen} onClose={() => setIsDeleteTypesOpen(false)} title="Eliminar Tipo">
            <DeleteIssueTypes onSubmit={handleDeleteTypes} onCancel={() => setIsDeleteTypesOpen(false)} typesName={currentTypes.name} />
         </Modal>
      </section>
   )
}