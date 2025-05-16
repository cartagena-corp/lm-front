import { NotificationProps } from '../types/types'
import { MutableRefObject } from 'react'
import { Client, Frame } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { create } from 'zustand'
import { useAuthStore } from './AuthStore'

interface NotificationState {
   notifications: NotificationProps[]
   getNotifications: (token: string) => Promise<void>
   connectAndSubscribe: (token: string, clientRef: MutableRefObject<Client | null>) => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_NOTIFICATIONS

export const useNotificationStore = create<NotificationState>(set => ({
   notifications: [],
   getNotifications: async (token) => {
      try {
         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_NOTIFICATIONS}`

         const response = await fetch(url, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
         if (!response.ok) throw new Error(response.statusText)

         const ntf: NotificationProps[] = await response.json()
         set({ notifications: ntf })
      } catch (error) {
         console.error(error)
      }
   },
   connectAndSubscribe: async (token, clientRef) => {
      try {
         if (clientRef.current && clientRef.current.active) return

         const client = new Client({
            webSocketFactory: () => new SockJS(process.env.NEXT_PUBLIC_WEBSOCKET_NOTIFICATIONS!),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
         })

         client.onConnect = (frame: Frame) => {
            client.subscribe(`${process.env.NEXT_PUBLIC_USE_NOTIFICATION_WEBSOCKET}/${useAuthStore.getState().user?.id}`,
               (ntf) => {
                  const payload: NotificationProps = JSON.parse(ntf.body)
                  set(state => ({
                     notifications: [payload, ...state.notifications]
                  }))
               }
            )
         }

         client.onStompError = frame => {
            console.error("Error STOMP:", frame.headers["message"], frame.body)
         }

         client.activate()
         clientRef.current = client
      } catch (error) {
         console.error(error)
      } finally {
         useNotificationStore.getState().getNotifications(token)
      }
   }
}))