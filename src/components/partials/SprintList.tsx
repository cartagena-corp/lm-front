import { useBoardStore } from "@/lib/store/BoardStore"
import { useIssueStore } from "@/lib/store/IssueStore"
import { useState } from "react"
import Modal from "../layout/Modal"
import CreateTaskForm from "./CreateTaskForm"
import { SprintProps, TaskProps } from "@/lib/types/types"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useSprintStore } from "@/lib/store/SprintStore"
import CreateSprintForm from "./CreateSprintForm"
import { DndContext, DragEndEvent } from "@dnd-kit/core"
import IssuesRow from "../ui/IssuesRow"

export default function SprintList() {
   const { sprints, createSprint } = useSprintStore()
   const { getValidAccessToken } = useAuthStore()
   const { selectedBoard } = useBoardStore()
   const { createTask, asignTaskToSprint } = useIssueStore()

   const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
   const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false)

   const handleCreateTask = async (newTask: TaskProps) => {
      const token = await getValidAccessToken()
      if (token) await createTask(token, newTask)
      setIsCreateTaskOpen(false)
   }

   const handleCreateSprint = async (newSprint: SprintProps) => {
      const token = await getValidAccessToken()
      if (token) await createSprint(token, { ...newSprint, projectId: selectedBoard?.id as string, status: newSprint.status })
      setIsCreateSprintOpen(false)
   }

   const handleDragEnd = async (event: DragEndEvent) => {
      const { active, over } = event

      // Return if dropped outside of a droppable area
      if (!over) return

      // Return if no change (dropped into same container)
      if (active.id === over.id) return

      // Find the task being dragged
      const taskId = active.id as string
      let draggedTask: TaskProps | undefined
      let sourceSprint: SprintProps | undefined

      // Find which sprint contains the task and the task itself
      for (const sprint of sprints) {
         const task = sprint.tasks?.content.find(task => task.id === taskId)
         if (task) {
            draggedTask = task
            sourceSprint = sprint
            break
         }
      }

      // If task wasn't found, return
      if (!draggedTask) return

      // Find the target sprint by ID
      const targetSprintId = over.id as string
      const targetSprint = sprints.find(sprint => sprint.id === targetSprintId)

      // If target sprint wasn't found, return
      if (!targetSprint) return

      // Don't proceed if source and target are the same
      if (sourceSprint?.id === targetSprint.id) return

      try {
         // Get authentication token
         const token = await getValidAccessToken()
         if (!token) return

         // Update the task with the new sprint ID
         const updatedTask: TaskProps = {
            ...draggedTask,
            sprintId: targetSprint.id
         }

         // Call your API to update the task
         await asignTaskToSprint(token, [updatedTask.id as string], updatedTask.sprintId as string, selectedBoard?.id as string)

         // Note: The task list should be updated automatically if your
         // store is properly connected to your API and state management
      } catch (error) {
         console.error("Error moving task between sprints:", error)
         // Consider adding error handling UI feedback here
      }
   }

   return (
      <DndContext onDragEnd={handleDragEnd}>
         <>
            {sprints && sprints.length > 0 && sprints.map(spr => <IssuesRow setIsOpen={setIsCreateTaskOpen} key={spr.id} spr={spr} />)}
         </>

         <button onClick={() => setIsCreateSprintOpen(true)}
            className='border-black/20 text-black/20 hover:border-black/75 hover:text-black/75 duration-150 border-dashed border rounded-md flex flex-col justify-center items-center py-6'>
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
      </DndContext>
   )
}