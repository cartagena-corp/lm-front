import React from 'react'
import { useDroppable } from '@dnd-kit/core'

interface DroppableProps {
   id: string
   children: React.ReactNode
}

export function Droppable({ id, children }: DroppableProps) {
   const { isOver, setNodeRef } = useDroppable({ id })

   return (
      <div className={`${isOver ? 'bg-blue-100' : 'bg-white'} w-full p-4 rounded-md space-y-4 duration-300`} ref={setNodeRef}>
         {children}
      </div>
   )
}