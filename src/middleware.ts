import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
    const hasSessionHint = request.cookies.has('refreshToken')
    const { pathname } = request.nextUrl
    if (hasSessionHint && (pathname === '/login' || pathname === '/login/callback')) { return NextResponse.redirect(new URL('/tableros', request.url)) }
    return NextResponse.next()
}

export const config = { matcher: ["/login"] }