export interface AuthStoreProps {
    isAuthenticated: boolean
    user: UserProfile | null
    token: string | null
    isLoading: boolean
    exp: number
    iat: number

    setUser: (userProfile: UserProfile) => void
    setLoading: (loading: boolean) => void
    setToken: (token: string) => void
    clearAuth: () => void
}

export interface JwtPayload {
    organization_id: string
    permissions: string[]
    family_name: string
    given_name: string
    picture: string
    email: string
    role: string
    sub: string
    exp: number
    iat: number
}

export interface UserProfile {
    organization_id: string
    permissions: string[]
    firstName: string
    lastName: string
    avatar: string
    token?: string
    email: string
    role: string
    id: string
}
