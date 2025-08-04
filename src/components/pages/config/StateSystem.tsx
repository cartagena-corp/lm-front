import { AddBoardIcon, BoardStateIcon } from "@public/icon/Icon"
import Button from "@/components/ui/Button"
import StateCard from "./StateCard"

export default function BoardStates() {

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

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-6">
                {/* {boardStatus.map(state => <StateCard key={state.id} state={state} />)} */}
            </section>
        </main>
    )
}
