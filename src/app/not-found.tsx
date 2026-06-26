import Link from "next/link"

export default function NotFound() {
    return (
        <div
            className="flex flex-col items-center justify-center text-center px-6"
            style={{ minHeight: "70vh", color: "var(--ds-text)" }}
        >
            <div
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    letterSpacing: "0.08em",
                    color: "var(--blue-700)",
                    textTransform: "uppercase",
                    marginBottom: 12,
                }}
            >
                Error 404
            </div>

            <h1 className="font-semibold" style={{ fontSize: 88, lineHeight: "88px", letterSpacing: "-3.5px", margin: 0 }}>
                404
            </h1>

            <h2 className="font-semibold" style={{ fontSize: 22, letterSpacing: "-0.6px", margin: "12px 0 0" }}>
                Página no encontrada
            </h2>

            <p style={{ fontSize: 15, lineHeight: "24px", color: "var(--ds-text-secondary)", maxWidth: 420, margin: "10px 0 28px" }}>
                La página que buscas no existe o fue movida. Revisa la dirección o vuelve al inicio.
            </p>

            <div className="flex items-center gap-2">
                <Link
                    href="/tableros"
                    className="inline-flex items-center gap-2 font-medium transition-opacity hover:opacity-90"
                    style={{ height: 40, padding: "0 16px", borderRadius: "var(--radius-md)", background: "var(--ds-text)", color: "var(--ds-contrast-inverse)", fontSize: 14, border: "1px solid var(--ds-text)" }}
                >
                    <svg width="16" height="16" style={{ display: "block" }}><use href="#geist-arrow-left" /></svg>
                    Volver al inicio
                </Link>
                <Link
                    href="/login"
                    className="inline-flex items-center font-medium transition-colors hover:bg-[var(--gray-alpha-100)]"
                    style={{ height: 40, padding: "0 16px", borderRadius: "var(--radius-md)", background: "var(--ds-background)", color: "var(--ds-text)", fontSize: 14, border: "1px solid var(--ds-border-strong)" }}
                >
                    Iniciar sesión
                </Link>
            </div>
        </div>
    )
}
