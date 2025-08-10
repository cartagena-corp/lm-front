"use client"

import { logger } from "./types/Logger"

export function getTokenFromCookies(): string | null {
    if (typeof document === 'undefined') return null
    const cookies = document.cookie.split(';')
    const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='))
    return accessTokenCookie ? accessTokenCookie.split('=')[1] : null
}

export async function apiClient<T>(url: string, options: RequestInit = {}, token?: string): Promise<T> {
    const accessToken = token || getTokenFromCookies()
    const headers = new Headers(options.headers)

    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
    let response = await fetch(url, { ...options, headers })

    logger.debug('Respuesta de API', { url, status: response.status, method: options.method || 'GET' })

    if (response.status === 401) {
        try {
            const refreshResponse = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'same-origin' })

            if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json()

                if (refreshData.success && refreshData.accessToken) {
                    headers.set('Authorization', `Bearer ${refreshData.accessToken}`)
                    response = await fetch(url, { ...options, headers })

                    logger.info('El token ha sido refrescado exitosamente', { url })
                } else {
                    await handleLogout()
                    throw new Error("Ha fallado el refresco del token. Cerrando sesión.")
                }
            } else {
                await handleLogout()
                throw new Error("La sesión ha expirado. Por favor, inicia sesión de nuevo.")
            }
        } catch (error) {
            logger.error('Error en el medio del token refresh', error, { url })
            await handleLogout()
            if (error instanceof Error && error.message === "La sesión ha expirado.") throw error
            throw new Error("Error de autenticación. Por favor, inicia sesión de nuevo.")
        }
    }

    if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({ message: 'Error en la petición a la API' }))
        logger.error('Error en la petición a la API', new Error(errorData.message), {
            url, status: response.status, method: options.method || 'GET'
        })

        throw new Error(errorData.message)
    }

    if (response.status === 204) return Promise.resolve(null as T)
    return response.json() as Promise<T>
}


export async function handleLogout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
        logger.info('Se cerró la sesión correctamente')
    } catch (error) {
        logger.error('Error durante el logout', error)
    } finally {
        if (typeof window !== 'undefined') window.location.href = '/login'
    }
}