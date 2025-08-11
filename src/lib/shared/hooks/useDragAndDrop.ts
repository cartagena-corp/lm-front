import { useState, useCallback } from "react"

/**
 * Interfaz base para elementos que pueden ser arrastrados y reordenados.
 * Todos los elementos deben tener un identificador único y opcionalmente un índice de orden.
 */
interface DragAndDropItem {
    /** Identificador único del elemento */
    id: number | string
    /** Índice de orden del elemento (null si no está ordenado) */
    orderIndex?: number | null
}

/**
 * Opciones de configuración para el hook useDragAndDrop.
 * @template T - Tipo del elemento que extiende DragAndDropItem
 */
interface UseDragAndDropOptions<T extends DragAndDropItem> {
    /** Array de elementos a ordenar */
    items: T[]
    /** Callback que se ejecuta cuando se completa el reordenamiento */
    onReorder: (reorderedItems: T[]) => Promise<void> | void
    /** Función opcional para obtener el índice de orden de un elemento */
    getOrderIndex?: (item: T) => number | null
    /** Función opcional para actualizar el índice de orden en el servidor */
    updateOrderIndex?: (item: T, newIndex: number) => Promise<T> | T
}

/**
 * Handlers para los eventos de drag and drop.
 * Contiene todas las funciones necesarias para manejar la interacción del usuario.
 */
interface DragAndDropHandlers {
    /** Maneja el inicio del arrastre */
    handleDragStart: (e: React.DragEvent, item: any) => void
    /** Maneja cuando un elemento está sobre una zona de drop válida */
    handleDragOver: (e: React.DragEvent, index: number) => void
    /** Maneja cuando el cursor sale de una zona de drop */
    handleDragLeave: () => void
    /** Maneja cuando se suelta un elemento */
    handleDrop: (e: React.DragEvent, targetIndex: number) => Promise<void>
    /** Maneja el final del arrastre (independientemente del resultado) */
    handleDragEnd: () => void
}

/**
 * Estado actual del sistema de drag and drop.
 * Proporciona información sobre qué elemento se está arrastrando y el estado de la operación.
 */
interface DragAndDropState {
    /** Elemento que se está arrastrando actualmente (null si no hay ninguno) */
    draggedItem: any | null
    /** Índice sobre el que se está haciendo hover durante el arrastre */
    dragOverIndex: number | null
    /** Indica si se está ejecutando una actualización en el servidor */
    isUpdating: boolean
}

/**
 * Hook personalizado para implementar funcionalidad de drag and drop con reordenamiento.
 * 
 * Este hook proporciona una solución completa para arrastrar y soltar elementos con las siguientes características:
 * - Reordenamiento automático de elementos basado en orderIndex
 * - Sincronización opcional con servidor
 * - Estados visuales para feedback del usuario
 * - Manejo de errores y loading states
 * - Callback personalizable para actualización de datos
 * 
 * @template T - Tipo del elemento que debe extender DragAndDropItem
 * @param options - Configuración del hook
 * @returns Objeto con elementos ordenados, estado actual y handlers de eventos
 * 
 * @example
 * ```typescript
 * const { sortedItems, state, handlers } = useDragAndDrop({
 *   items: myItems,
 *   onReorder: handleReorder,
 *   updateOrderIndex: updateItemInServer
 * })
 * ```
 */
