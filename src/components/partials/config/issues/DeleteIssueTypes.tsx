interface FilterFormProps {
   onSubmit: () => void
   onCancel: () => void
   typesName: string
}

export default function DeleteIssueTypes({ onSubmit, onCancel, typesName }: FilterFormProps) {
   return (
      <div className="space-y-6 p-6">
         <hgroup className="flex flex-col text-center gap-3">
            <p>Está a punto de eliminar el tipo <b className="text-red-500">"{typesName}"</b>, lo que implica que las tareas relacionadas quedarán sin tipo asignado.</p>
            <b>Esta acción NO se puede deshacer.</b>
         </hgroup>

         {/* Información de la prioridad */}
         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
               <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
               <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-red-900 text-sm">
                     Tipo de Tarea: {typesName}
                  </h4>
                  <p className="text-red-700 text-xs mt-1">
                     Las tareas que usen este tipo quedarán sin tipo asignado
                  </p>
               </div>
            </div>
         </div>
         <div className="flex justify-end gap-3 mt-4">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200 text-sm font-medium" type="button"
               onClick={() => onCancel()}>
               Cancelar
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium" type="button" onClick={onSubmit}>
               Eliminar Tipo
            </button>
         </div>
      </div>
   )
}