import { DeleteIcon, EditIcon } from "@public/icon/Icon"
import { StatusProps } from "@/lib/types/config"
import Button from "@/components/ui/Button"
import { motion } from "motion/react"

export default function StateCard({ state, order }: { state: StatusProps, order: number }) {
    return (
        <motion.article className="border-button-secondary-border bg-button-secondary-background hover:shadow-md transition-shadow 
        flex justify-between items-center rounded-md text-sm border group gap-2 p-6"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: 0.25 * order }}>
            <hgroup className="flex justify-start items-center gap-2">
                <span style={{ backgroundColor: state.color }} className="flex justify-center items-center rounded-full p-1.5" />
                <h6 className="font-medium">{state.name}</h6>
            </hgroup>
            <aside style={{ color: state.color }} className="flex justify-end items-center group-hover:opacity-100 opacity-0 transition-opacity gap-2.5">
                <Button variant="none" className="p-0!"><EditIcon size={20} /></Button>
                <Button variant="none" className="p-0!"><DeleteIcon size={20} /></Button>
            </aside>
        </motion.article>
    )
}
