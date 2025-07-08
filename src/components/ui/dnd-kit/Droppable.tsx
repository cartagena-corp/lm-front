import { useDroppable } from '@dnd-kit/core'
import React from 'react'

interface DroppableProps {
   children: React.ReactNode
   styleClass?: string
   id: string
}

export function Droppable({ id, children, styleClass = '' }: DroppableProps) {
   const { isOver, setNodeRef } = useDroppable({ id })
   return (
      <div className={`${styleClass} ${isOver ? 'border-blue-400' : 'border-transparent'} border-4 w-full rounded-md duration-300`} ref={setNodeRef}>
         {children}
      </div>
   )
}
