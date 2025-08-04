const BACKEND_URL = process.env.NEXT_PUBLIC_SERVICE_USERS

export const API_ROUTES = {
    CRUD_ROLES: `${BACKEND_URL}/api/roles`,
    CRUD_PERMISOS: `${BACKEND_URL}/api/permissions`,
}