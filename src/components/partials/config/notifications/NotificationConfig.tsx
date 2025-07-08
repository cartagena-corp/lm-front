"use client"

import { useState, useEffect } from "react"
import { DeleteIcon, PlusIcon, BellIcon } from "@/assets/Icon"
import { useNotificationStore } from "@/lib/store/NotificationStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import CreateEditNotificationType from "./CreateEditNotificationType"
import DeleteNotificationType from "./DeleteNotificationType"
import Modal from "@/components/layout/Modal"

export default function NotificationConfig() {
   const [isCreateTypeOpen, setIsCreateTypeOpen] = useState(false)
   const [isDeleteTypeOpen, setIsDeleteTypeOpen] = useState(false)
   const [currentType, setCurrentType] = useState<{ id?: string, name: string }>({ name: "" })

   const { getValidAccessToken } = useAuthStore()
   const { 
      notificationTypes, 
      isLoading, 
      getNotificationTypes, 
      createNotificationType, 
      deleteNotificationType
   } = useNotificationStore()

   useEffect(() => {
      const loadData = async () => {
         const token = await getValidAccessToken()
         if (token) {
            await getNotificationTypes(token)
         }
      }
      loadData()
   }, [getValidAccessToken, getNotificationTypes])

   const handleCreateType = async (data: { name: string }) => {
      const token = await getValidAccessToken()
      if (token) {
         await createNotificationType(token, data.name)
         setIsCreateTypeOpen(false)
      }
   }

   const handleDeleteType = async () => {
      const token = await getValidAccessToken()
      if (token) {
         await deleteNotificationType(token, currentType.name)
         setIsDeleteTypeOpen(false)
      }
   }

   return (
      <>
         <section className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            {/* Header */}
            <div className="border-gray-100 border-b p-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="bg-purple-50 text-purple-600 rounded-lg p-2">
                        <BellIcon size={24} />
                     </div>
                     <div>
                        <h3 className="text-lg font-semibold text-gray-900">Tipos de Notificación</h3>
                        <p className="text-sm text-gray-500">Gestiona los tipos de notificaciones del sistema</p>
                     </div>
                  </div>
                  <button
                     onClick={() => {
                        setCurrentType({ name: "" })
                        setIsCreateTypeOpen(true)
                     }}
                     className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
                  >
                     <PlusIcon size={16} stroke={4} />
                     Nuevo Tipo
                  </button>
               </div>
            </div>

            {/* Content */}
            <div className="p-6">
               {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                     {[...Array(4)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                           <div className="bg-gray-200 rounded-lg h-16"></div>
                        </div>
                     ))}
                  </div>
               ) : notificationTypes.length === 0 ? (
                  <div className="text-center py-12">
                     <div className="bg-gray-50 text-gray-400 rounded-full w-fit mx-auto mb-4 p-3">
                        <BellIcon size={32} />
                     </div>
                     <h4 className="text-lg font-medium text-gray-900 mb-2">No hay tipos configurados</h4>
                     <p className="text-gray-500 mb-6">Crea tu primer tipo de notificación</p>
                     <button
                        onClick={() => {
                           setCurrentType({ name: "" })
                           setIsCreateTypeOpen(true)
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium mx-auto"
                     >
                        <PlusIcon size={16} />
                        Crear Primer Tipo
                     </button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                     {notificationTypes.map((type) => (
                        <div
                           key={type.name}
                           className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300"
                        >
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                 <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0" />
                                 <span className="font-medium text-sm text-purple-700 truncate">
                                    {type.name}
                                 </span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                 <button
                                    onClick={() => {
                                       setCurrentType({ ...type, id: type.id })
                                       setIsDeleteTypeOpen(true)
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                                    title="Eliminar tipo"
                                 >
                                    <DeleteIcon size={14} />
                                 </button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </section>

         {/* Modal para crear tipo */}
         <Modal isOpen={isCreateTypeOpen} onClose={() => setIsCreateTypeOpen(false)} title="">
            <CreateEditNotificationType onSubmit={handleCreateType} onCancel={() => setIsCreateTypeOpen(false)} />
         </Modal>

         {/* Modal para eliminar tipo */}
         <Modal isOpen={isDeleteTypeOpen} onClose={() => setIsDeleteTypeOpen(false)} title="">
            <DeleteNotificationType onSubmit={handleDeleteType} onCancel={() => setIsDeleteTypeOpen(false)} type={currentType} />
         </Modal>
      </>
   )
}
