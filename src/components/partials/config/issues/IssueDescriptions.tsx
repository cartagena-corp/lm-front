import { Trash2, Pencil, Plus, FileText } from "lucide-react"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { useState } from "react"
import CreateEditDescription from "@/components/partials/config/issues/CreateEditDescription"
import { useAuthStore } from "@/lib/store/AuthStore"
import DeleteIssueDescription from "@/components/partials/config/issues/DeleteIssueDescription"
import { useModalStore } from "@/lib/hooks/ModalStore"

interface IssueDescriptionsProps {
   projectId: string
   onClose: () => void
}

export default function IssueDescriptions({ projectId, onClose }: IssueDescriptionsProps) {
   const { projectConfig, isLoading, addIssueDescription, editIssueDescription, deleteIssueDescription } = useConfigStore()
   const { getValidAccessToken } = useAuthStore()

   // Obtener las descripciones desde projectConfig
   const issueDescriptions = projectConfig?.issueDescriptions || []

   const handleCreateDescription = async (data: { name: string }) => {
      const token = await getValidAccessToken()
      if (token) await addIssueDescription(token, projectId, data)
      closeModal()
   }

   const handleEditDescription = async (data: { id: string, name: string }) => {
      const token = await getValidAccessToken()
      if (token) await editIssueDescription(token, projectId, data.id, { name: data.name })
      closeModal()
   }

   const handleDeleteDescription = async (id: string) => {
      const token = await getValidAccessToken()
      if (token) await deleteIssueDescription(token, projectId, id)
      closeModal()
   }

   const { openModal, closeModal } = useModalStore()

   const handleCreateDescriptionModal = () => {
      openModal({
         size: "lg",
         title: "Crear Nueva Descripción",
         desc: "Ingresa el nombre para la nueva descripción de tareas",
         children: <CreateEditDescription onSubmit={handleCreateDescription} onCancel={() => closeModal()} currentDescription={{ name: "" }} />,
         Icon: <Plus size={20} strokeWidth={1.75} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "CREATE"
      })
   }

   const handleUpdateDescriptionModal = ({ id, name }: { id: string, name: string }) => {
      openModal({
         size: "lg",
         title: "Editar Descripción",
         desc: "Modifica el nombre de la descripción",
         children: <CreateEditDescription onSubmit={(data) => handleEditDescription({ id, ...data })} onCancel={() => closeModal()} currentDescription={{ name }} />,
         Icon: <Pencil size={20} strokeWidth={1.75} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "UPDATE"
      })
   }

   const handleDeleteDescriptionModal = ({ id, name }: { id: string, name: string }) => {
      openModal({
         size: "md",
         children: <DeleteIssueDescription onSubmit={() => handleDeleteDescription(id)} onCancel={() => closeModal()} descriptionName={name} />,
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
               <h2 className="font-semibold" style={{ fontSize: 20, letterSpacing: "-0.02em", color: "var(--ds-text)", margin: "0 0 4px" }}>Descripciones de Tareas</h2>
               <p style={{ fontSize: 14, color: "var(--ds-text-secondary)", margin: 0 }}>
                  {issueDescriptions.length} descripciones · gestiona las descripciones disponibles para las tareas
               </p>
            </div>
            <button onClick={() => handleCreateDescriptionModal()}
               className="flex items-center justify-center gap-[7px] transition-colors hover:bg-[var(--primary-800)] bg-[var(--primary-700)] text-sm font-medium flex-shrink-0"
               style={{ height: 36, padding: "0 14px", color: "var(--primary-contrast-fg)", border: "1px solid var(--primary-700)", borderRadius: "var(--radius-md)" }}>
               <Plus size={15} strokeWidth={2.5} />
               <span className="hidden sm:inline">Nueva Descripción</span>
               <span className="sm:hidden">Nueva</span>
            </button>
         </div>

         {/* Content */}
         {isLoading ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
               {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse"><div className="h-[92px]" style={{ background: "var(--gray-alpha-200)", borderRadius: "var(--radius-xl)" }} /></div>
               ))}
            </div>
         ) : issueDescriptions.length === 0 ? (
            <div className="text-center py-12">
               <div className="w-fit mx-auto mb-4 p-3 rounded-full" style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text-muted)" }}>
                  <FileText size={32} strokeWidth={1.5} />
               </div>
               <h4 className="font-medium mb-2" style={{ fontSize: 16, color: "var(--ds-text)" }}>No hay descripciones configuradas</h4>
               <p className="mb-6" style={{ color: "var(--ds-text-muted)" }}>Crea tu primera descripción para comenzar a organizar las tareas</p>
               <button onClick={() => handleCreateDescriptionModal()}
                  className="flex items-center gap-2 px-[14px] transition-colors hover:bg-[var(--primary-800)] bg-[var(--primary-700)] text-sm font-medium mx-auto"
                  style={{ height: 36, color: "var(--primary-contrast-fg)", border: "1px solid var(--primary-700)", borderRadius: "var(--radius-md)" }}>
                  <Plus size={16} strokeWidth={1.5} />
                  Crear Primera Descripción
               </button>
            </div>
         ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
               {issueDescriptions.map((description) => (
                  <div key={description.id} className="lm-card group relative flex flex-col gap-3 p-[18px] transition-shadow duration-150"
                     style={{ background: "var(--ds-card)", border: "1px solid var(--ds-border)", borderRadius: "var(--radius-xl)" }}>
                     <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium min-w-0" style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text)" }}>
                           <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--purple-500)" }} />
                           <span className="truncate">{description.name}</span>
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                           <button onClick={() => handleUpdateDescriptionModal({ id: description.id?.toString(), name: description.name })} className="p-1.5 rounded-md transition-colors duration-200 hover:bg-[var(--gray-alpha-100)]" style={{ color: "var(--ds-text-muted)" }} title="Editar descripción" >
                              <Pencil size={14} strokeWidth={1.5} />
                           </button>
                           <button onClick={() => handleDeleteDescriptionModal({ id: description.id?.toString(), name: description.name })} className="p-1.5 rounded-md transition-colors duration-200 hover:bg-[var(--red-100)] hover:text-[var(--red-900)]" style={{ color: "var(--ds-text-muted)" }} title="Eliminar descripción" >
                              <Trash2 size={14} strokeWidth={1.5} />
                           </button>
                        </div>
                     </div>
                     <p className="text-xs" style={{ color: "var(--ds-text-muted)" }}>Descripción de tarea</p>
                  </div>
               ))}
            </div>
         )}
      </div>
   )
}
