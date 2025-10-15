const BACKEND_URL = process.env.NEXT_PUBLIC_SERVICE_AUDIT

export const API_ROUTES = {
    GET_PROJECT_HISTORY: `${BACKEND_URL}/api/audit/allByProject`,
    GET_ISSUE_HISTORY: `${BACKEND_URL}/api/audit/allByIssue/`,
    GET_PROJECT_DASHBOARD: ({ projectId }: { projectId: string }) => `${BACKEND_URL}/api/audit/${projectId}/dashboard`,
    GET_SPRINT_DASHBOARD: ({ projectId, sprintId }: { projectId: string, sprintId: string }) => `${BACKEND_URL}/api/audit/${projectId}/sprint/${sprintId}/dashboard`,
    GET_ISSUE_DASHBOARD: ({ projectId, issueId }: { projectId: string, issueId: string }) => `${BACKEND_URL}/api/audit/${projectId}/issue/${issueId}/dashboard`,
}