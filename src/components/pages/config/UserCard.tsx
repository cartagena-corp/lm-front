import { GlobalUserProps } from "@/lib/types/global"
import avatar from "@public/img/avatar.png"
import Button from "@/components/ui/Button"
import { EditIcon } from "@public/icon/Icon"
import { motion } from "motion/react"
import Image from "next/image"

export default function UserCard({ user }: { user: GlobalUserProps }) {
    return (
        <motion.article className="border-button-secondary-border hover:bg-button-secondary-hover transition-colors group
            flex justify-between items-center rounded-md border gap-4 p-4">
            <aside className="flex items-center gap-4">
                <picture className="bg-button-secondary-border overflow-hidden rounded-full flex justify-center items-center relative flex-shrink-0 w-10 h-10">
                    <Image className={user.picture ? "object-cover object-center" : "object-contain object-center p-2"}
                        src={user.picture || avatar} alt="avatar" width={48} height={48} unoptimized priority />
                </picture>
                <section className="flex flex-col">
                    <h6 className="text-primary-hover font-semibold line-clamp-1">{user.firstName} {user.lastName}</h6>
                    <p className="text-primary-border line-clamp-1 text-xs">{user.email || "Sin correo registrado"}</p>
                    <span className="bg-purple-100 text-purple-600 border lowercase first-letter:uppercase rounded-full font-medium text-xs w-fit mt-1.5  px-2">{user.role || "SIN ROL"}</span>
                </section>
            </aside>

            <Button variant="primary" className="bg-transparent aspect-square border-0! p-2.5!">
                <EditIcon size={20} />
            </Button>
        </motion.article>
    )
}