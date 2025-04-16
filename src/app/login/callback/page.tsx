"use client"
import { useAuthStore } from '@/lib/store/AuthStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthCallback() {
   const setAccessToken = useAuthStore(state => state.setAccessToken)
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_AUTHENTICATION}${process.env.NEXT_PUBLIC_VALIDATE_TOKEN}`, {
               method: 'GET',
               headers: {
                  'Authorization': `Bearer ${accessToken}`
               },
            })

            if (!response.ok) throw new Error(`Error en la validación: ${response.statusText}`)


            // Guardar el token en Zustand
            setAccessToken(accessToken)

            const data = await response.json()
            if (!data) throw new Error("Token NO Valido, por favor verifica tu cuenta de Google.")

            router.push("/tableros")
         } catch (error) {
            console.error("Error en el callback:", error)
            router.push("/login")
         }
      }

      handleCallback()
   }, [accessToken, router, setAccessToken])

   return (
      <div className="bg-gray-900 h-screen flex justify-center items-center">
         <div className="loader" />
      </div>
   )
}