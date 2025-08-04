const BACKEND_URL = process.env.NEXT_PUBLIC_SERVICE_BOARDS

export const API_ROUTES = {
    CRUD_BOARDS: `${BACKEND_URL}/api/projects`,
    VALIDATE_BOARD: `${BACKEND_URL}/api/projects/validate`,
}