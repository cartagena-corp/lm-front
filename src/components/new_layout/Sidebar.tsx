"use client"

import { BoardIcon, ConfigIcon, IAChatIcon, IAConfigIcon, LogoutIcon, SidebarOpenIcon, SidebarCloseIcon, FactoryIcon } from "@/assets/Icon"
import { usePathname, useRouter } from "next/navigation"
import { useSidebarStore } from "@/lib/store/SidebarStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useModalStore } from "@/lib/hooks/ModalStore"
import { useThemeStore } from "@/lib/store/ThemeStore"
import SidebarTooltip from "./SidebarTooltip"
import { useState, MouseEvent, useEffect } from "react"
import { motion } from "motion/react"
import { getUserAvatar } from "@/lib/utils/avatar.utils"
import { hasPermission } from "@/lib/utils/user.utils"
import ChatWithIA from "../partials/gemini/ChatWithIA"
import Link from "next/link"

interface SidebarLinkProps {
    title: string
    href: string
    Icon: ({ size, stroke }: { size: number; stroke: number }) => JSX.Element
    isActive: boolean
    isAvailable: boolean
}

interface SidebarButtonProps {
    title: string
    key: string
    Icon: ({ size, stroke }: { size: number; stroke: number }) => JSX.Element
}

export default function Sidebar() {
    const { isCollapsed, toggleSidebar } = useSidebarStore()
    const { user, logout } = useAuthStore()
    const { openModal, closeModal } = useModalStore()
    const { theme } = useThemeStore()
    // Castillo azul para fondo claro, castillo blanco para fondo oscuro.
    const logoSrc = theme === "dark" ? "/favicon-light.ico" : "/favicon-dark.ico"

    const [hovered, setHovered] = useState<{ key: string, position: { top: number, left: number } } | null>(null)
    const [activeSidebarButton, setActiveSidebarButton] = useState<string | null>(null)
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

    // Evitar hidratación si no está montado
    if (!isMounted) {
        return null
    }

    const sidebarLinks: SidebarLinkProps[] = [
        { title: "Tableros", href: "/tableros", Icon: BoardIcon, isActive: (pathname === "/tableros" && !activeSidebarButton), isAvailable: true },
        { title: "Organizaciones", href: "/factory", Icon: FactoryIcon, isActive: (pathname.startsWith("/factory") && !activeSidebarButton), isAvailable: hasOrganizationControl },
        { title: "Configuración", href: "/config", Icon: ConfigIcon, isActive: (pathname === "/config" && !activeSidebarButton), isAvailable: true },
        { title: "Configurar Gemini", href: "/gemini", Icon: IAConfigIcon, isActive: (pathname === "/gemini" && !activeSidebarButton), isAvailable: hasGeminiConfigAccess },
    ]

    const sidebarButtons: SidebarButtonProps[] = hasGeminiChatAccess ? [
        { title: "Chatea con IA", key: "chat", Icon: IAChatIcon },
    ] : []

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

    const handleChatButtonClick = () => {
        openModal({
            title: "Chatea con IA",
            desc: "Chatea con nuestro asistente de IA para que te ayude a solucionar tus dudas.",
            size: "full",
            children: <ChatWithIA onCancel={() => {
                closeModal()
                setActiveSidebarButton(null)
            }} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            Icon: <IAChatIcon size={20} stroke={1.75} />,
        })
    }

    return (
        <motion.aside className="overflow-hidden flex flex-col h-screen sticky group left-0 top-0 z-10"
            style={{ background: "var(--background-200)", borderRight: "1px solid var(--ds-border)", color: "var(--ds-text)" }}
            onMouseLeave={() => setIsSidebarHovered(false)} onMouseEnter={() => setIsSidebarHovered(true)} onAnimationComplete={() => setSidebarAnimationDone(isCollapsed)}
            transition={{ duration: 0.5, ease: "easeInOut" }} animate={{ width: sidebarWidth }} initial={{ width: 0 }}>
            <Link href="/tableros" className="flex items-center px-4 h-14 flex-shrink-0 gap-[10px]" style={{ borderBottom: "1px solid var(--ds-border)" }}>
                <img src={logoSrc} alt="La Muralla" className="flex-shrink-0" style={{ width: 28, height: 28, objectFit: "contain", display: "block" }} />
                <motion.span className="font-semibold whitespace-nowrap overflow-hidden" style={{ fontSize: 14, letterSpacing: "-0.02em" }} transition={{ duration: 0.5, ease: "easeInOut" }} initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 120 }}>
                    La Muralla
                </motion.span>
            </Link>

            <header className="flex flex-col justify-between items-center h-full">
                <nav className="flex flex-col gap-[2px] w-full px-2 py-[10px]">
                    {sidebarLinks.map(item =>
                        item.isAvailable && (
                            <Link key={item.title} href={item.href} onClick={() => setActiveSidebarButton(null)}
                                onMouseEnter={e => handleMouseEnter(e, item.title)} onMouseLeave={handleMouseLeave}
                                title={item.title}
                                className={`transition-colors duration-150 rounded-md flex items-center h-9 px-[10px] text-sm font-medium overflow-hidden whitespace-nowrap
                                ${item.isActive ? "" : "hover:bg-[var(--gray-alpha-100)]"}`}
                                style={item.isActive
                                    ? { background: "var(--gray-alpha-200)", color: "var(--ds-text)" }
                                    : { color: "var(--ds-text-secondary)" }}>
                                <span className="flex-shrink-0 flex items-center"><item.Icon size={18} stroke={1.75} /></span>
                                <motion.span className="whitespace-nowrap overflow-hidden" initial={{ opacity: 0, width: 0, marginLeft: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}
                                    animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 130, marginLeft: isCollapsed ? 0 : 10 }}>{item.title}</motion.span>
                                {(isCollapsed && hovered?.key === item.title) && <SidebarTooltip text={item.title} position={hovered.position} show={sidebarAnimationDone} />}
                            </Link>
                        )
                    )}

                    {sidebarButtons.length > 0 && (
                        <div className="flex flex-col w-full gap-[2px]">
                            {sidebarButtons.map(item =>
                                <button key={item.title} onClick={handleChatButtonClick}
                                    onMouseEnter={e => handleMouseEnter(e, item.title)} onMouseLeave={handleMouseLeave}
                                    title={item.title}
                                    className="transition-colors duration-150 rounded-md flex items-center h-9 px-[10px] text-sm font-medium overflow-hidden whitespace-nowrap cursor-pointer hover:bg-[var(--gray-alpha-100)]"
                                    style={{ color: "var(--ds-text-secondary)" }}>
                                    <span className="flex-shrink-0 flex items-center"><item.Icon size={18} stroke={1.75} /></span>
                                    <motion.span className="whitespace-nowrap overflow-hidden text-start" initial={{ opacity: 0, width: 0, marginLeft: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}
                                        animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 130, marginLeft: isCollapsed ? 0 : 10 }}>
                                        {item.title}
                                    </motion.span>
                                    {(isCollapsed && hovered?.key === item.title) && <SidebarTooltip text={item.title} position={hovered.position} show={sidebarAnimationDone} />}
                                </button>
                            )}
                        </div>
                    )}
                </nav>

                <nav className="flex flex-col w-full gap-[2px] px-2 py-[10px]">
                    <button className="transition-colors duration-150 rounded-md flex items-center h-9 px-[10px] text-sm font-medium overflow-hidden whitespace-nowrap cursor-pointer w-full hover:bg-[var(--gray-alpha-100)]"
                        style={{ color: "var(--ds-text-secondary)" }}
                        onClick={toggleSidebar} title={isCollapsed ? "Abrir sidebar" : "Cerrar sidebar"}
                        onMouseEnter={e => handleMouseEnter(e, "Expandir Sidebar")} onMouseLeave={handleMouseLeave}>
                        <span className="flex-shrink-0 flex items-center">{isCollapsed ? <SidebarOpenIcon size={18} stroke={1.75} /> : <SidebarCloseIcon size={18} stroke={1.75} />}</span>
                        <motion.span className="whitespace-nowrap overflow-hidden text-start" transition={{ duration: 0.5, ease: "easeInOut" }} initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                            animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 130, marginLeft: isCollapsed ? 0 : 10 }}>Contraer</motion.span>
                        {(isCollapsed && hovered?.key === "Expandir Sidebar") && <SidebarTooltip text="Expandir Sidebar" position={hovered.position} show={sidebarAnimationDone} />}
                    </button>
                </nav>
            </header>

            <footer className="flex items-center px-3 w-full h-[60px] gap-[10px] flex-shrink-0" style={{ borderTop: "1px solid var(--ds-border)" }}>
                <picture className="overflow-hidden rounded-full relative w-[30px] h-[30px] flex-shrink-0" style={{ background: "var(--blue-200)", boxShadow: "inset 0 0 0 1px var(--ds-border)" }}>
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
                    <motion.button className="bg-red-500/15 text-red-600 cursor-pointer justify-center items-center w-full h-full rounded-full object-cover absolute inset-0 flex"
                        onMouseEnter={e => handleMouseEnter(e, "Cerrar sesión")} onMouseLeave={handleMouseLeave} onClick={handleLogoutClick} style={{ pointerEvents: isSidebarHovered ? "auto" : "none" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }} animate={{ opacity: isSidebarHovered ? 1 : 0 }} initial={false} title="Cerrar sesión">
                        <LogoutIcon size={18} stroke={2} />
                        {(isCollapsed && hovered?.key === "Cerrar sesión") && <SidebarTooltip text="Cerrar sesión" position={hovered.position} show={sidebarAnimationDone} />}
                    </motion.button>
                </picture>
                <motion.section initial={{ opacity: 0, width: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="min-w-0 overflow-hidden" animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 170 }}>
                    <h5 className="max-w-[170px] truncate text-[13px] font-medium" style={{ color: "var(--ds-text)" }} title={user?.firstName + " " + user?.lastName}>{user?.firstName} {user?.lastName}</h5>
                    <p className="text-xs truncate" style={{ color: "var(--ds-text-muted)" }} title={user?.email}>{user?.email}</p>
                </motion.section>
            </footer>
        </motion.aside>
    )
}