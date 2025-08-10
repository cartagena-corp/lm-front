/**
 * Interfaz que describe la estructura de la respuesta paginada del backend.
 * @template T El tipo de los elementos en el array 'content'.
 */

export interface PaginatedResponse<T> {
    totalElements: number               // * Cantidad total de elementos en todas las páginas.
    totalPages: number                  // * Cantidad total de páginas disponibles.
    number: number                      // * El número de la página actual (inicia en 0). 
    size: number                        // * Cantidad de elementos por página. 

    content: T[]                        // ? El listado de elementos para la página actual. 
}

export interface PUserProps {
    firstName: string | null
    lastName: string | null
    picture: string | null
    email: string
    role: string
    id: string
}

export interface PBoardProps {
    createdBy: PUserProps               // * Viene sin campo Role
    description: string
    startDate: string
    createdAt: string
    updatedAt: string
    endDate: string
    status: number
    name: string
    id: string
}

export interface PIssueProps {
    descriptions: {
        title: string
        text: string
        id: string
    }[]
    estimatedTime: number | null
    priority: number | null
    reporterId: PUserProps              // * Viene sin campo Role
    assignedId: PUserProps              // * Viene sin campo Role
    status: number | null
    type: number | null
    createdAt: string
    updatedAt: string
    projectId: string
    sprintId: string
    title: string
    id: string
}

export type ListComponentType = 'users' | 'boards' | 'issues'

export interface PaginationFactoryProps {
    data: PaginatedResponse<unknown> // * Los datos paginados. Usamos 'any' aquí porque el tipo exacto dependerá del valor de 'type'.
    type: ListComponentType // * El tipo de lista que se debe renderizar.
}