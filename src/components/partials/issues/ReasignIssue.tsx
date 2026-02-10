import { useConfigStore } from "@/lib/store/ConfigStore"
import { useBoardStore } from "@/lib/store/BoardStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { TaskProps, ConfigProjectStatusProps } from "@/lib/types/types"
import { useState, useMemo } from "react"
import { Button, DataSelect } from "@/components/ui/FormUI"
import { AuditIcon, BoardIcon } from "@/assets/Icon"

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

      return participants.map(user => ({
         id: user.id as any,
         name: `${user.firstName} ${user.lastName}`,
         color: '#9333ea' // Purple variant color
      }))
   }, [projectParticipants, selectedBoard?.createdBy, listUsers])

   const [selectedUser, setSelectedUser] = useState<ConfigProjectStatusProps | null>(() => {
      const assignedId = typeof taskObject.assignedId === 'object' ? taskObject.assignedId?.id : taskObject.assignedId
      return allProjectUsers.find(u => u.id === assignedId) || null
   })

   const handleReassign = () => {
      if (selectedUser) {
         onSubmit({
            newUserId: selectedUser.id as unknown as string,
            issueId: taskObject.id as string
         })
      }
   }

   return (
      <div className="space-y-4">
         <main className="flex flex-col gap-4">
            <DataSelect label="Nuevo Usuario Responsable" placeholder="Seleccionar usuario" options={allProjectUsers}
               value={selectedUser} onChange={setSelectedUser} variant="purple" isRequired fullWidth />

            <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3 flex items-center gap-3">
               <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center text-purple-600 shrink-0">
                  <BoardIcon size={18} />
               </div>
               <article className="min-w-0">
                  <h4 className="font-semibold text-gray-900 text-xs truncate">{taskObject.title}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Asignado a: <span className="font-medium text-purple-600">{typeof taskObject.assignedId === 'object' ? `${taskObject.assignedId.firstName} ${taskObject.assignedId.lastName}` : 'Sin asignar'}</span></p>
               </article>
            </div>
         </main>

         <footer className="flex justify-end items-center gap-2">
            <Button onClick={onCancel} size="sm" variant="gray">Cancelar</Button>
            <Button onClick={handleReassign} size="sm" variant="purple" disabled={!selectedUser}>Reasignar Tarea</Button>
         </footer>
      </div>
   )
}