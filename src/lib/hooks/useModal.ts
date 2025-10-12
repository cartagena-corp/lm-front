import type { ModalOptions } from "@/lib/types/types"
import { useModalStore } from "./ModalStore"

export const useModal = () => {
    const { openModal, closeModal, closeAllModals, isOpen, currentModal } = useModalStore()

    const open = (options: ModalOptions): string => openModal(options)
    const close = (id?: string) => closeModal(id)
    const closeAll = () => closeAllModals()

    return { 
        isOpen, 
        close, 
        open, 
        closeAll,
        currentModal
    }
}
