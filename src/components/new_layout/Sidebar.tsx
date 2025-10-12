"use client"

import { BoardIcon, ConfigIcon, IAChatIcon, IAConfigIcon, LaMurallaIcon, LogoutIcon, SidebarOpenIcon, SidebarCloseIcon, FactoryIcon } from "@/assets/Icon"
import { usePathname, useRouter } from "next/navigation"
import { useSidebarStore } from "@/lib/store/SidebarStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useModalStore } from "@/lib/hooks/ModalStore"
import SidebarTooltip from "./SidebarTooltip"
import { useState, MouseEvent, useEffect } from "react"
import { motion } from "motion/react"
import { getUserAvatar } from "@/lib/utils/avatar.utils"
import { hasPermission } from "@/lib/utils/user.utils"
import ChatWithIA from "../partials/gemini/ChatWithIA"
import { Roboto_Condensed } from 'next/font/google'
import Link from "next/link"

const roboto = Roboto_Condensed({ subsets: ['latin'] })

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
        <motion.aside className="bg-gray-900 text-white overflow-hidden flex flex-col h-screen shadow-lg sticky group left-0 top-0 z-10"
            onMouseLeave={() => setIsSidebarHovered(false)} onMouseEnter={() => setIsSidebarHovered(true)} onAnimationComplete={() => setSidebarAnimationDone(isCollapsed)}
            transition={{ duration: 0.5, ease: "easeInOut" }} animate={{ width: sidebarWidth }} initial={{ width: 0 }}>
            <Link href="/tableros" className="border-gray-700 flex items-center justify-center border-b px-6 py-4 h-20">
                <span className="flex justify-center flex-shrink-0 w-10">
                    <LaMurallaIcon size={36} />
                </span>
                <motion.h5 className={`${roboto.className} font-bold whitespace-nowrap overflow-hidden text-xl`} transition={{ duration: 0.5, ease: "easeInOut" }} initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                    animate={{ marginLeft: isCollapsed ? 0 : 10, opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 120 }}>
                    LA MURALLA
                </motion.h5>
            </Link>

            <header className="flex flex-col justify-between items-center h-full">
                <nav className="flex flex-col gap-2 w-full px-[11px] py-4">
                    {sidebarLinks.map(item =>
                        item.isAvailable && (
                            <Link key={item.title} href={item.href} onClick={() => setActiveSidebarButton(null)}
                                onMouseEnter={e => handleMouseEnter(e, item.title)} onMouseLeave={handleMouseLeave}
                                className={`hover:bg-gray-800 border-gray-600 transition-colors duration-300 rounded-md flex items-center border-l-4 text-sm p-2 
                                ${item.isActive ? "hover:bg-gray-700 bg-gray-800" : "border-transparent"}`}>
                                <item.Icon size={22} stroke={1.75} />
                                <motion.span className="whitespace-nowrap overflow-hidden" initial={{ opacity: 0, width: 0, marginLeft: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}
                                    animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 120, marginLeft: isCollapsed ? 0 : 10 }}>{item.title}</motion.span>
                                {(isCollapsed && hovered?.key === item.title) && <SidebarTooltip text={item.title} position={hovered.position} show={sidebarAnimationDone} />}
                            </Link>
                        )
                    )}

                    {sidebarButtons.length > 0 && (
                        <div className="flex flex-col w-full gap-2">
                            {sidebarButtons.map(item =>
                                <button key={item.title} onClick={handleChatButtonClick}
                                    onMouseEnter={e => handleMouseEnter(e, item.title)} onMouseLeave={handleMouseLeave}
                                    className="hover:bg-gray-800 transition-colors duration-300 rounded-md flex items-center border-l-4 text-sm p-2 border-transparent cursor-pointer">
                                    <item.Icon size={22} stroke={1.75} />
                                    <motion.span className="whitespace-nowrap overflow-hidden text-start" initial={{ opacity: 0, width: 0, marginLeft: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}
                                        animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 120, marginLeft: isCollapsed ? 0 : 10 }}>
                                        {item.title}
                                    </motion.span>
                                    {(isCollapsed && hovered?.key === item.title) && <SidebarTooltip text={item.title} position={hovered.position} show={sidebarAnimationDone} />}
                                </button>
                            )}
                        </div>
                    )}
                </nav>

                <nav className="flex flex-col w-full gap-2 px-[11px] py-4">
                    <button className={`hover:bg-gray-800 border-gray-600 transition-colors duration-300 rounded-md flex items-center border-l-4 text-sm p-2
                        ${isCollapsed ? "hover:bg-gray-700 bg-gray-800" : "border-transparent"} cursor-pointer w-full`}
                        onClick={toggleSidebar} title={isCollapsed ? "Abrir sidebar" : "Cerrar sidebar"}
                        onMouseEnter={e => handleMouseEnter(e, "Expandir Sidebar")} onMouseLeave={handleMouseLeave}>
                        {isCollapsed ? <SidebarOpenIcon size={22} stroke={1.75} /> : <SidebarCloseIcon size={22} stroke={1.75} />}
                        <motion.span className="whitespace-nowrap overflow-hidden" transition={{ duration: 0.5, ease: "easeInOut" }} initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                            animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 120, marginLeft: isCollapsed ? 0 : 10 }}>Contraer Sidebar</motion.span>
                        {(isCollapsed && hovered?.key === "Expandir Sidebar") && <SidebarTooltip text="Expandir Sidebar" position={hovered.position} show={sidebarAnimationDone} />}
                    </button>
                </nav>
            </header>

            <footer className="border-gray-700 flex items-center justify-center border-t w-full h-20">
                <picture className="bg-gray-800 overflow-hidden rounded-full relative w-10 h-10 flex-shrink-0">
                    <motion.div className="absolute inset-0 w-full h-full flex justify-center items-center"
                        transition={{ duration: 0.3, ease: "easeInOut" }} animate={{ opacity: isSidebarHovered ? 0 : 1 }} initial={false}>
                        {user && (
                            user.picture && !imageError ? (
                                <img
                                    className="w-full h-full object-cover rounded-full"
                                    src={user.picture}
                                    alt="User Avatar"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <img
                                    className="w-full h-full object-cover rounded-full"
                                    src={getUserAvatar(user, 40)}
                                    alt="User Avatar"
                                />
                            )
                        )}
                    </motion.div>
                    <motion.button className="bg-red-500/15 text-red-600 cursor-pointer justify-center items-center w-full h-full rounded-full object-cover absolute inset-0 flex"
                        onMouseEnter={e => handleMouseEnter(e, "Cerrar sesión")} onMouseLeave={handleMouseLeave} onClick={handleLogoutClick} style={{ pointerEvents: isSidebarHovered ? "auto" : "none" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }} animate={{ opacity: isSidebarHovered ? 1 : 0 }} initial={false} title="Cerrar sesión">
                        <LogoutIcon size={20} stroke={2} />
                        {(isCollapsed && hovered?.key === "Cerrar sesión") && <SidebarTooltip text="Cerrar sesión" position={hovered.position} show={sidebarAnimationDone} />}
                    </motion.button>
                </picture>
                <motion.section initial={{ opacity: 0, width: 0, marginLeft: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="min-w-0 overflow-hidden" animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 190, marginLeft: isCollapsed ? 0 : 10 }}>
                    <h5 className="max-w-[190px] truncate text-sm font-semibold" title={user?.firstName + " " + user?.lastName}>{user?.firstName} {user?.lastName}</h5>
                    <p className="text-white/50 text-xs font-light" title={user?.email}>{user?.email}</p>
                </motion.section>
            </footer>
        </motion.aside>
    )
}