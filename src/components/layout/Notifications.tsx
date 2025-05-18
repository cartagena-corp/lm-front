"use client"

import { useNotificationStore } from "@/lib/store/NotificationStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useEffect, useState, useRef } from "react"
import { BellIcon, MegaphoneIcon } from "@/assets/Icon"
import { Client } from "@stomp/stompjs"
import { useRouter } from "next/navigation"


export default function Notifications() {
   const { getValidAccessToken } = useAuthStore()
   const { notifications, getNotifications, connectAndSubscribe } = useNotificationStore()

   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
   const clientRef = useRef<Client | null>(null)
   const ntfRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      const init = async () => {
         const token = await getValidAccessToken()
         if (token) {
            await getNotifications(token)
            await connectAndSubscribe(token, clientRef)
         }
      }
      init()
      return () => { clientRef.current?.deactivate() }
   }, [])

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => { if (ntfRef.current && !ntfRef.current.contains(event.target as Node)) setIsNotificationsOpen(false) }
      document.addEventListener('mousedown', handleClickOutside)
      return () => { document.removeEventListener('mousedown', handleClickOutside) }
   }, [])

   const router = useRouter()

   return (
      <main className="fixed bottom-5 right-5 flex flex-col items-end gap-2">
         {
            isNotificationsOpen &&
            <section ref={ntfRef} className="bg-white border-black/15 flex flex-col overflow-y-auto select-animation rounded-md shadow-2xl border w-80 h-[600px]">
               {
                  notifications.map(ntf =>
                     <button key={ntf.id} className="hover:bg-black/5 flex items-center px-2 py-3 gap-2" onClick={() => {
                        setIsNotificationsOpen(false)
                        router.push(`/tableros/${ntf.metadata.projectId}`)
                     }}>
                        <span className="text-[#2980b9] bg-[#2980b90f] border-[#2980b9] aspect-square rounded-full p-2">
                           <MegaphoneIcon size={18} />
                        </span>
                        <div className="flex flex-col items-start">
                           <div className="flex justify-between items-center gap-2 w-full">
                              <h6 className="text-[#2980b9] font-semibold text-start text-sm">{ntf.read ? "Notificación" : "Nueva Notificación"}</h6>
                              <p className="text-black/50 text-[11px]">
                                 {
                                    (() => {
                                       const dateStr = ntf.timestamp
                                       if (!dateStr) return ''

                                       let date
                                       if (dateStr.includes('T')) {
                                          date = new Date(dateStr)
                                       } else {
                                          const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10))
                                          date = new Date(year, month - 1, day)
                                       }

                                       return date.toLocaleDateString('es-ES', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: false
                                       })
                                    })()
                                 }
                              </p>
                           </div>
                           <p className="text-black/50 text-start text-[10px] line-clamp-2">{ntf.message}</p>
                        </div>
                     </button>
                  )
               }
            </section>
         }
         <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`${notifications.length !== 0
               ? "bg-gray-900 hover:bg-gray-700 text-white"
               : "text-gray-900 hover:bg-gray-900 hover:text-white bg-white"
               } shadow-2xl shadow-black duration-150 aspect-square rounded-full p-3`}>
            <div className="relative">
               <BellIcon stroke={2} />
               {notifications.length !== 0 && <span className="bg-white text-gray-900 absolute -top-0.5 right-0 aspect-square rounded-full w-2.5" />}
            </div>
         </button>
      </main>
   )
}
