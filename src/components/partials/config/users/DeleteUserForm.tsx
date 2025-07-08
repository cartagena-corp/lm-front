import { AlertCircleIcon, XIcon } from "@/assets/Icon"
import { UserProps } from "@/lib/types/types"
import { getUserRoleName } from "@/lib/utils/user.utils"
import { getUserAvatar } from "@/lib/utils/avatar.utils"

interface DeleteUserFormProps {
   onSubmit: () => void
   onCancel: () => void
   user: UserProps | null
}

export default function DeleteUserForm({ onSubmit, onCancel, user }: DeleteUserFormProps) {
   if (!user) return null

   return (
      <div className="bg-white rounded-lg max-w-md mx-auto">
         <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <AlertCircleIcon size={20} />
               </div>
               <h2 className="text-xl font-semibold text-gray-900">Desactivar Usuario</h2>
            </div>
         </div>

         <div className="p-6">
            <div className="mb-6">
               <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img 
                     src={user ? getUserAvatar(user, 48) : getUserAvatar({ email: 'Usuario' }, 48)} 
                     alt={`${user?.firstName} ${user?.lastName}`}
                     className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                     <h3 className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                     </h3>
                     <p className="text-sm text-gray-500">{user.email}</p>
                     <p className="text-xs text-gray-400">
                        Rol: {user ? getUserRoleName(user) : 'Sin rol'}
                     </p>
                  </div>
               </div>
            </div>

            <div className="mb-6">
               <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-red-800 font-medium mb-2">⚠️ Acción irreversible</h4>
                  <p className="text-red-700 text-sm">
                     Esta acción no se puede deshacer. El usuario será desactivado permanentemente 
                     del sistema y perderá acceso a todos los proyectos y tareas asignadas.
                  </p>
               </div>
            </div>

            <div className="flex justify-end gap-3">
               <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
               >
                  Cancelar
               </button>
               <button
                  type="button"
                  onClick={onSubmit}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
               >
                  Desactivar Usuario
               </button>
            </div>
         </div>
      </div>
   )
}
