'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, CircleCheck } from 'lucide-react'
import Image from 'next/image'
import { computeDropdownPosition } from '@/lib/utils/dropdown.utils'

const DROPDOWN_MAX_HEIGHT = 256 // px, debe coincidir con max-h-64 del panel

export interface SelectOption {
    value: string | number
    label: string
    color?: string
    icon?: React.ReactNode
    image?: string
    subtitle?: string
}

interface CustomSelectProps {
    value: string | number | null
    onChange: (value: string | number | null) => void
    options: SelectOption[]
    placeholder?: string
    variant?: 'default' | 'colored' | 'user'
    className?: string
    disabled?: boolean
}

export default function CustomSelect({
    value,
    onChange,
    options,
    placeholder = 'Seleccionar...',
    variant = 'default',
    className = '',
    disabled = false
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState<{ top?: number, bottom?: number, left: number, width: number, openUpward: boolean }>({ left: 0, width: 0, openUpward: false })
    const [mounted, setMounted] = useState(false)
    const selectRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find(opt => opt.value === value)

    // Necesario para el portal: document solo existe en el cliente
    useEffect(() => {
        setMounted(true)
    }, [])

    // Calcular posición del dropdown cuando se abre — si no cabe debajo del trigger antes
    // del borde inferior del viewport, se abre hacia arriba (ver dropdown.utils.ts)
    useEffect(() => {
        if (isOpen && selectRef.current) {
            const rect = selectRef.current.getBoundingClientRect()
            setDropdownPosition(computeDropdownPosition(rect, { maxHeight: DROPDOWN_MAX_HEIGHT, gap: 8 }))
        }
    }, [isOpen])

    // Cerrar el select al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            const insideTrigger = selectRef.current && selectRef.current.contains(target)
            const insideDropdown = dropdownRef.current && dropdownRef.current.contains(target)
            if (!insideTrigger && !insideDropdown) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    // Cerrar el dropdown al hacer scroll de la página, pero no cuando el scroll
    // ocurre dentro de la propia lista de opciones (el listener usa capture: true
    // para detectar scroll en cualquier contenedor, así que hay que excluir el dropdown)
    useEffect(() => {
        const handleScroll = (event: Event) => {
            if (!isOpen) return
            const target = event.target as Node
            if (dropdownRef.current && dropdownRef.current.contains(target)) {
                return
            }
            setIsOpen(false)
        }

        window.addEventListener('scroll', handleScroll, true) // true para capturar en fase de captura

        return () => {
            window.removeEventListener('scroll', handleScroll, true)
        }
    }, [isOpen])

    const handleSelect = (optionValue: string | number | null) => {
        onChange(optionValue)
        setIsOpen(false)
    }

    const renderSelectedValue = () => {
        if (!selectedOption) {
            return <span className="text-sm w-full flex items-center justify-between" style={{ color: "var(--ds-text-muted)" }}>{placeholder}</span>
        }

        switch (variant) {
            case 'colored':
                return (
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: selectedOption.color || 'var(--gray-700)' }}
                        />
                        <span
                            className="text-sm font-medium truncate"
                            style={{ color: selectedOption.color || 'var(--ds-text)' }}
                        >
                            {selectedOption.label}
                        </span>
                    </div>
                )

            case 'user':
                return (
                    <div className="flex items-center gap-1.5">
                        {selectedOption.image ? (
                            <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0" style={{ background: "var(--gray-alpha-200)" }}>
                                <Image
                                    src={selectedOption.image}
                                    alt={selectedOption.label}
                                    width={16}
                                    height={16}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--gray-alpha-200)", color: "var(--ds-text-secondary)" }}>
                                <span className="text-[10px] font-bold">
                                    {selectedOption.label.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate" style={{ color: "var(--ds-text)" }}>
                                {selectedOption.label}
                            </span>
                        </div>
                    </div>
                )

            default:
                return (
                    <span className="text-sm truncate" style={{ color: "var(--ds-text)" }}>
                        {selectedOption.label}
                    </span>
                )
        }
    }

    const renderOption = (option: SelectOption) => {
        const isSelected = option.value === value

        switch (variant) {
            case 'colored':
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left transition-colors duration-150 ${
                            isSelected ? 'bg-[var(--gray-alpha-200)]' : 'hover:bg-[var(--gray-alpha-100)]'
                        }`}
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <motion.div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: option.color || 'var(--gray-700)' }}
                                animate={{
                                    scale: isSelected ? [1, 1.3, 1] : 1,
                                }}
                                transition={{ duration: 0.3 }}
                            />
                            <span
                                className="text-sm font-medium truncate"
                                style={{ color: option.color || 'var(--ds-text-secondary)' }}
                            >
                                {option.label}
                            </span>
                        </div>
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                style={{ color: option.color || 'var(--ds-text)' }}
                            >
                                <CircleCheck size={14} strokeWidth={1.5} />
                            </motion.div>
                        )}
                    </button>
                )

            case 'user':
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left transition-colors duration-150 ${
                            isSelected ? 'bg-[var(--gray-alpha-200)]' : 'hover:bg-[var(--gray-alpha-100)]'
                        }`}
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {option.image ? (
                                <div
                                    className={`w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-[var(--gray-alpha-200)] ring-2 transition-all ${
                                        isSelected ? 'ring-[var(--blue-700)]' : 'ring-transparent'
                                    }`}
                                >
                                    <Image
                                        src={option.image}
                                        alt={option.label}
                                        width={24}
                                        height={24}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <motion.div
                                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: "var(--gray-alpha-200)", color: "var(--ds-text-secondary)" }}
                                    animate={{
                                        scale: isSelected ? [1, 1.1, 1] : 1,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <span className="text-[10px] font-bold">
                                        {option.label.charAt(0).toUpperCase()}
                                    </span>
                                </motion.div>
                            )}
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium truncate" style={{ color: "var(--ds-text)" }}>
                                    {option.label}
                                </span>
                                {option.subtitle && (
                                    <span className="text-[10px] truncate" style={{ color: "var(--ds-text-muted)" }}>
                                        {option.subtitle}
                                    </span>
                                )}
                            </div>
                        </div>
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="text-[var(--ds-text)]"
                            >
                                <CircleCheck size={14} strokeWidth={1.5} />
                            </motion.div>
                        )}
                    </button>
                )

            default:
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left transition-colors duration-150 ${
                            isSelected ? 'bg-[var(--gray-alpha-200)]' : 'hover:bg-[var(--gray-alpha-100)]'
                        }`}
                    >
                        <span className="text-sm truncate" style={{ color: "var(--ds-text)" }}>{option.label}</span>
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="text-[var(--ds-text)]"
                            >
                                <CircleCheck size={14} strokeWidth={1.5} />
                            </motion.div>
                        )}
                    </button>
                )
        }
    }

    return (
        <div ref={selectRef} className={`relative ${className}`}>
            {/* Botón principal del select */}
            <motion.button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full h-9 flex items-center justify-between gap-2 px-2.5 rounded-md text-sm text-left transition-all duration-150 bg-[var(--ds-card)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2 ${
                    disabled
                        ? 'shadow-[0_0_0_1px_var(--ds-border)] cursor-not-allowed opacity-60'
                        : isOpen
                        ? 'shadow-[0_0_0_1px_var(--gray-alpha-600)]'
                        : 'shadow-[0_0_0_1px_var(--ds-border)] hover:shadow-[0_0_0_1px_var(--ds-border-strong)]'
                }`}
                whileTap={!disabled ? { scale: 0.98 } : {}}
            >
                <div className="flex-1 min-w-0">{renderSelectedValue()}</div>
                <motion.div
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className={`flex-shrink-0 ${
                        disabled ? 'text-[var(--ds-text-muted)]' : 'text-[var(--ds-text-secondary)]'
                    }`}
                >
                    <ChevronRight size={14} strokeWidth={2} />
                </motion.div>
            </motion.button>

            {/* Dropdown con opciones — se renderiza en un portal a document.body para no
                quedar recortado por ancestros con overflow o con un transform (p. ej. las
                animaciones de framer-motion del Modal), que romperían el position:fixed */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={dropdownRef}
                            initial={{ opacity: 0, y: dropdownPosition.openUpward ? 10 : -10, scale: 0.95, pointerEvents: 'auto' }}
                            animate={{ opacity: 1, y: 0, scale: 1, pointerEvents: 'auto' }}
                            exit={{ opacity: 0, y: dropdownPosition.openUpward ? 10 : -10, scale: 0.95, pointerEvents: 'none' }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="fixed z-[99999] overflow-hidden"
                            style={{
                                ...(dropdownPosition.openUpward
                                    ? { bottom: `${dropdownPosition.bottom}px` }
                                    : { top: `${dropdownPosition.top}px` }),
                                left: `${dropdownPosition.left}px`,
                                width: `${dropdownPosition.width}px`,
                                background: "var(--ds-card)",
                                border: "1px solid var(--ds-border)",
                                borderRadius: "var(--radius-md)",
                                boxShadow: "var(--shadow-lg)"
                            }}
                        >
                            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                {/* Opción "Todos" o limpiar selección */}
                                <button
                                    type="button"
                                    onClick={() => handleSelect(null)}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left transition-colors duration-150 border-b border-[var(--ds-border)] ${
                                        value === null ? 'bg-[var(--gray-alpha-200)]' : 'hover:bg-[var(--gray-alpha-100)]'
                                    }`}
                                >
                                    <span className="text-sm font-medium" style={{ color: "var(--ds-text-secondary)" }}>
                                        {placeholder}
                                    </span>
                                    {value === null && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            exit={{ scale: 0, rotate: 180 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            className="text-[var(--ds-text)]"
                                        >
                                            <CircleCheck size={16} strokeWidth={1.5} />
                                        </motion.div>
                                    )}
                                </button>

                                {/* Opciones */}
                                {options.map((option) => renderOption(option))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    )
}
