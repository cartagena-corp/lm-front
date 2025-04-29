import { useEffect, useState } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { Draggable } from '../ui/dnd-kit/Draggable'
import { Droppable } from '../ui/dnd-kit/Droppable'
import Modal from '../layout/Modal'
import TaskDetailsForm from './TaskDetailsForm'

interface Tarea {
   id: string
   task: string
   desc: string
   priority: string
}

interface Task {
   id: string
   task: string
   desc: string
   priority: string
   pts: number
   user_asigned: string
}

interface Column {
   id: string
   title: string
   tasks: Task[]
}

interface ScrumData {
   columns: Column[]
}

const initialScrumData: ScrumData = {
   columns: [
      {
         id: "BACKLOG",
         title: "Backlog",
         tasks: [
            {
               id: "1",
               task: "Tarea #1",
               desc: "Descripción de la tarea #1",
               priority: "Low",
               pts: 3,
               user_asigned: "Kenn Marcucci"
            },
            {
               id: "2",
               task: "Tarea #2",
               desc: "Descripción de la tarea #2",
               priority: "Low",
               pts: 1,
               user_asigned: "Diego Pedrozo"
            },
         ],
      },
      {
         id: "SPRINT",
         title: "Sprint",
         tasks: [
            {
               id: "3",
               task: "Tarea #3",
               desc: "Descripción de la tarea #3",
               priority: "Medium",
               pts: 5,
               user_asigned: "Juan Cartagena"
            },
         ],
      },
      {
         id: "PROGRESS",
         title: "En progreso",
         tasks: [
            {
               id: "4",
               task: "Tarea #4",
               desc: "Descripción de la tarea #4",
               priority: "High",
               pts: 8,
               user_asigned: "Juan Cartagena"
            },
         ],
      },
      {
         id: "REVIEW",
         title: "En revisión",
         tasks: [
            {
               id: "5",
               task: "Tarea #5",
               desc: "Descripción de la tarea #5",
               priority: "Medium",
               pts: 4,
               user_asigned: "Kenn Marcucci"
            },
         ],
      },
      {
         id: "DONE",
         title: "Completado",
         tasks: [
            {
               id: "6",
               task: "Tarea #6",
               desc: "Descripción de la tarea #6",
               priority: "High",
               pts: 10,
               user_asigned: "Diego Pedrozo"
            },
         ],
      },
   ],
}

export default function Scrum() {
   const [data, setData] = useState<ScrumData>(initialScrumData)
   const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false)
   const [taskActive, setTaskActive] = useState<Tarea>({ id: "", task: "", desc: "", priority: "" })

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
      setIsTaskDetailsModalOpen(false)
   }

   const [mounted, setMounted] = useState(false)
   useEffect(() => { setMounted(true) }, [])
   if (!mounted) return <div>Cargando tablero...</div>

   return (
      <DndContext onDragEnd={handleDragEnd}>
         <div className='flex justify-between gap-4'>
            {
               data.columns.map(column =>
                  <Droppable key={column.id} id={column.id} styleClass={
                     column.id === "BACKLOG" ? "bg-white" :
                        column.id === "SPRINT" ? "bg-sky-100" :
                           column.id === "PROGRESS" ? "bg-amber-100/75" :
                              column.id === "REVIEW" ? "bg-purple-100/75" : "bg-green-100/75"
                  }>
                     <h2 className='text-xl font-bold'>{column.title}</h2>
                     {
                        column.tasks.map(task =>
                           <Draggable key={task.id} id={`task-${task.id}`} styleClass={"border-black/5 bg-white border"}>
                              <div className='mb-2.5'>
                                 <h6 className='hover:text-blue-500 text-lg font-semibold cursor-pointer duration-150 w-fit'
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={() => { setIsTaskDetailsModalOpen(true), setTaskActive(task) }}
                                 >
                                    {task.task}
                                 </h6>
                                 <p className='text-sm'>{task.desc}</p>
                              </div>
                              <div className='flex justify-between items-center gap-2'>
                                 <span className={`${task.priority === "Low" ? "bg-green-200/50 text-green-700" :
                                    task.priority === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-red-200/60 text-red-700"} 
                                    text-xs rounded-full px-2.5 py-0.5`}>
                                    {task.priority}
                                 </span>
                                 <p className='text-xs text-black/50'>{task.user_asigned}</p>
                              </div>
                           </Draggable>
                        )
                     }
                  </Droppable>
               )
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
      </DndContext>
   )
}
