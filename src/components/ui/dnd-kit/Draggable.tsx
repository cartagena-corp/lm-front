import { useMultiDragContext } from './MultiDragContext'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import React, { useRef, useState, useCallback, useEffect } from 'react'

interface DraggableProps {
   children: React.ReactNode
   styleClass?: string
   id: string
   onDoubleClick?: () => void
   onClick?: () => void  // Nuevo prop para click simple
}

export function Draggable({ id, children, styleClass = '', onDoubleClick, onClick }: DraggableProps) {
   const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })
   const { selectedIds } = useMultiDragContext()
   const isSelected = selectedIds.includes(id)
   const style = { transform: CSS.Translate.toString(transform) }
   
   const startPosition = useRef<{ x: number; y: number } | null>(null)
   const lastClickTime = useRef<number>(0)
   const isPointerDown = useRef<boolean>(false)
   const hasMoved = useRef<boolean>(false)
   
   // Ya no necesitamos cleanup del timeout porque no lo usamos

   
   const handlePointerDown = useCallback((event: React.PointerEvent) => {
      const currentTime = Date.now()
      startPosition.current = { x: event.clientX, y: event.clientY }
      isPointerDown.current = true
      hasMoved.current = false
      
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
      if (startPosition.current && isPointerDown.current) {
         const deltaX = Math.abs(event.clientX - startPosition.current.x)
         const deltaY = Math.abs(event.clientY - startPosition.current.y)
         
         // Si se mueve más de 3 píxeles, marcar como movimiento
         if (deltaX > 3 || deltaY > 3) {
            hasMoved.current = true
         }
      }
      
      // Llamar al listener original del drag
      if (listeners?.onPointerMove) {
         listeners.onPointerMove(event)
      }
   }, [listeners])
   
   const handlePointerUp = useCallback((event: React.PointerEvent) => {
      // Si fue un click simple (sin movimiento)
      if (isPointerDown.current && !hasMoved.current) {
         // Esperar un momento para ver si viene un segundo click
         setTimeout(() => {
            const timeSinceLastClick = Date.now() - lastClickTime.current
            // Si han pasado más de 300ms desde el último click, es un click simple
            if (timeSinceLastClick > 300) {
               // Llamar al callback de click simple (que abre detalles)
               if (onClick) {
                  onClick()
               } else if (onDoubleClick) {
                  // Fallback al callback de doble click si no hay onClick
                  onDoubleClick()
               }
            }
         }, 350) // Esperar un poco más de 300ms para asegurar que no es doble click
      }
      
      startPosition.current = null
      isPointerDown.current = false
      hasMoved.current = false
      
      // Llamar al listener original del drag
      if (listeners?.onPointerUp) {
         listeners.onPointerUp(event)
      }
   }, [onClick, onDoubleClick, listeners])
   
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
