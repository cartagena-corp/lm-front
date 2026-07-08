"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, LogIn } from "lucide-react"
import { useAuthStore } from "@/lib/store/AuthStore"
import { Roboto_Condensed } from "next/font/google"

const roboto = Roboto_Condensed({ subsets: ["latin"] })

export default function NotFound() {
    const router = useRouter()
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)

    return (
        <div
            className="fixed inset-0 flex flex-col items-center justify-center text-center px-6 overflow-hidden"
            style={{ zIndex: 100, background: "var(--ds-background)", color: "var(--ds-text)" }}
        >
            {/* Geist dot-grid backdrop, echoes the login brand panel */}
            <div
                aria-hidden
                className="absolute inset-0"
                style={{
                    backgroundImage: "radial-gradient(var(--gray-alpha-300) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                    maskImage: "radial-gradient(60% 50% at 50% 42%, black, transparent)",
                    WebkitMaskImage: "radial-gradient(60% 50% at 50% 42%, black, transparent)",
                }}
            />

            <div className="relative flex flex-col items-center">
                {/* Brand mark */}
                <div className="flex items-center gap-3" style={{ marginBottom: 40 }}>
                    <img src="/favicon-dark.ico" alt="La Muralla" style={{ width: 48, height: 48, objectFit: "contain", display: "block" }} />
                    <span className={`${roboto.className} pt-0.5`} style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em" }}>LA MURALLA</span>
                </div>

                <div className="mono-label" style={{ color: "var(--blue-700)", marginBottom: 12 }}>
                    Error 404
                </div>

                <h1 className="heading-72" style={{ margin: 0 }}>404</h1>

                <h2 className="heading-24" style={{ margin: "12px 0 0" }}>Página no encontrada</h2>

                <p className="copy-16" style={{ color: "var(--ds-text-secondary)", maxWidth: 420, margin: "10px 0 32px" }}>
                    La página que buscas no existe, fue movida o no tienes acceso a ella.
                </p>

                {isAuthenticated ? (
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                        style={{ height: 40, padding: "0 16px", color: "var(--primary-contrast-fg)" }}
                    >
                        <ArrowLeft size={16} strokeWidth={1.75} />
                        Volver a donde estabas
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                            style={{ height: 40, padding: "0 16px", color: "var(--primary-contrast-fg)" }}
                        >
                            Ir al inicio
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-[var(--gray-alpha-100)]"
                            style={{ height: 40, padding: "0 16px", background: "var(--ds-background)", color: "var(--ds-text)", border: "1px solid var(--ds-border-strong)" }}
                        >
                            <LogIn size={16} strokeWidth={1.75} />
                            Iniciar sesión
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
