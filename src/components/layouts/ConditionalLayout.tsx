"use client"

import { useConfigInitialization } from "@/lib/shared/hooks/useConfigInitialization"
import { useSessionInitialization } from "@hooks/useSessionInitialization"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@stores/AuthStore"
import { ReactNode, useEffect } from "react"
import Sidebar from "./Sidebar"
import Modal from "./Modal"

const EXCLUDED_ROUTES = ["/login", "/login/callback"] as const

export default function ConditionalLayout({ children }: { children: ReactNode }) {
    const { isInitialized: isSessionInitialized } = useSessionInitialization()
    const { isInitialized: isConfigInitialized } = useConfigInitialization()
    const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore()

    const pathname = usePathname()
    const router = useRouter()

    const shouldExcludeLayout = EXCLUDED_ROUTES.some(route => pathname.startsWith(route))
    const isFullyInitialized = isSessionInitialized && isConfigInitialized

    useEffect(() => {
        const shouldRedirect = !isAuthLoading && !isAuthenticated && !shouldExcludeLayout && isFullyInitialized
        if (shouldRedirect) router.push('/login')
    }, [isAuthLoading, isAuthenticated, shouldExcludeLayout, isFullyInitialized, router])

    if (shouldExcludeLayout) return <>{children}</>
    if (isAuthLoading || !isFullyInitialized) return <div className="h-screen w-full flex items-center justify-center">Cargando...</div>
    if (!isAuthenticated) return null

    return (
        <main className="bg-background min-h-screen flex">
            <Sidebar />
            <aside className="flex-1 flex flex-col p-6">
                {children}
            </aside>
            <Modal />
        </main>
    )
}