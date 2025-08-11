import { motion } from "motion/react"
import { ReactNode } from "react"

/**
 * Props para el componente DraggableItem.
 * Define todas las propiedades necesarias para crear un elemento arrastrable con feedback visual.
 */
interface DraggableItemProps {
    /** Identificador único del elemento */
    id: number | string
    /** Índice del elemento en la lista */
    index: number
    /** Indica si este elemento está siendo arrastrado actualmente */
    isDragged: boolean
    /** Indica si se está haciendo hover sobre este elemento durante un arrastre */
    isDraggedOver: boolean
    /** Indica si hay una operación de actualización en curso */
    isUpdating: boolean
    /** Handler para el inicio del arrastre */
    onDragStart: (e: React.DragEvent) => void
    /** Handler para cuando se hace hover sobre el elemento durante un arrastre */
    onDragOver: (e: React.DragEvent) => void
    /** Handler para cuando se deja de hacer hover sobre el elemento */
    onDragLeave: () => void
    /** Handler para cuando se suelta un elemento sobre este */
    onDrop: (e: React.DragEvent) => void
    /** Handler para el final del arrastre */
    onDragEnd: () => void
    /** Contenido del elemento arrastrable */
    children: ReactNode
    /** Clases CSS base del elemento */
    className?: string
    /** Clases CSS aplicadas cuando el elemento está siendo arrastrado */
    dragClassName?: string
    /** Clases CSS aplicadas cuando se hace hover sobre el elemento durante un arrastre */
    dragOverClassName?: string
    /** Clases CSS aplicadas cuando hay una actualización en curso */
    updatingClassName?: string
}

/**
 * Componente wrapper que convierte cualquier contenido en un elemento arrastrable.
 * 
 * Este componente proporciona:
 * - Funcionalidad completa de drag and drop HTML5
 * - Animaciones suaves con Motion
 * - Estados visuales para feedback del usuario
 * - Clases CSS personalizables para diferentes estados
 * - Separación entre la lógica de arrastre y el contenido visual
 * 
 * El componente usa un enfoque de doble wrapper:
 * - motion.div: Maneja las animaciones y el layout
 * - div interno: Maneja los eventos de drag and drop HTML5
 * 
 * @param props - Propiedades del componente
 * @returns Elemento arrastrable con animaciones y feedback visual
 * 
 * @example
 * ```tsx
 * <DraggableItem
 *   id={item.id}
 *   index={index}
 *   isDragged={isDragged}
 *   isDraggedOver={isDraggedOver}
 *   isUpdating={isUpdating}
 *   onDragStart={handleDragStart}
 *   onDragOver={handleDragOver}
 *   onDragLeave={handleDragLeave}
 *   onDrop={handleDrop}
 *   onDragEnd={handleDragEnd}
 *   className="p-4 border rounded"
 * >
 *   <div>Mi contenido arrastrable</div>
 * </DraggableItem>
 * ```
 */
export default function DraggableItem({
    id,
    index,
    isDragged,
    isDraggedOver,
    isUpdating,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    children,
    className = "",
    dragClassName = "opacity-50 scale-95",
    dragOverClassName = "border-blue-400 shadow-lg scale-105",
    updatingClassName = "pointer-events-none"
}: DraggableItemProps) {
    /**
     * Combina las clases CSS base con las clases condicionales según el estado actual.
     * 
     * Las clases se aplican de la siguiente manera:
     * - className: Siempre aplicadas (estilos base)
     * - cursor-grab/cursor-grabbing: Feedback visual del cursor
     * - select-none: Previene selección de texto durante el arrastre
     * - transition-all: Transiciones suaves entre estados
     * - dragClassName: Solo cuando isDragged es true
     * - dragOverClassName: Solo cuando isDraggedOver es true
     * - updatingClassName: Solo cuando isUpdating es true
     * - hover:shadow-md: Solo cuando no está en estado updating
     */
    const combinedClassName = `
        ${className} cursor-grab active:cursor-grabbing select-none transition-all duration-200
        ${isDragged ? dragClassName : ''}
        ${isDraggedOver ? dragOverClassName : ''}
        ${isUpdating ? updatingClassName : 'hover:shadow-md'}
    `.trim()

    return (
        <div key={id} className={combinedClassName}>
            {/**
             * Div interno que maneja los eventos de drag and drop HTML5.
             * Se separa del motion.div para evitar conflictos entre los eventos
             * de Motion (whileHover, whileDrag) y los eventos HTML5 (onDragStart, onDrop).
             * 
             * La clase w-full h-full asegura que ocupe todo el espacio disponible
             * del contenedor motion.div.
             */}
            <div className="w-full h-full" onDragStart={onDragStart} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onDragEnd={onDragEnd} draggable>
                {children}
            </div>
        </div>
    )
}
