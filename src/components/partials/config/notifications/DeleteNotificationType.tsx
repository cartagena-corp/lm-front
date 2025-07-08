"use client"

import { DeleteIcon } from "@/assets/Icon"

interface DeleteNotificationTypeProps {
   onSubmit: () => void
   onCancel: () => void
   type: { id?: string, name: string }
}

export default function DeleteNotificationType({ onSubmit, onCancel, type }: DeleteNotificationTypeProps) {
   return (
      <div className="p-6 max-w-md mx-auto">
         <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-50 rounded-full text-red-600">
               <DeleteIcon size={24} />
            </div>
            <div>
               <h3 className="text-lg font-semibold text-gray-900">Eliminar Tipo de Notificación</h3>
               <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
            </div>
         </div>

         <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
               ¿Estás seguro de que deseas eliminar el tipo de notificación{" "}
               <span className="font-semibold text-gray-900">"{type.name}"</span>?
            </p>
            <p className="text-xs text-gray-500 mt-2">
               Esta acción eliminará permanentemente este tipo de notificación.
            </p>
         </div>

         <div className="flex gap-3">
            <button
               onClick={onCancel}
               className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium"
            >
               Cancelar
            </button>
            <button
               onClick={onSubmit}
               className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center gap-2"
            >
               <DeleteIcon size={16} />
               Eliminar
            </button>
         </div>
      </div>
   )
}
