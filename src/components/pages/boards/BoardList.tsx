import BoardCard from "@/components/pages/boards/BoardCard"
import type { BoardListProps } from "@/lib/types/board"

/**
 * Componente que renderiza una lista paginada de tableros.
 * @param {BoardListProps} props - Las propiedades del componente.
 * @param {PaginatedResponse<IBoard>} props.data - Los datos paginados de los tableros.
 * @returns {JSX.Element} El componente de la lista de tableros.
 */

export default function BoardList({ data }: BoardListProps): JSX.Element {
    return (
        <section className="flex flex-col gap-4">
            <span className="text-primary-border text-sm">Mostrando {data.content.length} de {data.totalElements} {data.totalElements === 1 ? "tablero" : "tableros"}</span>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.content.map((board, i) => <BoardCard key={board.id} board={board} index={i} />)}
            </div>
        </section>
    )
}