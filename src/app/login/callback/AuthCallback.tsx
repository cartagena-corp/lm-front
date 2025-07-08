'use client'

import { useAuthStore } from '@/lib/store/AuthStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthCallback() {
   const { setAccessToken, validateToken, isLoading, error } = useAuthStore()
   const searchParams = useSearchParams()
   const accessToken = searchParams.get('token')
   const router = useRouter()

   useEffect(() => {
      const handleCallback = async () => {
         if (!accessToken) {
            console.error("No se recibió token")
            router.push("/login")
            return
         }

         try {
            // Validar el token usando el AuthStore
            const isValid = await validateToken(accessToken)
            
            if (!isValid) {
               throw new Error("Token NO Válido, por favor verifica tu cuenta de Google.")
            }

            // Establecer el token si es válido
            setAccessToken(accessToken)
            
            // Redirigir al dashboard
            router.push("/tableros")
         } catch (error) {
            console.error("Error en el callback:", error)
            router.push("/login")
         }
      }

      handleCallback()
   }, [accessToken, router, setAccessToken, validateToken])

   return (
      <div className="bg-gray-900 h-screen flex justify-center items-center">
         <div className="loader" />
         {error && (
            <div className="absolute top-4 right-4 bg-red-500 text-white p-3 rounded">
               {error}
            </div>
         )}
      </div>
   )
}
