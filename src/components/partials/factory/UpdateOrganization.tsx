import { ArrowRightIcon } from '@/assets/Icon'
import { useState } from 'react'

interface UpdateOrganizationProps {
    onClick: (newOrgName: string) => void
    organizationName: string
    onCancel: () => void
}

export default function UpdateOrganization({ organizationName, onCancel, onClick }: UpdateOrganizationProps) {
    const [newOrgName, setNewOrgName] = useState('')
    const handleSubmit = () => { if (newOrgName.trim()) onClick(newOrgName.trim()) }

    return (
        <div className="p-6">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <label htmlFor="orgName" className="text-gray-700 font-medium text-sm">Nuevo Nombre de la Organización</label>
                    <input className="focus:ring-purple-500 focus:border-purple-500 border-gray-300 border rounded-md p-2 focus:outline-none focus:ring-2 transition-all duration-200"
                        id="orgName" onChange={(e) => setNewOrgName(e.target.value)} value={newOrgName} placeholder="Ingresa el nuevo nombre" type="text" />
                </div>

                {newOrgName.trim() && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-xs font-medium text-green-800 mb-3">Vista Previa del Cambio</p>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 text-center">
                                <p className="text-sm text-gray-700 line-through font-medium">
                                    {organizationName}
                                </p>
                            </div>

                            <div className="text-green-600 flex-shrink-0">
                                <ArrowRightIcon size={20} stroke={2} />
                            </div>

                            <div className="flex-1 text-center">
                                <p className="text-sm text-green-700 font-semibold">
                                    {newOrgName}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-4">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200 text-sm font-medium" type="button"
                        onClick={() => onCancel()}>
                        Cancelar
                    </button>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium" type="button"
                        onClick={handleSubmit} disabled={!newOrgName.trim()}>
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    )
}