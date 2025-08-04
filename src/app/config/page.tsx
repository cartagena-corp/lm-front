"use client"

import BoardStates from "@/components/pages/config/StateSystem"
import UserSystem from "@/components/pages/config/UserSystem"
import RoleSystem from "@/components/pages/config/RoleSystem"
import { ConfigIcon } from "@public/icon/Icon"
import { motion } from "motion/react"
import Tab from "@/components/ui/Tab"

export default function Config() {
    const tabsData = [
        { label: "📋 Estados de Tablero", content: <BoardStates /> },
        { label: "👤 Usuarios del Sistema", content: <UserSystem /> },
        { label: "🔒 Roles y Permisos", content: <RoleSystem /> },
    ]
    return (
        <motion.main className="flex flex-col gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <section className="flex justify-between items-center gap-4">
                <span className="text-button-secondary-text bg-button-secondary-border flex justify-center items-center rounded-md aspect-square p-2">
                    <ConfigIcon size={24} />
                </span>

                <aside className="flex flex-col w-full gap-1">
                    <h3 className="max-sm:text-lg text-3xl font-semibold">Panel de Configuración</h3>
                    <p className="text-primary-border text-sm">Gestiona los estados, usuarios y roles de la plataforma.</p>
                </aside>
            </section>

            <Tab items={tabsData} />
        </motion.main>
    )
}
