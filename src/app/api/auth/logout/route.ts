import { API_ROUTES } from '@routes/oauth.route'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { logger } from '@/lib/types/Logger'

export async function POST() {
    try {
        const cookieStore = await cookies()
        const refreshToken = cookieStore.get('refreshToken')?.value

        if (refreshToken) await fetch(API_ROUTES.USER_LOGOUT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': `refreshToken=${refreshToken}` } })

        cookieStore.delete('accessToken')
        cookieStore.delete('refreshToken')

        logger.info('Usuario desloggeado exitosamente, cookies eliminadas')
        return NextResponse.json({ success: true })
    } catch (error) {
        logger.error('Error durante el logout del usuario', error)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}