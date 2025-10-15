import { DeleteIcon } from "@/assets/Icon"

interface DeleteAllFormProps {
    onSubmit: (gonnaDelete: boolean) => void
    onCancel: () => void
    taskArray: string[]
}

export default function DeleteAllForm({ onSubmit, onCancel, taskArray }: DeleteAllFormProps) {
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
                    Eliminar Tareas
                </h3>
                <hgroup className="flex flex-col">
                    <h6 className="text-sm text-gray-600 leading-relaxed">
                        Estás a punto de eliminar <b className="text-red-600">{taskArray.length} tareas</b> de forma permanente.
                    </h6>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Esta acción <b>NO</b> se puede deshacer.
                    </p>
                </hgroup>
            </div>
            <div className="flex justify-center gap-2 mt-4">
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200 text-sm font-medium" type="button"
                    onClick={() => onCancel()}>
                    Cancelar
                </button>
                <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium" type="button" onClick={() => onSubmit(true)}>
                    Eliminar {taskArray.length} Tareas
                </button>
            </div>
        </div>
    )
}
