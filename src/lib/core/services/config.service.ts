import { ListUsersFiltersProps, ListUsersProps, RoleProps, StatusProps, updateBoardStateParams } from "@/lib/types/config"
import { API_ROUTES as AUTH_ROUTES } from "../routes/oauth.route"
import { API_ROUTES as USER_ROUTES } from "../routes/user.route"
import { PaginatedResponse } from "@/lib/types/pagination"
import { API_ROUTES } from "@routes/config.route"
import { apiClient } from "@/lib/apiClient"
import { logger } from "@/lib/types/Logger"

export async function updateBoardState({ state, changes }: updateBoardStateParams): Promise<StatusProps | null> {
    try {
        const newState = { ...state, ...changes }
        const body = JSON.stringify(newState)
        const response = await apiClient<StatusProps>(`${API_ROUTES.CRUD_CONFIG_BOARDS}/${state.id}`, { method: "PUT", body, headers: { 'Content-Type': 'application/json' } })

        logger.info('Respuesta del servicio updateState:', { response })
        return response
    } catch (error) {
        logger.error('Error en el servicio updateState:', error)
        return null
    }
}

export async function getAllBoardStates(): Promise<StatusProps[] | null> {
    try {
        const response = await apiClient<StatusProps[]>(API_ROUTES.CRUD_CONFIG_BOARDS, { method: "GET", headers: { 'Content-Type': 'application/json' } })
        logger.info('Respuesta del servicio getAllBoardStates:', { response })
        return response
    } catch (error) {
        logger.error('Error en el servicio getAllBoardStates:', error)
        return null
    }
}

export async function getListUsers(filters: ListUsersFiltersProps): Promise<PaginatedResponse<ListUsersProps> | null> {
    try {
        const queryString = buildQueryParams(filters)
        const response = await apiClient<PaginatedResponse<ListUsersProps>>(`${AUTH_ROUTES.LIST_ALL_USERS}?${queryString}`, { method: "GET", headers: { 'Content-Type': 'application/json' } })
        logger.info('Respuesta del servicio getListUsers:', { response })
        return response
    } catch (error) {
        logger.error('Error en el servicio getListUsers:', error)
        return null
    }
}

export async function getAllRoles(): Promise<RoleProps[] | null> {
    try {
        const response = await apiClient<RoleProps[]>(USER_ROUTES.CRUD_ROLES, { method: "GET", headers: { 'Content-Type': 'application/json' } })
        logger.info('Respuesta del servicio getAllRoles:', { response })
        return response
    } catch (error) {
        logger.error('Error en el servicio getAllRoles:', error)
        return null
    }
}

function buildQueryParams(filters: ListUsersFiltersProps): string {
    const params = new URLSearchParams()

    if (filters.search && filters.search?.trim()) params.set('search', filters.search.trim())
    if (filters.page && filters.page > 0) params.set('page', filters.page.toString())
    if (filters.size && filters.size > 0) params.set('size', filters.size.toString())

    return params.toString()
}