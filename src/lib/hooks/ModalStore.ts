import type { ModalState, ModalOptions, ModalInstance } from "@/lib/types/types"
import { create } from "zustand"

// Función para generar IDs únicos
const generateId = () => `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const useModalStore = create<ModalState>((set, get) => ({
    modals: [],
    isOpen: false,
    currentModal: null,

    openModal: (options: ModalOptions) => {
        const modalId = options.id || generateId()
        
        const newModal: ModalInstance = {
            ...options,
            id: modalId,
            isOpen: true,
            closeOnBackdrop: options.closeOnBackdrop ?? true,
            closeOnEscape: options.closeOnEscape ?? true,
            size: options.size ?? "md",
            mode: options.mode ?? "CREATE",
            desc: options.desc ?? "",
        }

        set((state) => ({
            modals: [...state.modals, newModal],
            isOpen: true,
            currentModal: newModal
        }))

        return modalId
    },

    closeModal: (id?: string) => {
        set((state) => {
            let updatedModals: ModalInstance[]
            
            if (id) {
                // Cerrar una modal específica por ID
                updatedModals = state.modals.filter(modal => modal.id !== id)
            } else {
                // Cerrar la última modal (comportamiento por defecto)
                updatedModals = state.modals.slice(0, -1)
            }

            return {
                modals: updatedModals,
                isOpen: updatedModals.length > 0,
                currentModal: updatedModals[updatedModals.length - 1] || null
            }
        })
    },

    closeAllModals: () => {
        set({
            modals: [],
            isOpen: false,
            currentModal: null
        })
    }
}))
