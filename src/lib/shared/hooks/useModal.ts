import type { ModalOptions } from "@/lib/types/modal"
import { useModalStore } from "@stores/ModalStore"

export const useModal = () => {
    const { openModal, closeModal, isOpen } = useModalStore()

    const open = (options: ModalOptions) => openModal(options)
    const close = () => closeModal()

    return { isOpen, close, open }
}
