const BACKEND_URL = process.env.NEXT_PUBLIC_SERVICE_BOARDS
const INTEGRATION_URL = process.env.NEXT_PUBLIC_SERVICE_INTEGRATION

export const API_ROUTES = {
    CRUD_BOARDS: `${BACKEND_URL}/api/projects`,
    VALIDATE_BOARD: `${BACKEND_URL}/api/projects/validate`,
    IMPORT_BOARD_FROM_JIRA: `${INTEGRATION_URL}/api/import`,
}