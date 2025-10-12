"use client"

import { usePathname } from "next/navigation"
import { ReactNode } from "react"
import Sidebar from "./Sidebar"
import Modal from "./Modal"
import { useSidebarStore } from "@/lib/store/SidebarStore"

const EXCLUDED_ROUTES = ["/login", "/login/callback"] as const

export default function ConditionalLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const shouldExcludeLayout = EXCLUDED_ROUTES.some(route => pathname.startsWith(route))
    const { isCollapsed } = useSidebarStore()
    
    // Calcular el ancho del sidebar: 64px colapsado, 256px expandido
    const sidebarWidth = isCollapsed ? 64 : 256

    if (shouldExcludeLayout) {
        return <>{children}</>
    }

    return (
        <main className="bg-background min-h-screen flex h-screen w-screen overflow-hidden">
            <Sidebar />
            <aside className="flex-1 p-6 overflow-auto h-screen min-w-0">
                {children}
            </aside>
            <Modal />
        </main>
    )
}