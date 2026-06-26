"use client"

import ProjectConfig from "@/components/partials/config/boards/ProjectConfig"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useEffect, useState } from "react"
import UserConfig from "@/components/partials/config/users/UserConfig"
import NotificationConfig from "@/components/partials/config/notifications/NotificationConfig"
import { ConfigIcon, BoardIcon, BellIcon } from "@/assets/Icon"
import { PermissionProps, UserProps } from "@/lib/types/types"

const listView = [
   {
      id: 1,
      name: "Configuración de Proyectos",
      icon: BoardIcon,
      description: "Gestiona los estados de tus proyectos"
   },
   {
      id: 2,
      name: "Configuración de Usuarios",
      icon: ConfigIcon,
      description: "Gestiona los usuarios de la plataforma y sus permisos"
   },
   {
      id: 3,
      name: "Configuración de Notificaciones",
      icon: BellIcon,
      description: "Gestiona los tipos y preferencias de notificaciones"
   }
]

export default function Config() {
   const { setConfig } = useConfigStore()
   const [view, setView] = useState(listView[0])
   const { getValidAccessToken } = useAuthStore()

   useEffect(() => { getConfig() }, [])

   const getConfig = async () => {
      const token = await getValidAccessToken()
      if (token) {
         await setConfig(token)
      }
   }


   const { user, normalizeUserRole } = useAuthStore()
   const userRole = normalizeUserRole(user)

   const hasPermissionConfig = userRole?.permissions.some((p: PermissionProps) => p.name === "CONFIG_READ") ?? false
   const hasPermissionUser = userRole?.permissions.some((p: PermissionProps) => p.name === "USER_READ") ?? false
   const hasPermissionNotifications = userRole?.permissions.some((p: PermissionProps) => p.name === "NOTIFICATION_CRUD") ?? false

   const viewTint = (id: number): React.CSSProperties =>
      id === 1 ? { background: "var(--blue-200)", color: "var(--blue-900)" }
         : id === 2 ? { background: "var(--green-200)", color: "var(--green-900)" }
            : { background: "var(--purple-200)", color: "var(--purple-900)" }

   return (
      <>
         <div className="mx-auto space-y-6" style={{ maxWidth: 900 }}>
            {/* Header */}
            <div className="p-5" style={{ background: "var(--ds-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-border)" }}>
               <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 10, background: "var(--gray-alpha-100)", color: "var(--ds-text-secondary)" }}>
                     <ConfigIcon size={24} />
                  </div>
                  <div>
                     <h1 className="font-semibold" style={{ fontSize: 24, letterSpacing: "-0.96px", color: "var(--ds-text)" }}>Panel de Configuración</h1>
                     <p style={{ fontSize: 13, color: "var(--ds-text-secondary)", marginTop: 2 }}>Gestiona los estados y configuraciones de tu proyecto</p>
                  </div>
               </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex flex-wrap gap-2">
               {listView.map((tab) => {
                  const Icon = tab.icon
                  if (tab.id === 1 && !hasPermissionConfig) return null
                  if (tab.id === 2 && !hasPermissionUser) return null
                  if (tab.id === 3 && !hasPermissionNotifications) return null
                  const active = view.id === tab.id
                  return (
                     <button
                        key={tab.id}
                        onClick={() => setView(tab)}
                        className={`flex items-center gap-2 px-[14px] transition-colors text-sm font-medium ${active ? '' : 'hover:bg-[var(--gray-alpha-100)]'}`}
                        style={active
                           ? { height: 34, borderRadius: "var(--radius-md)", background: "var(--ds-text)", color: "var(--ds-contrast-inverse)", border: "1px solid var(--ds-text)" }
                           : { height: 34, borderRadius: "var(--radius-md)", background: "transparent", color: "var(--ds-text-secondary)", border: "1px solid var(--ds-border-strong)" }}
                     >
                        <Icon size={16} />
                        <span className="hidden sm:inline">{tab.name}</span>
                        <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                     </button>
                  )
               })}
            </nav>

            {/* Content Area */}
            <div className="space-y-6">
               {/* Current View Description */}
               <div className="p-5" style={{ background: "var(--ds-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-border)" }}>
                  <div className="flex items-center gap-3">
                     <div className="p-2 flex" style={{ borderRadius: "var(--radius-md)", ...viewTint(view.id) }}>
                        <view.icon size={20} />
                     </div>
                     <div>
                        <h2 className="font-semibold" style={{ fontSize: 16, color: "var(--ds-text)" }}>{view.name}</h2>
                        <p className="text-sm" style={{ color: "var(--ds-text-secondary)" }}>{view.description}</p>
                     </div>
                  </div>
               </div>

               {/* Dynamic Content */}
               {view.id === 1 ? (
                  <ProjectConfig />
               ) : view.id === 2 ? (
                  <UserConfig />
               ) : (
                  <NotificationConfig />
               )}
            </div>
         </div>
      </>
   )
}