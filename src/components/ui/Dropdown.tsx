import { CheckIcon, ChevronDownIcon } from "@public/icon/Icon"
import { motion, AnimatePresence } from "motion/react"
import useClickOutside from "@hooks/useClickOutsite"
import type { DropdownProps } from "@/lib/types/ui"
import { useState, useRef, useMemo } from "react"

export default function Dropdown({ options, selectedValue, onSelect, placeholder, className = "" }: DropdownProps) {
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)

    useClickOutside(dropdownRef, () => setIsOpen(false))

    const normalizedOptions = useMemo(() => {
        return options.map(opt => {
            if ('id' in opt) return { value: String(opt.id), hexColor: opt.color, name: opt.name, hasColor: true }
            return opt
        })
    }, [options])

    const handleSelect = (value: string) => {
        setIsOpen(false)
        onSelect(value)
    }

    const displayLabel = normalizedOptions.find(opt => opt.value === selectedValue)?.name || placeholder

    return (
        <div ref={dropdownRef} className={`text-button-secondary-text relative text-sm w-48 ${className}`}>
            <button className={`${isOpen ? "border-primary" : "border-button-secondary-border"} bg-button-secondary-background transition-colors
                cursor-pointer flex items-center justify-between rounded-md border text-left w-full px-4 py-2`}
                onClick={() => setIsOpen(!isOpen)} aria-haspopup="true" aria-expanded={isOpen}
            >
                <span className="truncate">{displayLabel}</span>
                <ChevronDownIcon className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} size={16} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div role="menu" className="border-button-secondary-border bg-button-secondary-background rounded-md shadow-lg absolute border w-full z-10 mt-2 p-1"
                        initial={{ transition: { duration: 0.1 }, scale: 0.95, opacity: 0, y: -10 }}
                        animate={{ transition: { type: "spring", stiffness: 300, damping: 25 }, opacity: 1, scale: 1, y: 0 }}
                        exit={{ transition: { duration: 0.1 }, scale: 0.95, opacity: 0, y: -10 }}
                    >
                        {normalizedOptions.map(opt =>
                            <button role="menuitem" className="hover:bg-background flex items-center justify-between
                                cursor-pointer outline-none rounded-md text-left w-full text-sm px-2 py-1.5"
                                key={opt.value} onClick={() => handleSelect(opt.value)}
                            >
                                <p className="flex items-center">
                                    {opt.hasColor && <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: opt.hexColor }} />}
                                    {opt.name}
                                </p>
                                {selectedValue === opt.value && <CheckIcon size={16} />}
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}