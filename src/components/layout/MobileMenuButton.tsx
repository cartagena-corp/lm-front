'use client'

import { MenuIcon } from '@/assets/Icon'
import { useSidebarStore } from '@/lib/store/SidebarStore'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function MobileMenuButton() {
  const { toggleSidebar } = useSidebarStore()
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // No mostrar en páginas de login
  if (pathname === '/login' || pathname === '/login/callback') return null

  // Solo mostrar en dispositivos móviles
  if (!isMobile) return null

  return (
    <button
      onClick={toggleSidebar}
      className="fixed top-4 left-4 z-40 p-3 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 md:hidden"
      title="Abrir menú"
    >
      <MenuIcon size={20} />
    </button>
  )
}
