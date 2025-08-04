export interface Board {
    updatedAt: string       /** Fecha de última actualización en formato ISO 8601 */
    createdAt: string       /** Fecha de creación en formato ISO 8601 */
    startDate: string       /** Fecha de inicio en formato YYYY-MM-DD */
    endDate: string         /** Fecha de fin en formato YYYY-MM-DD */
    createdBy: Author       /** El usuario que creó el tablero. */
    description: string
    status: number
    name: string
    id: string
}

export interface Author {
    firstName: string
    lastName: string
    picture: string
    email: string
    role: string
    id: string
}

export interface BoardFiltersProps {
    direction?: 'asc' | 'desc'
    createdBy?: string
    sortBy?: string
    status?: number
    name?: string
}

export interface BoardCardProps {
    index: number
    board: Board
}

export interface DateBadgeProps {
    type: 'startDate' | 'endDate' | 'createdAt' | 'updatedAt'
    date: string
}