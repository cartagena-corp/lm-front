import { ArrowRight } from 'lucide-react'
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
                    <label htmlFor="orgName" className="text-sm font-medium" style={{ color: "var(--ds-text)" }}>Nuevo Nombre de la Organización</label>
                    <input className="h-9 px-3 rounded-md text-sm outline-none transition-shadow duration-150 shadow-[var(--shadow-border)] focus:shadow-[0_0_0_1px_var(--blue-700)] placeholder:text-[var(--ds-text-muted)]"
                        style={{ background: "var(--ds-card)", color: "var(--ds-text)" }}
                        id="orgName" onChange={(e) => setNewOrgName(e.target.value)} value={newOrgName} placeholder="Ingresa el nuevo nombre" type="text" />
                </div>

                {newOrgName.trim() && (
                    <div className="p-4" style={{ background: "var(--blue-100)", border: "1px solid var(--blue-400)", borderRadius: "var(--radius-md)" }}>
                        <p className="text-xs font-medium mb-3" style={{ color: "var(--blue-900)" }}>Vista Previa del Cambio</p>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 text-center">
                                <p className="text-sm line-through font-medium" style={{ color: "var(--ds-text-muted)" }}>
                                    {organizationName}
                                </p>
                            </div>

                            <div className="flex-shrink-0" style={{ color: "var(--blue-900)" }}>
                                <ArrowRight size={20} strokeWidth={2} />
                            </div>

                            <div className="flex-1 text-center">
                                <p className="text-sm font-medium" style={{ color: "var(--blue-900)" }}>
                                    {newOrgName}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-4">
                    <button className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2" type="button"
                        style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                        onClick={() => onCancel()}>
                        Cancelar
                    </button>
                    <button className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2" type="button"
                        style={{ color: "var(--primary-contrast-fg)" }}
                        onClick={handleSubmit} disabled={!newOrgName.trim()}>
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    )
}
