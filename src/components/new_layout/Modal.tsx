import { AnimatePresence, motion } from "motion/react"
import { PlusIcon, XIcon } from "@/assets/Icon"
import { useModalStore } from "@/lib/hooks/ModalStore"
import { useEffect, useCallback } from "react"

const sizeClasses = {
    full: "max-w-[95vw] h-[95vh]",
    xxl: "max-w-[1280px]",
    xl: "max-w-[960px]",
    lg: "max-w-[720px]",
    md: "max-w-[600px]",
    sm: "max-w-[500px]",
}

const styleClasses = {
    CREATE: "bg-blue-50 text-blue-600",
    UPDATE: "bg-purple-50 text-purple-600",
    DELETE: "bg-red-50 text-red-600",
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
                        className="backdrop-blur-sm flex items-center justify-center fixed inset-0 p-4"
                        style={{
                            zIndex,
                            backgroundColor: `rgba(0, 0, 0, ${0.4 + (index * 0.1)})` // Oscurecer más cada capa
                        }}
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
                            className={`${sizeClasses[modalSize]} bg-button-secondary-background rounded-md flex flex-col w-full max-h-[95vh] p-6`}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <article className="border-background-background rounded-xl shadow-sm border">
                                {
                                    modal.title &&
                                    <header className="border-background-background flex items-center justify-between border-b p-6">
                                        <aside className="flex items-center gap-4">
                                            <span className={`${styleClasses[modal.mode ?? "CREATE"]} flex justify-center items-center rounded-md aspect-square p-2`}>
                                                {modal.Icon ? modal.Icon : <PlusIcon size={20} stroke={1.75} />}
                                            </span>
                                            <hgroup className="flex flex-col">
                                                <h2
                                                    className="text-primary font-semibold line-clamp-1 text-lg"
                                                    id={`modal-title-${modal.id}`}
                                                    title={modal.title}
                                                >
                                                    {modal.title}
                                                </h2>
                                                {modal.desc && (
                                                    <p
                                                        className="text-sm text-gray-600 line-clamp-2"
                                                        id={`modal-desc-${modal.id}`}
                                                        title={modal.desc}
                                                    >
                                                        {modal.desc}
                                                    </p>
                                                )}
                                            </hgroup>
                                        </aside>
                                        <button
                                            onClick={() => closeModal(modal.id)}
                                            className="hover:bg-background-background text-button-secondary-text/50 transition-colors aspect-square p-2 rounded"
                                        >
                                            <XIcon size={20} stroke={2} />
                                        </button>
                                    </header>
                                }

                                {/* Content */}
                                <main className="">{modal.children}</main>
                            </article>
                        </motion.section>
                    </motion.main>
                )
            })}
        </AnimatePresence>
    )
}