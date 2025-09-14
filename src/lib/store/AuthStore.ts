import { deleteCookie, getCookie, setCookie } from 'cookies-next/client'
import { UserProps } from '../types/types'
import { jwtDecode } from 'jwt-decode'
import { create } from 'zustand'
import { API_ROUTES } from "@/lib/routes/oauth.routes"
import { encryptOTP } from '@/lib/utils/crypto.utils'

interface PermissionProps {
   name: string
}

interface RoleProps {
   name: string
   permissions: PermissionProps[]
}

interface CreateRoleProps {
   name: string
   permissions: PermissionProps[]
}

interface UpdateRoleProps {
   permissions: PermissionProps[]
}

interface CreatePermissionProps {
   name: string
}

interface AuthState {
   // State
   isAuthenticated: boolean
   user: UserProps | null
   listUsers: UserProps[]
   usersPagination: {
      totalPages: number
      totalElements: number
      size: number
      number: number
   } | null
   roles: RoleProps[]
   permissions: PermissionProps[]
   isLoading: boolean
   error: string | null
   otpPhrase: string | null

   // Actions
   getValidAccessToken: () => Promise<string>
   getListUsers: (token: string, search?: string, page?: number, size?: number) => Promise<void>
   loadMoreUsers: (token: string, search?: string) => Promise<void>
   setAccessToken: (token: string) => void
   refreshToken: () => Promise<string>
   logout: () => Promise<void>
   validateToken: (token: string) => Promise<boolean>
   getGoogleLoginUrl: () => string
   addUser: (token: string, data: { email: string, role: string }) => Promise<void>
   addUserWithOrganization: (token: string, data: { email: string, role: string, organizationId: string }) => Promise<void>
   editUser: (token: string, userId: string, data: { role: string }) => Promise<void>
   deleteUser: (token: string, userId: string) => Promise<void>
   importUsers: (token: string, file: File) => Promise<void>


   // Role actions
   listRoles: (token: string) => Promise<void>
   getPermissionsByRole: (token: string, role: string) => Promise<PermissionProps[]>
   createRole: (token: string, data: CreateRoleProps) => Promise<void>
   updateRole: (token: string, roleName: string, data: UpdateRoleProps) => Promise<void>
   deleteRole: (token: string, roleName: string) => Promise<void>

   // Permission actions
   listPermissions: (token: string) => Promise<void>
   createPermission: (token: string, data: CreatePermissionProps) => Promise<void>
   deletePermission: (token: string, permissionName: string) => Promise<void>

   normalizeUserRole: (user: UserProps | null) => { name: string; permissions: Array<{ name: string }> } | null

   loginPassword: (email: string, password: string) => Promise<{ message: string, isError: boolean }>
   generateOtp: (registerRequestDTO: { email: string, firstName: string, lastName: string, password: string }) => Promise<{ message: string, isError: boolean }>
   verifyOtp: (code: string, registerRequestDTO: { email: string, firstName: string, lastName: string, password: string }) => Promise<{ message: string, isError: boolean }>

   // Utility actions
   clearAuth: () => void
   clearError: () => void
   setLoading: (loading: boolean) => void
   clearOtpPhrase: () => void
}

interface PayloadProps {
   permissions: string[]
   family_name: string
   given_name: string
   picture: string
   email: string
   role: string
   exp?: number
   sub: string
}

