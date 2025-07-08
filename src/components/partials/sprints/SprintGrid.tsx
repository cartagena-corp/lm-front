import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { MultiDragProvider } from '@/components/ui/dnd-kit/MultiDragContext'
import { useSprintStore } from '@/lib/store/SprintStore'
import { useBoardStore } from '@/lib/store/BoardStore'
import { useIssueStore } from '@/lib/store/IssueStore'
import CreateTaskForm from '../issues/CreateTaskForm'
import { useAuthStore } from '@/lib/store/AuthStore'
import CreateSprintForm from './CreateSprintForm'
import { PlusIcon, CalendarIcon } from '@/assets/Icon'
import Modal from '@/components/layout/Modal'
import SprintKanbanCard from './SprintKanbanCard'
import { useState } from 'react'
import { sortSprints } from '@/lib/utils/sprint.utils'

export default function SprintGrid() {
   const { createIssue, assignIssueToSprint, removeIssueFromSprint } = useIssueStore()
   const { sprints, createSprint, isLoading } = useSprintStore()
   const { getValidAccessToken } = useAuthStore()
   const { selectedBoard } = useBoardStore()

   const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false)
   const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
   const [selectedIds, setSelectedIds] = useState<string[]>([])
   const [activeId, setActiveId] = useState<string | null>(null)

   const handleCreateTask = async (newTask: any) => {
      const token = await getValidAccessToken()
      if (token) await createIssue(token, newTask)
      setIsCreateTaskOpen(false)
   }

   const handleCreateSprint = async (newSprint: any) => {
      const token = await getValidAccessToken()
      if (token) {
         await createSprint(token, {
            ...newSprint,
            projectId: selectedBoard?.id as string,
            status: newSprint.status
         })
      }
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

         if (targetSprintId === 'null') {
            // Moving to backlog - remove from current sprint
            await removeIssueFromSprint(
               token,
               selectedIds,
               selectedBoard?.id as string
            )
         } else {
            // Moving to a specific sprint
            await assignIssueToSprint(
               token,
               selectedIds,
               targetSprintId,
               selectedBoard?.id as string
            )
         }
      } catch (err) {
         console.error(err)
      } finally {
         setSelectedIds([])
         setActiveId(null)
      }
   }

   if (isLoading && !sprints.length) {
      return (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
               <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                        <div className="h-6 bg-gray-300 rounded w-32"></div>
                        <div className="h-5 bg-gray-300 rounded w-16"></div>
                     </div>
                     <div className="h-6 bg-gray-300 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                     {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="h-20 bg-gray-300 rounded"></div>
                     ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                     <div className="h-4 bg-gray-300 rounded w-24"></div>
                     <div className="h-4 bg-gray-300 rounded w-16"></div>
                  </div>
               </div>
            ))}
         </div>
      )
   }

   return (
      <div className="space-y-6">
         <MultiDragProvider value={{ selectedIds, setSelectedIds }}>
            <DndContext
               collisionDetection={pointerWithin}
               onDragStart={handleDragStart}
               onDragEnd={handleDragEnd}
               modifiers={[restrictToWindowEdges]}
            >
               <div className="flex flex-col gap-4">
                  {sortSprints(sprints).map(sprint => (
                     <SprintKanbanCard
                        key={sprint.id}
                        spr={sprint}
                     />
                  ))}

                  {/* Create Sprint Card */}
                  <div className="bg-white min-w-80 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                     <button
                        onClick={() => setIsCreateSprintOpen(true)}
                        disabled={isLoading}
                        className="w-full h-full min-h-60 p-8 border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 rounded-xl group disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center"
                     >
                        <div className="flex flex-col items-center gap-4">
                           <div className="p-4 bg-gray-100 group-hover:bg-blue-100 rounded-xl transition-colors duration-200 text-gray-400 group-hover:text-blue-600">
                              <CalendarIcon size={32} />
                           </div>
                           <div className="text-center">
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 text-lg">
                                 {isLoading ? 'Creando...' : 'Crear Nuevo Sprint'}
                              </h3>
                              <p className="text-sm text-gray-500 mt-2">
                                 Organiza tus tareas en un nuevo sprint
                              </p>
                           </div>
                        </div>
                     </button>
                  </div>
               </div>

               <DragOverlay dropAnimation={null}>
                  {activeId && (
                     <div className="bg-blue-50 border-2 border-blue-200 border-dashed text-blue-700 cursor-grabbing flex items-center justify-center rounded-xl shadow-lg w-64 h-20 transition-all duration-200">
                        <div className="flex items-center gap-2">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                           </svg>
                           <span className="font-medium text-sm">
                              {selectedIds.length === 1 ? `${selectedIds.length} tarea seleccionada` : `${selectedIds.length} tareas seleccionadas`}
                           </span>
                        </div>
                     </div>
                  )}
               </DragOverlay>
            </DndContext>
         </MultiDragProvider>

         {/* Modals */}
         <Modal
            isOpen={isCreateTaskOpen}
            onClose={() => setIsCreateTaskOpen(false)}
            title=""
            customWidth='max-w-2xl'
         >
            <CreateTaskForm
               onSubmit={handleCreateTask}
               onCancel={() => setIsCreateTaskOpen(false)}
            />
         </Modal>

         <Modal
            isOpen={isCreateSprintOpen}
            onClose={() => setIsCreateSprintOpen(false)}
            title=""
            customWidth="sm:max-w-2xl"
         >
            <CreateSprintForm
               onSubmit={handleCreateSprint}
               onCancel={() => setIsCreateSprintOpen(false)}
               isEdit={false}
            />
         </Modal>
      </div>
   )
}