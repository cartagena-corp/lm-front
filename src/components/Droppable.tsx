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
      <div className={`${styleClass ? styleClass : isOver ? 'bg-blue-100' : 'bg-white'} w-full p-4 rounded-md space-y-4 duration-300`} ref={setNodeRef}>
         {children}
      </div>
   )
}