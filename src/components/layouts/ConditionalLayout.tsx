"use client"

import { useSessionInitialization } from "@hooks/useSessionInitialization"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@stores/AuthStore"
import { ReactNode, useEffect } from "react"
import Sidebar from "./Sidebar"

const EXCLUDED_ROUTES = ["/login", "/login/callback"] as const

export default function ConditionalLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuthStore()
    const { isInitialized } = useSessionInitialization()

    const pathname = usePathname()
    const router = useRouter()

    const shouldExcludeLayout = EXCLUDED_ROUTES.some(route => pathname.startsWith(route))

    useEffect(() => {
        const shouldRedirect = !isLoading && !isAuthenticated && !shouldExcludeLayout && isInitialized
        if (shouldRedirect) router.push('/login')
    }, [isLoading, isAuthenticated, shouldExcludeLayout, isInitialized, router])


    if (shouldExcludeLayout) return <>{children}</>
    if (isLoading || !isInitialized) return <div className="h-screen w-full flex items-center justify-center">Cargando...</div>
    if (!isAuthenticated) return null

    return (
        <main className="bg-background min-h-screen flex">
            <Sidebar />
            <aside className="flex-1 flex flex-col p-6">
                {children}
            </aside>
        </main>
    )
}