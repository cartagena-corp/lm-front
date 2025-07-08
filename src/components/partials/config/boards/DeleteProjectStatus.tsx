import { AlertCircleIcon } from "@/assets/Icon"

interface FilterFormProps {
   onSubmit: () => void
   onCancel: () => void
   status: { id?: string, name: string, color: string }
}

export default function DeleteProjectStatus({ onSubmit, onCancel, status }: FilterFormProps) {
   return (
      <div className="space-y-6">
         {/* Warning Icon and Message */}
         <div className="text-center">
            <div className="bg-red-100 text-red-600 mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-4">
               <AlertCircleIcon size={24} stroke={2} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
               ¿Eliminar estado de proyecto?
            </h3>
            <div className="text-gray-500 text-sm space-y-2">
               <p>
                  Estás a punto de eliminar permanentemente el estado:
               </p>
               <div
                  className="inline-flex items-center rounded-full text-sm font-medium gap-2 px-3 py-1.5"
                  style={{
                     backgroundColor: `${status.color}15`,
                     color: status.color,
                     border: `1px solid ${status.color}30`
                  }}
               >
                  <div
                     className="w-2 h-2 rounded-full"
                     style={{ backgroundColor: status.color }}
                  />
                  {status.name}
               </div>
               <p className="text-xs text-gray-400 ">
                  Esta acción no se puede deshacer.
               </p>
            </div>
         </div>

         {/* Actions */}
         <div className="flex gap-3">
            <button
               type="button"
               onClick={onCancel}
               className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
            >
               Cancelar
            </button>
            <button
               type="button"
               onClick={onSubmit}
               className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
            >
               Eliminar Estado
            </button>
         </div>
      </div>
   )
}