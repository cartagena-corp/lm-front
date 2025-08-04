const BACKEND_URL = process.env.NEXT_PUBLIC_SERVICE_INTEGRATION

export const API_ROUTES = {
    GEMINI_CHAT: `${BACKEND_URL}/api/gemini/chat`,
    GEMINI_CONFIG: `${BACKEND_URL}/api/gemini-config`,
    IMPORT_BOARD_FROM_JIRA: `${BACKEND_URL}/api/import`,
    DETECT_ISSUES_FROM_TEXT: `${BACKEND_URL}/api/gemini/detectIssuesFromText`,
}