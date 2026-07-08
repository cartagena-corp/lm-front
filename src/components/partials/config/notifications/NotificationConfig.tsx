"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { useNotificationStore } from "@/lib/store/NotificationStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import Switch from "@/components/ui/Switch"

// Mapeo de nombres técnicos a nombres descriptivos
const notificationTypeNames: Record<string, string> = {
   "ISSUE_ASSIGNED": "Asignación de tareas",
   "ISSUE_UPDATED": "Actualización de tareas", 
   "ISSUE_CREATED": "Creación de tareas"
}

// Mapeo de nombres técnicos a descripciones
const notificationTypeDescriptions: Record<string, string> = {
   "ISSUE_ASSIGNED": "Recibe notificaciones cuando te asignen una tarea",
   "ISSUE_UPDATED": "Recibe notificaciones cuando se actualice una tarea",
   "ISSUE_CREATED": "Recibe notificaciones cuando se cree una nueva tarea"
}

interface NotificationPreference {
   type: string
   enabled: boolean
}

export default function NotificationConfig() {
   const [localPreferences, setLocalPreferences] = useState<NotificationPreference[]>([])
   const [savingStates, setSavingStates] = useState<Record<string, boolean>>({})

   const { getValidAccessToken } = useAuthStore()
   const { 
      notificationTypes, 
      preferences,
      isLoading, 
      getNotificationTypes,
      getPreferences,
      updatePreferences
   } = useNotificationStore()

   useEffect(() => {
      const loadData = async () => {
         const token = await getValidAccessToken()
         if (token) {
            await getNotificationTypes(token)
            await getPreferences(token)
         }
      }
      loadData()
   }, [getValidAccessToken, getNotificationTypes, getPreferences])

   // Inicializar preferencias locales cuando se cargan las preferencias del servidor
   useEffect(() => {
      if (preferences.length > 0) {
         // Mapear las preferencias del servidor al formato local
         const mappedPreferences = preferences.map(pref => ({
            type: pref.type.name,
            enabled: pref.enabled
         }))
         setLocalPreferences(mappedPreferences)
      } else if (notificationTypes.length > 0 && preferences.length === 0) {
         // Si no hay preferencias guardadas, inicializar con todos los tipos habilitados
         const initialPreferences = notificationTypes.map(type => ({
            type: type.name,
            enabled: true
         }))
         setLocalPreferences(initialPreferences)
      }
   }, [preferences, notificationTypes])

   const toggleNotification = async (type: string) => {
      // Actualizar el estado local inmediatamente
      const updatedPreferences = localPreferences.map(pref => 
         pref.type === type 
            ? { ...pref, enabled: !pref.enabled }
            : pref
      )
      setLocalPreferences(updatedPreferences)
      
      // Marcar este tipo como "guardando"
      setSavingStates(prev => ({ ...prev, [type]: true }))

      // Guardar en el servidor
      try {
         const token = await getValidAccessToken()
         if (token) {
            await updatePreferences(token, updatedPreferences)
         }
      } catch (error) {
         console.error('Error al guardar preferencias:', error)
         // Revertir el cambio local si hay error
         const revertedPreferences = localPreferences.map(pref => 
            pref.type === type 
               ? { ...pref, enabled: !pref.enabled }
               : pref
         )
         setLocalPreferences(revertedPreferences)
      } finally {
         // Remover el estado de "guardando" para este tipo
         setSavingStates(prev => {
            const newStates = { ...prev }
            delete newStates[type]
            return newStates
         })
      }
   }

   const getDisplayName = (type: string) => {
      return notificationTypeNames[type] || type
   }

   const getDescription = (type: string) => {
      return notificationTypeDescriptions[type] || ""
   }

   return (
      <div className="p-6">
         {/* Content */}
         <div>
            {isLoading ? (
               <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                     <div key={i} className="animate-pulse">
                        <div className="flex items-center justify-between gap-3 p-4" style={{ background: "var(--gray-alpha-100)", borderRadius: "var(--radius-md)" }}>
                           <div className="space-y-2 min-w-0 flex-1">
                              <div className="bg-[var(--gray-alpha-200)] rounded h-4 w-48 max-w-full"></div>
                              <div className="bg-[var(--gray-alpha-200)] rounded h-3 w-64 max-w-full"></div>
                           </div>
                           <div className="bg-[var(--gray-alpha-200)] rounded-full h-6 w-11 flex-shrink-0"></div>
                        </div>
                     </div>
                  ))}
               </div>
            ) : localPreferences.length === 0 ? (
               <div className="text-center py-12">
                  <div className="w-fit mx-auto mb-4 p-3 rounded-full" style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text-muted)" }}>
                     <Bell size={32} strokeWidth={1.5} />
                  </div>
                  <h4 className="text-lg font-medium text-[var(--ds-text)] mb-2">No hay tipos de notificación disponibles</h4>
                  <p className="text-[var(--ds-text-muted)]">Contacta con el administrador para configurar los tipos de notificación</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {localPreferences.map((preference) => (
                     <div
                        key={preference.type}
                        className="flex items-center justify-between gap-3 p-4 hover:bg-[var(--gray-alpha-200)] transition-colors duration-200"
                        style={{ background: "var(--gray-alpha-100)", borderRadius: "var(--radius-md)" }}
                     >
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-3 mb-1 min-w-0">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${preference.enabled ? 'bg-[var(--purple-700)]' : 'bg-[var(--gray-400)]'}`} />
                              <h4 className="font-medium text-[var(--ds-text)] break-words min-w-0">
                                 {getDisplayName(preference.type)}
                              </h4>
                           </div>
                           <p className="text-sm text-[var(--ds-text-secondary)] ml-5 break-words">
                              {getDescription(preference.type)}
                           </p>
                        </div>

                        {/* Toggle Switch */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                           {savingStates[preference.type] && (
                              <div
                                 className="w-3.5 h-3.5 rounded-full animate-spin flex-shrink-0"
                                 style={{ border: "2px solid var(--gray-alpha-300)", borderTopColor: "var(--ds-text-secondary)" }}
                              />
                           )}
                           <Switch
                              id={`notification-pref-${preference.type}`}
                              checked={preference.enabled}
                              onChange={() => toggleNotification(preference.type)}
                              disabled={savingStates[preference.type]}
                              size="md"
                           />
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* Footer con resumen */}
         {localPreferences.length > 0 && (
            <div className="p-4" style={{ borderTop: "1px solid var(--ds-border)" }}>
               <div className="text-center">
                  <span className="text-sm" style={{ color: "var(--ds-text-secondary)" }}>
                     {localPreferences.filter(p => p.enabled).length} de {localPreferences.length} tipos de notificación activados
                  </span>
               </div>
            </div>
         )}
      </div>
   )
}
