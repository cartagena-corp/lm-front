import { NextRequest, NextResponse } from 'next/server'
import { API_ROUTES } from '@routes/oauth.route'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    try {
        const token = searchParams.get('token')
        if (!token) return NextResponse.redirect(new URL('/login?error=no_token', request.url))

        // Se valida el token mandando una petición a la API que me devuelve un true si el token es válido
        const res = await fetch(API_ROUTES.VALIDATE_TOKEN, { method: "GET", headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) {
            console.error("Token inválido o expirado")
            return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
        }

        // Crear la respuesta de redirección
        const redirectUrl = new URL('/tableros', request.url)
        const response = NextResponse.redirect(redirectUrl)
        response.cookies.set('accessToken', token, {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 1,
            httpOnly: false,
            sameSite: 'lax'
        })

        return response
    } catch (error) {
        console.error("Error al recibir el token: ", error)
        const redirectUrl = new URL('/login', request.url)
        return NextResponse.redirect(redirectUrl)
    }
}