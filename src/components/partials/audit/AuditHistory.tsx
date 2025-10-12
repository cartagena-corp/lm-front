'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AuditHistoryProps, AuditPagination, TaskProps } from '@/lib/types/types'
import { useAuthStore } from '@/lib/store/AuthStore'
import { useBoardStore } from '@/lib/store/BoardStore'
import { useIssueStore } from '@/lib/store/IssueStore'
import { ClockIcon, UsersIcon, AlertCircleIcon, XIcon } from '@/assets/Icon'
import { getUserAvatar } from '@/lib/utils/avatar.utils'

interface AuditHistoryModalProps {
   projectId?: string
   issueId?: string
   currentIssue?: TaskProps
   onCancel: () => void
}

interface EnrichedAuditItem extends AuditHistoryProps {
   issue?: TaskProps
}

export default function AuditHistory({ projectId, issueId, currentIssue, onCancel }: AuditHistoryModalProps) {
   const { getValidAccessToken } = useAuthStore()
   const { getProjectHistory } = useBoardStore()
   const { getIssueHistory, getIssues } = useIssueStore()
   
   const [historyData, setHistoryData] = useState<AuditPagination | null>(null)
   const [isLoading, setIsLoading] = useState(true)
   const [isLoadingMore, setIsLoadingMore] = useState(false)
   const [error, setError] = useState<string | null>(null)
   const [currentPage, setCurrentPage] = useState(0)
   const [hasMore, setHasMore] = useState(true)
   const [allHistoryItems, setAllHistoryItems] = useState<EnrichedAuditItem[]>([])
   const [issues, setIssues] = useState<TaskProps[]>([])
   const [dataLoaded, setDataLoaded] = useState(false)
   
   // Ref para el contenedor de scroll
   const scrollContainerRef = useRef<HTMLDivElement>(null)

   // Función para cargar datos iniciales (solo issues)
   const loadInitialData = async (token: string) => {
      if (dataLoaded) return { loadedIssues: issues }

      // Cargar issues del proyecto (solo si es historial de proyecto)
      let loadedIssues: TaskProps[] = []
      if (projectId) {
         await getIssues(token, projectId, { page: 0, size: 999 })
         const issueStore = useIssueStore.getState()
         loadedIssues = issueStore.issues.content?.filter((item): item is TaskProps => 
            item && typeof item === 'object' && 'title' in item && 'projectId' in item
         ) || []
         setIssues(loadedIssues)
      }

      setDataLoaded(true)
      return { loadedIssues }
   }

   // Función para cargar una página específica del historial
   const loadHistoryPage = async (page: number = 0, append: boolean = false) => {
      if (!hasMore && append) return
      
      if (append) {
         setIsLoadingMore(true)
      } else {
         setIsLoading(true)
      }
      setError(null)

      try {
         const token = await getValidAccessToken()
         if (!token) {
            setError('No se pudo obtener el token de autenticación')
            return
         }

         // Cargar datos iniciales solo en la primera carga
         const { loadedIssues } = await loadInitialData(token)

         // Cargar historial
         let data: AuditPagination
         if (projectId) {
            data = await getProjectHistory(token, projectId, page, 10)
         } else if (issueId) {
            data = await getIssueHistory(token, issueId, page, 10)
         } else {
            setError('Se requiere un ID de proyecto o issue')
            return
         }

         // Enriquecer los datos con información de issues
         const enrichedItems: EnrichedAuditItem[] = data.content.map(item => {
            // Buscar issue en el array local de issues cargadas (solo para historial de proyecto)
            // O usar el currentIssue si está disponible (para historial de issue específico)
            let issue: TaskProps | undefined = undefined
            if (item.issueId) {
               if (currentIssue && currentIssue.id === item.issueId) {
                  // Si tenemos el issue actual y coincide con el issueId del item, usarlo
                  issue = currentIssue
               } else if (projectId && loadedIssues.length > 0) {
                  // Si es historial de proyecto, buscar en el array de issues cargadas
                  issue = loadedIssues.find(i => i.id === item.issueId) || undefined
               }
            }

            return {
               ...item,
               issue: issue
            }
         })

         if (append) {
            setAllHistoryItems(prev => [...prev, ...enrichedItems])
         } else {
            setAllHistoryItems(enrichedItems)
         }
         
         setHistoryData(data)
         setCurrentPage(page)
         setHasMore(page < data.totalPages - 1)
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Error al cargar el historial')
      } finally {
         setIsLoading(false)
         setIsLoadingMore(false)
      }
   }

   // Función simple para cargar historial inicial
   const loadHistory = () => loadHistoryPage(0, false)

   // Función para cargar más páginas
   const loadMore = useCallback(() => {
      if (hasMore && !isLoadingMore) {
         loadHistoryPage(currentPage + 1, true)
      }
   }, [hasMore, isLoadingMore, currentPage])

   // Función para manejar el scroll y detectar cuándo cargar más
   const handleScroll = useCallback(() => {
      const container = scrollContainerRef.current
      if (!container || isLoadingMore || !hasMore) return

      const { scrollTop, scrollHeight, clientHeight } = container
      const scrolledPercentage = (scrollTop + clientHeight) / scrollHeight
      
      // Cargar más cuando se llegue al 80% del scroll
      if (scrolledPercentage >= 0.8) {
         loadMore()
      }
   }, [isLoadingMore, hasMore, loadMore])

   // Ejecutar una sola vez al montar el componente
   useEffect(() => {
      loadHistory()
   }, [])

   // Agregar el event listener para el scroll con throttling
   useEffect(() => {
      const container = scrollContainerRef.current
      if (!container) return

      let timeoutId: NodeJS.Timeout
      const throttledScroll = () => {
         clearTimeout(timeoutId)
         timeoutId = setTimeout(handleScroll, 150)
      }

      container.addEventListener('scroll', throttledScroll)
      
      return () => {
         container.removeEventListener('scroll', throttledScroll)
         clearTimeout(timeoutId)
      }
   }, [handleScroll])

   const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
         day: '2-digit',
         month: 'short',
         year: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      })
   }

   const getActionIcon = (action: string) => {
      switch (action.toLowerCase()) {
         case 'create':
         case 'created':
            return <div className="w-2 h-2 bg-green-500 rounded-full" />
         case 'update':
         case 'updated':
            return <div className="w-2 h-2 bg-blue-500 rounded-full" />
         case 'delete':
         case 'deleted':
            return <div className="w-2 h-2 bg-red-500 rounded-full" />
         case 'assign':
         case 'assigned':
            return <div className="w-2 h-2 bg-purple-500 rounded-full" />
         case 'sprint':
            return <div className="w-2 h-2 bg-orange-500 rounded-full" />
         default:
            return <div className="w-2 h-2 bg-gray-500 rounded-full" />
      }
   }

   const getActionColor = (action: string) => {
      switch (action.toLowerCase()) {
         case 'create':
         case 'created':
            return 'text-green-600'
         case 'update':
         case 'updated':
            return 'text-blue-600'
         case 'delete':
         case 'deleted':
            return 'text-red-600'
         case 'assign':
         case 'assigned':
            return 'text-purple-600'
         case 'sprint':
            return 'text-orange-600'
         default:
            return 'text-gray-600'
      }
   }

   // Componente para mostrar información del usuario
   const UserCard = ({ userBasicData }: { userBasicData?: AuditHistoryProps['userBasicDataDto'] }) => {
      if (!userBasicData) {
         return (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 w-1/2">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                     <UsersIcon size={20} />
                  </div>
                  <div>
                     <p className="text-sm font-medium text-gray-500">Usuario no encontrado</p>
                  </div>
               </div>
            </div>
         )
      }

      return (
         <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 w-1/2">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center overflow-hidden">
                  <img
                     src={getUserAvatar(userBasicData, 40)}
                     alt={`${userBasicData.firstName} ${userBasicData.lastName}`}
                     className="w-full h-full object-cover rounded-full"
                  />
               </div>
               <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-blue-900 truncate">
                     {userBasicData.firstName} {userBasicData.lastName}
                  </p>
                  <p className="text-xs text-blue-600 truncate">{userBasicData.email}</p>
               </div>
            </div>
         </div>
      )
   }

   // Componente para mostrar información de la issue
   const IssueCard = ({ issue }: { issue?: TaskProps }) => {
      if (!issue) {
         return (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 w-1/2">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-300 flex items-center justify-center">
                     <span className="text-gray-500 text-xs font-bold">N/A</span>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-gray-500">Issue no encontrada</p>
                  </div>
               </div>
            </div>
         )
      }

      return (
         <div className="bg-green-50 rounded-lg p-3 border border-green-200 w-1/2">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                  <span className="text-green-600 text-xs font-bold">
                     #{issue.id?.substring(0, 4)}
                  </span>
               </div>
               <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-green-900 truncate" title={issue.title}>
                     {issue.title}
                  </p>
                  <p className="text-xs text-green-600">
                     Issue
                  </p>
               </div>
            </div>
         </div>
      )
   }

   if (error) {
      return (
         <div className="bg-white border-gray-100 rounded-xl shadow-sm border">
            {/* Content */}
            <div className="p-6">
               <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="text-red-500 mb-4">
                     <AlertCircleIcon size={48} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el historial</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                     onClick={loadHistory}
                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                     Intentar nuevamente
                  </button>
               </div>
            </div>
         </div>
      )
   }   return (
      <div className="bg-white">
         {/* Content */}
         <div className="p-6 max-w-4xl mx-auto">
            {historyData && (
               <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                     Mostrando {allHistoryItems.length} de {historyData.totalElements} entradas
                  </div>
                  {historyData.totalElements > 0 && (
                     <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                           <div 
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ 
                                 width: `${Math.min(100, (allHistoryItems.length / historyData.totalElements) * 100)}%` 
                              }}
                           />
                        </div>
                        <span className="text-xs text-gray-500">
                           {Math.round((allHistoryItems.length / historyData.totalElements) * 100)}%
                        </span>
                     </div>
                  )}
               </div>
            )}

         <div 
            ref={scrollContainerRef}
            className="space-y-6 max-h-[60vh] overflow-y-auto"
         >
            {allHistoryItems.map((item, index) => (
               <div key={`${item.id}-${index}`} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                  {/* Header con acción y timestamp */}
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2">
                        {getActionIcon(item.action)}
                        <span className={`font-medium text-sm ${getActionColor(item.action)}`}>
                           {item.action.toUpperCase()}
                        </span>
                     </div>
                     <span className="text-xs text-gray-500">
                        {formatDate(item.timestamp)}
                     </span>
                  </div>

                  {/* Descripción */}
                  <p className="text-gray-700 text-sm mb-4">
                     {item.description}
                  </p>

                  {/* Cards de Usuario e Issue */}
                  <div className="flex items-center justify-between gap-2">
                     <UserCard userBasicData={item.userBasicDataDto} />
                     
                     <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 7l5 5-5 5" />
                        </svg>
                     </div>
                     
                     <IssueCard issue={item.issue} />
                  </div>
               </div>
            ))}

            {/* Indicador de carga para páginas adicionales */}
            {isLoadingMore && (
               <div className="py-4">
                  <div className="flex items-center justify-center gap-3 text-blue-600">
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                     <span className="text-sm">Cargando más entradas...</span>
                  </div>
               </div>
            )}

            {/* Indicador de carga inicial */}
            {isLoading && (
               <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                     <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                              <div className="h-4 bg-gray-300 rounded w-16"></div>
                           </div>
                           <div className="h-3 bg-gray-300 rounded w-20"></div>
                        </div>
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                        <div className="flex items-center justify-between gap-4">
                           <div className="bg-gray-100 rounded-lg p-3 w-48 h-16"></div>
                           <div className="w-6 h-6 bg-gray-300 rounded"></div>
                           <div className="bg-gray-100 rounded-lg p-3 w-48 h-16"></div>
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {/* Mensaje cuando no hay más elementos */}
            {!hasMore && allHistoryItems.length > 0 && (
               <div className="text-center py-4 text-gray-500 text-sm border-t">
                  <div className="flex items-center justify-center gap-2">
                     <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                     <span>No hay más entradas para mostrar</span>
                     <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
               </div>
            )}

            {/* Estado vacío */}
            {allHistoryItems.length === 0 && !isLoading && (
               <div className="flex flex-col items-center text-center py-8">
                  <div className="text-gray-300 mx-auto mb-4">
                     <ClockIcon size={48} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                     No hay historial disponible
                  </h3>
                  <p className="text-gray-600">
                     Aún no se han registrado cambios para este elemento.
                  </p>
               </div>
            )}
         </div>
      </div>
      </div>
   )
}
