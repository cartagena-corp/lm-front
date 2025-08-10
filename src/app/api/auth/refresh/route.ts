import { API_ROUTES } from '@/lib/core/routes/oauth.route'
import { logger } from '@/lib/types/Logger'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
    try {
        const cookieStore = await cookies()
        const refreshToken = cookieStore.get('refreshToken')?.value

        if (!refreshToken) {
            logger.warn('No se proporcionó el token de actualización.')
            return NextResponse.json({ success: false, message: 'No refresh token' }, { status: 401 })
        }

        const response = await fetch(API_ROUTES.REFRESH_TOKEN, {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'Cookie': `refreshToken=${refreshToken}` },
        })

        if (!response.ok) {
            logger.error('El refresh del token ha fallado', new Error('Failed to refresh token'), { status: response.status })
            return NextResponse.json({ success: false, message: 'Failed to refresh token' }, { status: 401 })
        }

        const data = await response.json()

        cookieStore.set('accessToken', data.accessToken, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            httpOnly: false,
            maxAge: 15 * 60 // 15 minutos
        })

        if (data.refreshToken) {
            cookieStore.set('refreshToken', data.refreshToken, {
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 // 7 días
            })
        }

        logger.info('Token actualizado exitosamente')
        return NextResponse.json({ success: true, accessToken: data.accessToken })
    } catch (error) {
        logger.error('Error al refrescar el token', error)
        return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 })
    }
}