const BACKEND_URL = process.env.NEXT_PUBLIC_SERVICE_ISSUES

export const API_ROUTES = {
    GET_ISSUES_BY_PROJECT: `${BACKEND_URL}/api/issues/search`,
    CRUD_ISSUES: `${BACKEND_URL}/api/issues`,
    ASIGN_ISSUE_TO_SPRINT: `${BACKEND_URL}/api/issues/assign`,
    REMOVE_ISSUE_FROM_SPRINT: `${BACKEND_URL}/api/issues/remove`,
    REOPEN_ISSUE: `${BACKEND_URL}/api/issues/reopen`,
    ASIGN_USER: `${BACKEND_URL}/api/issues/assignUser`,
}