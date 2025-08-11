import { StatusProps } from "@/lib/types/config"
import { ChevronRightIcon } from "@public/icon/Icon"
import { motion } from "motion/react"
import { updateBoardState } from "@/lib/core/services/config.service"
import { useDragAndDrop } from "@/lib/shared/hooks/useDragAndDrop"
import DraggableItem from "@/components/ui/DraggableItem"
import LoadingIndicator from "@/components/ui/LoadingIndicator"
import { useConfigStore } from "@/lib/shared/stores/ConfigStore"

export default function Hierarchy({ states }: { states: StatusProps[] }) {
    const { setBoardStates } = useConfigStore()

    const updateStateOrder = async (state: StatusProps, newOrderIndex: number) => {
        const response = await updateBoardState({ state, changes: { orderIndex: newOrderIndex } })
        return response || { ...state, orderIndex: newOrderIndex }
    }

    const handleReorder = async (reorderedStates: StatusProps[]) => setBoardStates(reorderedStates)

    const { sortedItems: sortedStates, state: dragState, handlers } = useDragAndDrop({ updateOrderIndex: updateStateOrder, onReorder: handleReorder, items: states })

    return (
        <article className="flex items-center flex-wrap gap-2">
            {sortedStates.map((state, index) =>
                <span key={state.id} className="flex items-center gap-2">
                    <DraggableItem className="border-button-secondary-border rounded-md shadow-sm border" index={index} id={state.id}
                        isDragged={state.id === dragState.draggedItem?.id} isDraggedOver={dragState.dragOverIndex === index} isUpdating={dragState.isUpdating}
                        onDrop={e => handlers.handleDrop(e as any, index)} onDragLeave={handlers.handleDragLeave} onDragEnd={handlers.handleDragEnd}
                        onDragStart={e => handlers.handleDragStart(e as any, state)} onDragOver={e => handlers.handleDragOver(e as any, index)}>
                        <hgroup className="flex items-center gap-2 px-3 py-2">
                            <span style={{ backgroundColor: state.color }} className="flex-shrink-0 rounded-full w-3 h-3" />
                            <span className="text-button-secondary-text font-medium text-sm">{state.name}</span>
                            <span className="text-button-secondary-text/50 text-xs">#{state.orderIndex}</span>
                        </hgroup>
                    </DraggableItem>
                    {(index < sortedStates.length - 1) && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} > <ChevronRightIcon /> </motion.div>}
                </span>
            )}
            {(dragState.isUpdating) && <LoadingIndicator message="Actualizando orden..." />}
        </article>
    )
}