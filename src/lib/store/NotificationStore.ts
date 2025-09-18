import { NotificationProps, WebSocketNotificationResponse } from '../types/types'
import { API_ROUTES } from '../routes/notifications.routes'
import { MutableRefObject } from 'react'
import { Client, Frame } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { create } from 'zustand'
import { useAuthStore } from './AuthStore'
import toast from 'react-hot-toast'

interface NotificationPreference {
   type: string
   enabled: boolean
}

interface ServerNotificationPreference {
   id: number
   userId: string
   type: {
      name: string
   }
   enabled: boolean
}

interface NotificationType {
   id: string
   name: string
   createdAt: string
   updatedAt: string
}

interface NotificationState {
   // State
   notifications: NotificationProps[]
   unreadCount: number
   preferences: ServerNotificationPreference[]
   notificationTypes: NotificationType[]
   isLoading: boolean
   error: string | null

   // Notification Actions
   getNotifications: (token: string) => Promise<void>
   readNotification: (token: string, notificationId: string) => Promise<void>
   readAllNotifications: (token: string) => Promise<void>
   deleteNotification: (token: string, notificationId: string) => Promise<void>
   deleteAllNotifications: (token: string) => Promise<void>

   // Preferences Actions
   getPreferences: (token: string) => Promise<void>
   updatePreferences: (token: string, preferences: NotificationPreference[]) => Promise<void>

   // Notification Types Actions
   getNotificationTypes: (token: string) => Promise<void>
   createNotificationType: (token: string, name: string) => Promise<void>
   deleteNotificationType: (token: string, typeName: string) => Promise<void>

   // WebSocket Actions
   connectAndSubscribe: (token: string, clientRef: MutableRefObject<Client | null>) => Promise<void>

   // Utility Actions
   clearError: () => void
   setLoading: (loading: boolean) => void
}

// Helper function to handle API errors consistently
const handleApiError = (error: unknown, context: string): string => {
   const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
   console.error(`Error en ${context}:`, error)
   return errorMessage
}

