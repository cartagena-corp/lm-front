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

export interface ApiResponse<T> {
    message?: string
    success: boolean
    data?: T
}

export interface RefreshTokenResponse {
    accessToken?: string
    message?: string
    success: boolean
}

// -----------------------------------------------------------------------

export interface BoardStatusProps {
    orderIndex: null | number
    color: string
    name: string
    id: number
}

export interface ConfigStoreProps {
    boardStates: BoardStatusProps[]
    error: string | null
    isLoading: boolean

    setBoardStates: (boardStates: BoardStatusProps[]) => void
    setError: (error: string | null) => void
    setLoading: (loading: boolean) => void
    clearBoardStates: () => void
    clearError: () => void
}