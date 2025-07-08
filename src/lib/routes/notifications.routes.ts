const BACKEND_URL = process.env.NEXT_PUBLIC_SERVICE_NOTIFICATIONS

export const API_ROUTES = {
    CRUD_NOTIFICATIONS: `${BACKEND_URL}/api/notifications`,
    READ_ALL_NOTIFICATIONS: `${BACKEND_URL}/api/notifications/read-all`,
    DELETE_ALL_NOTIFICATIONS: `${BACKEND_URL}/api/notifications/delete-all`,
    CRUD_NOTIFICATIONS_TYPES: `${BACKEND_URL}/api/notification-types`,
    READ_EDIT_NOTIFICATIONS_PREFERENCES: `${BACKEND_URL}/api/notification-preferences`,
    WEBSOCKET_NOTIFICATIONS: `${BACKEND_URL}/ws-notifications`,
}