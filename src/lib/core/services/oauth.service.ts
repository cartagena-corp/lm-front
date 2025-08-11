"use server"

import { JwtPayload, UserProfile } from '@/lib/types/auth'
import { logger } from '@/lib/types/Logger'
import { jwtDecode } from 'jwt-decode'
import { cookies } from 'next/headers'

export async function initializeSessionAction(): Promise<UserProfile | null> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('accessToken')?.value
        if (!token) {
            logger.debug('No se encontró el token de acceso durante la inicialización de sesión')
            return null
        }

        const decoded = jwtDecode<JwtPayload>(token)

        logger.info('Sesión inicializada', { userId: decoded.sub || '', email: decoded.email || '' })
        return {
            organization_id: decoded.organization_id || '',
            permissions: decoded.permissions || [],
            firstName: decoded.given_name || '',
            lastName: decoded.family_name || '',
            avatar: decoded.picture || '',
            email: decoded.email || '',
            role: decoded.role || '',
            id: decoded.sub,
        }
    } catch (error) {
        logger.error('Error al inicializar la sesión', error)
        return null
    }
}