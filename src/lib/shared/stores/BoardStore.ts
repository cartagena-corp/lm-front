"use client"

import type { PaginatedResponse, PBoardProps } from "@/lib/types/pagination"
import { BoardStoreProps } from "@/lib/types/board"
import { create } from "zustand"

const initialState = {
    isLoading: false,
    boards: null,
    error: null
}

export const useBoardStore = create<BoardStoreProps>()((set) => ({
    ...initialState,

    setBoards: (boards: PaginatedResponse<PBoardProps>) => {
        set({
            isLoading: false,
            error: null,
            boards,
        })
    },

    setLoading: (loading: boolean) => {
        set({ isLoading: loading })
    },

    setError: (error: string | null) => {
        set({
            isLoading: false,
            error,
        })
    },

    clearBoards: () => {
        set({
            isLoading: false,
            boards: null,
            error: null,
        })
    },

    clearError: () => {
        set({ error: null })
    }
}))