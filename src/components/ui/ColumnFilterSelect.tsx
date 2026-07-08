'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, CircleCheck, Filter } from 'lucide-react'
import { computeDropdownPosition } from '@/lib/utils/dropdown.utils'

const DROPDOWN_MAX_HEIGHT = 256 // px, debe coincidir con max-h del panel
const DROPDOWN_MIN_WIDTH = 180

export interface ColumnFilterOption {
    id: number
    name: string
    color: string
}

interface ColumnFilterSelectProps {
    label: string
    options: ColumnFilterOption[]
    selected: ColumnFilterOption | null
    onChange: (option: ColumnFilterOption | null) => void
    allLabel: string
    className?: string
}

// Filtro de columna compacto (Tipo/Estado/Prioridad en la Lista de sprints):
// mismo patrón portal + computeDropdownPosition que UserFilterSelect/CustomSelect,
// pero como pill de selección única con punto de color en vez de avatar.
export default function ColumnFilterSelect({ label, options, selected, onChange, allLabel, className = '' }: ColumnFilterSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [position, setPosition] = useState<{ top?: number, bottom?: number, left: number, width: number, openUpward: boolean }>({ left: 0, width: 0, openUpward: false })
    const triggerRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            const width = Math.max(rect.width, DROPDOWN_MIN_WIDTH)
            const base = computeDropdownPosition(rect, { maxHeight: DROPDOWN_MAX_HEIGHT, gap: 8 })
            const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))
            setPosition({ ...base, width, left })
        }
    }, [isOpen])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            const insideTrigger = triggerRef.current?.contains(target)
            const insideDropdown = dropdownRef.current?.contains(target)
            if (!insideTrigger && !insideDropdown) setIsOpen(false)
        }
        if (isOpen) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    useEffect(() => {
        const handleScroll = (event: Event) => {
            if (!isOpen) return
            const target = event.target as Node
            if (dropdownRef.current && dropdownRef.current.contains(target)) return
            setIsOpen(false)
        }
        window.addEventListener('scroll', handleScroll, true)
        return () => window.removeEventListener('scroll', handleScroll, true)
    }, [isOpen])

    const handleSelect = (option: ColumnFilterOption | null) => {
        onChange(option)
        setIsOpen(false)
    }

    return (
        <div ref={triggerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 pl-2 pr-2 py-1 rounded-full text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2 max-w-full ${!selected ? `bg-[var(--gray-alpha-100)] hover:bg-[var(--gray-alpha-200)] text-[var(--ds-text-secondary)] ${isOpen ? 'bg-[var(--gray-alpha-200)]' : ''}` : ''}`}
                style={selected ? { backgroundColor: `${selected.color}1f`, color: selected.color } : undefined}
            >
                {selected ? (
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: selected.color }} />
                ) : (
                    <Filter size={12} strokeWidth={2} className="flex-shrink-0" />
                )}
                <span className="truncate">{selected ? selected.name : label}</span>
                <ChevronDown size={12} strokeWidth={2} className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={dropdownRef}
                            initial={{ opacity: 0, y: position.openUpward ? 10 : -10, scale: 0.95, pointerEvents: 'auto' }}
                            animate={{ opacity: 1, y: 0, scale: 1, pointerEvents: 'auto' }}
                            exit={{ opacity: 0, y: position.openUpward ? 10 : -10, scale: 0.95, pointerEvents: 'none' }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="fixed z-[99999] overflow-hidden flex flex-col"
                            style={{
                                ...(position.openUpward ? { bottom: `${position.bottom}px` } : { top: `${position.top}px` }),
                                left: `${position.left}px`,
                                width: `${position.width}px`,
                                maxHeight: DROPDOWN_MAX_HEIGHT,
                                background: "var(--ds-card)",
                                border: "1px solid var(--ds-border)",
                                borderRadius: "var(--radius-md)",
                                boxShadow: "var(--shadow-lg)"
                            }}
                        >
                            <div className="overflow-y-auto custom-scrollbar py-1">
                                <button
                                    type="button"
                                    onClick={() => handleSelect(null)}
                                    className={`w-full flex items-center justify-between gap-3 px-3 py-1.5 text-left transition-colors duration-150 ${!selected ? 'bg-[var(--gray-alpha-200)]' : 'hover:bg-[var(--gray-alpha-100)]'}`}
                                >
                                    <span className="flex items-center gap-2 text-sm font-medium min-w-0" style={{ color: "var(--ds-text-secondary)" }}>
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--gray-alpha-400)" }} />
                                        <span className="truncate">{allLabel}</span>
                                    </span>
                                    {!selected && <CircleCheck size={14} strokeWidth={1.5} style={{ color: "var(--ds-text)" }} className="flex-shrink-0" />}
                                </button>
                                {options.map(option => {
                                    const isSelected = selected?.id === option.id
                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => handleSelect(option)}
                                            className={`w-full flex items-center justify-between gap-3 px-3 py-1.5 text-left transition-colors duration-150 ${isSelected ? 'bg-[var(--gray-alpha-200)]' : 'hover:bg-[var(--gray-alpha-100)]'}`}
                                        >
                                            <span className="flex items-center gap-2 text-sm font-medium min-w-0" style={{ color: option.color }}>
                                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: option.color }} />
                                                <span className="truncate">{option.name}</span>
                                            </span>
                                            {isSelected && <CircleCheck size={14} strokeWidth={1.5} style={{ color: option.color }} className="flex-shrink-0" />}
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    )
}
