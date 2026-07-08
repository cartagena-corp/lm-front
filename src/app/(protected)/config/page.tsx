"use client"

import ProjectConfig from "@/components/partials/config/boards/ProjectConfig"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useEffect, useState } from "react"
import UserConfig from "@/components/partials/config/users/UserConfig"
import { PermissionProps } from "@/lib/types/types"
import { CustomSwitch, valueProps } from "@/components/ui/CustomSwitch"

const CONFIG_TABS: valueProps[] = [
   { id: 1, name: "Proyectos", view: () => <></> },
   { id: 2, name: "Usuarios", view: () => <></> },
]

export default function Config() {
   const { setConfig } = useConfigStore()
   const { getValidAccessToken, user, normalizeUserRole } = useAuthStore()
   const [activeTab, setActiveTab] = useState<valueProps>(CONFIG_TABS[0])

   useEffect(() => {
      const loadConfig = async () => {
         const token = await getValidAccessToken()
         if (token) await setConfig(token)
      }
      loadConfig()
   }, [getValidAccessToken, setConfig])

   const userRole = normalizeUserRole(user)
   const hasPermissionConfig = userRole?.permissions.some((p: PermissionProps) => p.name === "CONFIG_READ") ?? false
   const hasPermissionUser = userRole?.permissions.some((p: PermissionProps) => p.name === "USER_READ") ?? false

   const availableTabs = CONFIG_TABS.filter(tab =>
      (tab.id === 1 && hasPermissionConfig) ||
      (tab.id === 2 && hasPermissionUser)
   )

   // Si el tab activo deja de estar disponible (permisos aún cargando o cambiaron), cae al primero permitido.
   useEffect(() => {
      if (availableTabs.length > 0 && !availableTabs.some(tab => tab.id === activeTab.id)) {
         setActiveTab(availableTabs[0])
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [hasPermissionConfig, hasPermissionUser])

   return (
      <div>
         {/* Header */}
         <div className="mb-6">
            <h1 className="font-semibold" style={{ fontSize: 28, letterSpacing: "-1.1px", color: "var(--ds-text)", margin: "0 0 4px" }}>Panel de Configuración</h1>
            <p style={{ fontSize: 14, color: "var(--ds-text-secondary)", margin: 0 }}>Gestiona los estados y configuraciones de tu proyecto</p>
         </div>

         {/* Navigation Tabs */}
         {availableTabs.length > 1 && (
            <CustomSwitch tabs={availableTabs} value={activeTab} onChange={setActiveTab} />
         )}

         {/* Dynamic Content */}
         {activeTab.id === 1 ? (
            <ProjectConfig />
         ) : (
            <UserConfig />
         )}
      </div>
   )
}
