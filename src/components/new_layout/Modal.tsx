import { AnimatePresence, motion } from "motion/react"
import { Plus, X } from "lucide-react"
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

const styleClasses: Record<"CREATE" | "UPDATE" | "DELETE", React.CSSProperties> = {
    CREATE: { background: "var(--blue-200)", color: "var(--blue-900)" },
    UPDATE: { background: "var(--purple-200)", color: "var(--purple-900)" },
    DELETE: { background: "var(--red-200)", color: "var(--red-900)" },
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
                            className={`${sizeClasses[modalSize]} flex flex-col w-full max-h-[95vh]`}
                            style={{ background: "var(--ds-card)", color: "var(--ds-text)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)" }}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <article className="flex flex-col h-full min-h-0">
                                {
                                    modal.title &&
                                    <header className="flex items-center justify-between p-5 flex-shrink-0" style={{ borderBottom: "1px solid var(--ds-border)" }}>
                                        <aside className="flex items-center gap-3 min-w-0">
                                            <span className="flex justify-center items-center aspect-square p-2" style={{ borderRadius: "var(--radius-md)", ...styleClasses[modal.mode ?? "CREATE"] }}>
                                                {modal.Icon ? modal.Icon : <Plus size={20} strokeWidth={1.75} />}
                                            </span>
                                            <hgroup className="flex flex-col min-w-0">
                                                <h2
                                                    className="font-semibold line-clamp-1 text-base"
                                                    style={{ color: "var(--ds-text)", letterSpacing: "-0.01em" }}
                                                    id={`modal-title-${modal.id}`}
                                                    title={modal.title}
                                                >
                                                    {modal.title}
                                                </h2>
                                                {modal.desc && (
                                                    <p
                                                        className="text-sm line-clamp-2"
                                                        style={{ color: "var(--ds-text-secondary)" }}
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
                                            className="transition-colors aspect-square p-2 rounded-md flex-shrink-0 hover:bg-[var(--gray-alpha-100)]"
                                            style={{ color: "var(--ds-text-muted)" }}
                                        >
                                            <X size={20} strokeWidth={2} />
                                        </button>
                                    </header>
                                }

                                {/* Content */}
                                <main className="flex-1 min-h-0 overflow-y-auto">{modal.children}</main>
                            </article>
                        </motion.section>
                    </motion.main>
                )
            })}
        </AnimatePresence>
    )
}