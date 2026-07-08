import DeleteProjectStatus from "./DeleteProjectStatus"
import { Trash2, Pencil, Plus, Settings, LayoutDashboard } from "lucide-react"
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
         Icon: <LayoutDashboard size={20} strokeWidth={1.75} />,
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
         Icon: <Pencil size={20} strokeWidth={1.75} />,
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
      <div>
         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-4">
            <div>
               <h2 className="font-semibold" style={{ fontSize: 20, letterSpacing: "-0.02em", color: "var(--ds-text)", margin: "0 0 4px" }}>Estados de Proyectos</h2>
               <p style={{ fontSize: 14, color: "var(--ds-text-secondary)", margin: 0 }}>
                  {projectStatus.length} estados · gestiona los estados disponibles para tus proyectos
               </p>
            </div>
            <button className="flex items-center justify-center gap-[7px] transition-colors hover:bg-[var(--primary-800)] bg-[var(--primary-700)] text-sm font-medium flex-shrink-0"
               style={{ height: 36, padding: "0 14px", color: "var(--primary-contrast-fg)", border: "1px solid var(--primary-700)", borderRadius: "var(--radius-md)" }}
               onClick={() => handleCreateStateModal()} >
               <Plus size={15} strokeWidth={2.5} />
               <span className="hidden sm:inline">Nuevo Estado</span>
               <span className="sm:hidden">Nuevo</span>
            </button>
         </div>

         {/* Content */}
         {isLoading ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
               {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse"><div className="h-[92px]" style={{ background: "var(--gray-alpha-200)", borderRadius: "var(--radius-xl)" }} /></div>)}
            </div>
         ) : projectStatus.length === 0 ? (
            <div className="text-center py-12">
               <div className="w-fit mx-auto mb-4 p-3 rounded-full" style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text-muted)" }}>
                  <Settings size={32} strokeWidth={1.5} />
               </div>
               <h4 className="font-medium mb-2" style={{ fontSize: 16, color: "var(--ds-text)" }}>No hay estados configurados</h4>
               <p className="mb-6" style={{ color: "var(--ds-text-muted)" }}>Crea tu primer estado para comenzar a organizar tus proyectos</p>
               <button className="flex items-center gap-2 px-[14px] transition-colors hover:bg-[var(--primary-800)] bg-[var(--primary-700)] text-sm font-medium mx-auto"
                  style={{ height: 36, color: "var(--primary-contrast-fg)", border: "1px solid var(--primary-700)", borderRadius: "var(--radius-md)" }}
                  onClick={() => handleCreateStateModal()} >
                  <Plus size={16} strokeWidth={1.5} />
                  Crear Primer Estado
               </button>
            </div>
         ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
               {projectStatus.map((status) => (
                  <div key={status.id} className="lm-card group relative flex flex-col gap-3 p-[18px] transition-shadow duration-150"
                     style={{ background: "var(--ds-card)", border: "1px solid var(--ds-border)", borderRadius: "var(--radius-xl)" }} >
                     <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium min-w-0" style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text)" }}>
                           <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }} />
                           <span className="truncate">{status.name}</span>
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                           <button className="p-1.5 rounded-md transition-colors duration-200 hover:bg-[var(--gray-alpha-100)]" style={{ color: "var(--ds-text-muted)" }}
                              onClick={() => handleUpdateStateModal({ ...status, id: status.id?.toString() })} title="Editar estado">
                              <Pencil size={14} strokeWidth={1.5} />
                           </button>
                           <button className="p-1.5 rounded-md transition-colors duration-200 hover:bg-[var(--red-100)] hover:text-[var(--red-900)]" style={{ color: "var(--ds-text-muted)" }}
                              onClick={() => handleDeleteStateModal({ ...status, id: status.id?.toString() })} title="Eliminar estado"
                           >
                              <Trash2 size={14} strokeWidth={1.5} />
                           </button>
                        </div>
                     </div>
                     <p className="text-xs" style={{ color: "var(--ds-text-muted)" }}>Estado de proyecto</p>
                  </div>
               ))}
            </div>
         )}
      </div>
   )
}