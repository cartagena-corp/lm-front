import { AnimatePresence, motion } from "motion/react"
import { useModalStore } from "@stores/ModalStore"
import { useEffect, useCallback } from "react"
import { XIcon } from "@public/icon/Icon"

const sizeClasses = {
    full: "max-w-[95vw] max-h-[95vh]",
    xxl: "max-w-2xl",
    xl: "max-w-xl",
    lg: "max-w-lg",
    md: "max-w-md",
    sm: "max-w-sm",
}

export default function Modal() {
    const { isOpen, title, desc, size, children, closeOnBackdrop, closeOnEscape, closeModal } = useModalStore()

    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget && closeOnBackdrop) closeModal()
    }, [closeOnBackdrop, closeModal])

    const handleEscapeKey = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape" && closeOnEscape && isOpen) closeModal()
    }, [closeOnEscape, isOpen, closeModal])

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleEscapeKey)
            document.body.style.overflow = "hidden"
        } else document.body.style.overflow = "unset"

        return () => {
            document.removeEventListener("keydown", handleEscapeKey)
            document.body.style.overflow = "unset"
        }
    }, [isOpen, handleEscapeKey])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={handleBackdropClick}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    aria-describedby={desc ? "modal-desc" : undefined}
                >
                    <motion.div
                        className={`
                            bg-white rounded-lg shadow-2xl w-full ${sizeClasses[size || "md"]}
                            max-h-[90vh] overflow-hidden flex flex-col
                            border border-gray-200
                        `}
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        {/* Header */}
                        <header className="flex items-start justify-between p-6 border-b border-gray-200 bg-gray-50/50">
                            <div className="flex-1 min-w-0">
                                <h2
                                    id="modal-title"
                                    className="text-xl font-semibold text-gray-900 truncate pr-4"
                                    title={title}
                                >
                                    {title}
                                </h2>
                                {desc && (
                                    <p
                                        id="modal-desc"
                                        className="mt-1 text-sm text-gray-600 line-clamp-2"
                                        title={desc}
                                    >
                                        {desc}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={closeModal}
                                className="
                                    flex-shrink-0 p-2 rounded-md text-gray-400 
                                    hover:text-gray-600 hover:bg-gray-100 
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                    transition-colors duration-200
                                "
                                aria-label="Cerrar modal"
                                type="button"
                            >
                                <XIcon size={20} strokeWidth={2} />
                            </button>
                        </header>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
} 