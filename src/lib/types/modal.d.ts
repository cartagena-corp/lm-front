import { ReactNode } from "react"

export interface ModalState extends ModalOptions {
    openModal: (options: ModalOptions) => void
    closeModal: () => void
}

export interface ModalOptions {
    size?: "sm" | "md" | "lg" | "xl" | "xxl" | "full"
    closeOnBackdrop: boolean
    closeOnEscape: boolean
    children: ReactNode
    isOpen: boolean
    title: string
    desc: string
}
