export default function ConfigOrg({ id }: { id: string }) {
    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4" style={{ letterSpacing: "-0.02em", color: "var(--ds-text)" }}>Configuración de la Organización</h2>
            {/* TODO: Organization configuration form will be here */}
            <p className="text-sm" style={{ color: "var(--ds-text-secondary)" }}>Organization configuration will be displayed here.</p>
        </div>
    )
}
