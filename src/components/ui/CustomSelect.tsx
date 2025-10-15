'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRightIcon, CheckmarkIcon } from '@/assets/Icon'
import Image from 'next/image'

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
    const selectRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find(opt => opt.value === value)

    // Cerrar el select al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
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

    const handleSelect = (optionValue: string | number | null) => {
        onChange(optionValue)
        setIsOpen(false)
    }

    const renderSelectedValue = () => {
        if (!selectedOption) {
            return <span className="text-gray-400 text-xs w-full flex items-center justify-between">{placeholder}</span>
        }

        switch (variant) {
            case 'colored':
                return (
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: selectedOption.color || '#6B7280' }}
                        />
                        <span
                            className="text-xs font-medium truncate"
                            style={{ color: selectedOption.color || '#111827' }}
                        >
                            {selectedOption.label}
                        </span>
                    </div>
                )

            case 'user':
                return (
                    <div className="flex items-center gap-1.5">
                        {selectedOption.image ? (
                            <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                                <Image
                                    src={selectedOption.image}
                                    alt={selectedOption.label}
                                    width={16}
                                    height={16}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-[10px] font-bold">
                                    {selectedOption.label.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium text-gray-900 truncate">
                                {selectedOption.label}
                            </span>
                        </div>
                    </div>
                )

            default:
                return (
                    <span className="text-xs text-gray-900 truncate">
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
                        onClick={() => handleSelect(option.value)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left transition-colors ${
                            isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <motion.div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: option.color || '#6B7280' }}
                                animate={{
                                    scale: isSelected ? [1, 1.3, 1] : 1,
                                }}
                                transition={{ duration: 0.3 }}
                            />
                            <span
                                className="text-xs font-medium truncate"
                                style={{ color: option.color || '#374151' }}
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
                                style={{ color: option.color || '#3B82F6' }}
                            >
                                <CheckmarkIcon size={14} />
                            </motion.div>
                        )}
                    </button>
                )

            case 'user':
                return (
                    <button
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left transition-colors ${
                            isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {option.image ? (
                                <div
                                    className={`w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 ring-2 transition-all ${
                                        isSelected ? 'ring-blue-500' : 'ring-transparent'
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
                                    className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0"
                                    animate={{
                                        scale: isSelected ? [1, 1.1, 1] : 1,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <span className="text-white text-[10px] font-bold">
                                        {option.label.charAt(0).toUpperCase()}
                                    </span>
                                </motion.div>
                            )}
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-medium text-gray-900 truncate">
                                    {option.label}
                                </span>
                                {option.subtitle && (
                                    <span className="text-[10px] text-gray-500 truncate">
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
                                className="text-blue-600"
                            >
                                <CheckmarkIcon size={14} />
                            </motion.div>
                        )}
                    </button>
                )

            default:
                return (
                    <button
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left transition-colors ${
                            isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                    >
                        <span className="text-xs text-gray-900 truncate">{option.label}</span>
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="text-blue-600"
                            >
                                <CheckmarkIcon size={14} />
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
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 bg-white border rounded text-left transition-all ${
                    disabled
                        ? 'bg-gray-50 cursor-not-allowed opacity-60'
                        : isOpen
                        ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 shadow-sm hover:shadow'
                }`}
                whileTap={!disabled ? { scale: 0.98 } : {}}
            >
                <div className="flex-1 min-w-0">{renderSelectedValue()}</div>
                <motion.div
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className={`flex-shrink-0 ${
                        disabled ? 'text-gray-400' : 'text-gray-500'
                    }`}
                >
                    <ChevronRightIcon size={14} stroke={2} />
                </motion.div>
            </motion.button>

            {/* Dropdown con opciones */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute z-[100] left-0 right-0 mt-2 bg-white border border-gray-200 rounded shadow-xl overflow-hidden"
                    >
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {/* Opción "Todos" o limpiar selección */}
                            <button
                                onClick={() => handleSelect(null)}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left transition-colors border-b border-gray-100 ${
                                    value === null ? 'bg-blue-50' : 'hover:bg-gray-50'
                                }`}
                            >
                                <span className="text-xs font-medium text-gray-600">
                                    {placeholder}
                                </span>
                                {value === null && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0, rotate: 180 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        className="text-blue-600"
                                    >
                                        <CheckmarkIcon size={16} />
                                    </motion.div>
                                )}
                            </button>

                            {/* Opciones */}
                            {options.map((option) => renderOption(option))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
