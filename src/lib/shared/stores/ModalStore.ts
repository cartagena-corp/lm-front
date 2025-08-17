import type { ModalState, ModalOptions } from "@/lib/types/modal"
import { create } from "zustand"

const initialState = {
    closeOnBackdrop: true,
    closeOnEscape: true,
    children: null,
    isOpen: false,
    size: "md",
    title: "",
    desc: "",
} as ModalOptions

export const useModalStore = create<ModalState>((set) => ({
    ...initialState,

    openModal: (options: ModalOptions) => set({
        closeOnBackdrop: options.closeOnBackdrop ?? true,
        closeOnEscape: options.closeOnEscape ?? true,
        isOpen: options.isOpen ?? true,
        children: options.children,
        size: options.size ?? "md",
        title: options.title,
        desc: options.desc,
    }),

    closeModal: () => set({
        closeOnBackdrop: true,
        closeOnEscape: true,
        children: null,
        isOpen: false,
        size: "md",
        title: "",
        desc: "",
    }),
}))
