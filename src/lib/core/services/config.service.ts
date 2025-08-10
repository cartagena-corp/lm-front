import { BoardStatusProps } from "@/lib/types/global"
import { API_ROUTES } from "@routes/config.route"
import { apiClient } from "@/lib/apiClient"
import { logger } from "@/lib/types/Logger"

export async function getAllBoardStates(): Promise<BoardStatusProps[] | null> {
    try {
        const response = await apiClient<BoardStatusProps[]>(API_ROUTES.CRUD_CONFIG_BOARDS, { method: "GET", headers: { 'Content-Type': 'application/json' } })
        logger.info('Respuesta del servicio getAllBoardStates:', { response })
        return response
    } catch (error) {
        logger.error('Error en el servicio getAllBoardStates:', error)
        return null
    }
}