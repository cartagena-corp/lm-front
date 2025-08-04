import { LockShieldIcon } from "@public/icon/Icon"

export default function RoleSystem() {
    return (
        <section className="bg-button-secondary-background flex justify-between items-center rounded-md shadow-md gap-2 p-6">
            <aside className="flex items-center gap-4">
                <span className="bg-orange-100 text-orange-600 flex justify-center items-center rounded-md aspect-square p-2">
                    <LockShieldIcon />
                </span>
                <span className="flex flex-col gap-1">
                    <h5 className="font-semibold text-xl">Roles y Permisos</h5>
                    <p className="text-primary-border text-sm">Aquí puedes gestionar los roles y permisos de los usuarios del sistema.</p>
                </span>
            </aside>
        </section>
    )
}
