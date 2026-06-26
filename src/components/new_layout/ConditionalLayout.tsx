"use client"

import { usePathname } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"
import { useAuthStore } from "@/lib/store/AuthStore"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import Modal from "./Modal"

const EXCLUDED_ROUTES = ["/login", "/login/callback", "/dev/get/criptograma"] as const

export default function ConditionalLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])

    const shouldExcludeLayout = EXCLUDED_ROUTES.some(route => pathname.startsWith(route))

    // El shell (sidebar + topbar) solo se ve con sesión. Antes de montar asumimos
    // que se muestra (igual que el SSR) para no parpadear en usuarios autenticados;
    // tras montar lo ocultamos si no hay sesión (p. ej. un 404 sin login).
    const showShell = !shouldExcludeLayout && (!mounted || isAuthenticated)
    if (!showShell) return <>{children}</>
    return (
        <main className="min-h-screen flex h-screen w-screen overflow-hidden" style={{ background: "var(--ds-background)", color: "var(--ds-text)" }}>
            <Sidebar />
            <div className="flex-1 min-w-0 flex flex-col h-screen">
                <Topbar />
                <section className="flex-1 min-w-0 overflow-auto px-8 pt-7 pb-16">
                    {children}
                </section>
            </div>
            <Modal />
        </main>
    )
}