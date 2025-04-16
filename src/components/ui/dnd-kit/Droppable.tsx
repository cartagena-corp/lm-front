import React from 'react'
import { useDroppable } from '@dnd-kit/core'

interface DroppableProps {
   id: string
   children: React.ReactNode
   styleClass: string | null
}

export function Droppable({ id, children, styleClass = null }: DroppableProps) {
   const { isOver, setNodeRef } = useDroppable({ id })

   return (
      <div className={`${styleClass} ${isOver ? 'border-blue-500' : 'border-transparent'} border-4 w-full p-4 rounded-md space-y-4 duration-300`} ref={setNodeRef}>
         {children}
      </div>
   )
}