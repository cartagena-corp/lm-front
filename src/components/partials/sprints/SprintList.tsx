import { useSprintStore } from '@/lib/store/SprintStore'
import { useBoardStore } from '@/lib/store/BoardStore'
import { useIssueStore } from '@/lib/store/IssueStore'
import CreateTaskForm from '../issues/CreateTaskForm'
import { useAuthStore } from '@/lib/store/AuthStore'
import CreateSprintForm from './CreateSprintForm'
import { Plus, Calendar } from 'lucide-react'
import { useModalStore } from '@/lib/hooks/ModalStore'
import IssuesRow from './IssuesRow'
import { Fragment, useRef, useState } from 'react'
import { sortSprints } from '@/lib/utils/sprint.utils'
import { toast } from 'react-hot-toast'
import CreateWithIA from '../issues/CreateWithIA'

// Separador invisible entre dos sprints que, al pasar el mouse, revela una línea +
// botón "Agregar Sprint" — mismo patrón "hover-reveal insert row" que Notion/Linear.
// No mueve nada de layout mientras no está en hover: colapsado mide lo mismo que el
// espacio que antes daba `space-y-4`. La línea se parte en dos segmentos (izquierda/
// derecha del botón) en vez de un único trazo que pase por detrás — así nunca comparte
// píxeles con el botón y no se alcanza a ver la línea "a través" de él a mitad de la
// transición de opacidad.
function SprintGapAdd({ onAdd }: { onAdd: () => void }) {
   return (
      <div className="group flex items-center h-4 hover:h-9 focus-within:h-9 transition-all duration-150">
         <div
            className="flex-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150"
            style={{ borderTop: "1px dashed var(--ds-border-strong)" }}
         />
         <button
            type="button"
            onClick={onAdd}
            title="Agregar sprint aquí"
            className="flex-shrink-0 mx-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-[var(--ds-text-secondary)] bg-[var(--ds-card)] hover:bg-[var(--gray-alpha-100)] opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 focus-visible:opacity-100 focus-visible:scale-100 focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2 transition-all duration-150"
            style={{ boxShadow: "var(--shadow-border)" }}
         >
            <Plus size={12} strokeWidth={2} />
            Agregar Sprint
         </button>
         <div
            className="flex-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150"
            style={{ borderTop: "1px dashed var(--ds-border-strong)" }}
         />
      </div>
   )
}

