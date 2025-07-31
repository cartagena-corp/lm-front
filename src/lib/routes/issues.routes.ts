const BACKEND_URL = process.env.NEXT_PUBLIC_SERVICE_ISSUES
const INTEGRATION_URL = process.env.NEXT_PUBLIC_SERVICE_INTEGRATION

export const API_ROUTES = {
    GET_ISSUES_BY_PROJECT: `${BACKEND_URL}/api/issues/search`,
    CRUD_ISSUES: `${BACKEND_URL}/api/issues`,
    ASIGN_ISSUE_TO_SPRINT: `${BACKEND_URL}/api/issues/assign`,
    REMOVE_ISSUE_FROM_SPRINT: `${BACKEND_URL}/api/issues/remove`,
    REOPEN_ISSUE: `${BACKEND_URL}/api/issues/reopen`,
    ASIGN_USER: `${BACKEND_URL}/api/issues/assignUser`,
    CREATE_ISSUES_FROM_IA: `${BACKEND_URL}/api/issues/batch`,
    DETECT_ISSUES_FROM_TEXT: `${INTEGRATION_URL}/api/gemini/detectIssuesFromText`,
    DETECT_ISSUES_FROM_DOCX: `${INTEGRATION_URL}/api/gemini/detectIssuesFromDocx`,
    GET_COLUMNS_FROM_EXCEL: `${INTEGRATION_URL}/api/import/columns`,
    IMPORT_ISSUES: `${INTEGRATION_URL}/api/import`,
    GEMINI_CONFIG: `${INTEGRATION_URL}/api/gemini-config`,
    GEMINI_CHAT: `${INTEGRATION_URL}/api/gemini/chat`,
}