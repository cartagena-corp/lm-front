"use client"

import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@stores/AuthStore"
import { ReactNode, useEffect } from "react"
import Sidebar from "./Sidebar"

const excludedRoutes = ["/login", "/login/callback"]

export default function ConditionalLayout({ children }: { children: ReactNode }) {
    const { getProfileByToken, isAuthenticated, isLoading } = useAuthStore()
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            const accessToken = getCookie('accessToken')

            if (accessToken) getProfileByToken({ token: accessToken })
        }
    }, [getProfileByToken, isAuthenticated, isLoading])

    const shouldExcludeLayout = excludedRoutes.some((route) => pathname.startsWith(route))

    useEffect(() => {
        if (!isLoading && !isAuthenticated && !shouldExcludeLayout) router.push('/login')
    }, [isLoading, isAuthenticated, shouldExcludeLayout, router])

    if (shouldExcludeLayout) return <>{children}</>
    if (isLoading) return <div className="h-screen w-full flex items-center justify-center">Cargando...</div>
    if (isAuthenticated) return (
        <main className="bg-background min-h-screen flex">
            <Sidebar />
            <aside className="flex-1 flex flex-col p-6">
                {children}
            </aside>
        </main>
    )

    // return <div className="h-screen bg-black text-white">Esto aparece porque no hay nada</div>
    return null
}

const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}