// Función para decodificar el token JWT
function decodeToken(token: string): UserProps | null {
   try {
      const decodedToken = jwtDecode<PayloadProps>(token)
      const userData: UserProps = {
         id: decodedToken.sub,
         picture: decodedToken.picture,
         email: decodedToken.email,
         firstName: decodedToken.given_name,
         lastName: decodedToken.family_name,
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
   usersPagination: null,
   roles: [],
   permissions: [],
   isLoading: false,
   error: null,
   otpPhrase: null,

   // Obtener token válido (actualizado si es necesario)
   getValidAccessToken: async (): Promise<string> => {
      set({ isLoading: true, error: null })
      try {
         let token = getCookie("NEXT_COOKIE_ACCESS_TOKEN") as string
         if (!token) {
            set({ isLoading: false, error: 'No hay token disponible' })
            return ''
         }
         if (isTokenExpired(token)) {
            token = await get().refreshToken()
            if (!token) {
               set({ isLoading: false, error: 'No se pudo refrescar el token' })
               return ''
            }
         }
         set({ isLoading: false })
         return token
      } catch (error) {
         set({ isLoading: false, error: 'Error al obtener el token' })
         return ''
      }
   },

   // Establecer el token de acceso
   setAccessToken: (token: string) => {
      try {
         setCookie("NEXT_COOKIE_ACCESS_TOKEN", token)
         const user = decodeToken(token)
         set({ user, isAuthenticated: !!user, error: null })
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al establecer token'
         set({ error: errorMessage })
      }
   },

   // Obtener lista de usuarios con paginación y búsqueda
   getListUsers: async (token: string, search?: string, page?: number, size?: number) => {
      set({ isLoading: true, error: null })

      try {
         const params = new URLSearchParams()
         if (search) params.append('search', search)
         if (page !== undefined) params.append('page', page.toString())
         if (size !== undefined) params.append('size', size.toString())

         const url = `${API_ROUTES.LIST_USERS}${params.toString() ? `?${params.toString()}` : ''}`

         const response = await fetch(url, {
            method: 'GET',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         const data = await response.json()

         // Si la respuesta es paginada (tiene content, totalElements, etc.)
         if (data.content && data.totalElements !== undefined) {
            set({
               listUsers: data.content,
               usersPagination: {
                  totalPages: data.totalPages,
                  totalElements: data.totalElements,
                  size: data.size,
                  number: data.number
               },
               isLoading: false
            })
         } else {
            // Si la respuesta es un array simple (para compatibilidad)
            set({
               listUsers: Array.isArray(data) ? data : [],
               usersPagination: null,
               isLoading: false
            })
         }
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al obtener lista de usuarios'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en getListUsers:", error)
      }
   },

   // Cargar más usuarios (infinite scroll)
   loadMoreUsers: async (token: string, search?: string) => {
      const { usersPagination, listUsers } = get()

      if (!usersPagination || usersPagination.number >= usersPagination.totalPages - 1) {
         return // No hay más páginas para cargar
      }

      set({ isLoading: true, error: null })

      try {
         const nextPage = usersPagination.number + 1
         const params = new URLSearchParams()
         if (search) params.append('search', search)
         params.append('page', nextPage.toString())
         params.append('size', usersPagination.size.toString())

         const url = `${API_ROUTES.LIST_USERS}?${params.toString()}`

         const response = await fetch(url, {
            method: 'GET',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         const data = await response.json()

         if (data.content) {
            set({
               listUsers: [...listUsers, ...data.content],
               usersPagination: {
                  totalPages: data.totalPages,
                  totalElements: data.totalElements,
                  size: data.size,
                  number: data.number
               },
               isLoading: false
            })
         }
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al cargar más usuarios'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en loadMoreUsers:", error)
      }
   },

   addUser: async (token: string, data: { email: string, role: string }) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.ADD_USER, {
            method: 'POST',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         // Usuario creado exitosamente, ahora refrescar la lista
         await get().getListUsers(token, '', 0, 10)
         set({ isLoading: false })
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al agregar usuario'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en addUser:", error)
      }
   },

   addUserWithOrganization: async (token: string, data: { email: string, role: string, organizationId: string }) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.ADD_USER_WITH_ORGANIZATION, {
            method: 'POST',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         const newUser = await response.json()
         set({ isLoading: false })
         return newUser
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al agregar usuario'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en addUser:", error)
         throw error
      }
   },

   importUsers: async (token: string, file: File) => {
      set({ isLoading: true, error: null })

      try {
         const formData = new FormData()
         formData.append('file', file)

         const response = await fetch(API_ROUTES.IMPORT_USERS, {
            method: 'POST',
            headers: {
               "Authorization": `Bearer ${token}`
            },
            body: formData
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         // Usuarios importados exitosamente, ahora refrescar la lista
         await get().getListUsers(token, '', 0, 10)
         set({ isLoading: false })
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al importar usuarios'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en importUsers:", error)
      }
   },

   editUser: async (token: string, userId: string, data: { role: string }) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.ASSIGN_ROLE}/${userId}/role`, {
            method: 'PUT',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: data.role
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         // Usuario editado exitosamente, ahora refrescar la lista
         await get().getListUsers(token, '', 0, 10)
         set({ isLoading: false })
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al editar usuario'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en editUser:", error)
      }
   },

   deleteUser: async (token: string, userId: string) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.SELECT_USER}/${userId}`, {
            method: 'DELETE',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            }
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         // Usuario eliminado exitosamente, ahora refrescar la lista
         await get().getListUsers(token, '', 0, 10)
         set({ isLoading: false })
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al eliminar usuario'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en deleteUser:", error)
      }
   },

   // Refrescar el token
   refreshToken: async (): Promise<string> => {
      set({ isLoading: true, error: null })
      try {
         const response = await fetch(API_ROUTES.REFRESH_TOKEN, {
            method: 'POST',
            credentials: 'include'
         })
         if (!response.ok) {
            get().clearAuth()
            return ''
         }
         const data = await response.json()
         get().setAccessToken(data.accessToken)
         set({ isLoading: false })
         return data.accessToken
      } catch (error) {
         get().clearAuth()
         return ''
      }
   },

   // Cerrar sesión
   logout: async () => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.USER_LOGOUT, {
            method: 'POST',
            credentials: 'include'
         })

         if (!response.ok) {
            console.warn('Error en logout del servidor, pero continuando con logout local')
         }

         set({ isLoading: false })
      } catch (error) {
         console.error('Error en logout:', error)
         set({ isLoading: false })
      } finally {
         get().clearAuth()
      }
   },

   // Validar token
   validateToken: async (token: string) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.VALIDATE_TOKEN, {
            method: 'GET',
            headers: {
               'Authorization': `Bearer ${token}`
            },
         })

         set({ isLoading: false })
         return response.ok
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al validar el token'
         set({ error: errorMessage, isLoading: false })
         console.error('Error en validateToken:', error)
         return false
      }
   },

   // Obtener URL de login de Google
   getGoogleLoginUrl: () => {
      return API_ROUTES.LOGIN_GOOGLE
   },

   // Limpiar autenticación
   clearAuth: () => {
      try {
         deleteCookie("NEXT_COOKIE_ACCESS_TOKEN", { path: '/' })
         set({
            user: null,
            isAuthenticated: false,
            listUsers: [],
            usersPagination: null,
            roles: [],
            permissions: [],
            error: null,
            isLoading: false,
            otpPhrase: null
         })
         if (typeof window !== 'undefined') {
            window.location.href = "/login"
         }
      } catch (error) {
         console.error('Error al limpiar autenticación:', error)
      }
   },

   // Role management actions
   listRoles: async (token: string) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.CRUD_ROLES, {
            method: 'GET',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         const rolesList: RoleProps[] = await response.json()
         set({ roles: rolesList, isLoading: false })
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al obtener lista de roles'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en listRoles:", error)
      }
   },

   getPermissionsByRole: async (token: string, role: string) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_ROLES}/${role}`, {
            method: 'GET',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         const roleData: RoleProps = await response.json()
         set({ isLoading: false })
         return roleData.permissions
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al obtener permisos del rol'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en getPermissionsByRole:", error)
         return []
      }
   },

   createRole: async (token: string, data: CreateRoleProps) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.CRUD_ROLES, {
            method: 'POST',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         // Refrescar la lista de roles después de crear
         await get().listRoles(token)
         set({ isLoading: false })
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al crear rol'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en createRole:", error)
      }
   },

   updateRole: async (token: string, roleName: string, data: UpdateRoleProps) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_ROLES}/${roleName}`, {
            method: 'PUT',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         // Refrescar la lista de roles después de actualizar
         await get().listRoles(token)
         set({ isLoading: false })
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al actualizar rol'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en updateRole:", error)
      }
   },

   deleteRole: async (token: string, roleName: string) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_ROLES}/${roleName}`, {
            method: 'DELETE',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         // Refrescar la lista de roles después de eliminar
         await get().listRoles(token)
         set({ isLoading: false })
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al eliminar rol'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en deleteRole:", error)
      }
   },

   // Permission management actions
   listPermissions: async (token: string) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.CRUD_PERMISOS, {
            method: 'GET',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         const permissionsList: PermissionProps[] = await response.json()
         set({ permissions: permissionsList, isLoading: false })
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al obtener lista de permisos'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en listPermissions:", error)
      }
   },

   createPermission: async (token: string, data: CreatePermissionProps) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.CRUD_PERMISOS, {
            method: 'POST',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         // Refrescar la lista de permisos después de crear
         await get().listPermissions(token)
         set({ isLoading: false })
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al crear permiso'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en createPermission:", error)
      }
   },

   deletePermission: async (token: string, permissionName: string) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_PERMISOS}/${permissionName}`, {
            method: 'DELETE',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         // Refrescar la lista de permisos después de eliminar
         await get().listPermissions(token)
         set({ isLoading: false })
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al eliminar permiso'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en deletePermission:", error)
      }
   },

   // Utility actions
   clearError: () => {
      set({ error: null })
   },

   setLoading: (loading: boolean) => {
      set({ isLoading: loading })
   },

   clearOtpPhrase: () => {
      set({ otpPhrase: null })
   },

   normalizeUserRole: (user: UserProps | null): { name: string; permissions: Array<{ name: string }> } | null => {
      if (!user || !user.role) return null
      return typeof user.role === 'string' ? { name: user.role, permissions: [] } : user.role
   },

   loginPassword: async (email: string, password: string): Promise<{ message: string, isError: boolean }> => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.LOGIN_FORM, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({ email, password })
         })

         const data = await response.json()

         // Verificar si la respuesta fue exitosa
         if (data.statusCode === 401) {
            const errorMessage = data.message
            set({ error: errorMessage, isLoading: false })
            return { message: data.message, isError: true }
         }

         // Si todo está bien, establecer el token
         get().setAccessToken(data.accessToken)
         set({ isLoading: false })
         return data.accessToken
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en loginPassword:", error)
         return { message: errorMessage, isError: true }
      }
   },

   generateOtp: async (registerRequestDTO: { email: string, firstName: string, lastName: string, password: string }): Promise<{ message: string, isError: boolean }> => {
      set({ isLoading: true, error: null })

      try {
         const data = {
            registerRequestDto: registerRequestDTO,
            functionality: {
               name: "REGISTER"
            }
         }

         const response = await fetch(API_ROUTES.GENERATE_OTP, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
         })

         const res = await response.json()

         if (res.statusCode !== 200) {
            set({ error: res.message, isLoading: false })
            return { message: res.message, isError: true }
         }

         const phrase = response.headers.get('X-PHRASE')

         if (phrase) set({ otpPhrase: phrase })
         else console.warn('No se recibió el header X-PHRASE del servidor')

         set({ isLoading: false })
         return { message: "OTP Generado", isError: false }
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al generar OTP'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en generateOtp:", error)
         return { message: errorMessage, isError: true }
      }
   },

   verifyOtp: async (code: string, registerRequestDTO: { email: string, firstName: string, lastName: string, password: string }): Promise<{ message: string, isError: boolean }> => {
      set({ isLoading: true, error: null })

      try {
         const { otpPhrase } = get()

         if (!otpPhrase) {
            set({ error: 'No se encontró la frase de encriptación. Por favor, solicita un nuevo código OTP.', isLoading: false })
            return { message: "No se encontró la frase de encriptación. Por favor, solicita un nuevo código OTP.", isError: true }
         }

         const encryptedOTP = encryptOTP(code, otpPhrase)

         const requestBody = {
            registerRequestDto: registerRequestDTO,
            code: encryptedOTP,
            functionality: {
               name: "REGISTER"
            }
         }

         const response = await fetch(API_ROUTES.VERIFY_OTP, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
         })

         const data = await response.json()

         if (data.statusCode === 429) {
            set({ error: data.message, isLoading: false })
            return { message: "INVALIDO", isError: true }
         }

         if (data.statusCode !== 200) {
            set({ error: data.message, isLoading: false })
            return { message: data.message, isError: true }
         }

         set({ isLoading: false, otpPhrase: null })
         return { message: data.message, isError: false }
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al verificar OTP'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en verifyOtp:", error)
         return { message: errorMessage, isError: true }
      }
   }
}))
