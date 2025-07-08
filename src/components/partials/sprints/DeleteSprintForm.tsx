import { SprintProps } from "@/lib/types/types"
import { useState } from "react"

interface DeleteSprintFormProps {
   onSubmit: (sprint: SprintProps) => void
   onCancel: () => void
   sprintObject: SprintProps
}

export default function DeleteSprintForm({ onSubmit, onCancel, sprintObject }: DeleteSprintFormProps) {
   const [isLoading, setIsLoading] = useState(false)

   const handleSubmit = async () => {
      setIsLoading(true)
      try {
         await onSubmit(sprintObject)
      } catch (error) {
         console.error('Error al eliminar sprint:', error)
      } finally {
         setIsLoading(false)
      }
   }

   return (
      <div className="max-w-md mx-auto">
         {/* Icono de advertencia */}
         <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
         </div>

         {/* Contenido */}
         <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
               ¿Eliminar Sprint?
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
               <p>
                  Estás a punto de eliminar el sprint{' '}
                  <span className="font-semibold text-red-600">"{sprintObject?.title}"</span>.
               </p>
               <p>
                  Las tareas de este sprint se moverán automáticamente al Backlog.
               </p>
               <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                  <div className="flex items-start gap-2">
                     <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                     </svg>
                     <p className="text-amber-800 text-xs">
                        Esta acción no se puede deshacer. El historial del sprint se perderá permanentemente.
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* Botones de acción */}
         <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
               type="button"
               onClick={onCancel}
               disabled={isLoading}
               className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
               Cancelar
            </button>
            <button
               type="button"
               onClick={handleSubmit}
               disabled={isLoading}
               className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
               {isLoading ? (
                  <>
                     <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Eliminando...
                  </>
               ) : (
                  'Eliminar Sprint'
               )}
            </button>
         </div>
      </div>
   )
}