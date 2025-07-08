// middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { API_ROUTES } from '@/lib/routes/oauth.routes'

export async function middleware(request: NextRequest) {
   // Preparamos la respuesta base
   let response = NextResponse.next()

   // Obtiene el token almacenado en la cookie
   const tokenCookie = request.cookies.get("NEXT_COOKIE_ACCESS_TOKEN")
   let token = tokenCookie?.value

   // Si no hay token, redirige a /login
   if (!token) return NextResponse.redirect(new URL('/login', request.url))

   // Valida el token
   const isValid = await validateAccessToken(token)
   if (!isValid) {
      // Intenta refrescar el token
      const newToken = await refreshAccessToken(request)
      if (newToken) {
         // Si se refrescó exitosamente, actualiza la cookie en la respuesta
         response.cookies.set("NEXT_COOKIE_ACCESS_TOKEN", newToken, {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: false,
            path: '/',
         })
      } else {
         // Si no se pudo refrescar, redirige a /login
         // return NextResponse.redirect(new URL('/login', request.url))
         return NextResponse.redirect(new URL('/login', request.url))
      }
   }

   return response
}

// Función para validar el access token
async function validateAccessToken(token: string): Promise<boolean> {
   try {
      const response = await fetch(API_ROUTES.VALIDATE_TOKEN, {
         method: 'GET',
         headers: { 'Authorization': `Bearer ${token}` },
      })
      return response.ok
   } catch (error) {
      console.error('Error durante la validación del access token:', error)
      return false
   }
}

// Función para refrescar el access token usando el endpoint de refresh
async function refreshAccessToken(request: NextRequest): Promise<string | null> {
   try {
      const refreshToken = request.cookies.get('refreshToken')?.value

      if (!refreshToken) {
         console.error('No se encontró el refreshToken en las cookies')
         return null
      }

      const refreshResponse = await fetch(API_ROUTES.REFRESH_TOKEN, {
         method: 'POST',
         headers: {
            'Cookie': `refreshToken=${refreshToken}`,
         },
      })

      const data = await refreshResponse.json()

      if (!!data.error) {
         console.error('Error al refrescar el token, código:', refreshResponse.status)
         return null
      }

      if (data?.accessToken) return data.accessToken
      return null
   } catch (error) {
      console.error('Error durante el refresco del access token:', error)
      return null
   }
}

export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'] }