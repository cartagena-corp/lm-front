import { NextRequest, NextResponse } from 'next/server'
import { API_ROUTES } from '@routes/oauth.route'
import { logger } from '@/lib/types/Logger'
import { jwtDecode } from 'jwt-decode'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    try {
        const token = searchParams.get('token')
        if (!token) {
            logger.warn('No se proporcionó el token en el callback de inicio de sesión.')
            return NextResponse.redirect(new URL('/login?error=no_token', request.url))
        }

        try {
            const decodedToken = jwtDecode(token)
            if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) throw new Error('Token expirado')

        } catch (decodeError) {
            logger.error("Token inválido o expirado. Redirigiendo a login.")
            return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
        }

        const res = await fetch(API_ROUTES.VALIDATE_TOKEN, { method: "GET", headers: { Authorization: `Bearer ${token}` } })

        if (!res.ok) {
            logger.error("Token inválido o expirado. Redirigiendo a login.")
            return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
        }

        const cookieStore = await cookies()
        cookieStore.set('accessToken', token, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            httpOnly: false,
            maxAge: 1 * 24 * 60 * 60 // 1 día
        })

        logger.info('Usuario autenticado exitosamente a través del callback de inicio de sesión.')

        const cleanUrl = new URL('/tableros', request.url)
        return NextResponse.redirect(cleanUrl)
    } catch (error) {
        logger.error("Error al procesar el callback:", error)
        return NextResponse.redirect(new URL('/login?error=callback_error', request.url))
    }
}