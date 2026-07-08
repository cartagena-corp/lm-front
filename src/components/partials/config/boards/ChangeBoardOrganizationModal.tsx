"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useOrganizationStore } from "@/lib/store/OrganizationStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { ProjectProps } from "@/lib/types/types"
import { ArrowRight } from "lucide-react"
import { computeDropdownPosition } from "@/lib/utils/dropdown.utils"

const DROPDOWN_MAX_HEIGHT = 240 // px, debe coincidir con max-h-60 del panel

interface ChangeBoardOrganizationModalProps {
    board: ProjectProps
    currentOrganization: { organizationId: string; organizationName: string }
    onSubmit: (data: { organizationId: string }) => void
    onCancel: () => void
}

export default function ChangeBoardOrganizationModal({ board, currentOrganization, onSubmit, onCancel }: ChangeBoardOrganizationModalProps) {
    const { organizations, getAllOrganizations } = useOrganizationStore()
    const { getValidAccessToken } = useAuthStore()

    const [selectedOrganization, setSelectedOrganization] = useState("")
    const [isOrgSelectOpen, setIsOrgSelectOpen] = useState(false)
    const orgSelectRef = useRef<HTMLDivElement>(null)
    const orgPanelRef = useRef<HTMLDivElement>(null)
    const [orgPosition, setOrgPosition] = useState<{ top?: number, bottom?: number, left: number, width: number, openUpward: boolean }>({ left: 0, width: 0, openUpward: false })
    const [mounted, setMounted] = useState(false)

    // Necesario para el portal del dropdown: document solo existe en el cliente
    useEffect(() => {
        setMounted(true)
    }, [])

    // Cargar organizaciones al montar el componente
    useEffect(() => {
        const loadOrganizations = async () => {
            const token = await getValidAccessToken()
            if (!token) return
            await getAllOrganizations(token)
        }
        loadOrganizations()
    }, [getValidAccessToken, getAllOrganizations])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            if (
                orgSelectRef.current &&
                !orgSelectRef.current.contains(target) &&
                !(orgPanelRef.current && orgPanelRef.current.contains(target))
            ) {
                setIsOrgSelectOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // El dropdown se porta a document.body para no quedar recortado por el overflow-y-auto
    // del contenido de la modal (Modal.tsx). Si no cabe debajo antes del borde inferior del
    // viewport, se abre hacia arriba (ver dropdown.utils.ts)
    useEffect(() => {
        if (isOrgSelectOpen && orgSelectRef.current) {
            const rect = orgSelectRef.current.getBoundingClientRect()
            setOrgPosition(computeDropdownPosition(rect, { maxHeight: DROPDOWN_MAX_HEIGHT, gap: 4 }))
        }
    }, [isOrgSelectOpen])

    useEffect(() => {
        if (!isOrgSelectOpen) return
        const handleScroll = (event: Event) => {
            const target = event.target as Node
            if (orgPanelRef.current?.contains(target)) return
            setIsOrgSelectOpen(false)
        }
        window.addEventListener('scroll', handleScroll, true)
        return () => window.removeEventListener('scroll', handleScroll, true)
    }, [isOrgSelectOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedOrganization) {
            onSubmit({
                organizationId: selectedOrganization
            })
        }
    }

    // Filtrar la organización actual de la lista
    const availableOrganizations = organizations.filter(
        org => org.organizationId !== currentOrganization.organizationId
    )

    return (
        <div className="p-6">
            {/* Board Info */}
            <div className="p-4 rounded-md mb-6" style={{ background: "var(--gray-alpha-100)" }}>
                <h4 className="font-medium text-sm" style={{ color: "var(--ds-text)" }}>
                    {board.name}
                </h4>
                <p className="text-sm mt-1" style={{ color: "var(--ds-text-secondary)" }}>{board.description}</p>
                <p className="text-xs mt-1" style={{ color: "var(--ds-text-muted)" }}>
                    Creado: {new Date(board.createdAt).toLocaleDateString()}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Organization Select */}
                <div className="space-y-1 relative" ref={orgSelectRef}>
                    <label htmlFor="organization" className="text-sm font-medium" style={{ color: "var(--ds-text)" }}>
                        Nueva Organización
                    </label>
                    <button
                        id="organization"
                        type="button"
                        onClick={() => setIsOrgSelectOpen(!isOrgSelectOpen)}
                        className="w-full h-9 px-3 rounded-md text-sm flex items-center justify-between transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                        style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}
                    >
                        <span className="truncate" style={{ color: selectedOrganization ? "var(--ds-text)" : "var(--ds-text-muted)" }}>
                            {availableOrganizations.find(org => org.organizationId === selectedOrganization)?.organizationName || "Seleccionar organización"}
                        </span>
                        <svg className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOrgSelectOpen ? "rotate-180" : ""}`}
                            style={{ color: "var(--ds-text-muted)" }}
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>

                    {isOrgSelectOpen && mounted && createPortal(
                        <div
                            ref={orgPanelRef}
                            className="fixed z-[9999] flex flex-col rounded-md text-sm max-h-60 overflow-y-auto"
                            style={{
                                ...(orgPosition.openUpward ? { bottom: orgPosition.bottom } : { top: orgPosition.top }),
                                left: orgPosition.left,
                                width: orgPosition.width,
                                background: "var(--ds-card)", border: "1px solid var(--ds-border)", boxShadow: "var(--shadow-lg)"
                            }}
                        >
                            {availableOrganizations.map(org => (
                                <div
                                    key={org.organizationId}
                                    onClick={() => { setSelectedOrganization(org.organizationId); setIsOrgSelectOpen(false) }}
                                    className="hover:bg-[var(--gray-alpha-100)] transition-colors duration-150 w-full text-start py-2.5 px-3 flex items-center gap-3 cursor-pointer"
                                >
                                    <span className="flex-1 truncate" style={{ color: "var(--ds-text)" }}>{org.organizationName}</span>
                                    {org.organizationId === selectedOrganization && (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0" style={{ color: "var(--blue-700)" }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>,
                        document.body
                    )}
                </div>

                {/* Visual Representation */}
                {selectedOrganization && (
                    <div className="p-4 rounded-md" style={{ background: "var(--blue-100)", border: "1px solid var(--blue-400)" }}>
                        <p className="text-xs font-medium mb-3" style={{ color: "var(--blue-900)" }}>Vista Previa del Cambio</p>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0 text-center">
                                <p className="text-sm font-medium truncate" style={{ color: "var(--ds-text-muted)" }}>{currentOrganization.organizationName}</p>
                            </div>
                            <div className="flex-shrink-0" style={{ color: "var(--blue-900)" }}>
                                <ArrowRight size={20} strokeWidth={2} />
                            </div>
                            <div className="flex-1 min-w-0 text-center">
                                <p className="text-sm font-medium truncate" style={{ color: "var(--blue-900)" }}>
                                    {organizations.find(org => org.organizationId === selectedOrganization)?.organizationName}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => onCancel()}
                        className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                        style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!selectedOrganization}
                        className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                        style={{ color: "var(--primary-contrast-fg)" }}
                    >
                        Confirmar Cambio
                    </button>
                </div>
            </form>
        </div>
    )
}
