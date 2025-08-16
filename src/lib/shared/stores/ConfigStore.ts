"use client"

import { StatusProps, ConfigStoreProps, ListUsersProps, RoleProps } from "@/lib/types/config"
import { PaginatedResponse } from "@/lib/types/pagination"
import { create } from "zustand"

const initialState = {
    isLoading: false,
    boardStates: [],
    listUsers: null,
    listRoles: [],
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
    setListRoles: (listRoles: RoleProps[]) => {
        set({
            isLoading: false,
            error: null,
            listRoles,
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

    clearListRoles: () => {
        set({
            isLoading: false,
            listRoles: [],
            error: null,
        })
    },

    clearError: () => {
        set({ error: null })
    }
}))