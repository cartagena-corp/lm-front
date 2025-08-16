import { useConfigStore } from "@/lib/shared/stores/ConfigStore"
import { getAllRoles } from "@/lib/core/services/config.service"
import { AddRoleIcon, LockShieldIcon } from "@public/icon/Icon"
import { logger } from "@/lib/types/Logger"
import { useEffect } from "react"
import Button from "@/components/ui/Button"
import RoleCard from "./comps/RoleCard"

export default function RoleSystem() {
    const { listRoles, setListRoles, isLoading, setLoading, error, setError, clearError } = useConfigStore()

    const loadData = async () => {
        try {
            setLoading(true)
            clearError()

            const response = await getAllRoles()

            if (response) setListRoles(response)
            else setError('No se pudieron cargar el listado de roles')
        } catch (error) {
            logger.error('Error loading roles:', error)
            setError('Error al cargar el listado de roles')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadData() }, [])
    return (
        <main className="bg-button-secondary-background rounded-md shadow-md flex flex-col">
            <header className="flex justify-between items-center gap-2 p-6">
                <aside className="flex items-center gap-4">
                    <span className="bg-orange-100 text-orange-600 flex justify-center items-center rounded-md aspect-square p-2">
                        <LockShieldIcon />
                    </span>
                    <hgroup className="flex flex-col gap-1">
                        <h5 className="font-semibold text-xl">Roles y Permisos</h5>
                        <p className="text-primary-border text-sm">Aquí puedes gestionar los roles y permisos de los usuarios del sistema.</p>
                    </hgroup>
                </aside>

                <Button variant="primary" className="flex items-center gap-2">
                    <AddRoleIcon size={16} strokeWidth={1.75} />
                    Añadir Rol
                </Button>
            </header>

            <hr className="border-button-secondary-border/25" />

            <section className="flex flex-col gap-2 p-6">
                {
                    listRoles.length > 0 &&
                    <span className="text-primary-border text-sm">En total hay {listRoles.length} roles {listRoles.length > 1 ? "configurados" : "configurado"}</span>
                }

                {/* Data state */}
                {(!isLoading && !error && listRoles) && listRoles.map((role, id) => <RoleCard key={id} role={role} order={id} />)}
            </section>
        </main>
    )
}
