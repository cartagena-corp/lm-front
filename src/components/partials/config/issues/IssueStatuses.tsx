import { DeleteIcon, EditIcon, PlusIcon } from "@/assets/Icon"
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
      <section className="space-y-4 mt-2">
         <div className="flex items-center justify-between gap-2">
            <h6 className="font-semibold">Estados de las tareas</h6>
            <button onClick={() => {
               setCurrentStatus({ name: "", color: "#000000" })
               setIsCreateStatusOpen(true)
            }} className="bg-blue-600 hover:bg-blue-800 text-white duration-150 flex items-center rounded-md text-sm gap-2 py-1.5 px-2">
               <PlusIcon size={16} stroke={2.5} />
               Crear estado
            </button>
         </div>
         <div className="flex flex-wrap gap-2 text-sm">
            {
               projectConfig?.issueStatuses.map(status =>
                  <div key={status.id} className="border-black/15 rounded-full border flex items-center justify-between px-2 py-1 gap-2"
                     style={{ backgroundColor: `${status.color}15`, color: status.color }}>
                     {status.name}
                     <div className="flex items-center">
                        <button onClick={() => {
                           setCurrentStatus({ ...status, id: status.id?.toString() })
                           setIsEditStatusOpen(true)
                        }}>
                           <EditIcon size={18} />
                        </button>
                        <button onClick={() => {
                           setCurrentStatus({ ...status, id: status.id?.toString() })
                           setIsDeleteStatusOpen(true)
                        }}>

                           <DeleteIcon size={18} />
                        </button>
                     </div>
                  </div>
               )
            }
         </div>

         {/* Modal para crear estado */}
         <Modal isOpen={isCreateStatusOpen} onClose={() => setIsCreateStatusOpen(false)} title="Crear Estado">
            <CreateEditStatus onSubmit={handleCreateStatus} onCancel={() => setIsCreateStatusOpen(false)} currentStatus={currentStatus} />
         </Modal>

         {/* Modal para editar estado */}
         <Modal isOpen={isEditStatusOpen} onClose={() => setIsEditStatusOpen(false)} title="Editar Estado">
            <CreateEditStatus onSubmit={handleEditStatus} onCancel={() => setIsEditStatusOpen(false)} currentStatus={currentStatus} />
         </Modal>

         {/* Modal para eliminar estado */}
         <Modal isOpen={isDeleteStatusOpen} onClose={() => setIsDeleteStatusOpen(false)} title="Eliminar Estado">
            <DeleteIssueStatus onSubmit={handleDeleteStatus} onCancel={() => setIsDeleteStatusOpen(false)} statusName={currentStatus.name} />
         </Modal>
      </section>
   )
}