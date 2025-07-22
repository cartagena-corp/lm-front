'use client'

import { BoardIcon, ChatIAIcon, ConfigIcon, IAIcon, LogoutIcon, SidebarCollapseIcon, SidebarExpandIcon } from '../../assets/Icon'
import { useAuthStore } from '@/lib/store/AuthStore'
import { useSidebarStore } from '@/lib/store/SidebarStore'
import { useGeminiStore } from '@/lib/store/GeminiStore'
import { IconProps, RoleProps, PermissionProps } from '@/lib/types/types'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getUserAvatar } from '@/lib/utils/avatar.utils'
import toast from 'react-hot-toast'
import Modal from './Modal'
import ChatWithIA from '../partials/gemini/ChatWithIA'

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
  const [isClient, setIsClient] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isGeminiOpen, setIsGeminiOpen] = useState(false)
  const [isGeminiChatOpen, setIsGeminiChatOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { logout, user, getValidAccessToken } = useAuthStore()
  const { isCollapsed, toggleSidebar, setSidebarCollapsed } = useSidebarStore()
  const { updateConfig, getConfig, apiKey, apiUrl, setApiKey, setApiUrl } = useGeminiStore()
  const pathname = usePathname()

  const hasGeminiAccess = user?.role && typeof user.role !== 'string'
    ? user.role.permissions.some((permission: PermissionProps) => permission.name === 'GEMINI_CONFIG')
    : false

  const hasGeminiChatAccess = user?.role && typeof user.role !== 'string'
    ? user.role.permissions.some((permission: PermissionProps) => permission.name === 'GEMINI_ACTIVE')
    : false

  const isKeyHidden = Boolean(apiKey && /^\*+$/.test(apiKey))

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    // Si la API Key actual es solo asteriscos y se está borrando o agregando caracteres
    if (isKeyHidden) {
      // Si se está borrando (longitud menor que la actual)
      if (newValue.length < apiKey.length) {
        setApiKey('')
      }
      // Si se está agregando un nuevo caracter
      else if (newValue.length > apiKey.length) {
        setApiKey(newValue.slice(-1))
      }
    } else {
      setApiKey(newValue)
    }
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Cargar configuración inicial de Gemini
  useEffect(() => {
    const loadGeminiConfig = async () => {
      if (hasGeminiAccess) {
        try {
          const token = await getValidAccessToken()
          if (token) {
            await getConfig(token)
          }
        } catch (error) {
          console.error('Error al cargar la configuración de Gemini:', error)
        }
      }
    }

    loadGeminiConfig()
  }, [hasGeminiAccess, getValidAccessToken, getConfig])

  const handleSaveGemini = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const token = await getValidAccessToken()
      if (!token) {
        throw new Error('No se pudo obtener un token válido')
      }
      await updateConfig(token)
      setShowSaved(true)
      toast.success('La configuración de Gemini se ha guardado correctamente')
      setTimeout(() => {
        setShowSaved(false)
      }, 2000)
    } catch (error) {
      console.error('Error:', error)
      toast.error('No se pudo guardar la configuración de Gemini')
    } finally {
      setIsLoading(false)
    }
  }

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
                return (
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

              {hasGeminiAccess && (
                <li key={'gemini'}>
                  <button
                    onClick={() => setIsGeminiOpen(!isGeminiOpen)}
                    className={`group flex items-center text-sm font-medium rounded-lg transition-all duration-200 ${isCollapsed
                      ? 'justify-center p-3 w-10 h-10'
                      : 'gap-3 px-3 py-2.5 w-full'
                      } ${isGeminiOpen
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                  >
                    <div className="flex-shrink-0">
                      <IAIcon size={20} stroke={2} />
                    </div>

                    {!isCollapsed && (
                      <span className="truncate">Configurar Gemini</span>
                    )}
                  </button>

                  {isGeminiOpen && !isCollapsed && (
                    <>
                      <div
                        className={`fixed inset-0 ${isCollapsed ? 'left-16' : 'left-64'} z-40`}
                        onClick={() => setIsGeminiOpen(false)}
                      />
                      <div className="fixed left-[260px] top-0 translate-y-[30%] bg-gray-900 p-4 rounded-lg z-50 shadow-lg w-80">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-white font-medium">Configuración de Gemini</h3>
                          <button
                            onClick={() => setIsGeminiOpen(false)}
                            className="text-gray-400 hover:text-white transition-colors duration-200"
                            title="Cerrar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        <form onSubmit={handleSaveGemini} className="space-y-4">
                          <div>
                            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-1">
                              API Key
                            </label>
                            <input
                              type="password"
                              id="apiKey"
                              value={apiKey}
                              onChange={handleApiKeyChange}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ingresa tu API Key"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-300 mb-1">
                              URL de la API
                            </label>
                            <input
                              type="text"
                              id="apiUrl"
                              value={apiUrl}
                              onChange={(e) => setApiUrl(e.target.value)}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ingresa tu URL"
                              required
                            />
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <button
                              type="submit"
                              disabled={isLoading || isKeyHidden}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium transition-colors w-full duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                            >
                              {isLoading ? 'Guardando...' : isKeyHidden ? 'Modifica la API Key para guardar' : 'Guardar'}
                            </button>
                          </div>
                          {showSaved && (
                            <span className="text-green-400 text-sm block text-center">
                              ¡Guardado con éxito!
                            </span>
                          )}
                        </form>
                      </div>
                    </>
                  )}
                </li>
              )}
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
