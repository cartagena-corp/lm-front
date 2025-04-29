import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface DraggableProps {
   id: string
   children: React.ReactNode
   styleClass: string | ""
}

export function Draggable({ id, children, styleClass = "" }: DraggableProps) {
   const { attributes, listeners, setNodeRef, transform } = useDraggable({ id })
   const style = { transform: CSS.Translate.toString(transform) }

   return (
      <div className={styleClass} ref={setNodeRef} style={style} {...listeners} {...attributes}>
         {children}
      </div>
   )
}
