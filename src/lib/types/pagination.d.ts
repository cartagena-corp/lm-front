export interface PaginatedResponse<T> {
    totalElements: number
    totalPages: number
    number: number
    content: T[]
    size: number
}

export interface PaginatedState<T> {
    setInitialData: (page: PaginatedResponse<T>) => void
    addPage: (page: PaginatedResponse<T>) => void
    setLoading: (loading: boolean) => void
    totalElements: number
    currentPage: number
    totalPages: number
    isLoading: boolean
    reset: () => void
    items: T[]
}