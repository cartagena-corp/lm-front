const BACKEND_URL = process.env.NEXT_PUBLIC_SERVICE_ISSUES

export const API_ROUTES = {
    CRUD_ISSUES: `${BACKEND_URL}/api/issues`,
    REOPEN_ISSUE: `${BACKEND_URL}/api/issues/reopen`,
    CREATE_ISSUES_FROM_IA: `${BACKEND_URL}/api/issues/batch`,
    GET_ISSUES_BY_PROJECT: `${BACKEND_URL}/api/issues/search`,
    ASIGN_ISSUE_TO_SPRINT: `${BACKEND_URL}/api/issues/assign`,
    ASIGN_USER_TO_ISSUE: `${BACKEND_URL}/api/issues/assignUser`,
    REMOVE_ISSUE_FROM_SPRINT: `${BACKEND_URL}/api/issues/remove`,
}