import { API_ROUTES } from '../routes/organization.route'
import { create } from "zustand"

interface OrganizationState {
    organizations: { organizationId: string; organizationName: string; createdAt: string }[]

    getAllOrganizations: (token: string) => Promise<void>
    createOrganization: (token: string, name: string) => Promise<void>
}

export const useOrganizationStore = create<OrganizationState>()((set, get) => ({
    organizations: [],

    getAllOrganizations: async (token: string) => {
        try {
            const response = await fetch(API_ROUTES.GET_ALL_ORGANIZATIONS, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } })
            if (!response.ok) throw new Error('Error al obtener las organizaciones')

            const data = await response.json()
            set({ organizations: data })
        } catch (error) {
            console.error('Error:', error)
            throw error
        }
    },

    createOrganization: async (token: string, name: string) => {

    }
})
)
