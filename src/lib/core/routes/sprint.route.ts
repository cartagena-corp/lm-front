const BACKEND_URL = process.env.NEXT_PUBLIC_SERVICE_SPRINT

export const API_ROUTES = {
    CRUD_SPRINTS: `${BACKEND_URL}/api/sprints`,
    ACTIVE_SPRINT: `${BACKEND_URL}/api/sprints/active`,
    GET_SPRINTS_BY_PROJECT: `${BACKEND_URL}/api/sprints/project`,
    REMOVE_ISSUES_FROM_SPRINT: `${BACKEND_URL}/api/sprints/remove-issues`,
}