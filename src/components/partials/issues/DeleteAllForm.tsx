import { Trash2 } from "lucide-react"

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
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "var(--red-100)", color: "var(--red-900)" }}>
                    <Trash2 size={32} strokeWidth={1.5} />
                </div>
            </div>

            {/* Título y descripción */}
            <div className="text-center mb-8">
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--ds-text)", letterSpacing: "-0.01em" }}>
                    Eliminar Tareas
                </h3>
                <hgroup className="flex flex-col">
                    <h6 className="text-sm leading-relaxed" style={{ color: "var(--ds-text-secondary)" }}>
                        Estás a punto de eliminar <b style={{ color: "var(--red-700)" }}>{taskArray.length} tareas</b> de forma permanente.
                    </h6>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--ds-text-secondary)" }}>
                        Esta acción <b>NO</b> se puede deshacer.
                    </p>
                </hgroup>
            </div>
            <div className="flex justify-center gap-2 mt-4">
                <button className="w-full h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--ds-card)] hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2" type="button"
                    style={{ color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                    onClick={() => onCancel()}>
                    Cancelar
                </button>
                <button className="w-full h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--red-700)] hover:bg-[var(--red-800)] focus-visible:outline-2 focus-visible:outline-[var(--red-700)] focus-visible:outline-offset-2" type="button" style={{ color: "var(--ds-contrast-inverse)" }} onClick={() => onSubmit(true)}>
                    Eliminar {taskArray.length} Tareas
                </button>
            </div>
        </div>
    )
}
