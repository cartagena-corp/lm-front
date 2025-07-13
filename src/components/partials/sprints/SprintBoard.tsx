'use client'

import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, pointerWithin, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { MultiDragProvider } from '@/components/ui/dnd-kit/MultiDragContext'
import { useSprintStore } from '@/lib/store/SprintStore'
import { useBoardStore } from '@/lib/store/BoardStore'
import { useIssueStore } from '@/lib/store/IssueStore'
import CreateTaskForm from '../issues/CreateTaskForm'
import { useAuthStore } from '@/lib/store/AuthStore'
import { PlusIcon, AlertCircleIcon, ExpandIcon, CompressIcon } from '@/assets/Icon'
import Modal from '@/components/layout/Modal'
import SprintKanbanCard from './SprintKanbanCard'
import { useState, useEffect } from 'react'

export default function SprintBoard() {
   const { createIssue, assignIssueToSprint, removeIssueFromSprint } = useIssueStore()
   const { sprints, activeSprint, isLoading, getSprints, getIssuesBySprint } = useSprintStore()
   const { getValidAccessToken } = useAuthStore()
   const { selectedBoard } = useBoardStore()

   const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
   const [selectedIds, setSelectedIds] = useState<string[]>([])
   const [activeId, setActiveId] = useState<string | null>(null)
   const [activeSprintWithIssues, setActiveSprintWithIssues] = useState<any>(null)
   const [isExpanded, setIsExpanded] = useState(false)

   // Configuración de sensores personalizados para el drag
   const sensors = useSensors(
      useSensor(PointerSensor, {
         activationConstraint: {
            distance: 3, // El drag se activa después de mover 3 píxeles
         },
      })
   )

   // Obtener solo el sprint activo de los sprints disponibles
   const activeSprintData = activeSprint || sprints.find(sprint => sprint.active && sprint.id !== 'null')

   // Refrescar datos cuando cambie el proyecto
   useEffect(() => {
      if (selectedBoard?.id) {
         const refreshData = async () => {
            const token = await getValidAccessToken()
            if (token) {
               await getSprints(token, selectedBoard.id)
            }
         }
         refreshData()
      }
   }, [selectedBoard?.id, getSprints, getValidAccessToken])

   // Función para refrescar las issues del sprint activo
   const refreshActiveSprintIssues = async () => {
      if (activeSprintData && selectedBoard?.id) {
         const token = await getValidAccessToken()
         if (token) {
            try {
               const issues = await getIssuesBySprint(token, activeSprintData.id as string, selectedBoard.id)
               setActiveSprintWithIssues({
                  ...activeSprintData,
                  tasks: issues
               })
            } catch (error) {
               console.error('Error refrescando issues del sprint activo:', error)
            }
         }
      }
   }

   // Cargar issues del sprint activo cuando cambie
   useEffect(() => {
      refreshActiveSprintIssues()
   }, [activeSprintData, selectedBoard?.id])

   // Efecto para refrescar cuando cambien los sprints (después de actualizaciones)
   useEffect(() => {
      if (activeSprintData && sprints.length > 0) {
         // Buscar el sprint activo actualizado en la lista de sprints
         const updatedActiveSprint = sprints.find(sprint => sprint.active && sprint.id !== 'null')
         if (updatedActiveSprint && updatedActiveSprint.tasks?.content) {
            setActiveSprintWithIssues(updatedActiveSprint)
         }
      }
   }, [sprints, activeSprintData])

   const handleCreateTask = async (newTask: any) => {
      const token = await getValidAccessToken()
      if (token) {
         await createIssue(token, newTask)
         // Refrescar las issues del sprint activo después de crear una nueva tarea
         await refreshActiveSprintIssues()
      }
      setIsCreateTaskOpen(false)
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

      // Para el tablero del sprint activo, solo permitimos mover dentro del mismo sprint
      // No permitimos mover tareas fuera del sprint activo en esta vista
      if (targetSprintId !== activeSprintData?.id) {
         setSelectedIds([])
         setActiveId(null)
         return
      }

      setSelectedIds([])
      setActiveId(null)
   }

   if (isLoading && !sprints.length) {
      return (
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header consistente */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200/50 px-6 py-4">
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Vista de Tablero</h3>
                  <span className="text-sm text-gray-500">• Cargando...</span>
               </div>
            </div>
            
            {/* Estado de carga */}
            <div className="p-12 flex items-center justify-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
         </div>
      )
   }

   // Si no hay sprint activo o no se han cargado las issues, mostrar mensaje
   if (!activeSprintData || !activeSprintWithIssues) {
      return (
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header consistente */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200/50 px-6 py-4">
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Vista de Tablero</h3>
                  <span className="text-sm text-gray-500">• {!activeSprintData ? 'Sin sprint activo' : 'Cargando issues...'}</span>
               </div>
            </div>
            
            {/* Estado vacío */}
            <div className="p-12 text-center">
               <div className="mx-auto w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <AlertCircleIcon size={32} />
               </div>
               <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {!activeSprintData ? 'No hay sprint activo' : 'Cargando datos del sprint...'}
               </h3>
               <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {!activeSprintData 
                     ? 'Para usar la vista de tablero, necesitas activar un sprint desde la vista de lista.'
                     : 'Obteniendo las tareas del sprint activo...'
                  }
               </p>
               {!activeSprintData && (
                  <button
                     onClick={() => window.location.reload()}
                     className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                     </svg>
                     Actualizar
                  </button>
               )}
            </div>
         </div>
      )
   }

   return (
      <div className="space-y-6">
         <MultiDragProvider value={{ selectedIds, setSelectedIds }}>
            <DndContext
               sensors={sensors}
               collisionDetection={pointerWithin}
               onDragStart={handleDragStart}
               onDragEnd={handleDragEnd}
               modifiers={[restrictToWindowEdges]}
            >
               {/* Sprint Activo como Tablero Kanban */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header minimalista del tablero */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200/50 px-6 py-4">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-sm"></div>
                           <h3 className="text-lg font-semibold text-gray-900">Vista de Tablero</h3>
                        </div>
                        <button
                           onClick={() => setIsExpanded(true)}
                           className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                           title="Expandir vista"
                        >
                           <ExpandIcon size={16} />
                           <span>Expandir</span>
                        </button>
                     </div>
                  </div>

                  {/* Contenido del tablero */}
                  <div className="p-6">
                     <SprintKanbanCard
                        key={activeSprintWithIssues.id}
                        spr={activeSprintWithIssues}
                     />
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

         {/* Modal para crear tarea */}
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

         {/* Modal de vista expandida */}
         <Modal
            isOpen={isExpanded}
            onClose={() => setIsExpanded(false)}
            title=""
            customWidth="mx-5"
            showCloseButton={false}
            removePadding={true}
         >
            <div className="h-[90vh] flex flex-col">
               {/* Header del modal expandido */}
               <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200/50 px-6 py-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-sm"></div>
                        <h3 className="text-lg font-semibold text-gray-900">Vista de Tablero Expandida</h3>
                        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full border">
                           Modo expandido
                        </span>
                     </div>
                     <button
                        onClick={() => setIsExpanded(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                     >
                        <CompressIcon size={16} />
                        <span>Comprimir</span>
                     </button>
                  </div>
               </div>

               {/* Contenido del tablero expandido */}
               <div className="flex-1 overflow-auto p-6">
                  <MultiDragProvider value={{ selectedIds, setSelectedIds }}>
                     <DndContext
                        sensors={sensors}
                        collisionDetection={pointerWithin}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToWindowEdges]}
                     >
                        <SprintKanbanCard
                           key={`expanded-${activeSprintWithIssues.id}`}
                           spr={activeSprintWithIssues}
                        />

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
               </div>
            </div>
         </Modal>
         </div>
   )
}
