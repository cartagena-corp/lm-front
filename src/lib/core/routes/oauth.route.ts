const BACKEND_URL = process.env.NEXT_PUBLIC_SERVICE_OAUTH

export const API_ROUTES = {
    SELECT_USER: `${BACKEND_URL}/api/oauth/user`,
    ADD_USER: `${BACKEND_URL}/api/oauth/add-user`,
    USER_LOGOUT: `${BACKEND_URL}/api/oauth/logout`,
    IMPORT_USERS: `${BACKEND_URL}/api/oauth/import`,
    LIST_ALL_USERS: `${BACKEND_URL}/api/oauth/users`,
    REFRESH_TOKEN: `${BACKEND_URL}/api/oauth/refresh`,
    USER_BATCH: `${BACKEND_URL}/api/oauth/users/batch`,
    GET_UUID_BY_TOKEN: `${BACKEND_URL}/api/oauth/token`,
    ASSIGN_ROLE_TO_USER: `${BACKEND_URL}/api/oauth/user`,
    VALIDATE_BY_UUID: `${BACKEND_URL}/api/oauth/validate`,
    VALIDATE_TOKEN: `${BACKEND_URL}/api/oauth/validate/token`,
    LOGIN_GOOGLE: `${BACKEND_URL}/oauth2/authorization/google`,
    RESOLVE_USER: `${BACKEND_URL}/api/oauth/users/resolve?identifier=`,
}