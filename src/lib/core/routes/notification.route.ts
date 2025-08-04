const BACKEND_URL = process.env.NEXT_PUBLIC_SERVICE_NOTIFICATIONS

export const API_ROUTES = {
    CRUD_NOTIFICATIONS: `${BACKEND_URL}/api/notifications`,
    WEBSOCKET_NOTIFICATIONS: `${BACKEND_URL}/ws-notifications`,
    CRUD_NOTIFICATION_TYPES: `${BACKEND_URL}/api/notification-types`,
    READ_ALL_NOTIFICATIONS: `${BACKEND_URL}/api/notifications/read-all`,
    DELETE_ALL_NOTIFICATIONS: `${BACKEND_URL}/api/notifications/delete-all`,
    READ_EDIT_NOTIFICATION_PREFERENCES: `${BACKEND_URL}/api/notification-preferences`,
}