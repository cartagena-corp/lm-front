import { PaginatedResponse, PBoardProps } from "@/lib/types/pagination"
import { BoardFiltersProps } from "@/lib/types/board"
import { API_ROUTES } from "@routes/board.route"
import { apiClient } from "@/lib/apiClient"
import { logger } from "@/lib/types/Logger"

export async function getAllBoards(filters: BoardFiltersProps): Promise<PaginatedResponse<PBoardProps> | null> {
    try {
        const queryString = buildQueryParams(filters)
        const url = queryString ? `${API_ROUTES.CRUD_BOARDS}?${queryString}` : API_ROUTES.CRUD_BOARDS

        logger.info("Query Params Aplicados: ", { params: queryString })
        const response = await apiClient<PaginatedResponse<PBoardProps>>(url, { method: "GET", headers: { 'Content-Type': 'application/json' } })
        return response
    } catch (error) {
        logger.error('Error en el servicio getAllBoards:', error)
        return null
    }
}

export function buildQueryParams(filters: BoardFiltersProps): string {
    const params = new URLSearchParams()

    if (filters.direction && ['asc', 'desc'].includes(filters.direction)) params.set('direction', filters.direction)
    if (filters.createdBy && filters.createdBy?.trim()) params.set('createdBy', filters.createdBy.trim())
    if (filters.status && filters.status > 0) params.set('status', filters.status.toString())
    if (filters.sortBy && filters.sortBy?.trim()) params.set('sortBy', filters.sortBy.trim())
    if (filters.name && filters.name?.trim()) params.set('name', filters.name.trim())
    if (filters.page && filters.page > 0) params.set('page', filters.page.toString())
    if (filters.size && filters.size > 0) params.set('size', filters.size.toString())

    return params.toString()
}