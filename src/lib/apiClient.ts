import { refreshTokenAction } from '@services/oauth.service'
import { useAuthStore } from '@stores/AuthStore'
import { cookies } from 'next/headers'

let failedQueue: Array<() => void> = []
let isRefreshing = false

const processQueue = () => {
    failedQueue.forEach(prom => prom())
    failedQueue = []
}

export async function apiClient<T>(url: string, options: RequestInit = {}): Promise<T> {
    const cookieStore = await cookies()
    const token = cookieStore.get('accessToken')?.value

    const headers = new Headers(options.headers)
    if (token) headers.set('Authorization', `Bearer ${token}`)
    const fetchOptions: RequestInit = { ...options, headers }
    let response = await fetch(url, fetchOptions)
    console.log("Response status:", response.status)
    if (response.status === 401) {
        if (!isRefreshing) {
            isRefreshing = true
            const refreshResult = await refreshTokenAction()
            if (refreshResult.success && refreshResult.accessToken) {
                cookieStore.set('accessToken', refreshResult.accessToken)
                headers.set('Authorization', `Bearer ${refreshResult.accessToken}`)
                processQueue()
                response = await fetch(url, { ...fetchOptions, headers })
            } else {
                cookieStore.delete('accessToken')
                cookieStore.delete('refreshToken')
                throw new Error("La sesión ha expirado.")
            }
            isRefreshing = false
        } else return new Promise<void>((resolve) => { failedQueue.push(() => resolve()) }).then(() => apiClient(url, options))
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error en la petición a la API' }))
        throw new Error(errorData.message)
    }

    if (response.status === 204) return Promise.resolve(null as T)
    return response.json() as Promise<T>
}