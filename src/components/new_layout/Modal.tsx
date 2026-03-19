import { AnimatePresence, motion } from "motion/react"
import { PlusIcon, XIcon } from "@/assets/Icon"
import { useModalStore } from "@/lib/hooks/ModalStore"
import { useEffect, useCallback } from "react"

const sizeClasses = {
    full: "max-w-[95vw] h-[95vh]",
    xxl: "max-w-[1280px] h-[95vh]",
    xl: "max-w-[960px] h-[95vh]",
    lg: "max-w-[720px] h-[95vh]",
    md: "max-w-[600px]",
    sm: "max-w-[500px]",
}

const styleClasses = {
    CREATE: "bg-blue-100 text-blue-600",
    UPDATE: "bg-purple-100 text-purple-600",
    DELETE: "bg-red-100 text-red-600",
}

type ModalSize = keyof typeof sizeClasses

export default function Modal() {
    const { modals, closeModal } = useModalStore()

    const handleEscapeKey = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape" && modals.length > 0) {
            const topModal = modals[modals.length - 1]
            if (topModal.closeOnEscape) {
                closeModal(topModal.id)
            }
        }
    }, [modals, closeModal])

    useEffect(() => {
        if (modals.length > 0) {
            document.addEventListener("keydown", handleEscapeKey)
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }

        return () => {
            document.removeEventListener("keydown", handleEscapeKey)
            document.body.style.overflow = "unset"
        }
    }, [modals.length, handleEscapeKey])

    return (
        <AnimatePresence>
            {modals.map((modal, index) => {
                const modalSize = (modal.size || "md") as ModalSize
                const zIndex = 40 + index // Incrementar z-index para cada modal
                const isTopModal = index === modals.length - 1

                const handleBackdropClick = (e: React.MouseEvent) => {
                    if (e.target === e.currentTarget && modal.closeOnBackdrop && isTopModal) {
                        closeModal(modal.id)
                    }
                }

                return (
                    <motion.main
                        key={modal.id}
                        className="backdrop-blur-sm flex items-center justify-center fixed inset-0"
                        style={{ zIndex, backgroundColor: `rgba(0, 0, 0, ${0.4 + (index * 0.1)})` }}
                        onClick={handleBackdropClick}
                        aria-describedby={modal.desc ? `modal-desc-${modal.id}` : undefined}
                        aria-labelledby={`modal-title-${modal.id}`}
                        aria-modal="true"
                        role="dialog"
                        initial={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.section
                            className={`${sizeClasses[modalSize]} bg-button-secondary-background rounded-md flex flex-col w-full max-h-[95vh] overflow-hidden`}
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.7, opacity: 0, y: 20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {
                                modal.title &&
                                <header className="border-black/15 flex items-center justify-between gap-4 p-5 pb-0">
                                    <aside className="flex items-center gap-4 min-w-0 flex-1">
                                        <span className={`${styleClasses[modal.mode ?? "CREATE"]} flex justify-center items-center aspect-square rounded-md p-2 flex-shrink-0`}>
                                            {modal.Icon ? modal.Icon : <PlusIcon size={20} stroke={2} />}
                                        </span>
                                        <hgroup className="flex flex-col min-w-0 flex-1">
                                            <h2 className="text-black font-semibold text-lg/tight truncate" id={`modal-title-${modal.id}`} title={modal.title}>{modal.title}</h2>
                                            {modal.desc && <p className="text-black/50 line-clamp-2 text-sm" id={`modal-desc-${modal.id}`} title={modal.desc}>{modal.desc}</p>}
                                        </hgroup>
                                    </aside>
                                    <button className="hover:bg-black/5 text-black/50 transition-colors aspect-square rounded-md p-2 flex-shrink-0" onClick={() => closeModal(modal.id)}>
                                        <XIcon size={20} stroke={2} />
                                    </button>
                                </header>
                            }

                            <main className="flex-1 min-h-0 overflow-y-auto p-5">{modal.children}</main>
                        </motion.section>
                    </motion.main>
                )
            })}
        </AnimatePresence>
    )
}