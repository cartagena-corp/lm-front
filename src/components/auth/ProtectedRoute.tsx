// components/ProtectedRoute.tsx
import { useAuthStore } from '@/lib/store/AuthStore'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

interface ProtectedRouteProps {
   children: React.ReactNode
   redirectTo?: string
}

export default function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
   const isAuthenticated = useAuthStore(state => state.isAuthenticated)
   const refreshToken = useAuthStore(state => state.refreshToken)
   const router = useRouter()

   useEffect(() => {
      const checkAuth = async () => {
         if (!isAuthenticated) {
            const refreshed = await refreshToken()
            if (!refreshed) router.push(redirectTo)
         }
      }

      checkAuth()
   }, [isAuthenticated, refreshToken, router, redirectTo])

   if (!isAuthenticated) return <div>Cargando...</div>
   return <>{children}</>
}