import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface DraggableProps {
   id: string
   children: React.ReactNode
   styleClass: string | null
}

export function Draggable({ id, children, styleClass = null }: DraggableProps) {
   const { attributes, listeners, setNodeRef, transform } = useDraggable({ id })
   const style = { transform: CSS.Translate.toString(transform) }

   return (
      <div className={`${styleClass ? styleClass : "bg-white border"} rounded-md hover:shadow-lg active:duration-0 duration-150  p-4 cursor-grab active:cursor-grabbing select-none`} ref={setNodeRef} style={style} {...listeners} {...attributes}>
         {children}
      </div>
   )
}
