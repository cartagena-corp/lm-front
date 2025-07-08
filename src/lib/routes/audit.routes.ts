const BACKEND_URL = process.env.NEXT_PUBLIC_SERVICE_AUDIT

export const API_ROUTES = {
    GET_PROJECT_HISTORY: `${BACKEND_URL}/api/audit/allByProject`,
    GET_ISSUE_HISTORY: `${BACKEND_URL}/api/audit/allByIssue/`,
}