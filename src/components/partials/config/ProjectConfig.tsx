import DeleteProjectStatus from "./boards/DeleteProjectStatus"
import { DeleteIcon, EditIcon, PlusIcon } from "@/assets/Icon"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import CreateEditStatus from "./CreateEditStatus"
import Modal from "@/components/layout/Modal"
import { useState } from "react"

export default function ProjectConfig() {
   const [isCreateStatusOpen, setIsCreateStatusOpen] = useState(false)
   const [isEditStatusOpen, setIsEditStatusOpen] = useState(false)
   const [isDeleteStatusOpen, setIsDeleteStatusOpen] = useState(false)
   const [currentStatus, setCurrentStatus] = useState<{ id?: string, name: string, color: string }>({ name: "", color: "#000000" })
   const { getValidAccessToken } = useAuthStore()
   const { projectStatus, addProjectStatus, editProjectStatus, deleteProjectStatus } = useConfigStore()

   const handleCreateStatus = async (data: { name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) await addProjectStatus(token, data)
      setIsCreateStatusOpen(false)
   }

   const handleEditStatus = async (data: { name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) editProjectStatus(token, { id: currentStatus.id as string, ...data })
      setIsEditStatusOpen(false)
   }

   const handleDeleteStatus = async () => {
      const token = await getValidAccessToken()
      if (token) deleteProjectStatus(token, currentStatus.id as string)
      setIsDeleteStatusOpen(false)
   }

   return (
      <>
         <section className="bg-white flex flex-col gap-4 rounded-md p-6">
            <div className="flex justify-between items-center gap-2">
               <h6 className="text-lg font-semibold">Estados de los proyectos</h6>
               <button onClick={() => {
                  setCurrentStatus({ name: "", color: "#000000" })
                  setIsCreateStatusOpen(true)
               }} className="bg-blue-600 hover:bg-blue-800 text-white duration-150 flex items-center rounded-md gap-2 py-2 px-4">
                  <PlusIcon size={18} stroke={2.5} />
                  Crear estado
               </button>
            </div>
            <div className="grid grid-cols-6 items-center text-sm gap-6">
               {
                  projectStatus.map(ps =>
                     <div key={ps.id} className="border-black/15 rounded-full border flex items-center justify-between px-2 py-1"
                        style={{ backgroundColor: `${ps.color}15`, color: ps.color }}>
                        {ps.name}
                        <div className="flex items-center">
                           <button onClick={() => {
                              setCurrentStatus({ ...ps, id: ps.id?.toString() })
                              setIsEditStatusOpen(true)
                           }}>
                              <EditIcon size={18} />
                           </button>
                           <button onClick={() => {
                              setCurrentStatus({ ...ps, id: ps.id?.toString() })
                              setIsDeleteStatusOpen(true)
                           }}>

                              <DeleteIcon size={18} />
                           </button>
                        </div>
                     </div>
                  )
               }
            </div>
         </section>

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
            <DeleteProjectStatus onSubmit={handleDeleteStatus} onCancel={() => setIsDeleteStatusOpen(false)} statusName={currentStatus.name} />
         </Modal>
      </>
   )
}