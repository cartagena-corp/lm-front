const BACKEND_URL = process.env.NEXT_PUBLIC_SERVICE_CONFIG

export const API_ROUTES = {
    GET_CONFIG_BOARD: `${BACKEND_URL}/api/config`,
    CRUD_CONFIG_BOARDS: `${BACKEND_URL}/api/config/project-statuses`,
    CRUD_CONFIG_SPRINTS: `${BACKEND_URL}/api/config/sprint-statuses`,
    CRUD_CONFIG_ISSUES_TYPES: `${BACKEND_URL}/api/config/issue-types`,
    CRUD_CONFIG_ISSUES_STATUS: `${BACKEND_URL}/api/config/issue-statuses`,
    CRUD_CONFIG_ISSUES_PRIORITIES: `${BACKEND_URL}/api/config/issue-priorities`,
    CRUD_CONFIG_ISSUES_DESCRIPTIONS: `${BACKEND_URL}/api/config/issue-descriptions`,
}