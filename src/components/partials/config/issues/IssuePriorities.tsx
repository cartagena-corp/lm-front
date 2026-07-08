import { Trash2, Pencil, Plus, Zap } from "lucide-react"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import CreateEditPriorities from "../CreateEditPriorities"
import DeleteIssuePriorities from "./DeleteIssuePriorities"
import { useModalStore } from "@/lib/hooks/ModalStore"

interface IssueConfigProps {
   projectId: string
   onClose: () => void
}

export default function IssuePriorities({ projectId, onClose }: IssueConfigProps) {
   const { projectConfig, addIssuePriorities, editIssuePriorities, deleteIssuePriorities } = useConfigStore()
   const { getValidAccessToken } = useAuthStore()

   const handleCreatePriorities = async (data: { name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) addIssuePriorities(token, projectId, data)
      closeModal()
   }

   const handleEditPriorities = async (data: { id: string, name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) editIssuePriorities(token, projectId, data)
      closeModal()
   }

   const handleDeletePriorities = async (data: { id: string, name: string, color: string }) => {
      const token = await getValidAccessToken()
      if (token) deleteIssuePriorities(token, projectId, data.id)
      closeModal()
   }

   const { openModal, closeModal } = useModalStore()

   const handleCreatePrioritiesModal = () => {
      const currentPriorityVar = { name: "", color: "#000000" }
      openModal({
         size: "lg",
         title: "Crear Prioridad",
         desc: "Define una nueva prioridad para las tareas",
         children: <CreateEditPriorities onSubmit={handleCreatePriorities} onCancel={() => closeModal()} currentPriorities={currentPriorityVar} />,
         Icon: <Plus size={20} strokeWidth={1.75} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "CREATE"
      })
   }

   const handleUpdatePrioritiesModal = ({ id, name, color }: { id: string, name: string, color: string }) => {
      const currentPriorityVar = { name, color }
      openModal({
         size: "lg",
         title: "Editar Prioridad",
         desc: "Modifica la información de la prioridad",
         children: <CreateEditPriorities onSubmit={(data) => handleEditPriorities({ id, ...data })} onCancel={() => closeModal()} currentPriorities={currentPriorityVar} />,
         Icon: <Pencil size={20} strokeWidth={1.75} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "UPDATE"
      })
   }

   const handleDeletePrioritiesModal = ({ id, name, color }: { id: string, name: string, color: string }) => {
      const currentPriorityVar = { id, name, color }
      openModal({
         size: "md",
         children: <DeleteIssuePriorities onSubmit={() => handleDeletePriorities(currentPriorityVar)} onCancel={() => closeModal()} prioritiesName={currentPriorityVar.name} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "DELETE"
      })
   }

   const issuePriorities = projectConfig?.issuePriorities || []

   return (
      <div className="mt-6">
         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-4">
            <div>
               <h2 className="font-semibold" style={{ fontSize: 20, letterSpacing: "-0.02em", color: "var(--ds-text)", margin: "0 0 4px" }}>Prioridades de Tareas</h2>
               <p style={{ fontSize: 14, color: "var(--ds-text-secondary)", margin: 0 }}>
                  {issuePriorities.length} prioridades · gestiona las prioridades disponibles para las tareas
               </p>
            </div>
            <button onClick={() => handleCreatePrioritiesModal()}
               className="flex items-center justify-center gap-[7px] transition-colors hover:bg-[var(--primary-800)] bg-[var(--primary-700)] text-sm font-medium flex-shrink-0"
               style={{ height: 36, padding: "0 14px", color: "var(--primary-contrast-fg)", border: "1px solid var(--primary-700)", borderRadius: "var(--radius-md)" }}>
               <Plus size={15} strokeWidth={2.5} />
               <span className="hidden sm:inline">Nueva Prioridad</span>
               <span className="sm:hidden">Nueva</span>
            </button>
         </div>

         {/* Content */}
         {issuePriorities.length === 0 ? (
            <div className="text-center py-12">
               <div className="w-fit mx-auto mb-4 p-3 rounded-full" style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text-muted)" }}>
                  <Zap size={32} strokeWidth={1.5} />
               </div>
               <h4 className="font-medium mb-2" style={{ fontSize: 16, color: "var(--ds-text)" }}>No hay prioridades configuradas</h4>
               <p className="mb-6" style={{ color: "var(--ds-text-muted)" }}>Crea tu primera prioridad para comenzar a jerarquizar las tareas</p>
               <button onClick={() => handleCreatePrioritiesModal()}
                  className="flex items-center gap-2 px-[14px] transition-colors hover:bg-[var(--primary-800)] bg-[var(--primary-700)] text-sm font-medium mx-auto"
                  style={{ height: 36, color: "var(--primary-contrast-fg)", border: "1px solid var(--primary-700)", borderRadius: "var(--radius-md)" }}>
                  <Plus size={16} strokeWidth={1.5} />
                  Crear Primera Prioridad
               </button>
            </div>
         ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
               {issuePriorities.map((priority) =>
                  <div key={priority.id} className="lm-card group relative flex flex-col gap-3 p-[18px] transition-shadow duration-150"
                     style={{ background: "var(--ds-card)", border: "1px solid var(--ds-border)", borderRadius: "var(--radius-xl)" }}>
                     <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium min-w-0" style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text)" }}>
                           <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: priority.color }} />
                           <span className="truncate">{priority.name}</span>
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                           <button onClick={() => handleUpdatePrioritiesModal({ id: priority.id?.toString(), name: priority.name, color: priority.color })} className="p-1.5 rounded-md transition-colors duration-200 hover:bg-[var(--gray-alpha-100)]" style={{ color: "var(--ds-text-muted)" }} title="Editar prioridad" >
                              <Pencil size={14} strokeWidth={1.5} />
                           </button>
                           <button onClick={() => handleDeletePrioritiesModal({ id: priority.id?.toString(), name: priority.name, color: priority.color })} className="p-1.5 rounded-md transition-colors duration-200 hover:bg-[var(--red-100)] hover:text-[var(--red-900)]" style={{ color: "var(--ds-text-muted)" }} title="Eliminar prioridad" >
                              <Trash2 size={14} strokeWidth={1.5} />
                           </button>
                        </div>
                     </div>
                     <p className="text-xs" style={{ color: "var(--ds-text-muted)" }}>Prioridad de tarea</p>
                  </div>
               )}
            </div>
         )}
      </div>
   )
}