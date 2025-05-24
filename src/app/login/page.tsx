'use client'

import { useAuthStore } from '@/lib/store/AuthStore'
import { GoogleButton } from '../../assets/Icon'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [canRender, setCanRender] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) router.push("/tableros")
    else setCanRender(true)
  }, [isAuthenticated, router])

  return (
    <main className='bg-gray-900 flex justify-center items-center h-screen'>
      <section className='bg-blue-900 text-white flex flex-col justify-center items-center rounded-l-md h-[50%] w-[25%] p-14'>
        <h5 className='font-bold text-4xl'>La Muralla</h5>
        <p className='text-center'>Logo, Lema, Tema Principal, etc <br /> <b className='text-white/75 italic font-extralight'>(info del webapp)</b></p>
      </section>
      <section className='bg-white text-black flex flex-col justify-center items-center rounded-r-md h-[50%] w-[25%] p-14 space-y-6'>
        <div className='text-start w-full'>
          <h6 className='font-bold text-2xl'>Bienvenido</h6>
          <p className='text-black/50'>Inicia sesión para acceder a tu cuenta</p>
        </div>
        {/* <Link href={"http://localhost:8081/oauth2/authorization/google"} */}
        <Link href={"https://lm-oauth.cartagenacorporation.com/oauth2/authorization/google"}
          className='border-black/15 hover:bg-black/5 duration-150 border rounded-md py-2 w-full flex justify-center items-center gap-4'>
          <GoogleButton size={18} />
          Iniciar Sesión con Google
        </Link>
        <p className='text-xs text-center'>
          Al iniciar sesión, aceptas nuestros <b className='hover:underline cursor-pointer'>Términos de servicio</b> y <b className='hover:underline cursor-pointer'>Política de privacidad</b>
        </p>
      </section>
    </main>
  )
}