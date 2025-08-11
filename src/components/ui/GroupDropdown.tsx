import { ChevronDownIcon, FilterIcon } from "@public/icon/Icon"
import { motion, AnimatePresence } from "motion/react"
import useClickOutside from "@hooks/useClickOutsite"
import { useState, useRef, ReactNode } from "react"

interface GroupDropdownProps {
    children: ReactNode
    className?: string
    label: string
}

export default function GroupDropdown({ label, children, className = "" }: GroupDropdownProps) {
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)

    useClickOutside(dropdownRef, () => setIsOpen(false))

    return (
        <div ref={dropdownRef} className={`text-button-secondary-text relative text-sm ${className}`}>
            <button onClick={() => setIsOpen(!isOpen)} aria-haspopup="true" aria-expanded={isOpen}
                className={`${isOpen ? "border-primary" : "border-button-secondary-border"} bg-button-secondary-background transition-colors
                    cursor-pointer flex items-center justify-between rounded-md border text-left px-4 py-2 min-w-40`}
            >
                <hgroup className="flex items-center gap-2">
                    <FilterIcon size={16} />
                    {label}
                </hgroup>
                <ChevronDownIcon className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} size={16} />
            </button>

            <AnimatePresence>
                {isOpen &&
                    <motion.div className="border-button-secondary-border bg-button-secondary-background rounded-lg shadow-xl absolute border z-20 mt-2 p-4 min-w-80 right-0 space-y-4"
                        initial={{ transition: { duration: 0.1 }, scale: 0.95, opacity: 0, y: -10 }} exit={{ transition: { duration: 0.1 }, scale: 0.95, opacity: 0, y: -10 }}
                        animate={{ transition: { type: "spring", stiffness: 300, damping: 25 }, opacity: 1, scale: 1, y: 0 }}>
                        <h3 className="text-button-secondary-text font-medium text-base">Filtros de Búsqueda</h3>
                        {children}
                    </motion.div>
                }
            </AnimatePresence>
        </div>
    )
}
