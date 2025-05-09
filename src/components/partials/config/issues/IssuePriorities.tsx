import { DeleteIcon, EditIcon, PlusIcon } from "@/assets/Icon"
import Modal from "@/components/layout/Modal"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { useState } from "react"
import { useAuthStore } from "@/lib/store/AuthStore"
import CreateEditPriorities from "../CreateEditPriorities"
import DeleteIssuePriorities from "./DeleteIssuePriorities"

interface IssueConfigProps {
   projectId: string
   onClose: () => void
}

export default function IssuePriorities({ projectId, onClose }: IssueConfigProps) {
   const { projectConfig, addIssuePriorities, editIssuePriorities, deleteIssuePriorities } = useConfigStore()
   const { getValidAccessToken } = useAuthStore()

   const [isEditPrioritiesOpen, setIsEditPrioritiesOpen] = useState(false)
   const [isDeletePrioritiesOpen, setIsDeletePrioritiesOpen] = useState(false)
   const [isCreatePrioritiesOpen, setIsCreatePrioritiesOpen] = useState(false)
   const [currentPriorities, setCurrentPriorities] = useState<{ id?: string, name: string, color: string }>({ name: "", color: "#000000" })

   const handleCreatePriorities = async (data: { name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) addIssuePriorities(token, projectId, data)
      setIsCreatePrioritiesOpen(false)
   }

   const handleEditPriorities = async (data: { name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) editIssuePriorities(token, projectId, { id: currentPriorities.id as string, ...data })
      setIsEditPrioritiesOpen(false)
   }

   const handleDeletePriorities = async () => {
      const token = await getValidAccessToken()
      if (token) deleteIssuePriorities(token, projectId, currentPriorities.id as string)
      setIsDeletePrioritiesOpen(false)
   }

   return (
      <section className="space-y-4 mt-2">
         <div className="flex items-center justify-between gap-2">
            <h6 className="font-semibold">Prioridades de las tareas</h6>
            <button onClick={() => {
               setCurrentPriorities({ name: "", color: "#000000" })
               setIsCreatePrioritiesOpen(true)
            }} className="bg-blue-600 hover:bg-blue-800 text-white duration-150 flex items-center rounded-md text-sm gap-2 py-1.5 px-2">
               <PlusIcon size={16} stroke={2.5} />
               Crear prioridad
            </button>
         </div>
         <div className="flex flex-wrap gap-2 text-sm">
            {
               projectConfig?.issuePriorities.map(priorities =>
                  <div key={priorities.id} className="border-black/15 rounded-full border flex items-center justify-between px-2 py-1 gap-2"
                     style={{ backgroundColor: `${priorities.color}15`, color: priorities.color }}>
                     {priorities.name}
                     <div className="flex items-center">
                        <button onClick={() => {
                           setCurrentPriorities({ ...priorities, id: priorities.id?.toString() })
                           setIsEditPrioritiesOpen(true)
                        }}>
                           <EditIcon size={18} />
                        </button>
                        <button onClick={() => {
                           setCurrentPriorities({ ...priorities, id: priorities.id?.toString() })
                           setIsDeletePrioritiesOpen(true)
                        }}>

                           <DeleteIcon size={18} />
                        </button>
                     </div>
                  </div>
               )
            }
         </div>

         {/* Modal para crear estado */}
         <Modal isOpen={isCreatePrioritiesOpen} onClose={() => setIsCreatePrioritiesOpen(false)} title="Crear Prioridad">
            <CreateEditPriorities onSubmit={handleCreatePriorities} onCancel={() => setIsCreatePrioritiesOpen(false)} currentPriorities={currentPriorities} />
         </Modal>

         {/* Modal para editar estado */}
         <Modal isOpen={isEditPrioritiesOpen} onClose={() => setIsEditPrioritiesOpen(false)} title="Editar Prioridad">
            <CreateEditPriorities onSubmit={handleEditPriorities} onCancel={() => setIsEditPrioritiesOpen(false)} currentPriorities={currentPriorities} />
         </Modal>

         {/* Modal para eliminar estado */}
         <Modal isOpen={isDeletePrioritiesOpen} onClose={() => setIsDeletePrioritiesOpen(false)} title="Eliminar Prioridad">
            <DeleteIssuePriorities onSubmit={handleDeletePriorities} onCancel={() => setIsDeletePrioritiesOpen(false)} prioritiesName={currentPriorities.name} />
         </Modal>
      </section>
   )
}