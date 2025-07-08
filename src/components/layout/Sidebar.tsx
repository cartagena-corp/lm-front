'use client'

import { AuditIcon, BoardIcon, ConfigIcon, LogoutIcon } from '../../assets/Icon'
import { useAuthStore } from '@/lib/store/AuthStore'
import { IconProps } from '@/lib/types/types'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getUserAvatar } from '@/lib/utils/avatar.utils'

interface NavigationProps {
  icon: ({ size, stroke }: IconProps) => JSX.Element
  isAvailable: boolean
  name: string
  href: string
}

const navigation: NavigationProps[] = [
  { name: 'Tableros', href: '/tableros', icon: BoardIcon, isAvailable: true },
  { name: 'Configuración', href: '/config', icon: ConfigIcon, isAvailable: true },
]

export default function Sidebar() {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { logout, user } = useAuthStore()
  const pathname = usePathname()

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (pathname === '/login' || pathname === "/login/callback") return null

  return (
    <nav className="flex flex-col justify-between bg-gray-900 w-64 fixed top-0 left-0 z-30 h-screen">
      <section className="px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-8">La Muralla</h1>
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                title={!item.isAvailable ? 'Próximamente...' : undefined}
                className={`group flex gap-4 items-center p-2 text-base font-medium rounded-md ${isActive
                  ? 'bg-gray-800 text-white'
                  : !item.isAvailable
                    ? 'text-white opacity-25 cursor-default'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <item.icon />
                {item.name}
              </Link>
            )
          })}
        </ul>
      </section>

      <section className="border-white/25 border-t px-4 py-6 space-y-5">
        <div className="grid grid-cols-4 items-center">
          {
            isClient && user ? (
              <>
                <div className="rounded-full w-10 aspect-square">
                  <img className="rounded-full object-cover w-full h-full"
                    src={getUserAvatar(user, 40)}
                    alt="User Image"
                  />
                </div>
                <p className="text-white/85 overflow-ellipsis col-span-3 text-sm">{user?.firstName} {user?.lastName}</p>
              </>
            ) : <div className="bg-gray-500 rounded-full w-10 aspect-square" />
          }
        </div>


        <button className="hover:bg-gray-800 text-white duration-150 flex justify-start items-center cursor-pointer rounded-md w-full gap-4 p-2"
          onClick={() => logout()}>
          <LogoutIcon />
          Cerrar sesión
        </button>
      </section>
    </nav>
  )
}
