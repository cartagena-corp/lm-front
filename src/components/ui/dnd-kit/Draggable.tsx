import { useMultiDragContext } from './MultiDragContext'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import React from 'react'

interface DraggableProps {
   children: React.ReactNode
   styleClass?: string
   id: string
}

export function Draggable({ id, children, styleClass = '' }: DraggableProps) {
   const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })
   const { selectedIds } = useMultiDragContext()
   const isSelected = selectedIds.includes(id)
   const style = { transform: CSS.Translate.toString(transform) }

   return (
      <div className={`${styleClass} ${!isDragging ? "border-black/10" : "border-transparent rounded-md opacity-0"} border-b ${isSelected && 'bg-sky-100 hover:bg-sky-100!'}`}
         ref={setNodeRef} style={style} {...listeners} {...attributes}>
         {children}
      </div>
   )
}
