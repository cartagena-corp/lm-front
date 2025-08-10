'use client'

import { initializeSessionAction } from '@/lib/core/services/oauth.service'
import { getTokenFromCookies } from '@/lib/apiClient'
import { useAuthStore } from '@stores/AuthStore'
import { UserProfile } from '@/lib/types/auth'
import { logger } from '@/lib/types/Logger'
import { useEffect, useRef } from 'react'

export function useSessionInitialization() {
    const { setUser, setToken, clearAuth, isAuthenticated, isLoading, setLoading } = useAuthStore()
    const initializationAttempted = useRef(false)

    const hydrateSession = (userProfile: UserProfile | null) => {
        if (!userProfile) {
            logger.debug('No se pudo hidratar la sesión, el perfil de usuario es nulo')
            clearAuth()
            return false
        }
        setUser(userProfile)
        const cookieToken = getTokenFromCookies()
        if (cookieToken) setToken(cookieToken)


        logger.info('Se ha hidratado la sesión correctamente', { userId: userProfile.id, hasToken: !!cookieToken })
        return true
    }

    const initializeSession = async (): Promise<boolean> => {
        if (initializationAttempted.current) return false

        try {
            setLoading(true)
            initializationAttempted.current = true

            logger.debug('Iniciando la sesión del usuario...')
            const sessionDTO = await initializeSessionAction()
            return hydrateSession(sessionDTO)
        } catch (error) {
            logger.error('Error al inicializar al usuario', error)
            clearAuth()
            return false
        } finally {
            setLoading(false)
        }
    }

    // ✅ Inicializar automáticamente si no está autenticado
    useEffect(() => {
        if (!isAuthenticated && !isLoading && !initializationAttempted.current) initializeSession()
    }, [isAuthenticated, isLoading])

    return {
        isInitialized: initializationAttempted.current,
        initializeSession,
        hydrateSession,
    }
}