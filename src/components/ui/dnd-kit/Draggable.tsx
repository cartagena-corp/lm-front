import { useMultiDragContext } from './MultiDragContext'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import React, { useRef, useState, useCallback, useEffect } from 'react'

interface DraggableProps {
   children: React.ReactNode
   styleClass?: string
   id: string
   onDoubleClick?: () => void
}

export function Draggable({ id, children, styleClass = '', onDoubleClick }: DraggableProps) {
   const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })
   const { selectedIds } = useMultiDragContext()
   const isSelected = selectedIds.includes(id)
   const style = { transform: CSS.Translate.toString(transform) }
   
   const startPosition = useRef<{ x: number; y: number } | null>(null)
   const lastClickTime = useRef<number>(0)
   
   // Ya no necesitamos cleanup del timeout porque no lo usamos

   
   const handlePointerDown = useCallback((event: React.PointerEvent) => {
      const currentTime = Date.now()
      startPosition.current = { x: event.clientX, y: event.clientY }
      
      // Detectar doble click
      if (currentTime - lastClickTime.current < 300) {
         // Es un doble click
         if (onDoubleClick) {
            event.preventDefault()
            event.stopPropagation()
            onDoubleClick()
            return
         }
      }
      
      lastClickTime.current = currentTime
      
      // Siempre llamar al listener original, pero el sensor se encargará de la distancia
      if (listeners?.onPointerDown) {
         listeners.onPointerDown(event)
      }
   }, [onDoubleClick, listeners])
   
   const handlePointerMove = useCallback((event: React.PointerEvent) => {
      // Llamar al listener original del drag
      if (listeners?.onPointerMove) {
         listeners.onPointerMove(event)
      }
   }, [listeners])
   
   const handlePointerUp = useCallback((event: React.PointerEvent) => {
      startPosition.current = null
      
      // Llamar al listener original del drag
      if (listeners?.onPointerUp) {
         listeners.onPointerUp(event)
      }
   }, [listeners])
   
   // Crear listeners personalizados
   const customListeners = {
      ...listeners,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp
   }

   return (
      <div className={`${styleClass} ${!isDragging ? "border-black/10" : "border-transparent rounded-md opacity-0"} border-b ${isSelected && 'bg-sky-100 hover:bg-sky-100!'}`}
         ref={setNodeRef} style={style} {...customListeners} {...attributes}>
         {children}
      </div>
   )
}
