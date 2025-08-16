import { DeleteIcon, EditIcon, LockShieldIcon } from "@public/icon/Icon"
import { RoleProps } from "@/lib/types/config"
import Button from "@/components/ui/Button"
import { motion } from "motion/react"

export default function RoleCard({ role, order }: { role: RoleProps, order: number }) {
    return (
        <motion.article className="border-button-secondary-border bg-button-secondary-background hover:shadow-md transition-shadow 
        flex justify-between items-center rounded-md text-sm border group gap-2 p-6"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: 0.25 * order }}>
            <aside className="flex flex-col gap-3">
                <hgroup className="flex justify-start items-center gap-2">
                    <span className="bg-orange-100 text-orange-600 flex justify-center items-center rounded-md aspect-square p-2"><LockShieldIcon /></span>
                    <span className="flex flex-col">
                        <h6 className="font-medium text-lg/tight">{role.name}</h6>
                        <p className="text-primary-border text-sm">{role.permissions.length === 0 ? "Ningún" : role.permissions.length}&nbsp;
                            {role.permissions.length <= 1 ? "permiso asignado" : "permisos asignados"}
                        </p>
                    </span>
                </hgroup>

                {
                    role.permissions.length > 0 &&
                    <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 5).map(permission => <span key={permission.name} className="bg-secondary text-button-secondary-text rounded-full text-xs px-2 py-1">{permission.name}</span>)}
                        {role.permissions.length > 5 && <span className="bg-button-primary-background text-primary-border rounded-full text-xs px-2 py-1">+{role.permissions.length - 5} más</span>}
                    </div>
                }
            </aside>
            <aside className="text-orange-600 flex justify-end items-center group-hover:opacity-100 opacity-0 transition-opacity gap-2.5">
                <Button variant="none" className="p-0!"><EditIcon size={20} /></Button>
                <Button variant="none" className="p-0!"><DeleteIcon size={20} /></Button>
            </aside>
        </motion.article>
    )
}