export function useDragAndDrop<T extends DragAndDropItem>({
    items,
    onReorder,
    getOrderIndex,
    updateOrderIndex
}: UseDragAndDropOptions<T>) {
    /** Estado del elemento que se está arrastrando actualmente */
    const [draggedItem, setDraggedItem] = useState<T | null>(null)
    /** Estado del índice sobre el que se está haciendo hover */
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
    /** Estado que indica si hay una operación de actualización en curso */
    const [isUpdating, setIsUpdating] = useState(false)

    /**
     * Filtra y ordena los elementos basándose en su orderIndex.
     * Solo incluye elementos que tengan un orderIndex válido (no null/undefined).
     * Los ordena de menor a mayor según su orderIndex.
     */
    const sortedItems = items
        .filter(item => {
            const orderIndex = getOrderIndex ? getOrderIndex(item) : item.orderIndex
            return orderIndex !== null && orderIndex !== undefined
        })
        .sort((a, b) => {
            const orderA = getOrderIndex ? getOrderIndex(a) : a.orderIndex
            const orderB = getOrderIndex ? getOrderIndex(b) : b.orderIndex
            return (orderA || 0) - (orderB || 0)
        })

    /**
     * Maneja el inicio del evento de arrastre.
     * Establece el elemento que se está arrastrando y configura el efecto de arrastre.
     * 
     * @param e - Evento de drag de React
     * @param item - Elemento que se está empezando a arrastrar
     */
    const handleDragStart = useCallback((e: React.DragEvent, item: T) => {
        setDraggedItem(item)
        e.dataTransfer.effectAllowed = "move"
    }, [])

    /**
     * Maneja el evento cuando el elemento arrastrado está sobre una zona de drop válida.
     * Previene el comportamiento por defecto y establece el efecto visual.
     * 
     * @param e - Evento de drag de React
     * @param index - Índice de la posición sobre la que se está haciendo hover
     */
    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        setDragOverIndex(index)
    }, [])

    /**
     * Maneja cuando el cursor sale de una zona de drop.
     * Limpia el estado de hover para remover el feedback visual.
     */
    const handleDragLeave = useCallback(() => {
        setDragOverIndex(null)
    }, [])

    /**
     * Maneja el evento de soltar un elemento en una nueva posición.
     * Esta es la función más compleja del hook, que:
     * 1. Valida que la operación sea válida
     * 2. Reordena los elementos localmente
     * 3. Actualiza el servidor (si se proporciona updateOrderIndex)
     * 4. Notifica al componente padre del cambio
     * 5. Maneja errores y estados de loading
     * 
     * @param e - Evento de drop de React
     * @param targetIndex - Índice de destino donde se soltó el elemento
     */
    const handleDrop = useCallback(async (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault()
        setDragOverIndex(null)

        // Validaciones iniciales
        if (!draggedItem || isUpdating) return

        const draggedIndex = sortedItems.findIndex(item => item.id === draggedItem.id)
        if (draggedIndex === targetIndex) {
            setDraggedItem(null)
            return
        }

        setIsUpdating(true)

        try {
            // Crear nueva lista con el elemento reordenado
            const newItems = [...sortedItems]
            const [movedItem] = newItems.splice(draggedIndex, 1)
            newItems.splice(targetIndex, 0, movedItem)

            // Si hay función personalizada para actualizar orden en servidor
            if (updateOrderIndex) {
                /**
                 * Actualiza cada elemento que haya cambiado de posición.
                 * Solo actualiza elementos cuyo orderIndex haya cambiado.
                 */
                const updates = newItems.map(async (item, index) => {
                    const newOrderIndex = index + 1
                    const currentOrderIndex = getOrderIndex ? getOrderIndex(item) : item.orderIndex
                    
                    if (currentOrderIndex !== newOrderIndex) {
                        return await updateOrderIndex(item, newOrderIndex)
                    }
                    return item
                })

                const updatedItems = await Promise.all(updates)
                
                // Combinar elementos ordenados con elementos sin orden
                const itemsWithoutOrder = items.filter(item => {
                    const orderIndex = getOrderIndex ? getOrderIndex(item) : item.orderIndex
                    return orderIndex === null || orderIndex === undefined
                })

                const allUpdatedItems = [...updatedItems, ...itemsWithoutOrder] as T[]
                await onReorder(allUpdatedItems)
            } else {
                // Actualización simple de orderIndex sin llamada al servidor
                const updatedItems = newItems.map((item, index) => ({
                    ...item,
                    orderIndex: index + 1
                })) as T[]

                // Combinar elementos ordenados con elementos sin orden
                const itemsWithoutOrder = items.filter(item => {
                    const orderIndex = getOrderIndex ? getOrderIndex(item) : item.orderIndex
                    return orderIndex === null || orderIndex === undefined
                })

                const allUpdatedItems = [...updatedItems, ...itemsWithoutOrder] as T[]
                await onReorder(allUpdatedItems)
            }
        } catch (error) {
            console.error('Error updating item order:', error)
        } finally {
            setIsUpdating(false)
            setDraggedItem(null)
        }
    }, [draggedItem, isUpdating, sortedItems, items, onReorder, updateOrderIndex, getOrderIndex])

    /**
     * Maneja el final del evento de arrastre.
     * Se ejecuta independientemente de si el drop fue exitoso o no.
     * Limpia todos los estados relacionados con el arrastre.
     */
    const handleDragEnd = useCallback(() => {
        setDraggedItem(null)
        setDragOverIndex(null)
    }, [])

    /** Estado actual del sistema de drag and drop */
    const state: DragAndDropState = {
        draggedItem,
        dragOverIndex,
        isUpdating
    }

    /** Handlers de eventos para conectar con los elementos del DOM */
    const handlers: DragAndDropHandlers = {
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleDragEnd
    }

    /**
     * Retorna los elementos ordenados, el estado actual y los handlers de eventos.
     * 
     * @returns Objeto con:
     * - sortedItems: Array de elementos filtrados y ordenados por orderIndex
     * - state: Estado actual del drag and drop (elemento arrastrado, hover, loading)
     * - handlers: Funciones para manejar eventos de drag and drop
     */
    return {
        sortedItems,
        state,
        handlers
    }
}
