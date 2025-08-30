import { API_ROUTES } from '../routes/organization.route'
import { create } from "zustand"
import { GlobalPagination, UserPagination, UserProps, RoleProps } from '../types/types'
import toast from 'react-hot-toast'

interface OrganizationState {
    organizations: { organizationId: string; organizationName: string; createdAt: string }[]
    users: UserPagination
    organizationRoles: RoleProps[]
    isLoading: boolean
    error: string | null

    getAllOrganizations: (token: string) => Promise<void>
    createOrganization: (token: string, name: string) => Promise<{ organizationId: string; organizationName: string; createdAt: string } | null>
    updateOrganization: (token: string, organizationId: string, organizationName: string) => Promise<boolean>
    deleteOrganization: (token: string, organizationId: string) => Promise<boolean>
    getSpecificOrganization: (token: string, id: string) => Promise<{ organizationId: string; organizationName: string; createdAt: string } | null>
    getUsersByOrganization: (token: string, organizationId: string, search?: string, page?: number, size?: number) => Promise<void>
    getOrganizationRoles: (token: string, organizationId: string) => Promise<void>
    loadMoreUsersByOrganization: (token: string, organizationId: string, search?: string, page?: number, size?: number) => Promise<void>
    changeUserOrganization: (token: string, userId: string, data: { organizationId: string, role: string }) => Promise<boolean>
}

export const useOrganizationStore = create<OrganizationState>()((set, get) => ({
    organizations: [],
    users: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 },
    organizationRoles: [],
    isLoading: false,
    error: null,

    getAllOrganizations: async (token: string) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(API_ROUTES.GET_ALL_ORGANIZATIONS, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } })
            if (!response.ok) {
                throw new Error('Error al obtener las organizaciones')
            }
            const data = await response.json()
            set({ organizations: data, isLoading: false })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al obtener las organizaciones'
            set({ error: errorMessage, isLoading: false })
            toast.error(errorMessage)
            console.error('Error en getAllOrganizations:', error)
        }
    },

    getSpecificOrganization: async (token: string, id: string) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(`${API_ROUTES.GET_SPECIFIC_ORGANIZATION}/${id}`, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } })
            if (!response.ok) {
                throw new Error('Error al obtener una organizacion')
            }
            const data = await response.json()
            set({ isLoading: false })
            return data
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al obtener una organizacion'
            set({ error: errorMessage, isLoading: false })
            toast.error(errorMessage)
            console.error('Error en getSpecificOrganization:', error)
            return null
        }
    },

    createOrganization: async (token: string, name: string) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(API_ROUTES.CREATE_ORGANIZATION, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ organizationName: name })
            })
            if (!response.ok) {
                throw new Error('Error al crear la organización')
            }
            const newOrg = await response.json()
            set({ isLoading: false })
            await get().getAllOrganizations(token)
            return newOrg
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al crear la organización'
            set({ error: errorMessage, isLoading: false })
            toast.error(errorMessage)
            console.error('Error en createOrganization:', error)
            return null
        }
    },

    getUsersByOrganization: async (token: string, organizationId: string, search?: string, page?: number, size?: number) => {
        set({ isLoading: true, error: null })
        try {
            const params = new URLSearchParams()
            if (search) params.append('search', search)
            if (page !== undefined) params.append('page', page.toString())
            if (size !== undefined) params.append('size', size.toString())

            const url = `${API_ROUTES.GET_USERS_BY_ORGANIZATION}?organizationId=${organizationId}&${params.toString()}`

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            })

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`)
            }

            const data: GlobalPagination = await response.json()
            set({
                users: {
                    content: data.content as UserProps[],
                    totalElements: data.totalElements,
                    totalPages: data.totalPages,
                    number: data.number,
                    size: data.size,
                },
                isLoading: false
            })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al obtener usuarios de la organización'
            set({ error: errorMessage, isLoading: false })
            toast.error(errorMessage)
            console.error('Error en getUsersByOrganization:', error)
        }
    },

    getOrganizationRoles: async (token: string, organizationId: string) => {
        set({ isLoading: true, error: null })
        try {
            const url = API_ROUTES.GET_ROLES_BY_ORGANIZATION({ idOrg: organizationId })
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            })

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`)
            }

            const data: RoleProps[] = await response.json()
            set({ organizationRoles: data, isLoading: false })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al obtener los roles de la organización'
            set({ error: errorMessage, isLoading: false })
            toast.error(errorMessage)
            console.error('Error en getOrganizationRoles:', error)
        }
    },

    loadMoreUsersByOrganization: async (token: string, organizationId: string, search?: string, page?: number, size?: number) => {
        set({ isLoading: true, error: null })
        try {
            const params = new URLSearchParams()
            if (search) params.append('search', search)
            if (page !== undefined) params.append('page', page.toString())
            if (size !== undefined) params.append('size', size.toString())

            const url = `${API_ROUTES.GET_USERS_BY_ORGANIZATION}?organizationId=${organizationId}&${params.toString()}`

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            })

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`)
            }

            const data: GlobalPagination = await response.json()
            set(state => ({
                users: {
                    ...state.users,
                    content: [...state.users.content, ...(data.content as UserProps[])],
                    totalElements: data.totalElements,
                    totalPages: data.totalPages,
                    number: data.number,
                    size: data.size,
                },
                isLoading: false
            }))
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al obtener más usuarios de la organización'
            set({ error: errorMessage, isLoading: false })
            toast.error(errorMessage)
            console.error('Error en loadMoreUsersByOrganization:', error)
        }
    },

    updateOrganization: async (token: string, organizationId: string, organizationName: string) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(`${API_ROUTES.UPDATE_ORGANIZATION}/${organizationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ organizationName })
            })

            if (!response.ok) {
                throw new Error('Error al actualizar la organización')
            }

            // Actualizar la lista de organizaciones
            await get().getAllOrganizations(token)
            set({ isLoading: false })
            return true
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la organización'
            set({ error: errorMessage, isLoading: false })
            toast.error(errorMessage)
            console.error('Error en updateOrganization:', error)
            return false
        }
    },

    deleteOrganization: async (token: string, organizationId: string) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(`${API_ROUTES.DELETE_ORGANIZATION}/${organizationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Error al eliminar la organización')
            }

            // Actualizar la lista de organizaciones
            await get().getAllOrganizations(token)
            set({ isLoading: false })
            return true
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la organización'
            set({ error: errorMessage, isLoading: false })
            toast.error(errorMessage)
            console.error('Error en deleteOrganization:', error)
            return false
        }
    },

    changeUserOrganization: async (token: string, userId: string, data: { organizationId: string, role: string }) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(`${API_ROUTES.CHANGE_USER_ORGANIZATION}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: userId,
                    role: data.role,
                    organizationId: data.organizationId
                })
            })

            if (!response.ok) {
                throw new Error('Error al cambiar la organización del usuario')
            }

            set({ isLoading: false })
            return true
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al cambiar la organización del usuario'
            set({ error: errorMessage, isLoading: false })
            toast.error(errorMessage)
            console.error('Error en changeUserOrganization:', error)
            return false
        }
    }
}))
