import { PaginatedResponse, PBoardProps } from "@/lib/types/pagination"

export interface BoardListProps {
    data: PaginatedResponse<PBoardProps>
}

export interface BoardFiltersProps {
    direction?: 'asc' | 'desc'
    createdBy?: string
    sortBy?: string
    status?: number
    name?: string

    page: number
    size: number
}

export interface BoardCardProps {
    board: PBoardProps
    index: number
}

export interface DateBadgeProps {
    type: 'startDate' | 'endDate' | 'createdAt' | 'updatedAt'
    date: string
}

export interface BoardStoreProps {
    boards: PaginatedResponse<PBoardProps> | null
    error: string | null
    isLoading: boolean

    setBoards: (boards: PaginatedResponse<PBoardProps>) => void
    setError: (error: string | null) => void
    setLoading: (loading: boolean) => void
    clearBoards: () => void
    clearError: () => void
}