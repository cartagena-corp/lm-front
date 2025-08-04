import { BoardIcon, ConfigIcon, IAChatIcon, IAConfigIcon, LaMurallaIcon, LogoutIcon, SidebarOpenIcon, SidebarCloseIcon } from "@public/icon/Icon"
import { usePathname, useRouter } from "next/navigation"
import { useSidebarStore } from "@stores/SidebarStore"
import { useAuthStore } from "@stores/AuthStore"
import SidebarTooltip from "./SidebarTooltip"
import { useState, MouseEvent } from "react"
import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"

import avatar from "@public/img/avatar.png"

export default function Sidebar() {
    const { isCollapsed, toggleSidebar } = useSidebarStore()
    const { logout, user } = useAuthStore()

    const [hovered, setHovered] = useState<{ key: string, position: { top: number, left: number } } | null>(null)
    const [activeSidebarButton, setActiveSidebarButton] = useState<string | null>(null)
    const [sidebarAnimationDone, setSidebarAnimationDone] = useState(isCollapsed)
    const [isSidebarHovered, setIsSidebarHovered] = useState(false)
    const sidebarWidth = isCollapsed ? 64 : 256

    const pathname = usePathname()
    const router = useRouter()

    const sidebarLinks = [
        { title: "Tableros", href: "/tableros", Icon: BoardIcon, isActive: (pathname === "/tableros" && !activeSidebarButton) },
        { title: "Configuración", href: "/config", Icon: ConfigIcon, isActive: (pathname === "/config" && !activeSidebarButton) },
    ]

    const sidebarButtons = [
        { title: "Chatea con IA", key: "chat", Icon: IAChatIcon },
        { title: "Gemini API Key", key: "api", Icon: IAConfigIcon },
    ]

    const handleMouseLeave = () => setHovered(null)
    const handleMouseEnter = (e: MouseEvent, key: string) => {
        if (!isCollapsed) return
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        setHovered({ key, position: { top: rect.top + rect.height / 2, left: rect.right + 8 } })
    }

    const handleLogoutClick = async () => {
        await logout()
        router.push('/login')
    }

    return (
        <motion.aside className="bg-primary text-primary-text overflow-hidden flex flex-col h-screen shadow-lg sticky group left-0 top-0 z-10"
            onMouseLeave={() => setIsSidebarHovered(false)} onMouseEnter={() => setIsSidebarHovered(true)} onAnimationComplete={() => setSidebarAnimationDone(isCollapsed)}
            transition={{ duration: 0.5, ease: "easeInOut" }} animate={{ width: sidebarWidth }} initial={{ width: 0 }}>
            <Link href="/tableros" className="border-primary-text/15 flex items-center justify-center border-b px-6 py-4 h-20">
                <span className="flex justify-center flex-shrink-0 w-10">
                    <LaMurallaIcon size={36} />
                </span>
                <motion.h5 className="font-bold whitespace-nowrap overflow-hidden text-2xl" transition={{ duration: 0.5, ease: "easeInOut" }} initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                    animate={{ marginLeft: isCollapsed ? 0 : 10, opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 120 }}>
                    La Muralla
                </motion.h5>
            </Link>

            <header className="flex flex-col justify-between items-center h-full">
                <nav className="flex flex-col gap-2 w-full px-[11px] py-4">
                    {sidebarLinks.map(item =>
                        <Link key={item.title} href={item.href} onClick={() => setActiveSidebarButton(null)}
                            onMouseEnter={e => handleMouseEnter(e, item.title)} onMouseLeave={handleMouseLeave}
                            className={`hover:bg-primary-hover transition-colors duration-300 rounded-md flex items-center border-l-4 text-sm p-2 
                            ${item.isActive ? "border-primary-border bg-primary-hover" : "border-transparent"}`}><item.Icon size={22} strokeWidth={1.75} />
                            <motion.span className="whitespace-nowrap overflow-hidden" initial={{ opacity: 0, width: 0, marginLeft: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}
                                animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 120, marginLeft: isCollapsed ? 0 : 10 }}>{item.title}</motion.span>
                            {(isCollapsed && hovered?.key === item.title) && <SidebarTooltip text={item.title} position={hovered.position} show={sidebarAnimationDone} />}
                        </Link>
                    )}

                    <div className="flex flex-col w-full gap-2">
                        {sidebarButtons.map(item =>
                            <button key={item.title} onClick={() => setActiveSidebarButton(item.key)}
                                onMouseEnter={e => handleMouseEnter(e, item.title)} onMouseLeave={handleMouseLeave}
                                className={`hover:bg-primary-hover transition-colors duration-300 rounded-md flex items-center border-l-4 text-sm p-2 
                                ${activeSidebarButton === item.key ? "border-primary-border bg-primary-hover" : "border-transparent"} cursor-pointer`}>
                                <item.Icon size={22} strokeWidth={1.75} />
                                <motion.span className="whitespace-nowrap overflow-hidden text-start" initial={{ opacity: 0, width: 0, marginLeft: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}
                                    animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 120, marginLeft: isCollapsed ? 0 : 10 }}>
                                    {item.title}
                                </motion.span>
                                {(isCollapsed && hovered?.key === item.title) && <SidebarTooltip text={item.title} position={hovered.position} show={sidebarAnimationDone} />}
                            </button>
                        )}
                    </div>
                </nav>

                <nav className="flex flex-col w-full gap-2 px-[11px] py-4">
                    <button className={`hover:bg-primary-hover transition-colors duration-300 rounded-md flex items-center border-l-4 text-sm p-2
                        ${isCollapsed ? "border-primary-border bg-primary-hover" : "border-transparent"} cursor-pointer w-full`}
                        onClick={toggleSidebar} title={isCollapsed ? "Abrir sidebar" : "Cerrar sidebar"}
                        onMouseEnter={e => handleMouseEnter(e, "Expandir Sidebar")} onMouseLeave={handleMouseLeave}>
                        {isCollapsed ? <SidebarOpenIcon size={22} strokeWidth={1.75} /> : <SidebarCloseIcon size={22} strokeWidth={1.75} />}
                        <motion.span className="whitespace-nowrap overflow-hidden" transition={{ duration: 0.5, ease: "easeInOut" }} initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                            animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 120, marginLeft: isCollapsed ? 0 : 10 }}>Contraer Sidebar</motion.span>
                        {(isCollapsed && hovered?.key === "Expandir Sidebar") && <SidebarTooltip text="Expandir Sidebar" position={hovered.position} show={sidebarAnimationDone} />}
                    </button>
                </nav>
            </header>

            <footer className="border-primary-text/15 flex items-center justify-center border-t w-full h-20">
                <picture className="bg-primary-hover overflow-hidden rounded-full relative w-10 h-10 flex-shrink-0">
                    <motion.div className="absolute inset-0 w-full h-full flex justify-center items-center"
                        transition={{ duration: 0.3, ease: "easeInOut" }} animate={{ opacity: isSidebarHovered ? 0 : 1 }} initial={false}>
                        <Image className="object-cover object-center" src={user?.avatar || avatar} alt="avatar" width={user?.avatar ? 40 : 20} height={user?.avatar ? 40 : 20} unoptimized priority />
                    </motion.div>
                    <motion.button className="bg-red-500/15 text-red-600 cursor-pointer justify-center items-center w-full h-full rounded-full object-cover absolute inset-0 flex"
                        onMouseEnter={e => handleMouseEnter(e, "Cerrar sesión")} onMouseLeave={handleMouseLeave} onClick={handleLogoutClick} style={{ pointerEvents: isSidebarHovered ? "auto" : "none" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }} animate={{ opacity: isSidebarHovered ? 1 : 0 }} initial={false} title="Cerrar sesión">
                        <LogoutIcon size={20} strokeWidth={2} />
                        {(isCollapsed && hovered?.key === "Cerrar sesión") && <SidebarTooltip text="Cerrar sesión" position={hovered.position} show={sidebarAnimationDone} />}
                    </motion.button>
                </picture>
                <motion.section initial={{ opacity: 0, width: 0, marginLeft: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="min-w-0 overflow-hidden" animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 190, marginLeft: isCollapsed ? 0 : 10 }}>
                    <h5 className="max-w-[190px] truncate text-sm" title={user?.firstName + " " + user?.lastName}>{user?.firstName} {user?.lastName}</h5>
                    <p className="text-primary-text/70 text-xs font-light" title={user?.email}>{user?.email}</p>
                </motion.section>
            </footer>
        </motion.aside>
    )
}