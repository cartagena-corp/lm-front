import { deleteCookie, getCookie, setCookie } from 'cookies-next/client'
import { UserProps } from '../types/types'
import { jwtDecode } from 'jwt-decode'
import { create } from 'zustand'

interface AuthState {
   getValidAccessToken: () => Promise<string>
   getListUsers: (token: string) => void
   setAccessToken: (token: string) => void
   refreshToken: () => Promise<boolean>
   logout: () => Promise<void>
   clearAuth: () => void

   isAuthenticated: boolean
   user: UserProps | null
   listUsers: UserProps[] | []
}

interface PayloadProps {
   permissions: string[]
   family_mame: string
   given_mame: string
   picture: string
   email: string
   role: string
   exp?: number
   sub: string
}

const API_URL = process.env.NEXT_PUBLIC_AUTHENTICATION

// Función para decodificar el token JWT
function decodeToken(token: string): UserProps | null {
   try {
      const decodedToken = jwtDecode<PayloadProps>(token)
      const userData: UserProps = {
         id: decodedToken.sub,
         picture: decodedToken.picture,
         email: decodedToken.email,
         firstName: decodedToken.given_mame,
         lastName: decodedToken.family_mame,
         role: {
            name: decodedToken.role,
            permissions: decodedToken.permissions.map(permission => ({ name: permission }))
         }
      }

      return userData
   } catch (error) {
      console.error('Error al decodificar el token:', error)
      return null
   }
}

// Función para verificar si el token ha vencido
function isTokenExpired(token: string): boolean {
   try {
      const decoded = jwtDecode<{ exp: number }>(token)
      if (decoded.exp) {
         // Se verifica comparando el timestamp de expiración con el actual
         return decoded.exp * 1000 < Date.now()
      }
      return false
   } catch (error) {
      console.error('Error al comprobar expiración del token:', error)
      return true
   }
}

// Inicialización: intenta leer el token actual
const initializeAuthState = (): { user: UserProps | null, isAuthenticated: boolean } => {
   if (typeof window === 'undefined') return { user: null, isAuthenticated: false }

   const token = getCookie("NEXT_COOKIE_ACCESS_TOKEN") || null
   if (!token) return { user: null, isAuthenticated: false }

   const user = decodeToken(token as string)
   return { user, isAuthenticated: !!user, }
}

// Crear el store de autenticación
export const useAuthStore = create<AuthState>()((set, get) => ({
   ...initializeAuthState(),
   listUsers: [],

   // Nuevo método asíncrono para obtener un token actualizado
   getValidAccessToken: async () => {
      let token = getCookie("NEXT_COOKIE_ACCESS_TOKEN") as string
      if (!token) return ''

      // Si el token ha vencido, lo refrescamos
      if (isTokenExpired(token)) {
         const refreshed = await get().refreshToken()
         if (refreshed) {
            token = getCookie("NEXT_COOKIE_ACCESS_TOKEN") as string
         } else {
            return ''
         }
      }
      return token
   },

   // Establecer el token de acceso en la cookie y actualizar el estado del usuario
   setAccessToken: (token: string) => {
      setCookie("NEXT_COOKIE_ACCESS_TOKEN", token)

      const user = decodeToken(token)

      set({ user, isAuthenticated: !!user })
   },

   // Limpiar la autenticación
   clearAuth: () => {
      deleteCookie("NEXT_COOKIE_ACCESS_TOKEN", { path: '/' })
      set({ user: null, isAuthenticated: false })
      if (typeof window !== 'undefined') window.location.href = "/login"
   },

   getListUsers: async (token: string) => {
      try {
         const response = await fetch(`${API_URL}${process.env.NEXT_PUBLIC_LIST_USERS}`, {
            method: 'GET',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
         })

         if (!response.ok) {
            console.error("Error al obtener la lista de usuarios", response.statusText)
            return
         }

         const userList: UserProps[] = await response.json()

         set(({
            listUsers: userList
         }))
      } catch (error) {
         console.error("Error en el getListUsers", error)
      }
   },

   // Refrescar el token: utiliza el refresh token (almacenado como httpOnly en el backend)
   refreshToken: async () => {
      try {
         const response = await fetch(`${API_URL}${process.env.NEXT_PUBLIC_REFRESH_TOKEN}`, {
            method: 'POST',
            credentials: 'include'
         })
         if (!response.ok) throw new Error('Error al refrescar el token')

         const data = await response.json()
         get().setAccessToken(data.accessToken)
         return true
      } catch (error) {
         console.error('Error al refrescar el token:', error)
         get().clearAuth()
         return false
      }
   },

   // Cerrar sesión
   logout: async () => {
      try {
         await fetch(`${API_URL}${process.env.NEXT_PUBLIC_LOGOUT}`, {
            method: 'POST',
            credentials: 'include'
         })
      } catch (error) {
         console.error('Error en logout:', error)
      } finally {
         get().clearAuth()
      }
   }
}))
