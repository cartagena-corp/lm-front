"use client"

import type { AuthStoreProps, UserProfile } from "@/lib/types/auth"
import { persist } from "zustand/middleware"
import { create } from "zustand"

const initialState = {
    isAuthenticated: false,
    isLoading: false,
    token: null,
    user: null,
    exp: 0,
    iat: 0
}

export const useAuthStore = create<AuthStoreProps>()(
    persist((set, get) => ({
        ...initialState,

        setUser: (userProfile: UserProfile) => {
            set({
                isAuthenticated: true,
                user: userProfile,
                isLoading: false,
            })
        },

        setToken: (token: string) => {
            set({ token: token })
        },

        clearAuth: () => {
            set({ ...initialState })
        },

        setLoading: (loading: boolean) => {
            set({ isLoading: loading })
        },
    }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                user: state.user
            }),
        }
    )
)