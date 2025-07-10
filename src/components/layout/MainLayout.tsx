'use client'

import { useSidebarStore } from '@/lib/store/SidebarStore'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isCollapsed } = useSidebarStore()
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  // Detectar dispositivos móviles
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // No mostrar layout en páginas de login
  if (pathname === '/login' || pathname === '/login/callback') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main 
        className={`transition-all duration-300 ease-in-out ${
          isMobile ? 'ml-0' : (isCollapsed ? 'ml-16' : 'ml-64')
        }`}
      >
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
