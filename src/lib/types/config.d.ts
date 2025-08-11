import { PaginatedResponse, PUserProps } from "./pagination"

export interface ConfigStoreProps {
    listUsers: PaginatedResponse<ListUsersProps> | null
    boardStates: StatusProps[]
    error: string | null
    isLoading: boolean

    setListUsers: (listUsers: PaginatedResponse<ListUsersProps>) => void
    setBoardStates: (boardStates: StatusProps[]) => void
    setError: (error: string | null) => void
    setLoading: (loading: boolean) => void
    clearBoardStates: () => void
    clearListUsers: () => void
    clearError: () => void
}

export interface ListUsersProps {
    firstName: string | null
    lastName: string | null
    picture: string | null
    email: string
    role: string
    id: string
}


export interface StatusProps {
    orderIndex: null | number
    color: string
    name: string
    id: number
}

export interface UserListProps {
    data: PaginatedResponse<PUserProps>
}

// * --------------------- Service Props --------------------- *

export interface updateBoardStateParams {
    changes: Partial<StatusProps>
    state: StatusProps
}

export interface ListUsersFiltersProps {
    search?: string
    page: number
    size: number
}