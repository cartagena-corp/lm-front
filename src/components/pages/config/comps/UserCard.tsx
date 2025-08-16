import { ListUsersProps } from "@/lib/types/config"
import { EditIcon } from "@public/icon/Icon"
import avatar from "@public/img/avatar.png"
import Button from "@/components/ui/Button"
import { motion } from "motion/react"
import Image from "next/image"

export default function UserCard({ user, index }: { user: ListUsersProps, index: number }): JSX.Element {
    return (
        <motion.article className="border-button-secondary-border hover:bg-button-secondary-hover transition-colors group
            flex justify-between items-center rounded-md border gap-4 p-4"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: 0.25 * index }}>
            <aside className="flex items-center gap-4">
                <picture className="overflow-hidden rounded-full flex justify-center items-center relative flex-shrink-0 w-16 h-16">
                    <Image className={user.picture ? "object-cover object-center" : "object-contain object-center p-2"}
                        src={user.picture || avatar} alt="avatar" width={72} height={72} unoptimized priority />
                </picture>
                <section className="flex flex-col">
                    <h6 className="text-primary-hover font-semibold line-clamp-1">
                        {(user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : "Sin nombre registrado"}
                    </h6>
                    <p className="text-primary-border line-clamp-1 text-xs">{user.email || "Sin correo registrado"}</p>
                </section>
            </aside>

            <aside className="flex items-center gap-4">
                <span className="bg-purple-100 text-purple-600 border lowercase first-letter:uppercase rounded-full font-medium text-xs w-fit py-1 px-4">
                    {user.role || "SIN ROL"}
                </span>
                <Button variant="primary" className="flex gap-2 items-center">
                    <EditIcon size={20} />
                    Editar usuario
                </Button>
            </aside>
        </motion.article>
    )
}