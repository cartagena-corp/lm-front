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
         <section style={{ background: "var(--ds-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-border)" }}>
            {/* Header */}
            <div className="p-5" style={{ borderBottom: "1px solid var(--ds-border)" }}>
               <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                     <div className="p-2 flex" style={{ borderRadius: "var(--radius-md)", background: "var(--blue-200)", color: "var(--blue-900)" }}>
                        <ConfigIcon size={22} />
                     </div>
                     <div className="flex flex-col">
                        <h3 className="font-semibold" style={{ fontSize: 16, color: "var(--ds-text)" }}>Estados de Proyectos</h3>
                        <p className="text-sm" style={{ color: "var(--ds-text-muted)" }}>Gestiona los estados disponibles para tus proyectos</p>
                     </div>
                  </div>
                  <button className="flex items-center gap-2 px-[12px] transition-opacity hover:opacity-90 text-sm font-medium flex-shrink-0"
                     style={{ height: 32, color: "var(--ds-contrast-inverse)", background: "var(--ds-text)", border: "1px solid var(--ds-text)", borderRadius: "var(--radius-md)" }}
                     onClick={() => handleCreateStateModal()} >
                     <PlusIcon size={14} stroke={2.5} />
                     <span className="hidden sm:inline">Nuevo Estado</span>
                  </button>
               </div>
            </div>

            {/* Content */}
            <div className="p-5">
               {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                     {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse"><div className="h-12" style={{ background: "var(--gray-alpha-200)", borderRadius: "var(--radius-lg)" }} /></div>)}
                  </div>
               ) : projectStatus.length === 0 ? (
                  <div className="text-center py-12">
                     <div className="w-fit mx-auto mb-4 p-3 rounded-full" style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text-muted)" }}>
                        <ConfigIcon size={32} />
                     </div>
                     <h4 className="font-medium mb-2" style={{ fontSize: 16, color: "var(--ds-text)" }}>No hay estados configurados</h4>
                     <p className="mb-6" style={{ color: "var(--ds-text-muted)" }}>Crea tu primer estado para comenzar a organizar tus proyectos</p>
                     <button className="flex items-center gap-2 px-[14px] transition-opacity hover:opacity-90 text-sm font-medium mx-auto"
                        style={{ height: 36, color: "var(--ds-contrast-inverse)", background: "var(--ds-text)", border: "1px solid var(--ds-text)", borderRadius: "var(--radius-md)" }}
                        onClick={() => handleCreateStateModal()} >
                        <PlusIcon size={16} />
                        Crear Primer Estado
                     </button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                     {projectStatus.map((status) => (
                        <div key={status.id} className="lm-card group relative p-[14px] transition-shadow duration-150"
                           style={{ background: "var(--ds-card)", border: "1px solid var(--ds-border)", borderRadius: "var(--radius-lg)" }} >
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                 <div className="w-3 h-3 flex-shrink-0" style={{ backgroundColor: status.color, borderRadius: "var(--radius-sm)" }} />
                                 <span className="font-medium text-sm truncate" style={{ color: "var(--ds-text)" }}>
                                    {status.name}
                                 </span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                 <button className="p-1.5 rounded-md transition-colors duration-200 hover:bg-[var(--gray-alpha-100)]" style={{ color: "var(--ds-text-muted)" }}
                                    onClick={() => handleUpdateStateModal({ ...status, id: status.id?.toString() })} title="Editar estado">
                                    <EditIcon size={14} />
                                 </button>
                                 <button className="p-1.5 rounded-md transition-colors duration-200 hover:bg-red-50 hover:text-red-600" style={{ color: "var(--ds-text-muted)" }}
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