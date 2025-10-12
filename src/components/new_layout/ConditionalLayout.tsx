"use client"

import { usePathname } from "next/navigation"
import { ReactNode } from "react"
import Sidebar from "./Sidebar"
import Modal from "./Modal"

const EXCLUDED_ROUTES = ["/login", "/login/callback"] as const

export default function ConditionalLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const shouldExcludeLayout = EXCLUDED_ROUTES.some(route => pathname.startsWith(route))

    // Si estamos en una ruta excluida, solo mostrar el contenido
    if (shouldExcludeLayout) {
        return <>{children}</>
    }

    // En cualquier otra ruta, mostrar el layout completo con sidebar
    return (
        <main className="bg-background min-h-screen flex">
            <Sidebar />
            <aside className="flex-1 p-6">
                {children}
            </aside>
            <Modal />
        </main>
    )
}