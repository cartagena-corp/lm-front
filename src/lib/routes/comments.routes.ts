const BACKEND_URL = process.env.NEXT_PUBLIC_SERVICE_COMMENTS

export const API_ROUTES = {
    CRUD_COMMENTS: `${BACKEND_URL}/api/comments`,
    CRUD_RESPONSES: `${BACKEND_URL}/api/comments/responses`,
}