"use client"

import { useState, useEffect } from "react"
import { BellIcon } from "@/assets/Icon"
import { useNotificationStore } from "@/lib/store/NotificationStore"
import { useAuthStore } from "@/lib/store/AuthStore"

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
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
         {/* Header */}
         <div className="border-gray-100 border-b p-6">
            <div className="flex items-center gap-3">
               <div className="bg-purple-50 text-purple-600 rounded-lg p-2">
                  <BellIcon size={24} />
               </div>
               <div>
                  <h3 className="text-lg font-semibold text-gray-900">Preferencias de Notificaciones</h3>
                  <p className="text-sm text-gray-500">Configura qué notificaciones deseas recibir</p>
               </div>
            </div>
         </div>

         {/* Content */}
         <div className="p-6">
            {isLoading ? (
               <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                     <div key={i} className="animate-pulse">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                           <div className="space-y-2">
                              <div className="bg-gray-200 rounded h-4 w-48"></div>
                              <div className="bg-gray-200 rounded h-3 w-64"></div>
                           </div>
                           <div className="bg-gray-200 rounded-full h-6 w-11"></div>
                        </div>
                     </div>
                  ))}
               </div>
            ) : localPreferences.length === 0 ? (
               <div className="text-center py-12">
                  <div className="bg-gray-50 text-gray-400 rounded-full w-fit mx-auto mb-4 p-3">
                     <BellIcon size={32} />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No hay tipos de notificación disponibles</h4>
                  <p className="text-gray-500">Contacta con el administrador para configurar los tipos de notificación</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {localPreferences.map((preference) => (
                     <div
                        key={preference.type}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                     >
                        <div className="flex-1">
                           <div className="flex items-center gap-3 mb-1">
                              <div className={`w-2 h-2 rounded-full ${preference.enabled ? 'bg-purple-500' : 'bg-gray-400'}`} />
                              <h4 className="font-medium text-gray-900">
                                 {getDisplayName(preference.type)}
                              </h4>
                           </div>
                           <p className="text-sm text-gray-600 ml-5">
                              {getDescription(preference.type)}
                           </p>
                        </div>
                        
                        {/* Toggle Switch */}
                        <button
                           onClick={() => toggleNotification(preference.type)}
                           disabled={savingStates[preference.type]}
                           className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                              preference.enabled ? 'bg-purple-600' : 'bg-gray-200'
                           }`}
                           role="switch"
                           aria-checked={preference.enabled}
                           aria-label={`Toggle ${getDisplayName(preference.type)}`}
                        >
                           <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                 preference.enabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                           />
                           {savingStates[preference.type] && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                              </div>
                           )}
                        </button>
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* Footer con resumen */}
         {localPreferences.length > 0 && (
            <div className="border-gray-100 border-t p-4 bg-gray-50">
               <div className="text-center">
                  <span className="text-sm text-gray-600">
                     {localPreferences.filter(p => p.enabled).length} de {localPreferences.length} tipos de notificación activados
                  </span>
               </div>
            </div>
         )}
      </section>
   )
}
