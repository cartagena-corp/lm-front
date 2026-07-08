'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, CircleCheck, Search, X } from 'lucide-react'
import { computeDropdownPosition } from '@/lib/utils/dropdown.utils'
import { getUserAvatar } from '@/lib/utils/avatar.utils'

const DROPDOWN_MAX_HEIGHT = 288 // px, debe coincidir con max-h-72 del panel
const DROPDOWN_MIN_WIDTH = 288 // el panel necesita más ancho que el pill para mostrar nombre + email
const SEARCH_THRESHOLD = 6 // a partir de cuántos usuarios vale la pena mostrar el buscador

export interface FilterUser {
    id: string
    firstName?: string
    lastName?: string
    email?: string
    picture?: string
}

interface UserFilterSelectProps {
    users: FilterUser[]
    selected: FilterUser[]
    onChange: (users: FilterUser[]) => void
    allLabel?: string
    className?: string
}

function getUserLabel(user: FilterUser) {
    return user.firstName || user.lastName
        ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
        : (user.email || 'Sin asignar')
}

function getUserInitials(user: FilterUser) {
    return user.firstName || user.lastName
        ? ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase()
        : (user.email?.[0] || '?').toUpperCase()
}

export default function UserFilterSelect({ users, selected, onChange, allLabel = 'Todos', className = '' }: UserFilterSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [search, setSearch] = useState('')
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
        } else {
            setSearch('')
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

    const filteredUsers = useMemo(() => {
        if (!search.trim()) return users
        const q = search.trim().toLowerCase()
        return users.filter(u => getUserLabel(u).toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
    }, [users, search])

    const toggleUser = (user: FilterUser) => {
        const isSelected = selected.some(u => u.id === user.id)
        onChange(isSelected ? selected.filter(u => u.id !== user.id) : [...selected, user])
    }

    const summaryLabel = selected.length === 1
        ? getUserLabel(selected[0]).slice(0, 20) + (getUserLabel(selected[0]).length > 20 ? '…' : '')
        : selected.length > 1
            ? `${selected.length} seleccionados`
            : allLabel

    return (
        <div ref={triggerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`bg-[var(--gray-alpha-100)] hover:bg-[var(--gray-alpha-200)] transition-colors duration-150 rounded-full pr-2 flex items-center gap-2 w-full group focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2 ${isOpen ? 'bg-[var(--gray-alpha-200)]' : ''}`}
            >
                <div className={`w-5 h-5 rounded-full bg-[var(--gray-alpha-200)] flex items-center justify-center overflow-hidden relative group ${selected.length > 0 ? 'cursor-pointer' : ''}`}>
                    {selected.length > 0 && (
                        <div
                            className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all duration-150 z-10"
                            style={{ background: "var(--gray-alpha-900)", color: "var(--ds-contrast-inverse)" }}
                            title="Limpiar selección"
                            onClick={e => { e.stopPropagation(); onChange([]) }}
                        >
                            <X size={14} strokeWidth={2} />
                        </div>
                    )}
                    <span className={`${selected.length > 0 ? 'opacity-100 group-hover:opacity-0 transition-opacity' : ''} flex items-center justify-center w-full h-full`}>
                        {selected.length === 1 ? (
                            selected[0].picture ? (
                                <img src={getUserAvatar(selected[0], 28)} alt="avatar" className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <span className="text-xs font-medium" style={{ color: "var(--ds-text-secondary)" }}>{getUserInitials(selected[0])}</span>
                            )
                        ) : selected.length > 1 ? (
                            <span className="text-xs font-semibold" style={{ color: "var(--ds-text-secondary)" }}>{selected.length}</span>
                        ) : (
                            <span className="text-xs font-medium" style={{ color: "var(--ds-text-muted)" }}>?</span>
                        )}
                    </span>
                </div>
                <span className="text-xs font-medium truncate block mr-auto" style={{ color: "var(--ds-text)" }} title={summaryLabel}>
                    {summaryLabel}
                </span>
                <ChevronDown
                    className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    size={16}
                    strokeWidth={2}
                    style={{ color: "var(--ds-text-muted)" }}
                />
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
                            {users.length > SEARCH_THRESHOLD && (
                                <div className="flex items-center gap-2 px-3 h-9 flex-shrink-0" style={{ borderBottom: "1px solid var(--ds-border)" }}>
                                    <Search size={14} strokeWidth={1.5} style={{ color: "var(--ds-text-muted)" }} />
                                    <input
                                        type="search"
                                        autoFocus
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Buscar integrante..."
                                        className="outline-none text-sm w-full bg-transparent placeholder:text-[var(--ds-text-muted)]"
                                        style={{ color: "var(--ds-text)" }}
                                    />
                                </div>
                            )}
                            <div className="overflow-y-auto custom-scrollbar">
                                <button
                                    type="button"
                                    onClick={() => { onChange([]); setIsOpen(false) }}
                                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left transition-colors duration-150 ${selected.length === 0 ? 'bg-[var(--gray-alpha-200)]' : 'hover:bg-[var(--gray-alpha-100)]'}`}
                                    style={{ borderBottom: "1px solid var(--ds-border)" }}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: "var(--gray-alpha-200)" }}>
                                            <span className="text-xs font-medium" style={{ color: "var(--ds-text-muted)" }}>?</span>
                                        </div>
                                        <span className="text-sm font-medium truncate" style={{ color: "var(--ds-text)" }}>{allLabel}</span>
                                    </div>
                                    {selected.length === 0 && (
                                        <CircleCheck size={16} strokeWidth={1.5} style={{ color: "var(--ds-text)" }} className="flex-shrink-0" />
                                    )}
                                </button>

                                {filteredUsers.length === 0 ? (
                                    <p className="px-3 py-4 text-sm text-center" style={{ color: "var(--ds-text-muted)" }}>Sin resultados</p>
                                ) : filteredUsers.map(user => {
                                    const isSelected = selected.some(u => u.id === user.id)
                                    return (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={e => { e.stopPropagation(); toggleUser(user) }}
                                            className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left transition-colors duration-150 ${isSelected ? 'bg-[var(--gray-alpha-200)]' : 'hover:bg-[var(--gray-alpha-100)]'}`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 transition-all ${isSelected ? 'ring-[var(--blue-700)]' : 'ring-transparent'}`} style={{ background: "var(--gray-alpha-200)" }}>
                                                    {user.picture ? (
                                                        <img src={getUserAvatar(user, 28)} alt={user.id} className="w-full h-full object-cover rounded-full" />
                                                    ) : (
                                                        <span className="text-xs font-medium" style={{ color: "var(--ds-text-secondary)" }}>{getUserInitials(user)}</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-medium truncate" style={{ color: "var(--ds-text)" }}>{getUserLabel(user)}</span>
                                                    {user.email && (
                                                        <span className="text-xs truncate" style={{ color: "var(--ds-text-muted)" }}>{user.email}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <CircleCheck size={16} strokeWidth={1.5} style={{ color: "var(--blue-700)" }} className="flex-shrink-0" />
                                            )}
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
