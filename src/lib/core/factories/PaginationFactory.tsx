import { PaginatedResponse, PaginationFactoryProps, PBoardProps } from "@/lib/types/pagination"
import BoardList from "@/components/pages/boards/BoardList"
import { logger } from "@/lib/types/Logger"

/**
 * Factory Component que selecciona y renderiza el componente de lista
 * apropiado basado en el prop 'type'.
 * @param {PaginationFactoryProps} props - Las propiedades del factory.
 * @param {ListComponentType} props.type - El identificador del tipo de lista.
 * @param {PaginatedResponse<any>} props.data - Los datos a pasar al componente hijo.
 * @returns {JSX.Element | null} El componente de lista seleccionado o null si el tipo no es válido.
 */


export default function PaginationFactory({ type, data }: PaginationFactoryProps): JSX.Element | null {
    // Hacemos un 'cast' para asegurar que el prop 'data' tenga el tipo correcto
    switch (type) {
        case 'users':
            // return <UserList data={data as PaginatedResponse<IUser>} />
            return <></>

        case 'boards':
            return <BoardList data={data as PaginatedResponse<PBoardProps>} />

        case 'issues':
            //   return <IssueList data={data as PaginatedResponse<IIssue>} />
            return <></>

        default:
            logger.warn("[PaginationFactory] Tipo desconocido", { type })
            return null
    }
}