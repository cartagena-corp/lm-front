import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, pointerWithin, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { MultiDragProvider } from '@/components/ui/dnd-kit/MultiDragContext'
import { useSprintStore } from '@/lib/store/SprintStore'
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers'
import { useBoardStore } from '@/lib/store/BoardStore'
import { useIssueStore } from '@/lib/store/IssueStore'
import CreateTaskForm from '../issues/CreateTaskForm'
import { useAuthStore } from '@/lib/store/AuthStore'
import CreateSprintForm from './CreateSprintForm'
import { PlusIcon, CalendarIcon } from '@/assets/Icon'
import Modal from '../../layout/Modal'
import IssuesRow from './IssuesRow'
import { useState } from 'react'
import { sortSprints } from '@/lib/utils/sprint.utils'
import { toast } from 'react-hot-toast'
import CreateWithIA from '../issues/CreateWithIA'

export default function SprintList() {
   const { createIssue, assignIssueToSprint, removeIssueFromSprint } = useIssueStore()
   const { sprints, createSprint, isLoading } = useSprintStore()
   const { getValidAccessToken } = useAuthStore()
   const { selectedBoard } = useBoardStore()

   const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false)
   const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
   const [isCreateWithIAOpen, setIsCreateWithIAOpen] = useState(false)

   const [selectedIds, setSelectedIds] = useState<string[]>([])
   const [activeId, setActiveId] = useState<string | null>(null)

   // Estado optimista para sprints
   const [optimisticSprints, setOptimisticSprints] = useState<any[] | null>(null)
   const [optimisticTimeout, setOptimisticTimeout] = useState<NodeJS.Timeout | null>(null)

   // Sensores personalizados para drag igual que SprintKanbanCard
   const sensors = useSensors(
      useSensor(PointerSensor, {
         activationConstraint: {
            distance: 3, // El drag se activa después de mover 3 píxeles
         },
      })
   )

   const handleCreateTask = async (newTask: any, filesMap?: Map<string, File[]>) => {
      const token = await getValidAccessToken()
      if (token) await createIssue(token, newTask, filesMap)
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

   const handleCreateWithIA = async (detectedTasks: any) => {
      const token = await getValidAccessToken()
      if (!token) return;

      const toastId = toast.loading('Creando tareas...');

      try {
         // Crear cada tarea detectada
         for (const task of detectedTasks) {
            await createIssue(token, {
               ...task,
               projectId: selectedBoard?.id,
               sprintId: null, // Las tareas se crean en el backlog por defecto
               descriptions: task.descriptionsDTO, // Mapear descriptionsDTO a descriptions
               type: 1, // Tipo por defecto
               priority: 1, // Prioridad por defecto
               status: 1, // Estado por defecto
               estimatedTime: 0 // Tiempo estimado por defecto
            });
         }

         toast.success(`${detectedTasks.length} tareas creadas exitosamente`, { id: toastId });
      } catch (error) {
         console.error('Error al crear las tareas:', error);
         toast.error('Error al crear las tareas', { id: toastId });
      } finally {
         setIsCreateWithIAOpen(false);
      }
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

      // --- OPTIMISTIC UPDATE ---
      // Guardar copia previa para revertir si falla
      const prevSprints = sprints.map(s => ({ ...s, tasks: { ...s.tasks, content: [...(s.tasks?.content || [])] } }))
      let newSprints = sprints.map(s => ({ ...s, tasks: { ...s.tasks, content: [...(s.tasks?.content || [])] } }))

      // Remover las issues seleccionadas de todos los sprints
      newSprints = newSprints.map(sprint => ({
         ...sprint,
         tasks: {
            ...sprint.tasks,
            content: sprint.tasks?.content?.filter((t: any) => !selectedIds.includes(t.id)) || []
         }
      }))

      if (targetSprintId !== 'null') {
         // Agregar las issues seleccionadas al sprint destino
         const targetSprintIdx = newSprints.findIndex(s => s.id === targetSprintId)
         if (targetSprintIdx !== -1) {
            const selectedTasks = prevSprints
               .flatMap(s => s.tasks?.content?.filter((t: any) => selectedIds.includes(t.id)) || [])
               .map((t: any) => ({ ...t, sprintId: targetSprintId }))
            newSprints[targetSprintIdx] = {
               ...newSprints[targetSprintIdx],
               tasks: {
                  ...newSprints[targetSprintIdx].tasks,
                  content: [...selectedTasks, ...(newSprints[targetSprintIdx].tasks?.content || [])]
               }
            }
         }
      } else {
         // Si es backlog, poner sprintId: null en los issues seleccionados y agregarlos al backlog visual
         // 1. Buscar las tasks seleccionadas en prevSprints
         const selectedTasks = prevSprints
            .flatMap(s => s.tasks?.content?.filter((t: any) => selectedIds.includes(t.id)) || [])
            .map((t: any) => ({ ...t, sprintId: null }))
         // 2. Buscar si ya existe un sprint backlog en newSprints
         let backlogIdx = newSprints.findIndex(s => s.id === 'null')
         if (backlogIdx === -1) {
            // Si no existe, crear uno
            newSprints = [
               {
                  id: 'null',
                  projectId: selectedBoard?.id || '',
                  title: 'Backlog',
                  active: false,
                  status: 0,
                  goal: '',
                  startDate: '',
                  endDate: '',
                  tasks: { content: selectedTasks }
               },
               ...newSprints
            ]
         } else {
            // Si existe, agregar las tasks al backlog
            newSprints[backlogIdx] = {
               ...newSprints[backlogIdx],
               tasks: {
                  ...newSprints[backlogIdx].tasks,
                  content: [...selectedTasks, ...(newSprints[backlogIdx].tasks?.content || [])]
               }
            }
         }
      }

      setOptimisticSprints(newSprints)

      // --- FIN OPTIMISTIC ---

      const toastId = toast.loading('Moviendo tareas...')

      try {
         const token = await getValidAccessToken()
         if (!token) return
         if (targetSprintId === 'null') {
            await removeIssueFromSprint(
               token,
               selectedIds,
               selectedBoard?.id as string
            )
         } else {
            await assignIssueToSprint(
               token,
               selectedIds,
               targetSprintId,
               selectedBoard?.id as string
            )
         }
         setOptimisticSprints(null)
         toast.success('Tareas movidas exitosamente', { id: toastId })
      } catch (err) {
         setOptimisticSprints(prevSprints)
         toast.error('No se pudo mover la tarea. Intenta de nuevo.', { id: toastId })
         if (optimisticTimeout) clearTimeout(optimisticTimeout)
         setOptimisticTimeout(setTimeout(() => setOptimisticSprints(null), 2000))
      } finally {
         setSelectedIds([])
         setActiveId(null)
      }
   }

   if (isLoading && !sprints.length) {
      return (
         <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
               <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                  <div className="flex justify-between items-center mb-4">
                     <div className="flex items-center gap-4">
                        <div className="h-6 bg-gray-300 rounded w-32"></div>
                        <div className="h-5 bg-gray-300 rounded w-20"></div>
                     </div>
                     <div className="h-8 bg-gray-300 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                     {Array.from({ length: 2 }).map((_, j) => (
                        <div key={j} className="h-12 bg-gray-300 rounded"></div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      )
   }

   // Usar sprints optimistas si existen, si no, los del store
   const sprintsToRender = optimisticSprints || sprints

   return (
      <div className="space-y-6">
         <MultiDragProvider value={{ selectedIds, setSelectedIds }}>
            <DndContext
               sensors={sensors}
               collisionDetection={pointerWithin}
               onDragStart={handleDragStart}
               onDragEnd={handleDragEnd}
               modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            >
               {sortSprints(sprintsToRender).map(spr => (
                  <IssuesRow
                     key={spr.id}
                     spr={spr}
                     isOverlay={false}
                     setIsOpen={setIsCreateTaskOpen}
                     setIsCreateWithIAOpen={setIsCreateWithIAOpen}
                  />
               ))}

               <DragOverlay dropAnimation={null}>
                  {activeId && (
                     <div className="bg-blue-50 border-2 border-blue-200 border-dashed text-blue-700 cursor-grabbing flex items-center justify-center rounded-xl shadow-lg w-full h-20 transition-all duration-200">
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

         {/* Create Sprint Button */}
         <div className="bg-white rounded-xl shadow-sm  overflow-hidden">
            <button
               onClick={() => setIsCreateSprintOpen(true)}
               disabled={isLoading}
               className="w-full p-8 border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 rounded-xl group disabled:opacity-50 disabled:cursor-not-allowed"
            >
               <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-gray-100 group-hover:bg-blue-100 rounded-xl transition-colors duration-200 text-gray-400 group-hover:text-blue-600">
                     <CalendarIcon size={24} />
                  </div>
                  <div className="text-center">
                     <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                        {isLoading ? 'Creando...' : 'Crear Nuevo Sprint'}
                     </h3>
                     <p className="text-sm text-gray-500 mt-1">
                        Organiza tus tareas en un nuevo sprint
                     </p>
                  </div>
               </div>
            </button>
         </div>

         {/* Modals */}
         <Modal
            isOpen={isCreateTaskOpen}
            onClose={() => setIsCreateTaskOpen(false)}
            title=""
            customWidth='max-w-2xl'
            showCloseButton={false}
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
            showCloseButton={false}
         >
            <CreateSprintForm
               onSubmit={handleCreateSprint}
               onCancel={() => setIsCreateSprintOpen(false)}
               isEdit={false}
            />
         </Modal>

         <Modal
            isOpen={isCreateWithIAOpen}
            onClose={() => setIsCreateWithIAOpen(false)}
            title=""
            customWidth="sm:max-w-4xl h-[90dvh]"
            showCloseButton={false}
            closeOnClickOutside={false}
         >
            <CreateWithIA
               onSubmit={handleCreateWithIA}
               onCancel={() => setIsCreateWithIAOpen(false)}
            />
         </Modal>
      </div>
   )
}