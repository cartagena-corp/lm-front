"use client"

import type { AuthStoreProps, UserProfile, JwtPayload } from "@/lib/types/auth"
import { logoutAction } from "@services/oauth.service"
import { jwtDecode } from "jwt-decode"
import { create } from "zustand"

const initialState = {
    isAuthenticated: false,
    isLoading: false,
    token: null,
    user: null,
    exp: 0,
    iat: 0
}

export const useAuthStore = create<AuthStoreProps>((set) => ({
    ...initialState,

    getProfileByToken: ({ token }) => {
        const userFromToken = jwtDecode(token) as JwtPayload | null
        if (userFromToken) {
            const { exp, iat } = userFromToken
            const userProfile = {
                permissions: userFromToken.permissions,
                firstName: userFromToken.family_name,
                lastName: userFromToken.given_name,
                avatar: userFromToken.picture,
                email: userFromToken.email,
                role: userFromToken.role,
                id: userFromToken.sub,
            } as UserProfile

            set({
                isAuthenticated: true,
                user: userProfile,
                isLoading: false,
                token: token,
                exp: exp,
                iat: iat
            })

            return userProfile
        } else return null
    },

    logout: async () => {
        await logoutAction()
        set({ ...initialState })
    },
}))