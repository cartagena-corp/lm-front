"use client"

import { LayoutDashboard, Settings, Bot, Sparkles, LogOut, PanelLeftOpen, PanelLeftClose, Factory, X, type LucideIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useSidebarStore } from "@/lib/store/SidebarStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import SidebarTooltip from "./SidebarTooltip"
import { useState, MouseEvent, useEffect } from "react"
import { AnimatePresence, motion } from "motion/react"
import { getUserAvatar } from "@/lib/utils/avatar.utils"
import { hasPermission } from "@/lib/utils/user.utils"
import { Roboto_Condensed } from 'next/font/google'
import Link from "next/link"

const roboto = Roboto_Condensed({ subsets: ['latin'] })

interface SidebarLinkProps {
    title: string
    href: string
    Icon: LucideIcon
    isActive: boolean
    isAvailable: boolean
}

export default function Sidebar() {
    const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebarStore()
    const { user, logout } = useAuthStore()
    // El sidebar es siempre fondo oscuro (#101828), así que usa el castillo
    // blanco (variante para fondo oscuro) sin importar el tema de la app.
    const logoSrc = "/favicon-light.ico"

    const [hovered, setHovered] = useState<{ key: string, position: { top: number, left: number } } | null>(null)
    const [sidebarAnimationDone, setSidebarAnimationDone] = useState(false)
    const [isSidebarHovered, setIsSidebarHovered] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const sidebarWidth = isCollapsed ? 64 : 256

    const pathname = usePathname()
    const router = useRouter()

    // Verificar permisos usando la función utilitaria
    const hasGeminiChatAccess = hasPermission(user, 'GEMINI_ACTIVE')
    const hasGeminiConfigAccess = hasPermission(user, 'GEMINI_CONFIG')
    const hasOrganizationControl = hasPermission(user, 'ORGANIZATION_CONTROL')

    // Asegurar que el componente está montado en el cliente
    useEffect(() => {
        setIsMounted(true)
        setSidebarAnimationDone(isCollapsed)
    }, [])

    // Actualizar sidebarAnimationDone cuando cambie isCollapsed
    useEffect(() => {
        if (isMounted) {
            setSidebarAnimationDone(isCollapsed)
        }
    }, [isCollapsed, isMounted])

    // Resetear el estado de error cuando cambie el usuario
    useEffect(() => {
        setImageError(false)
    }, [user?.picture])

    // Cerrar el drawer móvil al navegar a otra ruta
    useEffect(() => {
        closeMobileSidebar()
    }, [pathname])

    // Evitar hidratación si no está montado
    if (!isMounted) {
        return null
    }

    const sidebarLinks: SidebarLinkProps[] = [
        { title: "Tableros", href: "/tableros", Icon: LayoutDashboard, isActive: pathname === "/tableros", isAvailable: true },
        { title: "Organizaciones", href: "/factory", Icon: Factory, isActive: pathname.startsWith("/factory"), isAvailable: hasOrganizationControl },
        { title: "Analista de Pólizas", href: "/gemini/chat", Icon: Bot, isActive: pathname === "/gemini/chat", isAvailable: hasGeminiChatAccess },
        { title: "Configuración", href: "/config", Icon: Settings, isActive: pathname === "/config", isAvailable: true },
        { title: "Configurar Gemini", href: "/gemini", Icon: Sparkles, isActive: pathname === "/gemini", isAvailable: hasGeminiConfigAccess },
    ]

    const handleMouseLeave = () => setHovered(null)
    const handleMouseEnter = (e: MouseEvent, key: string) => {
        if (!isCollapsed) return
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        setHovered({ key, position: { top: rect.top + rect.height / 2, left: rect.right + 8 } })
    }

    const handleLogoutClick = async () => {
        try {
            await logout()
            router.push('/login')
        } catch (error) {
            console.error('Error durante el logout:', error)
            router.push('/login')
        }
    }

    return (
        <>
            {/* Desktop rail — collapsible, sticky in the layout flow */}
            <motion.aside className="hidden md:flex overflow-hidden flex-col h-screen sticky group left-0 top-0 z-10"
                style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)", color: "var(--sidebar-text)" }}
                onMouseLeave={() => setIsSidebarHovered(false)} onMouseEnter={() => setIsSidebarHovered(true)} onAnimationComplete={() => setSidebarAnimationDone(isCollapsed)}
                transition={{ duration: 0.5, ease: "easeInOut" }} animate={{ width: sidebarWidth }} initial={{ width: 0 }}>
                <Link href="/tableros" className="flex justify-center items-center px-4 h-14 flex-shrink-0" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
                    <img src={logoSrc} alt="La Muralla" className="flex-shrink-0" style={{ width: 36, height: 36, objectFit: "contain", display: "block" }} />
                    <motion.span className={`${roboto.className} font-bold whitespace-nowrap overflow-hidden text-xl pt-0.5`} transition={{ duration: 0.5, ease: "easeInOut" }} initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                        animate={{ marginLeft: isCollapsed ? 0 : 10, opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 120 }}>
                        LA MURALLA
                    </motion.span>
                </Link>

                <header className="flex flex-col justify-between items-center h-full">
                    <nav className="flex flex-col gap-[2px] w-full px-2 py-[10px]">
                        {sidebarLinks.map(item =>
                            item.isAvailable && (
                                <Link key={item.title} href={item.href}
                                    onMouseEnter={e => handleMouseEnter(e, item.title)} onMouseLeave={handleMouseLeave}
                                    title={item.title}
                                    className={`transition-colors duration-150 rounded-md flex items-center h-9 px-[10px] text-sm font-medium overflow-hidden whitespace-nowrap
                                    ${isCollapsed ? "justify-center" : ""}
                                    ${item.isActive ? "" : "hover:bg-[var(--sidebar-bg-hover)]"}`}
                                    style={item.isActive
                                        ? { background: "var(--sidebar-bg-active)", color: "var(--sidebar-text)" }
                                        : { color: "var(--sidebar-text-secondary)" }}>
                                    <span className="flex-shrink-0 flex items-center"><item.Icon size={18} strokeWidth={1.75} /></span>
                                    <motion.span className="whitespace-nowrap overflow-hidden" initial={{ opacity: 0, width: 0, marginLeft: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}
                                        animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 130, marginLeft: isCollapsed ? 0 : 10 }}>{item.title}</motion.span>
                                    {(isCollapsed && hovered?.key === item.title) && <SidebarTooltip text={item.title} position={hovered.position} show={sidebarAnimationDone} />}
                                </Link>
                            )
                        )}
                    </nav>

                    <nav className="flex flex-col w-full gap-[2px] px-2 py-[10px]">
                        <button className={`transition-colors duration-150 rounded-md flex items-center h-9 px-[10px] text-sm font-medium overflow-hidden whitespace-nowrap cursor-pointer w-full hover:bg-[var(--sidebar-bg-hover)] ${isCollapsed ? "justify-center" : ""}`}
                            style={{ color: "var(--sidebar-text-secondary)" }}
                            onClick={toggleSidebar} title={isCollapsed ? "Abrir sidebar" : "Cerrar sidebar"}
                            onMouseEnter={e => handleMouseEnter(e, "Expandir Sidebar")} onMouseLeave={handleMouseLeave}>
                            <span className="flex-shrink-0 flex items-center">{isCollapsed ? <PanelLeftOpen size={18} strokeWidth={1.75} /> : <PanelLeftClose size={18} strokeWidth={1.75} />}</span>
                            <motion.span className="whitespace-nowrap overflow-hidden text-start" transition={{ duration: 0.5, ease: "easeInOut" }} initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                                animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 130, marginLeft: isCollapsed ? 0 : 10 }}>Contraer</motion.span>
                            {(isCollapsed && hovered?.key === "Expandir Sidebar") && <SidebarTooltip text="Expandir Sidebar" position={hovered.position} show={sidebarAnimationDone} />}
                        </button>
                    </nav>
                </header>

                <footer className={`flex items-center px-3 w-full h-[60px] flex-shrink-0 ${isCollapsed ? "justify-center gap-0" : "gap-[10px]"}`} style={{ borderTop: "1px solid var(--sidebar-border)" }}>
                    <picture className="overflow-hidden rounded-full relative w-[30px] h-[30px] flex-shrink-0" style={{ background: "var(--sidebar-avatar-bg)", boxShadow: "inset 0 0 0 1px var(--sidebar-border)" }}>
                        <motion.div className="absolute inset-0 w-full h-full flex justify-center items-center"
                            transition={{ duration: 0.3, ease: "easeInOut" }} animate={{ opacity: isSidebarHovered ? 0 : 1 }} initial={false}>
                            {user && (
                                user.picture && !imageError ? (
                                    <img className="w-full h-full object-cover rounded-full" src={user.picture} alt="User Avatar" onError={() => setImageError(true)} />
                                ) : (
                                    <img className="w-full h-full object-cover rounded-full" src={getUserAvatar(user, 40)} alt="User Avatar" />
                                )
                            )}
                        </motion.div>
                        <motion.button className="bg-[var(--sidebar-danger-bg)] text-[var(--sidebar-danger-text)] cursor-pointer justify-center items-center w-full h-full rounded-full object-cover absolute inset-0 flex"
                            onMouseEnter={e => handleMouseEnter(e, "Cerrar sesión")} onMouseLeave={handleMouseLeave} onClick={handleLogoutClick} style={{ pointerEvents: isSidebarHovered ? "auto" : "none" }}
                            transition={{ duration: 0.3, ease: "easeInOut" }} animate={{ opacity: isSidebarHovered ? 1 : 0 }} initial={false} title="Cerrar sesión">
                            <LogOut size={18} strokeWidth={2} />
                            {(isCollapsed && hovered?.key === "Cerrar sesión") && <SidebarTooltip text="Cerrar sesión" position={hovered.position} show={sidebarAnimationDone} />}
                        </motion.button>
                    </picture>
                    <motion.section initial={{ opacity: 0, width: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="min-w-0 overflow-hidden" animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 170 }}>
                        <h5 className="max-w-[170px] truncate text-[13px] font-medium" style={{ color: "var(--sidebar-text)" }} title={user?.firstName + " " + user?.lastName}>{user?.firstName} {user?.lastName}</h5>
                        <p className="text-xs truncate" style={{ color: "var(--sidebar-text-muted)" }} title={user?.email}>{user?.email}</p>
                    </motion.section>
                </footer>
            </motion.aside>

            {/* Mobile drawer — full-label slide-over, triggered by Topbar's hamburger */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div className="md:hidden fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.4)" }}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                            onClick={closeMobileSidebar} />
                        <motion.aside className="md:hidden fixed top-0 left-0 h-screen w-[260px] max-w-[80vw] z-50 flex flex-col"
                            style={{ background: "var(--sidebar-bg)", color: "var(--sidebar-text)" }}
                            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.25, ease: "easeOut" }}>
                            <div className="flex items-center justify-between px-4 h-14 flex-shrink-0" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
                                <Link href="/tableros" className="flex items-center gap-[10px]" onClick={closeMobileSidebar}>
                                    <img src={logoSrc} alt="La Muralla" style={{ width: 28, height: 28, objectFit: "contain", display: "block" }} />
                                    <span className="font-semibold" style={{ fontSize: 14, letterSpacing: "-0.02em" }}>La Muralla</span>
                                </Link>
                                <button onClick={closeMobileSidebar} title="Cerrar menú" className="p-1.5 rounded-md transition-colors duration-150 hover:bg-[var(--sidebar-bg-hover)]">
                                    <X size={18} strokeWidth={1.75} />
                                </button>
                            </div>

                            <nav className="flex flex-col gap-[2px] w-full px-2 py-[10px] flex-1">
                                {sidebarLinks.map(item =>
                                    item.isAvailable && (
                                        <Link key={item.title} href={item.href}
                                            className={`transition-colors duration-150 rounded-md flex items-center h-10 px-[10px] text-sm font-medium
                                            ${item.isActive ? "" : "hover:bg-[var(--sidebar-bg-hover)]"}`}
                                            style={item.isActive
                                                ? { background: "var(--sidebar-bg-active)", color: "var(--sidebar-text)" }
                                                : { color: "var(--sidebar-text-secondary)" }}>
                                            <span className="flex-shrink-0 flex items-center mr-[10px]"><item.Icon size={18} strokeWidth={1.75} /></span>
                                            {item.title}
                                        </Link>
                                    )
                                )}
                            </nav>

                            <footer className="flex items-center px-3 w-full h-[60px] gap-[10px] flex-shrink-0" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
                                <div className="overflow-hidden rounded-full w-[30px] h-[30px] flex-shrink-0" style={{ background: "var(--sidebar-avatar-bg)", boxShadow: "inset 0 0 0 1px var(--sidebar-border)" }}>
                                    {user && (
                                        user.picture && !imageError ? (
                                            <img className="w-full h-full object-cover rounded-full" src={user.picture} alt="User Avatar" onError={() => setImageError(true)} />
                                        ) : (
                                            <img className="w-full h-full object-cover rounded-full" src={getUserAvatar(user, 40)} alt="User Avatar" />
                                        )
                                    )}
                                </div>
                                <section className="min-w-0 flex-1">
                                    <h5 className="truncate text-[13px] font-medium" style={{ color: "var(--sidebar-text)" }}>{user?.firstName} {user?.lastName}</h5>
                                    <p className="truncate text-xs" style={{ color: "var(--sidebar-text-muted)" }}>{user?.email}</p>
                                </section>
                                <button className="flex-shrink-0 p-2 rounded-md transition-colors duration-150 bg-[var(--sidebar-danger-bg)] text-[var(--sidebar-danger-text)]"
                                    onClick={handleLogoutClick} title="Cerrar sesión">
                                    <LogOut size={16} strokeWidth={2} />
                                </button>
                            </footer>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
