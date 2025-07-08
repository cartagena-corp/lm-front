import { DeleteIcon } from "@/assets/Icon"

interface DeleteReplyFormProps {
   onSubmit: (responseId: string) => void
   onCancel: () => void
   responseId: string
}

export default function DeleteReplyForm({ onSubmit, onCancel, responseId }: DeleteReplyFormProps) {
   return (
      <div className="p-6">
         {/* Header con icono */}
         <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
               <DeleteIcon size={32} />
            </div>
         </div>

         {/* Título y descripción */}
         <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
               Eliminar respuesta
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
               Estás a punto de eliminar esta respuesta de forma permanente. 
               Esta acción no se puede deshacer.
            </p>
         </div>

         {/* Botones de acción */}
         <div className="flex gap-3">
            <button
               type="button"
               onClick={onCancel}
               className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            >
               Cancelar
            </button>
            <button
               type="button"
               onClick={() => onSubmit(responseId)}
               className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
            >
               Eliminar
            </button>
         </div>
      </div>
   )
}