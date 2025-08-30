"use client"
import { DeleteIcon } from '@/assets/Icon'

interface RoleProps {
    name: string
    permissions: Array<{ name: string }>
}

interface DeleteRoleFormProps {
    role: RoleProps
    onSubmit: () => void
    onCancel: () => void
}

export default function DeleteRoleForm({ role, onSubmit, onCancel }: DeleteRoleFormProps) {
    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg w-fit mx-auto">
                    <DeleteIcon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                    Eliminar Rol
                </h3>
                <p className="text-sm text-gray-500">
                    Esta acción no se puede deshacer
                </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Rol a eliminar:</h4>
                <div className="text-sm text-gray-600">
                    <p><strong>Nombre:</strong> {role.name}</p>
                    <p><strong>Permisos:</strong> {role.permissions.length} asignados</p>
                </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">
                    ⚠️ Al eliminar este rol, todos los usuarios que lo tengan asignado perderán estos permisos.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-white hover:bg-gray-50 hover:border-gray-300 border-gray-200 border flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={onSubmit}
                    className="bg-red-600 hover:bg-red-700 text-white border-transparent border hover:shadow-md flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    Eliminar Rol
                </button>
            </div>
        </div>
    )
}