// Helper function to normalize notification data from different sources
const normalizeNotification = (data: any): NotificationProps => {
   // Handle both old and new notification formats
   return {
      id: data.id,
      message: data.message,
      type: data.type,
      read: data.read ?? data.wasReaded ?? false, // Handle both 'read' and legacy 'wasReaded'
      timestamp: data.timestamp,
      metadata: data.metadata || {
         projectId: data.projectId,
         issueId: data.issueId
      },
      projectId: data.projectId,
      issueId: data.issueId
   }
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
   // Initial state
   notifications: [],
   unreadCount: 0,
   preferences: [],
   notificationTypes: [],
   isLoading: false,
   error: null,

   // Get all notifications
   getNotifications: async (token) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.CRUD_NOTIFICATIONS, {
            method: 'GET',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         })

         if (!response.ok) {
            throw new Error(`Error al obtener notificaciones: ${response.statusText}`)
         }

         const rawNotifications = await response.json()
         const notifications: NotificationProps[] = rawNotifications.map(normalizeNotification)
         const unreadCount = notifications.filter(n => !n.read).length
         set({ notifications, unreadCount, isLoading: false })
      } catch (error) {
         const errorMessage = handleApiError(error, 'getNotifications')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al cargar las notificaciones')
      }
   },

   // Mark a notification as read
   readNotification: async (token, notificationId) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_NOTIFICATIONS}/${notificationId}/read`, {
            method: 'PUT',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         })

         if (!response.ok) {
            throw new Error(`Error al marcar notificación como leída: ${response.statusText}`)
         }

         // Update the notification in the local state
         set(state => {
            const updatedNotifications = state.notifications.map(notification =>
               notification.id === notificationId
                  ? { ...notification, read: true }
                  : notification
            )
            const unreadCount = updatedNotifications.filter(n => !n.read).length
            return {
               notifications: updatedNotifications,
               unreadCount,
               isLoading: false
            }
         })

         toast.success('Notificación marcada como leída')
      } catch (error) {
         const errorMessage = handleApiError(error, 'readNotification')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al marcar la notificación como leída')
      }
   },

   // Mark all notifications as read
   readAllNotifications: async (token) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.READ_ALL_NOTIFICATIONS, {
            method: 'PUT',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         })

         if (!response.ok) {
            throw new Error(`Error al marcar todas las notificaciones como leídas: ${response.statusText}`)
         }

         // Update all notifications in the local state
         set(state => ({
            notifications: state.notifications.map(notification => ({ ...notification, read: true })),
            unreadCount: 0,
            isLoading: false
         }))

         toast.success('Todas las notificaciones marcadas como leídas')
      } catch (error) {
         const errorMessage = handleApiError(error, 'readAllNotifications')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al marcar todas las notificaciones como leídas')
      }
   },

   // Delete a notification
   deleteNotification: async (token, notificationId) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_NOTIFICATIONS}/${notificationId}`, {
            method: 'DELETE',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         })

         if (!response.ok) {
            throw new Error(`Error al eliminar notificación: ${response.statusText}`)
         }

         // Remove the notification from the local state
         set(state => {
            const updatedNotifications = state.notifications.filter(notification => notification.id !== notificationId)
            const unreadCount = updatedNotifications.filter(n => !n.read).length
            return {
               notifications: updatedNotifications,
               unreadCount,
               isLoading: false
            }
         })

         toast.success('Notificación eliminada exitosamente')
      } catch (error) {
         const errorMessage = handleApiError(error, 'deleteNotification')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al eliminar la notificación')
      }
   },

   // Delete all notifications
   deleteAllNotifications: async (token) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.DELETE_ALL_NOTIFICATIONS, {
            method: 'DELETE',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         })

         if (!response.ok) {
            throw new Error(`Error al eliminar todas las notificaciones: ${response.statusText}`)
         }

         // Clear all notifications from the local state
         set({ notifications: [], unreadCount: 0, isLoading: false })

         toast.success('Todas las notificaciones eliminadas exitosamente')
      } catch (error) {
         const errorMessage = handleApiError(error, 'deleteAllNotifications')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al eliminar todas las notificaciones')
      }
   },

   // Get notification preferences
   getPreferences: async (token) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.READ_EDIT_NOTIFICATIONS_PREFERENCES, {
            method: 'GET',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         })

         if (!response.ok) {
            throw new Error(`Error al obtener preferencias: ${response.statusText}`)
         }

         const preferences: ServerNotificationPreference[] = await response.json()
         set({ preferences, isLoading: false })
      } catch (error) {
         const errorMessage = handleApiError(error, 'getPreferences')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al cargar las preferencias')
      }
   },

   // Update notification preferences
   updatePreferences: async (token, preferences) => {
      try {
         const response = await fetch(API_ROUTES.READ_EDIT_NOTIFICATIONS_PREFERENCES, {
            method: 'PUT',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferences)
         })

         if (!response.ok) {
            throw new Error(`Error al actualizar preferencias: ${response.statusText}`)
         }

         // El endpoint devuelve 204 No Content, solo mostramos el toast de éxito
         toast.success('Preferencias actualizadas exitosamente')
      } catch (error) {
         const errorMessage = handleApiError(error, 'updatePreferences')
         set({
            error: errorMessage
         })
         toast.error('Error al actualizar las preferencias')
         throw error // Re-throw para que el componente pueda manejar el error
      }
   },

   // Get notification types
   getNotificationTypes: async (token) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.CRUD_NOTIFICATIONS_TYPES, {
            method: 'GET',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         })

         if (!response.ok) {
            throw new Error(`Error al obtener tipos de notificaciones: ${response.statusText}`)
         }

         const notificationTypes: NotificationType[] = await response.json()
         set({ notificationTypes, isLoading: false })
      } catch (error) {
         const errorMessage = handleApiError(error, 'getNotificationTypes')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al cargar los tipos de notificaciones')
      }
   },

   // Create a new notification type
   createNotificationType: async (token, name) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.CRUD_NOTIFICATIONS_TYPES, {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
         })

         if (!response.ok) {
            throw new Error(`Error al crear tipo de notificación: ${response.statusText}`)
         }

         const newType: NotificationType = await response.json()
         set(state => ({
            notificationTypes: [...state.notificationTypes, newType],
            isLoading: false
         }))

         toast.success('Tipo de notificación creado exitosamente')
      } catch (error) {
         const errorMessage = handleApiError(error, 'createNotificationType')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al crear el tipo de notificación')
      }
   },

   // Delete a notification type
   deleteNotificationType: async (token, typeName) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_NOTIFICATIONS_TYPES}/${typeName}`, {
            method: 'DELETE',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         })

         if (!response.ok) {
            throw new Error(`Error al eliminar tipo de notificación: ${response.statusText}`)
         }

         // Remove the type from the local state
         set(state => ({
            notificationTypes: state.notificationTypes.filter(type => type.name !== typeName),
            isLoading: false
         }))

         toast.success('Tipo de notificación eliminado exitosamente')
      } catch (error) {
         const errorMessage = handleApiError(error, 'deleteNotificationType')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al eliminar el tipo de notificación')
      }
   },

   // WebSocket connection and subscription
   connectAndSubscribe: async (token, clientRef) => {
      try {
         // Disconnect existing client if any
         if (clientRef.current) {
            clientRef.current.deactivate()
         }

         // Get user info for subscription
         const { user } = useAuthStore.getState()
         if (!user?.id) {
            throw new Error('Usuario no autenticado')
         }

         // Create STOMP client with SockJS
         const client = new Client({
            webSocketFactory: () => new SockJS(API_ROUTES.WEBSOCKET_NOTIFICATIONS),
            connectHeaders: {
               Authorization: `Bearer ${token}`
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: (frame: Frame) => {
               // Subscribe to notifications topic (matching backend configuration)
               client.subscribe(`/topic/notifications/${user.id}`, (message) => {
                  try {
                     const wsResponse: WebSocketNotificationResponse = JSON.parse(message.body)

                     // Extract notification and unread count from websocket response
                     const { notification: rawNotification, unreadCount } = wsResponse

                     // Normalize the notification data
                     const notification = normalizeNotification(rawNotification)

                     // Add the new notification to the store and update unread count
                     set(state => ({
                        notifications: [notification, ...state.notifications],
                        unreadCount: unreadCount
                     }))

                  } catch (error) {
                     console.error('Error al procesar notificación:', error)
                  }
               })
            },
            onDisconnect: (frame: Frame) => {
               console.log('Desconectado del WebSocket:', frame)
            },
            onStompError: (frame: Frame) => {
               toast.error('Error en la conexión de notificaciones')
            }
         })

         // Store client reference
         clientRef.current = client

         // Activate the client
         client.activate()
      } catch (error) {
         const errorMessage = handleApiError(error, 'connectAndSubscribe')
         console.error('Error al conectar WebSocket:', error)
         toast.error('Error al conectar con las notificaciones en tiempo real')
      } finally {
         // Load initial notifications
         get().getNotifications(token)
      }
   },

   // Utility actions
   clearError: () => set({ error: null }),

   setLoading: (loading: boolean) => set({ isLoading: loading })
}))