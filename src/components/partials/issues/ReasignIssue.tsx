import { useConfigStore } from "@/lib/store/ConfigStore"
import { useBoardStore } from "@/lib/store/BoardStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { TaskProps } from "@/lib/types/types"
import { useState, useMemo } from "react"
import CustomSelect from "@/components/ui/CustomSelect"
import { FileText } from "lucide-react"

interface ReasignIssueFormProps {
   onSubmit: ({ newUserId, issueId }: { newUserId: string, issueId: string }) => void
   onCancel: () => void
   taskObject: TaskProps
}

export default function ReasignIssue({ onSubmit, onCancel, taskObject }: ReasignIssueFormProps) {
   const { projectParticipants } = useConfigStore()
   const { selectedBoard } = useBoardStore()
   const { listUsers } = useAuthStore()

   // Combine project participants with the project creator (avoid duplicates)
   const allProjectUsers = useMemo(() => {
      const participants = [...projectParticipants]

      // Add project creator if not already in participants
      if (selectedBoard?.createdBy && !participants.some(p => p.id === selectedBoard.createdBy?.id)) {
         // Find the creator in the full user list to get complete information including email
         const creatorFromUserList = listUsers.find(user => user.id === selectedBoard.createdBy?.id)

         participants.push({
            id: selectedBoard.createdBy.id,
            firstName: selectedBoard.createdBy.firstName,
            lastName: selectedBoard.createdBy.lastName,
            email: creatorFromUserList?.email || '', // Get email from full user list
            picture: selectedBoard.createdBy.picture
         })
      }

      return participants
   }, [projectParticipants, selectedBoard?.createdBy, listUsers])

   const [userSelected, setUserSelected] = useState(allProjectUsers.find(user => typeof taskObject.assignedId !== 'string' && user.id === taskObject.assignedId?.id))

   return (
      <div>
         {/* Content */}
         <div className="p-6">
            <div className="space-y-4">
               {/* Current Task Info */}
               <div className="rounded-md p-4" style={{ background: "var(--gray-alpha-100)" }}>
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: "var(--purple-100)" }}>
                        <FileText size={20} strokeWidth={1.5} style={{ color: "var(--purple-900)" }} />
                     </div>
                     <div className="flex-1">
                        <h4 className="font-medium text-sm" style={{ color: "var(--ds-text)" }}>{taskObject.title}</h4>
                        <p className="text-xs mt-1" style={{ color: "var(--ds-text-muted)" }}>
                           Asignado actualmente a: {' '}
                           <span className="font-medium">
                              {typeof taskObject.assignedId === 'object' && taskObject.assignedId
                                 ? `${taskObject.assignedId.firstName} ${taskObject.assignedId.lastName}`
                                 : 'Sin asignar'
                              }
                           </span>
                        </p>
                     </div>
                  </div>
               </div>

               {/* User Selection */}
               <div className="space-y-2">
                  <label className="text-[13px] font-medium" style={{ color: "var(--ds-text-secondary)" }}>
                     Nuevo usuario responsable
                     <span className='ml-1' style={{ color: "var(--red-700)" }}>*</span>
                  </label>
                  <CustomSelect
                     value={userSelected?.id ?? null}
                     onChange={(value) => {
                        // Campo requerido: ignorar la opción "limpiar" del select.
                        const user = allProjectUsers.find(u => u.id === value)
                        if (user) setUserSelected(user)
                     }}
                     options={allProjectUsers.map(user => ({
                        value: user.id,
                        label: user.firstName || user.lastName ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : (user.email || 'Sin nombre'),
                        image: user.picture || undefined,
                        subtitle: user.email
                     }))}
                     placeholder="Seleccionar usuario"
                     variant="user"
                  />
               </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
               <button
                  className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                  style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                  type="button"
                  onClick={() => onCancel()}>
                  Cancelar
               </button>
               <button
                  disabled={!userSelected}
                  className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: "var(--primary-contrast-fg)" }}
                  onClick={() => onSubmit({ newUserId: userSelected?.id as string, issueId: taskObject.id as string })}
                  type="button">
                  Reasignar Tarea
               </button>
            </div>
         </div>
      </div>
   )
}
