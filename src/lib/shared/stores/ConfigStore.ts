"use client"

import { StatusProps, ConfigStoreProps } from "@/lib/types/global"
import { create } from "zustand"

const initialState = {
    boardStates: [],
    isLoading: false,
    error: null
}

export const useConfigStore = create<ConfigStoreProps>()((set) => ({
    ...initialState,

    setBoardStates: (boardStates: StatusProps[]) => {
        set({
            isLoading: false,
            error: null,
            boardStates,
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

    clearBoardStates: () => {
        set({
            isLoading: false,
            boardStates: [],
            error: null,
        })
    },

    clearError: () => {
        set({ error: null })
    }
}))