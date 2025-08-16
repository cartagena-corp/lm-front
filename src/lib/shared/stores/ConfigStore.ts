"use client"

import { StatusProps, ConfigStoreProps, ListUsersProps } from "@/lib/types/config"
import { PaginatedResponse } from "@/lib/types/pagination"
import { create } from "zustand"

const initialState = {
    isLoading: false,
    boardStates: [],
    listUsers: null,
    listRoles: null,
    error: null
}

export const useConfigStore = create<ConfigStoreProps>()((set) => ({
    ...initialState,

    setListUsers: (listUsers: PaginatedResponse<ListUsersProps>) => {
        set({
            isLoading: false,
            error: null,
            listUsers,
        })
    },

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

    clearListUsers: () => {
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