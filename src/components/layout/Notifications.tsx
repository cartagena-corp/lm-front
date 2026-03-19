"use client"

import { useNotificationStore } from "@/lib/store/NotificationStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useEffect, useState, useRef } from "react"
import { BellIcon, DeleteIcon, MegaphoneIcon } from "@/assets/Icon"
import { Client } from "@stomp/stompjs"
import { useRouter } from "next/navigation"
import { NotificationProps } from "@/lib/types/types"

export default function Notifications() {
   const { getValidAccessToken, user } = useAuthStore()
   const {
      notifications,
      unreadCount,
      isLoading,
      getNotifications,
      connectAndSubscribe,
      readNotification,
      readAllNotifications,
      deleteNotification,
      deleteAllNotifications
   } = useNotificationStore()

   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
   const [isClient, setIsClient] = useState(false)
   const clientRef = useRef<Client | null>(null)
   const ntfRef = useRef<HTMLDivElement>(null)
   const router = useRouter()

   // TODOS LOS HOOKS DEBEN ESTAR ANTES DE CUALQUIER EARLY RETURN

   // Evitar problemas de hidratación
   useEffect(() => {
      setIsClient(true)
   }, [])

   // Inicialización de notificaciones y WebSocket
   useEffect(() => {
      // Solo ejecutar si el cliente está listo y el usuario está logueado
      if (!isClient || !user) return

      const init = async () => {
         const token = await getValidAccessToken()
         if (token) {
            await getNotifications(token)
            await connectAndSubscribe(token, clientRef)
         }
      }

      init()

      return () => {
         clientRef.current?.deactivate()
      }
   }, [isClient, user, getValidAccessToken, getNotifications, connectAndSubscribe])

   // Click outside handler
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (ntfRef.current && !ntfRef.current.contains(event.target as Node)) {
            setIsNotificationsOpen(false)
         }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => {
         document.removeEventListener('mousedown', handleClickOutside)
      }
   }, [])

   // Solo renderizar si el cliente está listo y el usuario está logueado
   if (!isClient || !user) return null

   const handleNotificationClick = async (notification: NotificationProps) => {
      const token = await getValidAccessToken()
      if (token) {
         await readNotification(token, notification.id)
         setIsNotificationsOpen(false)
         router.push(`/tableros/${notification.projectId}`)
      }
   }

   const handleReadAll = async () => {
      const token = await getValidAccessToken()
      if (token) {
         await readAllNotifications(token)
      }
   }

   const handleDeleteAll = async () => {
      const token = await getValidAccessToken()
      if (token) {
         await deleteAllNotifications(token)
      }
   }

   const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      const token = await getValidAccessToken()
      if (token) {
         await deleteNotification(token, notificationId)
      }
   }

   const formatDate = (dateStr: string) => {
      if (!dateStr) return ''

      let date
      if (dateStr.includes('T')) {
         date = new Date(dateStr)
      } else {
         const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10))
         date = new Date(year, month - 1, day)
      }

      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)

      if (diffHours < 1) return 'Hace unos minutos'
      if (diffHours < 24) return `Hace ${diffHours}h`
      if (diffDays < 7) return `Hace ${diffDays}d`

      return date.toLocaleDateString('es-ES', {
         day: '2-digit',
         month: 'short',
         year: 'numeric'
      })
   }

   return (
      <>
         {/* Panel de notificaciones */}
         {isNotificationsOpen && (
            <div
               ref={ntfRef}
               className="fixed bottom-24 right-6 z-40 bg-white rounded-2xl shadow-2xl border border-gray-200 w-96 max-h-[600px] overflow-hidden animate-in slide-in-from-bottom-2 duration-300"
            >
               {/* Header */}
               <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                           <BellIcon size={20} />
                        </div>
                        <div>
                           <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                           <p className="text-sm text-gray-500">
                              {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
                           </p>
                        </div>
                     </div>

                     {/* Acciones del header */}
                     <div className="flex items-center gap-2">
                        {notifications.length > 0 && (
                           <>
                              <button
                                 onClick={handleReadAll}
                                 className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                 title="Marcar todas como leídas"
                              >
                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20,6 9,17 4,12"></polyline>
                                 </svg>
                              </button>
                              <button
                                 onClick={handleDeleteAll}
                                 className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                 title="Eliminar todas"
                              >
                                 <DeleteIcon size={16} />
                              </button>
                           </>
                        )}
                     </div>
                  </div>
               </div>

               {/* Lista de notificaciones */}
               <div className="max-h-[500px] overflow-y-auto">
                  {isLoading ? (
                     <div className="p-8 text-center">
                        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">Cargando notificaciones...</p>
                     </div>
                  ) : notifications.length === 0 ? (
                     <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                           <BellIcon size={32} />
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">Sin notificaciones</h4>
                        <p className="text-sm text-gray-500">No tienes notificaciones nuevas</p>
                     </div>
                  ) : (
                     <div className="divide-y divide-gray-100">
                        {notifications.map(notification => (
                           <div
                              key={notification.id}
                              className={`group p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                                 }`}
                              onClick={() => handleNotificationClick(notification)}
                           >
                              <div className="flex items-start gap-3">
                                 {/* Indicador de estado */}
                                 <div className="flex-shrink-0 mt-1">
                                    {!notification.read ? (
                                       <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    ) : (
                                       <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                    )}
                                 </div>

                                 {/* Contenido */}
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                       <div className="flex-1">
                                          <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'
                                             }`}>
                                             {!notification.read ? 'Nueva Notificación' : 'Notificación'}
                                          </h4>
                                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                             {notification.message}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-2">
                                             {formatDate(notification.timestamp)}
                                          </p>
                                       </div>

                                       {/* Botón eliminar */}
                                       <button
                                          onClick={(e) => handleDeleteNotification(notification.id, e)}
                                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                          title="Eliminar notificación"
                                       >
                                          <DeleteIcon size={14} />
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               {/* Footer */}
               {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-100 bg-gray-50">
                     <button
                        onClick={() => setIsNotificationsOpen(false)}
                        className="w-full text-sm text-gray-600 hover:text-gray-900 py-2 px-4 rounded-lg hover:bg-white transition-colors"
                     >
                        Cerrar panel
                     </button>
                  </div>
               )}
            </div>
         )}

         {/* Botón flotante - Completamente independiente */}
         <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${unreadCount > 0
               ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
               : 'bg-white hover:bg-gray-50 text-gray-700 shadow-gray-900/10'
               } border ${unreadCount > 0 ? 'border-blue-600' : 'border-gray-200'}`}
         >
            <div className="relative flex items-center justify-center">
               <BellIcon size={24} />
               {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                     {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
               )}
            </div>
         </button>
      </>
   )
}
