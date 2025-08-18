'use client'

import { BoardIcon, ChatIAIcon, ConfigIcon, FactoryIcon, IAIcon, LogoutIcon, SidebarCollapseIcon, SidebarExpandIcon } from '../../assets/Icon'
import { useAuthStore } from '@/lib/store/AuthStore'
import { useSidebarStore } from '@/lib/store/SidebarStore'
import { IconProps, PermissionProps } from '@/lib/types/types'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getUserAvatar } from '@/lib/utils/avatar.utils'
import Modal from './Modal'
import ChatWithIA from '../partials/gemini/ChatWithIA'

interface NavigationProps {
  icon: ({ size, stroke }: IconProps) => JSX.Element
  isAvailable: boolean
  name: string
  href: string
}

export default function Sidebar() {
  const [isClient, setIsClient] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isGeminiChatOpen, setIsGeminiChatOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { logout, user } = useAuthStore()
  const { isCollapsed, toggleSidebar, setSidebarCollapsed } = useSidebarStore()
  const pathname = usePathname()

  const hasGeminiChatAccess = user?.role && typeof user.role !== 'string' ? user.role.permissions.some((permission: PermissionProps) => permission.name === 'GEMINI_ACTIVE') : false
  const hasGeminiConfigAccess = user?.role && typeof user.role !== 'string' ? user.role.permissions.some((permission: PermissionProps) => permission.name === 'GEMINI_CONFIG') : false
  const hasOrganizationControl = user?.role && typeof user.role !== 'string' ? user.role.permissions.some((permission: PermissionProps) => permission.name === 'ORGANIZATION_CONTROL') : false

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)

      // Auto-colapsar en móviles
      if (mobile && !isCollapsed) {
        setSidebarCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [isCollapsed, setSidebarCollapsed])

  // Resetear el estado de error cuando cambie el usuario
  useEffect(() => {
    setImageError(false)
  }, [user?.picture])

  if (pathname === '/login' || pathname === "/login/callback") return null

  const navigation: NavigationProps[] = [
    { name: 'Tableros', href: '/tableros', icon: BoardIcon, isAvailable: true },
    { name: 'Organizaciones', href: '/factory', icon: FactoryIcon, isAvailable: hasOrganizationControl },
    { name: 'Configuración', href: '/config', icon: ConfigIcon, isAvailable: true },
    { name: 'Configurar Gemini', href: '/gemini', icon: IAIcon, isAvailable: hasGeminiConfigAccess },
  ]

  return (
    <>
      {/* Overlay para móviles */}
      {isClient && isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <nav className={`flex flex-col justify-between bg-gray-900 border-r border-gray-700 shadow-lg fixed top-0 left-0 z-30 h-screen transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'
        } ${isMobile && isCollapsed ? '-translate-x-full' : 'translate-x-0'}`}>
        {/* Header con botón de colapso */}
        <section className="px-4 py-6">
          <div className={`flex items-center mb-8 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && <h1 className="text-2xl font-bold text-white truncate">La Muralla</h1>}
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-gray-300 hover:text-white ${isCollapsed ? 'w-10 h-10 flex items-center justify-center' : ''}`}
              title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              {isCollapsed ? <SidebarExpandIcon size={20} stroke={2} /> : <SidebarCollapseIcon size={20} stroke={2} />}
            </button>
          </div>

          {/* Navegación */}
          {isClient && (
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href)

                return item.isAvailable && (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      title={!item.isAvailable ? 'Próximamente...' : item.name}
                      className={`group flex items-center text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                        ? 'bg-gray-800 text-white border-l-4 border-gray-500'
                        : !item.isAvailable
                          ? 'text-gray-500 cursor-default'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        } ${isCollapsed ? 'justify-center p-3 w-10 h-10' : 'gap-3 px-3 py-2.5'}`}
                      onClick={() => {
                        // Cerrar sidebar en móviles al navegar
                        if (isMobile && !isCollapsed) {
                          setTimeout(() => setSidebarCollapsed(true), 200)
                        }
                      }}
                    >
                      <div className="flex-shrink-0">
                        <item.icon size={20} stroke={2} />
                      </div>
                      {!isCollapsed && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </Link>
                  </li>
                )
              })}

              {hasGeminiChatAccess && (
                <li key={'gemini-chat'}>
                  <button
                    onClick={() => setIsGeminiChatOpen(!isGeminiChatOpen)}
                    className={`group flex items-center text-sm font-medium rounded-lg transition-all duration-200 ${isCollapsed
                      ? 'justify-center p-3 w-10 h-10'
                      : 'gap-3 px-3 py-2.5 w-full'
                      } ${isGeminiChatOpen
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                  >
                    <div className="flex-shrink-0">
                      <ChatIAIcon size={20} stroke={2} />
                    </div>

                    {!isCollapsed && (
                      <span className="truncate">Chatea con IA</span>
                    )}
                  </button>
                </li>
              )}
            </ul>
          )}
        </section>

        {/* Footer con usuario */}
        {isClient && (
          <section className="border-t border-gray-700 px-4 py-4">
            {/* Información del usuario */}
            <div className={`flex items-center mb-4 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              {user ? (
                <>
                  <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
                    {user.picture && !imageError ? (
                      <img
                        className="w-full h-full object-cover"
                        src={user.picture}
                        alt="User Avatar"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <img
                        className="w-full h-full object-cover"
                        src={getUserAvatar(user, 32)}
                        alt="User Avatar"
                      />
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-8 h-8 bg-gray-600 rounded-full flex-shrink-0" />
              )}
            </div>

            {/* Botón de cerrar sesión */}
            <button
              onClick={() => logout()}
              className={`w-full flex items-center text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200 ${isCollapsed ? 'justify-center p-3 w-10 h-10' : 'gap-3 px-3 py-2.5'
                }`}
              title="Cerrar sesión"
            >
              <div className="flex-shrink-0">
                <LogoutIcon size={20} stroke={2} />
              </div>
              {!isCollapsed && <span className='truncate'>Cerrar sesión</span>}
            </button>
          </section>
        )}
      </nav >

      <Modal
        isOpen={isGeminiChatOpen}
        onClose={() => setIsGeminiChatOpen(false)}
        title=""
        customWidth="sm:max-w-4xl h-[90dvh]"
        showCloseButton={false}
        closeOnClickOutside={false}
      >
        <ChatWithIA onCancel={() => setIsGeminiChatOpen(false)} />
      </Modal>
    </>
  )
}
