const BACKEND_URL = process.env.NEXT_PUBLIC_SERVICE_OAUTH
const ROLE_URL = process.env.NEXT_PUBLIC_SERVICE_USERS


export const API_ROUTES = {
    VALIDATE_TOKEN: `${BACKEND_URL}/api/oauth/validate/token`,
    GET_UUID_BY_TOKEN: `${BACKEND_URL}/api/oauth/token`,
    RESOLVE_USER: `${BACKEND_URL}/api/oauth/users/resolve?identifier=`,
    VALIDATE_BY_UUID: `${BACKEND_URL}/api/oauth/validate`,
    LIST_USERS: `${BACKEND_URL}/api/oauth/users`,
    SELECT_USER: `${BACKEND_URL}/api/oauth/user`,
    USER_BATCH: `${BACKEND_URL}/api/oauth/users/batch`,
    LOGIN_GOOGLE: `${BACKEND_URL}/oauth2/authorization/google`,
    ASSIGN_ROLE: `${BACKEND_URL}/api/oauth/user`,
    REFRESH_TOKEN: `${BACKEND_URL}/api/oauth/refresh`,
    USER_LOGOUT: `${BACKEND_URL}/api/oauth/logout`,
    IMPORT_USERS: `${BACKEND_URL}/api/oauth/import`,
    ADD_USER: `${BACKEND_URL}/api/oauth/add-user`,
    CRUD_ROLES: `${ROLE_URL}/api/roles`,
    CRUD_PERMISOS: `${ROLE_URL}/api/permissions`,
    ADD_USER_WITH_ORGANIZATION: `${BACKEND_URL}/api/oauth/add-user-with-organization`,
}