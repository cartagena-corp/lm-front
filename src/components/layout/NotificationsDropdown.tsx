"use client"

import { useNotificationStore } from "@/lib/store/NotificationStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useModalStore } from "@/lib/hooks/ModalStore"
import { useEffect, useState, useRef } from "react"
import { Bell, Trash2, Settings } from "lucide-react"
import { Client } from "@stomp/stompjs"
import { useRouter } from "next/navigation"
import { NotificationProps, PermissionProps } from "@/lib/types/types"
import NotificationConfig from "@/components/partials/config/notifications/NotificationConfig"

const iconBtn = "w-[34px] h-[34px] flex items-center justify-center rounded-md cursor-pointer transition-colors hover:bg-[var(--gray-alpha-100)]"

/** Notifications bell + anchored dropdown, rendered inline in the Topbar. */
export default function NotificationsDropdown() {
   const { getValidAccessToken, user, normalizeUserRole } = useAuthStore()
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
   const { openModal } = useModalStore()

   const [isOpen, setIsOpen] = useState(false)
   const [isClient, setIsClient] = useState(false)
   const clientRef = useRef<Client | null>(null)
   const ntfRef = useRef<HTMLDivElement>(null)
   const router = useRouter()

   useEffect(() => {
      setIsClient(true)
   }, [])

   useEffect(() => {
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

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (ntfRef.current && !ntfRef.current.contains(event.target as Node)) {
            setIsOpen(false)
         }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => {
         document.removeEventListener('mousedown', handleClickOutside)
      }
   }, [])

   if (!isClient || !user) return null

   const handleNotificationClick = async (notification: NotificationProps) => {
      const token = await getValidAccessToken()
      if (token) {
         await readNotification(token, notification.id)
         setIsOpen(false)
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

   const handleOpenPreferences = () => {
      setIsOpen(false)
      openModal({
         size: "lg",
         title: "Preferencias de Notificaciones",
         desc: "Configura qué notificaciones deseas recibir",
         Icon: <Settings size={20} strokeWidth={1.75} />,
         children: <NotificationConfig />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "UPDATE"
      })
   }

   const userRole = normalizeUserRole(user)
   const hasPermissionNotifications = userRole?.permissions.some((p: PermissionProps) => p.name === "NOTIFICATION_CRUD") ?? false

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
      <div className="relative" ref={ntfRef}>
         <button
            onClick={() => setIsOpen(!isOpen)}
            title="Notificaciones"
            className={iconBtn}
            style={{ border: "1px solid var(--ds-border)", background: "var(--ds-background)", color: "var(--ds-text-secondary)" }}
         >
            <div className="relative flex items-center justify-center">
               <Bell size={16} strokeWidth={1.5} />
               {unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2.5 min-w-[16px] h-[16px] px-1 text-[10px] font-semibold rounded-full flex items-center justify-center"
                     style={{ background: "var(--red-700)", color: "var(--ds-contrast-inverse)" }}>
                     {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
               )}
            </div>
         </button>

         {isOpen && (
            <div
               className="absolute right-0 top-full mt-2 z-30 rounded-xl w-[min(24rem,calc(100vw-3rem))] max-h-[70vh] overflow-hidden"
               style={{ background: "var(--ds-card)", border: "1px solid var(--ds-border)", boxShadow: "var(--shadow-lg)" }}
            >
               {/* Header */}
               <div className="p-4" style={{ borderBottom: "1px solid var(--ds-border)" }}>
                  <div className="flex items-center justify-between">
                     <div>
                        <h3 className="text-sm font-semibold" style={{ color: "var(--ds-text)" }}>Notificaciones</h3>
                        <p className="text-xs" style={{ color: "var(--ds-text-muted)" }}>
                           {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
                        </p>
                     </div>

                     <div className="flex items-center gap-1">
                        {hasPermissionNotifications && (
                           <button
                              onClick={handleOpenPreferences}
                              className="p-2 rounded-md transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] hover:text-[var(--ds-text)]"
                              style={{ color: "var(--ds-text-secondary)" }}
                              title="Preferencias de notificaciones"
                           >
                              <Settings size={16} strokeWidth={1.5} />
                           </button>
                        )}
                        {notifications.length > 0 && (
                           <>
                              <button
                                 onClick={handleReadAll}
                                 className="p-2 rounded-md transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] hover:text-[var(--ds-text)]"
                                 style={{ color: "var(--ds-text-secondary)" }}
                                 title="Marcar todas como leídas"
                              >
                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20,6 9,17 4,12"></polyline>
                                 </svg>
                              </button>
                              <button
                                 onClick={handleDeleteAll}
                                 className="p-2 rounded-md transition-colors duration-150 hover:bg-[var(--red-100)] hover:text-[var(--red-900)]"
                                 style={{ color: "var(--ds-text-secondary)" }}
                                 title="Eliminar todas"
                              >
                                 <Trash2 size={16} strokeWidth={1.5} />
                              </button>
                           </>
                        )}
                     </div>
                  </div>
               </div>

               {/* Lista de notificaciones */}
               <div className="max-h-[50vh] overflow-y-auto">
                  {isLoading ? (
                     <div className="p-8 text-center">
                        <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "var(--gray-alpha-200)", borderTopColor: "var(--gray-700)" }}></div>
                        <p className="text-sm" style={{ color: "var(--ds-text-muted)" }}>Cargando notificaciones…</p>
                     </div>
                  ) : notifications.length === 0 ? (
                     <div className="p-8 text-center">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text-muted)" }}>
                           <Bell size={28} strokeWidth={1.5} />
                        </div>
                        <h4 className="text-sm font-medium mb-1" style={{ color: "var(--ds-text-secondary)" }}>Sin notificaciones</h4>
                        <p className="text-[13px]" style={{ color: "var(--ds-text-muted)" }}>No tienes notificaciones nuevas</p>
                     </div>
                  ) : (
                     <div className="divide-y divide-[var(--ds-border)]">
                        {notifications.map(notification => (
                           <div
                              key={notification.id}
                              className={`group p-4 hover:bg-[var(--gray-alpha-100)] cursor-pointer transition-colors duration-150 ${!notification.read ? 'bg-[var(--blue-100)] border-l-2 border-l-[var(--blue-700)]' : ''
                                 }`}
                              onClick={() => handleNotificationClick(notification)}
                           >
                              <div className="flex items-start gap-3">
                                 <div className="flex-shrink-0 mt-1">
                                    {!notification.read ? (
                                       <div className="w-2 h-2 rounded-full" style={{ background: "var(--blue-700)" }}></div>
                                    ) : (
                                       <div className="w-2 h-2 rounded-full" style={{ background: "var(--gray-alpha-400)" }}></div>
                                    )}
                                 </div>

                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                       <div className="flex-1">
                                          <h4 className="text-sm font-medium" style={{ color: !notification.read ? "var(--ds-text)" : "var(--ds-text-secondary)" }}>
                                             {!notification.read ? 'Nueva Notificación' : 'Notificación'}
                                          </h4>
                                          <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--ds-text-secondary)" }}>
                                             {notification.message}
                                          </p>
                                          <p className="text-xs mt-2" style={{ color: "var(--ds-text-muted)" }}>
                                             {formatDate(notification.timestamp)}
                                          </p>
                                       </div>

                                       <button
                                          onClick={(e) => handleDeleteNotification(notification.id, e)}
                                          className="p-1 rounded-md transition-colors duration-150 opacity-0 group-hover:opacity-100 text-[var(--ds-text-muted)] hover:text-[var(--red-900)] hover:bg-[var(--red-100)]"
                                          title="Eliminar notificación"
                                       >
                                          <Trash2 size={14} strokeWidth={1.5} />
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               {notifications.length > 0 && (
                  <div className="p-2" style={{ borderTop: "1px solid var(--ds-border)", background: "var(--background-200)" }}>
                     <button
                        onClick={() => setIsOpen(false)}
                        className="w-full text-sm py-2 px-4 rounded-md transition-colors duration-150 text-[var(--ds-text-secondary)] hover:text-[var(--ds-text)] hover:bg-[var(--gray-alpha-100)]"
                     >
                        Cerrar panel
                     </button>
                  </div>
               )}
            </div>
         )}
      </div>
   )
}
