import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Rutas que solo puede ver un NO autenticado
const authPages = ['/login', '/login/callback']

// Rutas que requieren autenticación
const privatePages = ['/tableros', '/factory', '/config', '/gemini']

export function middleware(request: NextRequest) {
    const hasSession = (request.cookies.has('NEXT_COOKIE_ACCESS_TOKEN'))
    const { pathname } = request.nextUrl

    if (hasSession && authPages.includes(pathname)) { return NextResponse.redirect(new URL('/tableros', request.url)) }
    if (!hasSession && privatePages.some(p => pathname.startsWith(p))) { return NextResponse.redirect(new URL('/login', request.url)) }
    return NextResponse.next()
}

export const config = {
    matcher: ['/:path*']
}
