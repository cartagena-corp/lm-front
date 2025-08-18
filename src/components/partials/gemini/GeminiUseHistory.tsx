"use client"

import { useState, useEffect, useCallback } from 'react'
import { useGeminiStore } from '@/lib/store/GeminiStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll'
import { AuditIcon, FilterIcon, ClockIcon, CheckmarkIcon, AlertCircleIcon } from '@/assets/Icon'
import toast from 'react-hot-toast'

export default function GeminiUseHistory() {
    const [filters, setFilters] = useState({
        feature: '',
        projectId: '',
        userEmail: ''
    })
    const [showFilters, setShowFilters] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)

    const {
        historyFilters,
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

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const applyFilters = async () => {
        try {
            const token = await getValidAccessToken()
            if (token) {
                resetHistory()
                await getHistory(token, {
                    feature: filters.feature,
                    projectId: filters.projectId,
                    userEmail: filters.userEmail,
                    page: 0,
                    size: historySize
                }, true)
            }
        } catch (error) {
            console.error('Error al aplicar filtros:', error)
            toast.error('Error al aplicar los filtros')
        }
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
                return <div className="text-green-600"><CheckmarkIcon size={16} /></div>
            case 'error':
                return <div className="text-red-600"><AlertCircleIcon size={16} /></div>
            default:
                return <div className="text-yellow-600"><ClockIcon size={16} /></div>
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'ok':
                return 'bg-green-100 text-green-800'
            case 'error':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-yellow-100 text-yellow-800'
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
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 animate-pulse">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-5 bg-gray-300 rounded w-24"></div>
                                <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-4 bg-gray-300 rounded w-12"></div>
                                    <div className="h-4 bg-gray-300 rounded w-28"></div>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <AuditIcon size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Historial de Uso de Gemini</h3>
                            <p className="text-sm text-gray-600">
                                {historyTotalElements > 0 ? `${historyTotalElements} registro${historyTotalElements !== 1 ? 's' : ''} encontrado${historyTotalElements !== 1 ? 's' : ''}` : 'Sin registros'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors relative"
                    >
                        <FilterIcon size={16} />
                        Filtros
                        {getActiveFiltersCount() > 0 && (
                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {getActiveFiltersCount()}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filtros */}
                {showFilters && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Feature Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Funcionalidad
                                </label>
                                <select
                                    value={filters.feature}
                                    onChange={(e) => handleFilterChange('feature', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Todas las funcionalidades</option>
                                    {historyFilters?.features.map((feature) => (
                                        <option key={feature} value={feature}>
                                            {getFeatureLabel(feature)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Project Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Proyecto
                                </label>
                                <select
                                    value={filters.projectId}
                                    onChange={(e) => handleFilterChange('projectId', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Todos los proyectos</option>
                                    {historyFilters?.projectIds.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Email Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Usuario
                                </label>
                                <select
                                    value={filters.userEmail}
                                    onChange={(e) => handleFilterChange('userEmail', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Todos los usuarios</option>
                                    {historyFilters?.emails.map((email) => (
                                        <option key={email} value={email}>
                                            {email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Aplicar Filtros
                            </button>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>
                )}

                {/* Lista de Historial */}
                <div className="space-y-4">
                    {historyLoading && historyItems.length === 0 ? (
                        <SkeletonLoader />
                    ) : historyItems.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-2 flex justify-center">
                                <AuditIcon size={48} />
                            </div>
                            <p className="text-gray-500">No se encontraron registros de uso</p>
                        </div>
                    ) : (
                        historyItems.map((item) => (
                            <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-medium text-gray-900">
                                                {getFeatureLabel(item.feature)}
                                            </span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                                                {getStatusIcon(item.status)}
                                                {item.status}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
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
                    {(historyLoading || isLoadingMore) && (
                        <div className="flex justify-center py-4">
                            <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                    )}

                    {/* No more items indicator */}
                    {!historyHasMore && historyItems.length > 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                            No hay más registros para mostrar
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}