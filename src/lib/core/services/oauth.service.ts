'use server'

import { apiClient } from '@/lib/apiClient'
import { API_ROUTES } from '@/lib/core/routes/oauth.route'
import { useAuthStore } from '@stores/AuthStore'
import { cookies } from 'next/headers'

export async function initializeSessionAction() {
    const { getProfileByToken } = useAuthStore()
    const cookieStore = await cookies()

    try {
        const accessToken = cookieStore.get('accessToken')?.value
        if (!accessToken) return { success: false }

        const user = getProfileByToken({ token: accessToken })
        return user
    } catch (error) {
        console.error("initializeSessionAction: Error al inicializar al usuario:", error)
        return { success: false }
    }
}

export async function logoutAction() {
    try {
        const cookieStore = await cookies()
        const refreshToken = cookieStore.get('refreshToken')?.value
        cookieStore.delete('accessToken')
        cookieStore.delete('refreshToken')
        await fetch(API_ROUTES.USER_LOGOUT, { method: 'POST', headers: { Cookie: `refreshToken=${refreshToken}` } })
        return { success: true }
    } catch (error) {
        console.error("logoutAction: Error al eliminar las cookies:", error)
        return { success: false }
    }
}

export async function refreshTokenAction(): Promise<{ success: boolean, accessToken?: string }> {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refreshToken')?.value

    if (!refreshToken) return { success: false }

    try {
        const res = await fetch(API_ROUTES.REFRESH_TOKEN, { method: 'POST', headers: { Cookie: `refreshToken=${refreshToken}` } })
        if (!res.ok) throw new Error('Falló el refresco del token desde la API')

        const data = await res.json()
        return { success: true, accessToken: data.accessToken }

    } catch (error) {
        console.error("refreshTokenAction:", error)
        return { success: false }
    }
}