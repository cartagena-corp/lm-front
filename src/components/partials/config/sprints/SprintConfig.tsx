import DeleteSprintStatus from "./DeleteSprintStatus"
import { Trash2, Pencil, Plus, CalendarClock } from "lucide-react"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useConfigStore } from "@/lib/store/ConfigStore"
import CreateEditStatus from "../CreateEditStatus"
import { useModalStore } from "@/lib/hooks/ModalStore"

export default function SprintConfig({ projectId }: { projectId: string }) {
   const { getValidAccessToken } = useAuthStore()
   const { projectConfig, isLoading, addSprintStatus, editSprintStatus, deleteSprintStatus } = useConfigStore()
   const { openModal, closeModal } = useModalStore()

   // Obtener los estados de sprint desde projectConfig
   const sprintStatuses = projectConfig?.sprintStatuses || []

   const handleCreateStatus = async (data: { name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) await addSprintStatus(token, projectId, data)
      closeModal()
   }

   const handleEditStatus = async (data: { id: string, name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) await editSprintStatus(token, projectId, data)
      closeModal()
   }

   const handleDeleteStatus = async (data: { id: string, name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) await deleteSprintStatus(token, projectId, data.id)
      closeModal()
   }

   const handleCreateStatusModal = () => {
      openModal({
         size: "lg",
         title: "Crear Nuevo Estado",
         desc: "Define un nuevo estado para los sprints",
         children: <CreateEditStatus onSubmit={handleCreateStatus} onCancel={() => closeModal()} currentStatus={{ name: "", color: "#000000" }} />,
         Icon: <Plus size={20} strokeWidth={1.75} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "CREATE"
      })
   }

   const handleUpdateStatusModal = ({ id, name, color }: { id: string, name: string, color: string }) => {
      openModal({
         size: "lg",
         title: "Editar Estado",
         desc: "Modifica la información del estado",
         children: <CreateEditStatus onSubmit={(data) => handleEditStatus({ id, ...data })} onCancel={() => closeModal()} currentStatus={{ name, color }} />,
         Icon: <Pencil size={20} strokeWidth={1.75} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "UPDATE"
      })
   }

   const handleDeleteStatusModal = ({ id, name, color }: { id: string, name: string, color: string }) => {
      openModal({
         size: "md",
         children: <DeleteSprintStatus onSubmit={() => handleDeleteStatus({ id, name, color })} onCancel={() => closeModal()} status={{ id, name, color }} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "DELETE"
      })
   }

   return (
      <div className="mt-6">
         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-4">
            <div>
               <h2 className="font-semibold" style={{ fontSize: 20, letterSpacing: "-0.02em", color: "var(--ds-text)", margin: "0 0 4px" }}>Estados de Sprints</h2>
               <p style={{ fontSize: 14, color: "var(--ds-text-secondary)", margin: 0 }}>
                  {sprintStatuses.length} estados · gestiona los estados disponibles para tus sprints
               </p>
            </div>
            <button
               onClick={handleCreateStatusModal}
               className="flex items-center justify-center gap-[7px] transition-colors hover:bg-[var(--primary-800)] bg-[var(--primary-700)] text-sm font-medium flex-shrink-0"
               style={{ height: 36, padding: "0 14px", color: "var(--primary-contrast-fg)", border: "1px solid var(--primary-700)", borderRadius: "var(--radius-md)" }}
            >
               <Plus size={15} strokeWidth={2.5} />
               <span className="hidden sm:inline">Nuevo Estado</span>
               <span className="sm:hidden">Nuevo</span>
            </button>
         </div>

         {/* Content */}
         {isLoading ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
               {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse"><div className="h-[92px]" style={{ background: "var(--gray-alpha-200)", borderRadius: "var(--radius-xl)" }} /></div>
               ))}
            </div>
         ) : sprintStatuses.length === 0 ? (
            <div className="text-center py-12">
               <div className="w-fit mx-auto mb-4 p-3 rounded-full" style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text-muted)" }}>
                  <CalendarClock size={32} strokeWidth={1.5} />
               </div>
               <h4 className="font-medium mb-2" style={{ fontSize: 16, color: "var(--ds-text)" }}>No hay estados configurados</h4>
               <p className="mb-6" style={{ color: "var(--ds-text-muted)" }}>Crea tu primer estado para comenzar a organizar tus sprints</p>
               <button
                  onClick={handleCreateStatusModal}
                  className="flex items-center gap-2 px-[14px] transition-colors hover:bg-[var(--primary-800)] bg-[var(--primary-700)] text-sm font-medium mx-auto"
                  style={{ height: 36, color: "var(--primary-contrast-fg)", border: "1px solid var(--primary-700)", borderRadius: "var(--radius-md)" }}
               >
                  <Plus size={16} strokeWidth={1.5} />
                  Crear Primer Estado
               </button>
            </div>
         ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
               {sprintStatuses.map((status) => (
                  <div key={status.id} className="lm-card group relative flex flex-col gap-3 p-[18px] transition-shadow duration-150"
                     style={{ background: "var(--ds-card)", border: "1px solid var(--ds-border)", borderRadius: "var(--radius-xl)" }}>
                     <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium min-w-0" style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text)" }}>
                           <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }} />
                           <span className="truncate">{status.name}</span>
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                           <button
                              onClick={() => handleUpdateStatusModal({ id: status.id?.toString() || "", name: status.name, color: status.color })}
                              className="p-1.5 rounded-md transition-colors duration-200 hover:bg-[var(--gray-alpha-100)]" style={{ color: "var(--ds-text-muted)" }}
                              title="Editar estado"
                           >
                              <Pencil size={14} strokeWidth={1.5} />
                           </button>
                           <button
                              onClick={() => handleDeleteStatusModal({ id: status.id?.toString() || "", name: status.name, color: status.color })}
                              className="p-1.5 rounded-md transition-colors duration-200 hover:bg-[var(--red-100)] hover:text-[var(--red-900)]" style={{ color: "var(--ds-text-muted)" }}
                              title="Eliminar estado"
                           >
                              <Trash2 size={14} strokeWidth={1.5} />
                           </button>
                        </div>
                     </div>
                     <p className="text-xs" style={{ color: "var(--ds-text-muted)" }}>Estado de sprint</p>
                  </div>
               ))}
            </div>
         )}
      </div>
   )
}
