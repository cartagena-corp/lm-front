import { useConfigInitialization } from "@hooks/useConfigInitialization"
import { AddBoardIcon, BoardStateIcon } from "@public/icon/Icon"
import { useConfigStore } from "@stores/ConfigStore"
import Button from "@/components/ui/Button"
import StateCard from "./comps/StateCard"
import Hierarchy from "./comps/Hierarchy"

export default function BoardStates() {
    const { boardStates } = useConfigStore()
    useConfigInitialization()

    return (
        <main className="bg-button-secondary-background rounded-md shadow-md flex flex-col">
            <header className="flex justify-between items-center gap-2 p-6">
                <aside className="flex items-center gap-4">
                    <span className="bg-sky-100 text-sky-600 flex justify-center items-center rounded-md aspect-square p-2">
                        <BoardStateIcon />
                    </span>
                    <span className="flex flex-col gap-1">
                        <h5 className="font-semibold text-xl">Estados de Tablero</h5>
                        <p className="text-primary-border text-sm">Aquí puedes gestionar los estados de los tableros.</p>
                    </span>
                </aside>

                <Button variant="primary" className="flex items-center gap-2">
                    <AddBoardIcon size={16} strokeWidth={1.75} />
                    Añadir Estado
                </Button>
            </header>

            <hr className="border-button-secondary-border/25" />

            <section className="flex flex-col items-start rounded-lg gap-2 p-6">
                <h6 className="text-primary font-semibold text-sm">Orden Jerárquico</h6>
                <Hierarchy states={boardStates} />
                {boardStates.filter(state => state.orderIndex !== null).length === 0 && <p className="text-gray-500 text-sm italic">No hay estados configurados con orden</p>}
            </section>

            <section className="flex flex-col gap-2 p-6 pt-0">
                <h6 className="text-primary font-semibold text-sm mb-2">Gestionar Estados</h6>
                {boardStates.map((state, id) => <StateCard key={state.id} state={state} order={id} />)}
            </section>
        </main>
    )
}
