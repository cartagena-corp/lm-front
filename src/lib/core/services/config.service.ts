import { StatusProps } from "@/lib/types/global"
import { API_ROUTES } from "@routes/config.route"
import { apiClient } from "@/lib/apiClient"
import { logger } from "@/lib/types/Logger"

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

interface updateBoardStateParams {
    changes: Partial<StatusProps>
    state: StatusProps
}

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