export default function SprintList() {
   const { createIssue, assignIssueToSprint, removeIssueFromSprint } = useIssueStore()
   const { sprints, createSprint, isLoading } = useSprintStore()
   const { getValidAccessToken } = useAuthStore()
   const { selectedBoard } = useBoardStore()
   const { openModal, closeModal } = useModalStore()

   // Selección múltiple de tareas (shift/cmd+click extiende la selección al
   // empezar a arrastrar) — vive acá porque una tarea puede arrastrarse desde
   // el sprint A hacia el sprint B, así que ambos IssuesRow necesitan verla.
   const [selectedIds, setSelectedIds] = useState<string[]>([])

   // Elemento persistente fuera de pantalla para el "fantasma" de arrastre
   // cuando se mueven varias tareas seleccionadas a la vez — mismo patrón que
   // ImportIssuesModal.tsx usa para su drag de columnas.
   const dragPreviewRef = useRef<HTMLDivElement>(null)

   // Estado optimista para sprints
   const [optimisticSprints, setOptimisticSprints] = useState<any[] | null>(null)
   const [optimisticTimeout, setOptimisticTimeout] = useState<NodeJS.Timeout | null>(null)

   const handleCreateTask = async (newTask: any, filesMap?: Map<string, File[]>) => {
      const token = await getValidAccessToken()
      if (token) await createIssue(token, newTask, filesMap)
      closeModal()
   }

   const handleCreateSprint = async (newSprint: any) => {
      const token = await getValidAccessToken()
      if (token)
         await createSprint(token, {
            ...newSprint,
            projectId: selectedBoard?.id as string,
            status: newSprint.status
         })
      closeModal()
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
         closeModal();
      }
   }

   // Modal handlers
   const handleCreateTaskModal = () => {
      openModal({
         size: "xl",
         title: "Crear Nueva Tarea",
         desc: "Agrega una nueva tarea al proyecto",
         children: (
            <CreateTaskForm
               onSubmit={handleCreateTask}
               onCancel={() => closeModal()}
            />
         ),
         Icon: <Plus size={20} strokeWidth={1.75} />,
         closeOnBackdrop: false,
         closeOnEscape: true,
         mode: "CREATE"
      })
   }

   const handleCreateSprintModal = () => {
      openModal({
         size: "lg",
         title: "Crear Nuevo Sprint",
         desc: "Organiza tus tareas en un nuevo sprint",
         children: (
            <CreateSprintForm
               onSubmit={handleCreateSprint}
               onCancel={() => closeModal()}
               isEdit={false}
            />
         ),
         Icon: <Calendar size={20} strokeWidth={1.75} />,
         closeOnBackdrop: false,
         closeOnEscape: true,
         mode: "CREATE"
      })
   }

   const handleCreateWithIAModal = () => {
      openModal({
         size: "full",
         title: "Crear Tareas con IA",
         desc: "Deja que la IA te ayude a crear múltiples tareas de forma inteligente",
         children: (
            <CreateWithIA
               onSubmit={handleCreateWithIA}
               onCancel={() => closeModal()}
            />
         ),
         Icon: <Plus size={20} strokeWidth={1.75} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "CREATE"
      })
   }

   // Empieza (o extiende, con shift/cmd) la selección de tareas al arrastrar.
   const handleTaskDragStart = (e: React.DragEvent, taskId: string) => {
      let effectiveSelection = selectedIds
      if (e.shiftKey || e.metaKey || e.ctrlKey) {
         effectiveSelection = selectedIds.includes(taskId) ? selectedIds.filter(i => i !== taskId) : [...selectedIds, taskId]
         setSelectedIds(effectiveSelection)
      } else if (!selectedIds.includes(taskId)) {
         effectiveSelection = [taskId]
         setSelectedIds(effectiveSelection)
      }

      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', taskId)

      // Con más de una tarea seleccionada, mostrar una burbuja "N tareas
      // seleccionadas" en vez del snapshot por defecto del navegador (que solo
      // capturaría esta fila).
      if (effectiveSelection.length > 1 && dragPreviewRef.current) {
         dragPreviewRef.current.textContent = `${effectiveSelection.length} tareas seleccionadas`
         e.dataTransfer.setDragImage(dragPreviewRef.current, 16, 16)
      }
   }

   // Soltar sobre un sprint (o el backlog, id 'null'): mueve todas las tareas
   // seleccionadas hacia ahí. Misma lógica optimista de antes, solo cambia
   // cómo se dispara (evento nativo en vez de DragEndEvent de dnd-kit).
   const handleSprintDrop = async (e: React.DragEvent, targetSprintId: string) => {
      e.preventDefault()
      if (!selectedIds.length) return

      const alreadyThere = sprints
         .find(s => s.id === targetSprintId)
         ?.tasks?.content.some(t => selectedIds.includes(t.id as string))

      if (alreadyThere) {
         setSelectedIds([])
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

      const draggedIds = selectedIds
      setOptimisticSprints(newSprints)

      // --- FIN OPTIMISTIC ---

      const toastId = toast.loading('Moviendo tareas...')

      try {
         const token = await getValidAccessToken()
         if (!token) return
         if (targetSprintId === 'null') {
            await removeIssueFromSprint(
               token,
               draggedIds,
               selectedBoard?.id as string
            )
         } else {
            await assignIssueToSprint(
               token,
               draggedIds,
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
      }
   }

   if (isLoading && !sprints.length) {
      return (
         <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
               <div key={i} className="p-4 animate-pulse" style={{ background: "var(--ds-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-border)" }}>
                  <div className="flex justify-between items-center mb-3">
                     <div className="flex items-center gap-4">
                        <div className="h-5 rounded w-32" style={{ background: "var(--gray-alpha-200)" }}></div>
                        <div className="h-4 rounded w-20" style={{ background: "var(--gray-alpha-200)" }}></div>
                     </div>
                     <div className="h-7 rounded w-24" style={{ background: "var(--gray-alpha-200)" }}></div>
                  </div>
                  <div className="h-3 rounded w-3/4 mb-3" style={{ background: "var(--gray-alpha-200)" }}></div>
                  <div className="space-y-2">
                     {Array.from({ length: 2 }).map((_, j) => (
                        <div key={j} className="h-10 rounded" style={{ background: "var(--gray-alpha-200)" }}></div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      )
   }

   // Usar sprints optimistas si existen, si no, los del store
   const sprintsToRender = optimisticSprints || sprints

   const sortedSprints = sortSprints(sprintsToRender)

   return (
      <div>
         {/* Fantasma de arrastre para selección múltiple — ver handleTaskDragStart */}
         <div
            ref={dragPreviewRef}
            className="pointer-events-none fixed px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap"
            style={{ top: -9999, left: -9999, background: "var(--blue-700)", color: "var(--primary-contrast-fg)" }}
         />

         {sortedSprints.map((spr, idx) => (
            <Fragment key={spr.id}>
               <IssuesRow
                  spr={spr}
                  setIsOpen={handleCreateTaskModal}
                  setIsCreateWithIAOpen={handleCreateWithIAModal}
                  selectedIds={selectedIds}
                  setSelectedIds={setSelectedIds}
                  onTaskDragStart={handleTaskDragStart}
                  onDropOnSprint={(e) => handleSprintDrop(e, spr.id as string)}
               />
               {/* Zona hover entre sprints para insertar uno nuevo ahí mismo */}
               {idx < sortedSprints.length - 1 && <SprintGapAdd onAdd={handleCreateSprintModal} />}
            </Fragment>
         ))}

         {/* Create Sprint Button */}
         <div className="overflow-hidden rounded-xl mt-4">
            <button
               onClick={handleCreateSprintModal}
               disabled={isLoading}
               className="w-full p-4 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--gray-alpha-100)]"
               style={{ border: "2px dashed var(--ds-border-strong)", borderRadius: "var(--radius-xl)" }}
            >
               <div className="flex items-center justify-center gap-3">
                  <div className="p-2 rounded-lg transition-colors duration-200" style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text-muted)" }}>
                     <Calendar size={18} strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                     <h3 className="text-sm font-semibold transition-colors duration-200" style={{ color: "var(--ds-text)" }}>
                        {isLoading ? 'Creando...' : 'Crear Nuevo Sprint'}
                     </h3>
                     <p className="text-xs" style={{ color: "var(--ds-text-muted)" }}>
                        Organiza tus tareas en un nuevo sprint
                     </p>
                  </div>
               </div>
            </button>
         </div>
      </div>
   )
}
