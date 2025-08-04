"use client"

import BoardFilters from "@/components/pages/boards/BoardFilters"
import { BoardIcon } from "@public/icon/Icon"
import { motion } from "motion/react"

export default function BoardPage() {

    return (
        <motion.main className="flex flex-col gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <section className="flex justify-between items-center gap-4">
                <span className="text-button-primary-text bg-button-primary-hover flex justify-center items-center rounded-md aspect-square p-2">
                    <BoardIcon size={24} />
                </span>

                <aside className="flex flex-col w-full gap-1">
                    <h3 className="max-sm:text-lg text-3xl font-semibold">Gestión de Tableros</h3>
                    <p className="text-primary-border text-sm">Administra y organiza todos los tableros de tu equipo.</p>
                </aside>
            </section>

            <BoardFilters />

            <section className="flex flex-col gap-4">
                {/* <span className="text-primary-border text-sm">Mostrando {items.length} de {totalElements} {totalElements === 1 ? "tablero" : "tableros"}</span> */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* {items.map((board, i) => <BoardCard key={board.id} board={board} index={i} />)} */}
                </div>
            </section>
        </motion.main>
    )
}
