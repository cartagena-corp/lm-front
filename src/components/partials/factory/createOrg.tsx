import { PlusIcon, XIcon } from "@/assets/Icon";

interface FormProps {
    onSubmit: (data: string) => void
    onCancel: () => void
    orgObject?: { organizationId: string; organizationName: string; createdAt: string } | null
    isEdit?: boolean
}

export default function CreateOrg({ onSubmit, onCancel, orgObject, isEdit = false }: FormProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const input = (document.getElementById('orgName') as HTMLInputElement).value
        onSubmit(input)
    }

    return (
        <div className="bg-white border-gray-100 rounded-xl shadow-sm border">
            <div className="p-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="orgName" className="text-sm font-medium text-gray-700">Nombre de la Organización</label>
                        <input
                            type="text"
                            id="orgName"
                            name="orgName"
                            defaultValue={orgObject ? orgObject.organizationName : ''}
                            placeholder="Ingresa el nombre de la organización"
                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
                        >
                            {isEdit ? 'Guardar Cambios' : 'Crear Organización'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}