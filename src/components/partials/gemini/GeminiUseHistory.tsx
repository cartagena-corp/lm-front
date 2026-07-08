"use client"

import { useState, useEffect, useCallback } from 'react'
import { useGeminiStore } from '@/lib/store/GeminiStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll'
import { useModalStore } from '@/lib/hooks/ModalStore'
import { ClipboardCheck, Filter, Clock, CircleCheck, AlertCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import FilterGeminiHistoryForm, { GeminiHistoryFiltersValue } from './FilterGeminiHistoryForm'

export default function GeminiUseHistory() {
    const [filters, setFilters] = useState<GeminiHistoryFiltersValue>({
        feature: '',
        projectId: '',
        userEmail: ''
    })
    const [isLoadingMore, setIsLoadingMore] = useState(false)

    const { openModal, closeModal } = useModalStore()

    const {
        historyItems,
        historyLoading,
        historyHasMore,
        historyTotalElements,
        historyCurrentPage,
        historySize,
        getHistory,
        getHistoryFilters,
        resetHistory
    } = useGeminiStore()

    const { getValidAccessToken } = useAuthStore()

    // Cargar filtros disponibles al montar el componente
    useEffect(() => {
        const loadFilters = async () => {
            try {
                const token = await getValidAccessToken()
                if (token) {
                    await getHistoryFilters(token)
                }
            } catch (error) {
                console.error('Error al cargar filtros:', error)
                toast.error('Error al cargar los filtros disponibles')
            }
        }

        loadFilters()
    }, [getValidAccessToken, getHistoryFilters])

    // Cargar historial inicial
    useEffect(() => {
        // Cargar historial inicial con filtros vacíos
        loadInitialHistory({
            feature: '',
            projectId: '',
            userEmail: ''
        })
    }, []) // Solo se ejecuta una vez al montar

    const loadInitialHistory = useCallback(async (customFilters?: typeof filters) => {
        try {
            const token = await getValidAccessToken()
            if (token) {
                resetHistory()
                const filtersToUse = customFilters || filters
                await getHistory(token, {
                    feature: filtersToUse.feature,
                    projectId: filtersToUse.projectId,
                    userEmail: filtersToUse.userEmail,
                    page: 0,
                    size: historySize
                }, true)
            }
        } catch (error) {
            console.error('Error al cargar historial:', error)
            toast.error('Error al cargar el historial de uso')
        }
    }, [getValidAccessToken, resetHistory, getHistory, historySize, filters])

    const loadMoreHistory = useCallback(async () => {
        if (historyLoading || !historyHasMore || isLoadingMore) return

        setIsLoadingMore(true)
        try {
            const token = await getValidAccessToken()
            if (token) {
                await getHistory(token, {
                    feature: filters.feature,
                    projectId: filters.projectId,
                    userEmail: filters.userEmail,
                    page: historyCurrentPage + 1,
                    size: historySize
                }, false)
            }
        } catch (error) {
            console.error('Error al cargar más historial:', error)
            toast.error('Error al cargar más elementos del historial')
        } finally {
            setIsLoadingMore(false)
        }
    }, [historyLoading, historyHasMore, isLoadingMore, historyCurrentPage, historySize, filters.feature, filters.projectId, filters.userEmail, getValidAccessToken, getHistory])

    const applyFilters = async (newFilters: GeminiHistoryFiltersValue) => {
        setFilters(newFilters)
        try {
            const token = await getValidAccessToken()
            if (token) {
                resetHistory()
                await getHistory(token, {
                    feature: newFilters.feature,
                    projectId: newFilters.projectId,
                    userEmail: newFilters.userEmail,
                    page: 0,
                    size: historySize
                }, true)
            }
        } catch (error) {
            console.error('Error al aplicar filtros:', error)
            toast.error('Error al aplicar los filtros')
        } finally {
            closeModal()
        }
    }

    const handleFilterHistoryModal = () => {
        openModal({
            size: "md",
            title: "Filtrar historial",
            desc: "Encuentra registros específicos usando los filtros",
            Icon: <Filter size={20} strokeWidth={1.75} />,
            children: <FilterGeminiHistoryForm onSubmit={applyFilters} onCancel={() => closeModal()} initialFilters={filters} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "UPDATE"
        })
    }

    const clearFilters = async () => {
        const clearedFilters = {
            feature: '',
            projectId: '',
            userEmail: ''
        }
        setFilters(clearedFilters)
        // Usar los filtros limpiados directamente
        await loadInitialHistory(clearedFilters)
    }

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'ok':
                return <div className="flex"><CircleCheck size={16} strokeWidth={1.5} /></div>
            case 'error':
                return <div className="flex"><AlertCircle size={16} strokeWidth={1.5} /></div>
            default:
                return <div className="flex"><Clock size={16} strokeWidth={1.5} /></div>
        }
    }

    const getStatusColor = (status: string): React.CSSProperties => {
        switch (status.toLowerCase()) {
            case 'ok':
                return { background: "var(--green-100)", color: "var(--green-900)", boxShadow: "0 0 0 1px var(--green-400)" }
            case 'error':
                return { background: "var(--red-100)", color: "var(--red-900)", boxShadow: "0 0 0 1px var(--red-400)" }
            default:
                return { background: "var(--amber-100)", color: "var(--amber-900)", boxShadow: "0 0 0 1px var(--amber-400)" }
        }
    }

    const getFeatureLabel = (feature: string) => {
        switch (feature) {
            case 'chat':
                return 'Chat con IA'
            case 'detect-issues':
                return 'Detectar Issues'
            default:
                return feature
        }
    }

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getActiveFiltersCount = () => {
        return Object.values(filters).filter(value => value !== '').length
    }

    const formatResponseTime = (timeMs: number) => {
        if (timeMs < 1000) {
            return `${timeMs}ms`
        }
        return `${(timeMs / 1000).toFixed(1)}s`
    }

    const SkeletonLoader = () => (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-md p-4 animate-pulse" style={{ background: "var(--gray-alpha-100)", boxShadow: "var(--shadow-border)" }}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-5 rounded w-24" style={{ background: "var(--gray-alpha-300)" }}></div>
                                <div className="h-6 rounded-full w-16" style={{ background: "var(--gray-alpha-300)" }}></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <div className="h-4 rounded w-16" style={{ background: "var(--gray-alpha-300)" }}></div>
                                    <div className="h-4 rounded w-32" style={{ background: "var(--gray-alpha-300)" }}></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-4 rounded w-16" style={{ background: "var(--gray-alpha-300)" }}></div>
                                    <div className="h-4 rounded w-20" style={{ background: "var(--gray-alpha-300)" }}></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-4 rounded w-24" style={{ background: "var(--gray-alpha-300)" }}></div>
                                    <div className="h-4 rounded w-16" style={{ background: "var(--gray-alpha-300)" }}></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-4 rounded w-12" style={{ background: "var(--gray-alpha-300)" }}></div>
                                    <div className="h-4 rounded w-28" style={{ background: "var(--gray-alpha-300)" }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )

    // Infinite scroll usando el hook personalizado
    useInfiniteScroll({
        loading: historyLoading || isLoadingMore,
        hasMore: historyHasMore,
        onLoadMore: loadMoreHistory,
        threshold: 100
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                    <h2 className="font-semibold" style={{ fontSize: 20, letterSpacing: "-0.02em", color: "var(--ds-text)", margin: "0 0 4px" }}>Historial de Uso de Gemini</h2>
                    <p style={{ fontSize: 14, color: "var(--ds-text-secondary)", margin: 0 }}>
                        {historyTotalElements > 0 ? `${historyTotalElements} registro${historyTotalElements !== 1 ? 's' : ''} encontrado${historyTotalElements !== 1 ? 's' : ''}` : 'Sin registros'}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    {getActiveFiltersCount() > 0 && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center justify-center gap-2 transition-colors text-sm font-medium hover:bg-[var(--red-100)] hover:text-[var(--red-900)] flex-shrink-0"
                            style={{ height: 36, padding: "0 12px", color: "var(--red-700)", background: "var(--ds-background)", border: "1px solid var(--red-400)", borderRadius: "var(--radius-md)" }}
                        >
                            <X size={15} strokeWidth={2} />
                            Limpiar filtros
                        </button>
                    )}
                    <button
                        onClick={handleFilterHistoryModal}
                        className="flex items-center justify-center gap-[7px] transition-colors text-sm font-medium relative hover:bg-[var(--gray-alpha-100)] flex-shrink-0"
                        style={{ height: 36, padding: "0 12px", color: "var(--ds-text)", background: "var(--ds-background)", border: "1px solid var(--ds-border-strong)", borderRadius: "var(--radius-md)" }}
                    >
                        <Filter size={15} strokeWidth={2} />
                        Filtros
                        {getActiveFiltersCount() > 0 && (
                            <span className="absolute -top-2 -right-2 text-xs rounded-full h-5 w-5 flex items-center justify-center" style={{ background: "var(--blue-700)", color: "var(--ds-contrast-inverse)" }}>
                                {getActiveFiltersCount()}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Lista de Historial */}
            <div className="space-y-4">
                {historyLoading && historyItems.length === 0 ? (
                    <SkeletonLoader />
                ) : historyItems.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mb-2 flex justify-center" style={{ color: "var(--ds-text-muted)" }}>
                            <ClipboardCheck size={48} />
                        </div>
                        <p style={{ color: "var(--ds-text-secondary)" }}>No se encontraron registros de uso</p>
                    </div>
                ) : (
                    historyItems.map((item) => (
                        <div key={item.id} className="rounded-md p-4 transition-shadow duration-150 hover:shadow-md" style={{ background: "var(--gray-alpha-100)", boxShadow: "var(--shadow-border)" }}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-medium" style={{ color: "var(--ds-text)" }}>
                                            {getFeatureLabel(item.feature)}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full" style={getStatusColor(item.status)}>
                                            {getStatusIcon(item.status)}
                                            {item.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm" style={{ color: "var(--ds-text-secondary)" }}>
                                        <div>
                                            <span className="font-medium">Usuario:</span>
                                            <p className="truncate">{item.userEmail}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Proyecto:</span>
                                            <p className="truncate">{item.projectId || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Tiempo de respuesta:</span>
                                            <p>{formatResponseTime(item.responseTimeMs)}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Fecha:</span>
                                            <p>{formatDate(item.timestamp)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {/* Loading indicator */}
                {(historyLoading || isLoadingMore) && historyItems.length > 0 && (
                    <div className="flex items-center justify-center gap-2 py-4 text-sm" style={{ color: "var(--ds-text-muted)" }}>
                        <div className="w-4 h-4 rounded-full animate-spin" style={{ border: "2px solid var(--ds-border)", borderTopColor: "var(--blue-700)" }}></div>
                        Cargando más registros...
                    </div>
                )}

                {/* No more items indicator */}
                {!historyHasMore && historyItems.length > 0 && (
                    <div className="text-center py-4 text-sm" style={{ color: "var(--ds-text-secondary)" }}>
                        No hay más registros para mostrar
                    </div>
                )}
            </div>
        </div>
    )
}