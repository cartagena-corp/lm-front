export interface AuthStoreProps {
    isAuthenticated: boolean
    user: UserProfile | null
    token: string | null
    isLoading: boolean
    exp: number
    iat: number

    getProfileByToken: ({ token }) => UserProfile | null
    logout: () => Promise<void>
}

export interface JwtPayload {
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
    permissions: string[]
    firstName: string
    lastName: string
    avatar: string
    email: string
    role: string
    id: string
}
