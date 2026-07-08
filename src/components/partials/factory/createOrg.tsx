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
        <div>
            <div className="p-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="orgName" className="text-sm font-medium" style={{ color: "var(--ds-text)" }}>Nombre de la Organización</label>
                        <input
                            type="text"
                            id="orgName"
                            name="orgName"
                            defaultValue={orgObject ? orgObject.organizationName : ''}
                            placeholder="Ingresa el nombre de la organización"
                            className="h-9 px-3 rounded-md text-sm outline-none transition-shadow duration-150 shadow-[var(--shadow-border)] focus:shadow-[0_0_0_1px_var(--blue-700)] placeholder:text-[var(--ds-text-muted)]"
                            style={{ background: "var(--ds-card)", color: "var(--ds-text)" }}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                            style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                            style={{ color: "var(--primary-contrast-fg)" }}
                        >
                            {isEdit ? 'Guardar Cambios' : 'Crear Organización'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
