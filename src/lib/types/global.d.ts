export interface BoardStatusProps {
    orderIndex: null | number
    color: string
    name: string
    id: number
}

export interface GlobalState {
    initializeGlobalData: (data: { boardStatus: BoardStatusProps[] }) => void
    boardStatus: BoardStatusProps[]
    isInitialized: boolean
}

export interface StoreInitializerProps {
    boardStatus: BoardStatusProps[]
}

export interface GlobalUserProps {
    firstName: string | null
    lastName: string | null
    picture: string | null
    email: string
    role: string
    id: string
}

export interface GlobalUserFilters {
    search?: string
}