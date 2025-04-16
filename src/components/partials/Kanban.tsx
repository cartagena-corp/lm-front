import { useEffect, useState } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { Draggable } from '../ui/dnd-kit/Draggable'
import { Droppable } from '../ui/dnd-kit/Droppable'
import Modal from '../layout/Modal'
import TaskDetailsForm from './TaskDetailsForm'

interface Task {
   id: string
   task: string
   desc: string
   priority: string
}

interface Column {
   id: string
   title: string
   tasks: Task[]
}

interface KanbanData {
   columns: Column[]
}

const initialKanbanData: KanbanData = {
   columns: [
      {
         id: "TODO",
         title: "Por hacer",
         tasks: [
            {
               id: "1",
               task: "Tarea #1",
               desc: "Descripción de la tarea #1",
               priority: "Low",
            },
            {
               id: "2",
               task: "Tarea #2",
               desc: "Descripción de la tarea #2",
               priority: "Medium",
            },
         ],
      },
      {
         id: "PROGRESS",
         title: "En progreso",
         tasks: [
            {
               id: "3",
               task: "Tarea #3",
               desc: "Descripción de la tarea #3",
               priority: "Medium",
            },
         ],
      },
      {
         id: "DONE",
         title: "Completado",
         tasks: [
            {
               id: "4",
               task: "Tarea #4",
               desc: "Descripción de la tarea #4",
               priority: "High",
            },
         ],
      },
   ],
}

export default function Kanban() {
   const [data, setData] = useState<KanbanData>(initialKanbanData)
   const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false)
   const [taskActive, setTaskActive] = useState<Task>({ id: "", task: "", desc: "", priority: "" })

   const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event
      if (!over) return

      // Asumimos que cada Draggable tiene id con el formato "task-{id}"
      const activeTaskId = active.id
      const destinationColumnId = over.id

      // Buscar la columna de origen y el índice de la tarea
      let sourceColIndex = -1
      let taskIndex = -1
      let draggedTask: Task | undefined = undefined

      data.columns.forEach((col, colIndex) => {
         const index = col.tasks.findIndex(task => `task-${task.id}` === activeTaskId)
         if (index !== -1) {
            sourceColIndex = colIndex
            taskIndex = index
            draggedTask = col.tasks[index]
         }
      })

      if (!draggedTask) return

      // Si la tarea se suelta en la misma columna, se podría implementar reordenamiento interno
      if (data.columns[sourceColIndex].id === destinationColumnId) return

      // Remover la tarea de la columna de origen
      const newColumns = data.columns.map((col, index) => {
         if (index === sourceColIndex) {
            return { ...col, tasks: col.tasks.filter(task => task.id !== draggedTask!.id) }
         }
         return col
      })

      // Encontrar la columna destino
      const destColIndex = newColumns.findIndex(col => col.id === destinationColumnId)
      if (destColIndex === -1) return

      // Agregar la tarea al final de la columna destino
      newColumns[destColIndex] = {
         ...newColumns[destColIndex],
         tasks: [...newColumns[destColIndex].tasks, draggedTask],
      }

      setData({ columns: newColumns })
   }

   const handleDetails = (data: { keyword: string, state: string, sort: string, isAsc: boolean }) => {
      console.log("handleFilter", data)
      setIsTaskDetailsModalOpen(false)
   }

   const [mounted, setMounted] = useState(false)
   useEffect(() => { setMounted(true) }, [])
   if (!mounted) return <div>Cargando tablero...</div>
   return (
      <DndContext onDragEnd={handleDragEnd}>
         <div className='flex justify-between gap-4'>
            {
               data.columns.map(column => (
                  <Droppable key={column.id} id={column.id} styleClass={"bg-white"}>
                     <h2 className='text-xl font-bold'>{column.title}</h2>
                     {
                        column.tasks.map(task => (
                           <Draggable key={task.id} id={`task-${task.id}`} styleClass={"border-black/5 bg-white border"}>
                              <div className='flex justify-between items-center gap-2'>
                                 <h6 className='hover:text-blue-500 text-lg font-semibold cursor-pointer duration-150 w-fit'
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={() => { setIsTaskDetailsModalOpen(true), setTaskActive(task) }}
                                 >
                                    {task.task}
                                 </h6>
                                 <span className={`${task.priority === "Low" ? "bg-green-200 text-green-700" : task.priority === "Medium" ?
                                    "bg-yellow-100 text-yellow-700" : "bg-red-200 text-red-700"} text-xs rounded-full px-2.5 py-0.5`}>
                                    {task.priority}
                                 </span>
                              </div>

                              <p className='text-sm pt-1'>{task.desc}</p>
                           </Draggable>
                        ))
                     }
                  </Droppable>
               ))
            }
         </div>

         {/* Modal para detalle de tareas */}
         <Modal customWidth={'sm:max-w-4xl'}
            isOpen={isTaskDetailsModalOpen}
            onClose={() => setIsTaskDetailsModalOpen(false)}
            title={taskActive.task}
         >
            <TaskDetailsForm task={taskActive}
               onSubmit={handleDetails}
               onCancel={() => setIsTaskDetailsModalOpen(false)}
            />
         </Modal>
      </DndContext >
   )
}
