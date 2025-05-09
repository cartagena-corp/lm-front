import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { MultiDragProvider } from '@/components/ui/dnd-kit/MultiDragContext'
import { useSprintStore } from '@/lib/store/SprintStore'
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers'
import { useBoardStore } from '@/lib/store/BoardStore'
import { useIssueStore } from '@/lib/store/IssueStore'
import CreateTaskForm from '../issues/CreateTaskForm'
import { useAuthStore } from '@/lib/store/AuthStore'
import CreateSprintForm from './CreateSprintForm'
import Modal from '../../layout/Modal'
import IssuesRow from './IssuesRow'
import { useState } from 'react'

export default function SprintList() {
   const { createTask, asignTaskToSprint } = useIssueStore()
   const { sprints, createSprint } = useSprintStore()
   const { getValidAccessToken } = useAuthStore()
   const { selectedBoard } = useBoardStore()

   const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false)
   const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)

   const [selectedIds, setSelectedIds] = useState<string[]>([])
   const [activeId, setActiveId] = useState<string | null>(null)

   const handleCreateTask = async (newTask: any) => {
      const token = await getValidAccessToken()
      if (token) await createTask(token, newTask)
      setIsCreateTaskOpen(false)
   }

   const handleCreateSprint = async (newSprint: any) => {
      const token = await getValidAccessToken()
      if (token)
         await createSprint(token, {
            ...newSprint,
            projectId: selectedBoard?.id as string,
            status: newSprint.status
         })
      setIsCreateSprintOpen(false)
   }

   const handleDragStart = (event: DragStartEvent) => {
      const { active, activatorEvent } = event
      const id = active.id as string
      const shiftKey = (activatorEvent as PointerEvent).shiftKey
      const metaKey = (activatorEvent as PointerEvent).metaKey

      if (shiftKey || metaKey) {
         setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
         )
      } else if (!selectedIds.includes(id)) {
         setSelectedIds([id])
      }
      setActiveId(id)
   }

   const handleDragEnd = async (event: DragEndEvent) => {
      const { over } = event
      if (!over) {
         setSelectedIds([])
         setActiveId(null)
         return
      }

      const targetSprintId = over.id as string
      if (!selectedIds.length) {
         setActiveId(null)
         return
      }

      const alreadyThere = sprints
         .find(s => s.id === targetSprintId)
         ?.tasks?.content.some(t => selectedIds.includes(t.id as string))

      if (alreadyThere) {
         setSelectedIds([])
         setActiveId(null)
         return
      }

      try {
         const token = await getValidAccessToken()
         if (!token) return
         await asignTaskToSprint(
            token,
            selectedIds,
            targetSprintId,
            selectedBoard?.id as string
         )
      } catch (err) {
         console.error(err)
      } finally {
         setSelectedIds([])
         setActiveId(null)
      }
   }

   return (
      <MultiDragProvider value={{ selectedIds, setSelectedIds }}>
         <DndContext
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
         >
            {
               sprints.map(spr => (
                  <IssuesRow
                     key={spr.id}
                     spr={spr}
                     isOverlay={false}
                     setIsOpen={setIsCreateTaskOpen}
                  />
               ))
            }

            <DragOverlay dropAnimation={null}>
               {
                  activeId && (
                     <IssuesRow
                        spr={sprints.find(s => s.id === activeId)!}
                        isOverlay={true}
                        setIsOpen={setIsCreateTaskOpen}
                     />
                  )
               }
            </DragOverlay>
         </DndContext>

         <button
            onClick={() => setIsCreateSprintOpen(true)}
            className="w-full border-dashed border text-black/20 hover:border-black/75 hover:text-black/75 duration-150 rounded-md flex flex-col items-center py-6"
         >
            Crear Nuevo Sprint
         </button>

         <Modal
            isOpen={isCreateTaskOpen}
            onClose={() => setIsCreateTaskOpen(false)}
            title="Crear nueva tarea"
         >
            <CreateTaskForm
               onSubmit={handleCreateTask}
               onCancel={() => setIsCreateTaskOpen(false)}
            />
         </Modal>

         <Modal
            isOpen={isCreateSprintOpen}
            onClose={() => setIsCreateSprintOpen(false)}
            title="Crear nuevo sprint"
         >
            <CreateSprintForm
               onSubmit={handleCreateSprint}
               onCancel={() => setIsCreateSprintOpen(false)}
            />
         </Modal>
      </MultiDragProvider>
   )
}