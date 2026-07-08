'use client'

import { useAuthStore } from '@/lib/store/AuthStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, CSSProperties } from 'react'
import toast from 'react-hot-toast'

export default function AuthCallback() {
   const { setAccessToken, validateToken, isLoading, error } = useAuthStore()
   const searchParams = useSearchParams()
   const accessToken = searchParams.get('token')
   const router = useRouter()
   const handledRef = useRef(false)

   useEffect(() => {
      // Evita procesar el callback dos veces (p.ej. doble-montaje en modo desarrollo),
      // lo que dispararía validateToken/setAccessToken por duplicado.
      if (handledRef.current) return
      handledRef.current = true

      const handleCallback = async () => {
         if (!accessToken || accessToken.split('.').length !== 3) {
            toast.error("No se recibió un token válido desde Google.")
            router.replace("/login")
            return
         }

         try {
            // Validar el token usando el AuthStore
            const isValid = await validateToken(accessToken)

            if (!isValid) {
               throw new Error("Token no válido, por favor verifica tu cuenta de Google.")
            }

            // Establecer el token si es válido
            setAccessToken(accessToken)

            // Redirigir al dashboard (replace: no deja la URL con el token en el historial)
            router.replace("/tableros")
         } catch (error) {
            console.error("Error en el callback:", error)
            toast.error(error instanceof Error ? error.message : "Error al iniciar sesión con Google.")
            router.replace("/login")
         }
      }

      handleCallback()
   }, [accessToken, router, setAccessToken, validateToken])

   return (
      <div className="relative h-screen flex justify-center items-center" style={{ background: "var(--ds-background)" }}>
         <div className="loader" style={{ "--c": "no-repeat linear-gradient(var(--ds-text-secondary) 0 0)" } as CSSProperties} />
         {error && (
            <div
               className="absolute top-4 left-4 right-4 sm:left-auto sm:max-w-sm p-3 rounded-md text-sm"
               style={{ background: "var(--red-100)", color: "var(--red-900)", border: "1px solid var(--red-400)" }}
            >
               {error}
            </div>
         )}
      </div>
   )
}
