import { Trash2 } from "lucide-react"

interface FilterFormProps {
   onSubmit: () => void
   onCancel: () => void
   status: { id?: string, name: string, color: string }
}

export default function DeleteSprintStatus({ onSubmit, onCancel, status }: FilterFormProps) {
   return (
      <div className="p-6">
         {/* Header con icono */}
         <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-[var(--red-100)] text-[var(--red-900)] rounded-full flex items-center justify-center">
               <Trash2 size={32} strokeWidth={1.5} />
            </div>
         </div>

         {/* Título y descripción */}
         <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-[var(--ds-text)] mb-2">
               Eliminar Estado
            </h3>
            <hgroup className="flex flex-col">
               <h6 className="text-sm text-[var(--ds-text-secondary)] leading-relaxed">
                  Estás a punto de eliminar el estado <b className="text-[var(--red-700)]">{status.name}</b> de forma permanente.
               </h6>
               <p className="text-sm text-[var(--ds-text-secondary)] leading-relaxed">
                  Esta acción <b>NO</b> se puede deshacer.
               </p>
            </hgroup>
         </div>
         <div className="flex justify-center gap-2 mt-4">
            <button className="w-full px-4 py-2 bg-[var(--ds-card)] text-[var(--ds-text)] rounded-md hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2 transition-all duration-200 text-sm font-medium" type="button"
               onClick={() => onCancel()}>
               Cancelar
            </button>
            <button className="w-full px-4 py-2 bg-[var(--red-700)] text-[var(--ds-contrast-inverse)] rounded-md hover:bg-[var(--red-800)] focus-visible:outline-2 focus-visible:outline-[var(--red-700)] focus-visible:outline-offset-2 transition-all duration-200 text-sm font-medium" type="button" onClick={() => onSubmit()}>
               Eliminar
            </button>
         </div>
      </div>
   )
}