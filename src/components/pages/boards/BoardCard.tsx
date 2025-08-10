import type { BoardCardProps } from "@/lib/types/board"
import avatar from "@public/img/avatar.png"
import Badge from "@/components/ui/Badge"
import { motion } from "motion/react"
import DateBadge from "./DateBadge"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"


export default function BoardCard({ board, index }: BoardCardProps) {
    const [isAnimated, setIsAnimated] = useState(false)
    return (
        <motion.div className="bg-button-secondary-background rounded-md border-l-4 shadow-sm group"
            // style={{ borderColor: status?.color ?? "#000000" }}
            whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)", transition: { type: "spring", stiffness: 300, damping: 20 } }}
            animate={isAnimated ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, transition: { delay: index * 0.25 } }} onAnimationComplete={() => setIsAnimated(true)}
            transition={{ type: "spring", stiffness: 120, damping: 20 }} initial={{ opacity: 0, y: 20 }}
        >
            <Link href={`/tableros/${board.id}`} className="block h-full px-4 py-6">
                <article className="flex flex-col justify-between space-y-4 h-full">
                    <section className="flex flex-col gap-2">
                        <header className="flex justify-between items-center w-full gap-2">
                            <h5 className="group-hover:text-button-primary-text transition-colors font-semibold text-lg/tight line-clamp-3">{board.name}</h5>
                            {/* <Badge hexColor={status?.color ?? "#000000"}>{status?.name ?? "Sin estado"}</Badge> */}
                        </header>
                        <p className="text-primary-border h-[3lh] line-clamp-3 text-xs">{board.description}</p>
                    </section>

                    <section className="flex items-center gap-2">
                        <picture className="bg-background-hover overflow-hidden rounded-full flex justify-center items-center relative flex-shrink-0 w-8 h-8">
                            <Image className={board.createdBy.picture ? "object-cover object-center" : "object-contain object-center p-1.5"}
                                src={board.createdBy.picture || avatar} alt="avatar" width={32} height={32} unoptimized priority />
                        </picture>

                        <span className="flex flex-col">
                            <h6 className="text-primary-hover font-semibold text-sm line-clamp-1">{board.createdBy.firstName} {board.createdBy.lastName}</h6>
                            <p className="text-primary-border text-xs">{board.createdBy.email || "Sin correo registrado"}</p>
                        </span>
                    </section>

                    <section className="flex flex-col gap-4">
                        <aside className="grid grid-cols-2 text-sm gap-2">
                            <DateBadge date={board.startDate} type="startDate" />
                            <DateBadge date={board.endDate} type="endDate" />
                        </aside>
                        <hr className="border-button-secondary-border/50" />
                        <aside className="flex flex-col items-start gap-2">
                            <DateBadge date={board.createdAt} type="createdAt" />
                            <DateBadge date={board.updatedAt} type="updatedAt" />
                        </aside>

                    </section>
                </article>
            </Link>
        </motion.div>
    )
}