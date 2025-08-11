"use client"

import { getAllBoardStates } from "@services/config.service"
import { useConfigStore } from "@stores/ConfigStore"
import { useEffect, useState } from "react"
import { logger } from "@/lib/types/Logger"

export const useConfigInitialization = () => {
    const { setBoardStates, setLoading, setError, clearError } = useConfigStore()
    const [isInitialized, setIsInitialized] = useState(false)

    const initializeConfig = async () => {
        try {
            setLoading(true)
            clearError()

            logger.info('Inicializando configuración de boards...')
            const boardStates = await getAllBoardStates()

            if (boardStates) {
                setBoardStates(boardStates)
                logger.info('Estados de boards inicializados correctamente')
            } else {
                setError('No se pudieron cargar los estados de los boards')
                logger.warn('No se obtuvieron estados de boards')
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al inicializar configuración'
            setError(errorMessage)
            logger.error('Error al inicializar configuración:', error)
        } finally {
            setLoading(false)
            setIsInitialized(true)
        }
    }

    useEffect(() => {
        initializeConfig()
    }, [setBoardStates, setLoading, setError, clearError])

    return { isInitialized, initializeConfig }
}