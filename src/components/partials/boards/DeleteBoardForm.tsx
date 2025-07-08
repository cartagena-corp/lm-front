import { ProjectProps } from "@/lib/types/types"

interface DeleteBoardFormProps {
   onSubmit: (gonnaDelete: boolean) => void
   onCancel: () => void
   projectObject: ProjectProps
}

export default function DeleteBoardForm({ onSubmit, onCancel, projectObject }: DeleteBoardFormProps) {
   return (
      <div className="space-y-6">
         {/* Icono de advertencia */}
         <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
         </div>

         {/* Contenido del mensaje */}
         <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
               ¿Eliminar tablero?
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed">
               <p>
                  Estás a punto de eliminar el tablero{' '}
                  <span className="font-semibold text-red-600">"{projectObject.name}"</span>.
               </p>
               <p className="mt-2">
                  Esta acción no se puede deshacer y se perderán todos los datos asociados.
               </p>
            </div>
         </div>

         {/* Información del tablero */}
         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
               <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
               <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-red-900 text-sm">
                     {projectObject.name}
                  </h4>
                  <p className="text-red-700 text-xs mt-1 line-clamp-2">
                     {projectObject.description}
                  </p>
               </div>
            </div>
         </div>

         {/* Botones */}
         <div className="flex items-center gap-3 pt-2">
            <button
               type="button"
               onClick={onCancel}
               className="bg-white hover:bg-gray-50 hover:border-gray-300 border-gray-200 border flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
               Cancelar
            </button>
            <button
               type="button"
               onClick={() => onSubmit(true)}
               className="bg-red-600 hover:bg-red-700 text-white border-transparent border hover:shadow-md flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
               Eliminar tablero
            </button>
         </div>
      </div>
   )
}