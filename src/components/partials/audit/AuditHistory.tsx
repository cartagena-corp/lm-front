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

interface ChangeItem {
   field: string
   before: any
   after: any
   label: string
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
   const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

   // Ref para el contenedor de scroll
   const scrollContainerRef = useRef<HTMLDivElement>(null)

   // Toggle para expandir/contraer acordeón
   const toggleExpand = (itemId: string) => {
      setExpandedItems(prev => {
         const newSet = new Set(prev)
         if (newSet.has(itemId)) {
            newSet.delete(itemId)
         } else {
            newSet.add(itemId)
         }
         return newSet
      })
   }

   // Función para detectar cambios
   const detectChanges = (beforeChange?: TaskProps, afterChange?: TaskProps): ChangeItem[] => {
      if (!beforeChange || !afterChange) return []

      const changes: ChangeItem[] = []

      if (beforeChange.title !== afterChange.title) {
         changes.push({ field: 'title', before: beforeChange.title, after: afterChange.title, label: 'Título' })
      }

      if (JSON.stringify(beforeChange.descriptions) !== JSON.stringify(afterChange.descriptions)) {
         changes.push({
            field: 'descriptions',
            before: beforeChange.descriptions,
            after: afterChange.descriptions,
            label: 'Descripciones'
         })
      }

      if (beforeChange.priority !== afterChange.priority) {
         changes.push({ field: 'priority', before: beforeChange.priority, after: afterChange.priority, label: 'Prioridad' })
      }

      if (beforeChange.status !== afterChange.status) {
         changes.push({ field: 'status', before: beforeChange.status, after: afterChange.status, label: 'Estado' })
      }

      if (beforeChange.type !== afterChange.type) {
         changes.push({ field: 'type', before: beforeChange.type, after: afterChange.type, label: 'Tipo' })
      }

      if (beforeChange.estimatedTime !== afterChange.estimatedTime) {
         changes.push({ field: 'estimatedTime', before: beforeChange.estimatedTime, after: afterChange.estimatedTime, label: 'Tiempo Estimado' })
      }

      if (beforeChange.assignedId !== afterChange.assignedId) {
         changes.push({ field: 'assignedId', before: beforeChange.assignedId, after: afterChange.assignedId, label: 'Asignado' })
      }

      if (beforeChange.sprintId !== afterChange.sprintId) {
         changes.push({ field: 'sprintId', before: beforeChange.sprintId, after: afterChange.sprintId, label: 'Sprint' })
      }

      if (beforeChange.startDate !== afterChange.startDate) {
         changes.push({ field: 'startDate', before: beforeChange.startDate, after: afterChange.startDate, label: 'Fecha Inicio' })
      }

      if (beforeChange.endDate !== afterChange.endDate) {
         changes.push({ field: 'endDate', before: beforeChange.endDate, after: afterChange.endDate, label: 'Fecha Fin' })
      }

      if (beforeChange.realDate !== afterChange.realDate) {
         changes.push({ field: 'realDate', before: beforeChange.realDate, after: afterChange.realDate, label: 'Fecha Real de Terminación' })
      }

      if (JSON.stringify(beforeChange.subtasks) !== JSON.stringify(afterChange.subtasks)) {
         changes.push({
            field: 'subtasks',
            before: beforeChange.subtasks?.length || 0,
            after: afterChange.subtasks?.length || 0,
            label: 'Subtareas'
         })
      }

      return changes
   }

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
         case 'sprint_assign':
         case 'sprint_remove':
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
         case 'sprint_assign':
         case 'sprint_remove':
            return 'text-orange-600'
         default:
            return 'text-gray-600'
      }
   }

   // Función para renderizar valores de cambios
   const renderValue = (value: any, field: string, isCompact: boolean = false) => {
      if (value === null || value === undefined) return <span className="text-gray-400 italic">Sin definir</span>

      if (field === 'descriptions') {
         const descriptions = Array.isArray(value) ? value : []
         if (descriptions.length === 0) return <span className="text-gray-400 italic">Sin descripciones</span>

         if (isCompact) {
            return <span className="font-medium">{descriptions.length} descripción(es)</span>
         }

         return (
            <div className="space-y-2">
               {descriptions.map((desc: any, idx: number) => (
                  <div key={idx} className="text-xs bg-white p-3 rounded border border-gray-200">
                     <div className="font-semibold text-gray-800 mb-1">{desc.title}</div>
                     <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: desc.text }}></div>
                  </div>
               ))}
            </div>
         )
      }

      if (field === 'assignedId') {
         return <span className="font-medium text-gray-600 break-all">{value || 'Sin asignar'}</span>
      }

      if (field === 'startDate' || field === 'endDate' || field === 'realDate') {
         return <span className="font-mono text-sm">{value || 'Sin definir'}</span>
      }

      return <span className="font-medium break-words">{value}</span>
   }

   // Componente para el acordeón de cambios (UPDATE, CREATE, ASSIGN, etc.)
   const ActionAccordion = ({ item, isExpanded }: { item: EnrichedAuditItem, isExpanded: boolean }) => {
      const action = item.action.toUpperCase()
      const changes = detectChanges(item.beforeChange, item.afterChange)
      const mainChange = changes[0] // El primer cambio es el más importante

      // Para CREATE, mostrar solo el beforeChange como información de la nueva issue
      const isCreate = action === 'CREATE'
      const hasChanges = changes.length > 0 || isCreate

      // Obtener el color según la acción
      const getActionBgColor = () => {
         switch (action) {
            case 'CREATE': return 'bg-green-50'
            case 'UPDATE': return 'bg-blue-50'
            case 'DELETE': return 'bg-red-50'
            case 'ASSIGN': return 'bg-purple-50'
            default: return 'bg-gray-50'
         }
      }

      const getActionBorderColor = () => {
         switch (action) {
            case 'CREATE': return 'border-green-200'
            case 'UPDATE': return 'border-blue-200'
            case 'DELETE': return 'border-red-200'
            case 'ASSIGN': return 'border-purple-200'
            default: return 'border-gray-200'
         }
      }

      return (
         <div className="relative">
            <div className="space-y-0">
               {/* Vista compacta - Siempre visible */}
               <div
                  className={`p-4 border cursor-pointer transition-all ${isExpanded
                        ? 'bg-gray-50 border-gray-300 rounded-t-lg border-b-0 shadow-sm'
                        : 'bg-white border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-md'
                     }`}
                  onClick={() => toggleExpand(item.id)}
               >
                  <div className="flex items-start justify-between gap-4">
                     <div className="flex-1 space-y-3">
                        {/* Header con usuario, fecha y acción */}
                        <div className="flex items-center justify-between gap-3">
                           {/* Izquierda: Usuario y fecha */}
                           <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm flex-shrink-0">
                                 <img
                                    src={getUserAvatar(item.userBasicDataDto, 28)}
                                    alt={`${item.userBasicDataDto.firstName} ${item.userBasicDataDto.lastName}`}
                                    className="w-full h-full object-cover"
                                 />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-sm font-semibold text-gray-900 truncate">
                                    {item.userBasicDataDto.firstName} {item.userBasicDataDto.lastName}
                                 </p>
                                 <p className="text-xs text-gray-600">{formatDate(item.timestamp)}</p>
                              </div>
                           </div>

                           {/* Derecha: Acción y chevron */}
                           <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="flex items-center gap-2">
                                 {getActionIcon(item.action)}
                                 <span className={`font-medium text-xs ${getActionColor(item.action)} uppercase`}>
                                    {action}
                                 </span>
                              </div>
                              <div className="text-gray-500">
                                 {isExpanded ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                 ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                 )}
                              </div>
                           </div>
                        </div>

                        {/* Título de la issue */}
                        {(item.issueTitle && !isCreate) && (
                           <div className="text-sm font-medium text-gray-900 truncate">
                              {item.issueTitle}
                           </div>
                        )}

                        {/* Cambio principal en formato compacto - Solo para UPDATE */}
                        {!isCreate && mainChange && (
                           <div className="flex items-center gap-3 text-sm">
                              <div className="flex items-center gap-2 flex-1 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                                 <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
                                 <span className="text-red-700 truncate">{renderValue(mainChange.before, mainChange.field, true)}</span>
                              </div>
                              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                              <div className="flex items-center gap-2 flex-1 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                                 <span className="text-green-700 truncate">{renderValue(mainChange.after, mainChange.field, true)}</span>
                              </div>
                           </div>
                        )}

                        {/* Descripción compacta para CREATE */}
                        {isCreate && (
                           <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                 <div className="text-xs font-semibold text-green-700 mb-2">Nueva tarea creada</div>
                                 {/* <div className="flex items-center gap-2 text-sm">
                                 <span className="text-gray-600">De:</span>
                                 <span className="font-medium text-gray-800">{assignedChange.before || 'Sin asignar'}</span>
                                 <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                 </svg>
                                 <span className="text-gray-600">A:</span>
                                 <span className="font-medium text-purple-700">{assignedChange.after || 'Sin asignar'}</span>
                              </div> */}
                                 <div className="flex items-center text-sm">
                                    Se ha creado una nueva tarea con el título:&nbsp;<b>{item.issueTitle}</b>
                                 </div>
                              </div>
                        )}

                        {/* Indicador de más cambios - Solo para UPDATE */}
                        {!isCreate && changes.length > 1 && (
                           <div className="text-xs text-gray-700 font-medium">
                              + {changes.length - 1} cambio(s) más
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Vista expandida - Descripción y Detalles */}
               {isExpanded && (
                  <div className="border border-gray-300 rounded-b-lg overflow-hidden animate-in slide-in-from-top-2 duration-200 bg-gray-50">
                     {/* Descripción del Cambio - PRIMERO */}
                     <div className="bg-gray-50 p-4 border-b-2 border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Descripción</span>
                        </div>
                        <p className="text-sm text-gray-900 leading-relaxed">{item.description}</p>
                     </div>

                     {/* Detalles - Para CREATE mostrar información de la nueva issue */}
                     {isCreate && item.beforeChange && (
                        <div className="bg-gray-50 p-4 space-y-4">
                           <div className="flex items-center gap-2 mb-3">
                              <div className="h-px flex-1 bg-gray-300"></div>
                              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Información de la Issue Creada</span>
                              <div className="h-px flex-1 bg-gray-300"></div>
                           </div>

                           <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm space-y-3">
                              {/* Título */}
                              <div>
                                 <span className="text-xs font-semibold text-gray-600 uppercase">Título</span>
                                 <p className="text-sm text-gray-900 font-medium mt-1">{item.beforeChange.title}</p>
                              </div>

                              {/* Grid de información */}
                              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                                 <div>
                                    <span className="text-xs font-semibold text-gray-600 uppercase">Prioridad</span>
                                    <p className="text-sm text-gray-900 mt-1">{item.beforeChange.priority}</p>
                                 </div>
                                 <div>
                                    <span className="text-xs font-semibold text-gray-600 uppercase">Estado</span>
                                    <p className="text-sm text-gray-900 mt-1">{item.beforeChange.status}</p>
                                 </div>
                                 <div>
                                    <span className="text-xs font-semibold text-gray-600 uppercase">Tipo</span>
                                    <p className="text-sm text-gray-900 mt-1">{item.beforeChange.type}</p>
                                 </div>
                                 <div>
                                    <span className="text-xs font-semibold text-gray-600 uppercase">Tiempo Estimado</span>
                                    <p className="text-sm text-gray-900 mt-1">{item.beforeChange.estimatedTime}h</p>
                                 </div>
                              </div>

                              {/* Descripciones */}
                              {item.beforeChange.descriptions && item.beforeChange.descriptions.length > 0 && (
                                 <div className="pt-2 border-t border-gray-200">
                                    <span className="text-xs font-semibold text-gray-600 uppercase">Descripciones</span>
                                    <div className="space-y-2 mt-2">
                                       {item.beforeChange.descriptions.map((desc: any, idx: number) => (
                                          <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200">
                                             <div className="font-semibold text-gray-800 text-xs mb-1">{desc.title}</div>
                                             <div className="text-xs text-gray-600" dangerouslySetInnerHTML={{ __html: desc.text }}></div>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>
                     )}

                     {/* Detalles Completos - Para UPDATE y otros con cambios */}
                     {!isCreate && changes.length > 0 && (
                        <div className="bg-gray-50 p-4 space-y-4">
                           <div className="flex items-center gap-2 mb-3">
                              <div className="h-px flex-1 bg-gray-300"></div>
                              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Detalles Completos</span>
                              <div className="h-px flex-1 bg-gray-300"></div>
                           </div>

                           {changes.map((change, idx) => (
                              <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                 <div className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                                    <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                    {change.label}
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Antes */}
                                    <div className="space-y-2">
                                       <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                          <span className="text-xs font-semibold text-red-700 uppercase">Antes</span>
                                       </div>
                                       <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-sm text-red-900">
                                          {renderValue(change.before, change.field, false)}
                                       </div>
                                    </div>

                                    {/* Después */}
                                    <div className="space-y-2">
                                       <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          <span className="text-xs font-semibold text-green-700 uppercase">Después</span>
                                       </div>
                                       <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 text-sm text-green-900">
                                          {renderValue(change.after, change.field, false)}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               )}
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
   } return (
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
               {allHistoryItems.map((item, index) => {
                  const isExpanded = expandedItems.has(item.id)

                  // Usar acordeón para todas las acciones que tengan beforeChange o afterChange
                  const hasDetailedInfo = item.beforeChange || item.afterChange || item.action.toUpperCase() === 'UPDATE'

                  // Detectar tipo de acción especial
                  const actionUpper = item.action.toUpperCase()
                  const isAssignAction = actionUpper === 'ASSIGN'
                  const isDeleteAction = actionUpper === 'DELETE'
                  const isSprintRemoveAction = actionUpper === 'SPRINT_REMOVE'
                  const isSprintAssignAction = actionUpper === 'SPRINT_ASSIGN'
                  
                  const assignChanges = isAssignAction ? detectChanges(item.beforeChange, item.afterChange) : []
                  const assignedChange = assignChanges.find(c => c.field === 'assignedId')

                  return (
                     <div key={`${item.id}-${index}`}>
                        {isDeleteAction && item.beforeChange ? (
                           /* Renderizado especial para DELETE */
                           <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                              {/* Header */}
                              <div className="flex items-center justify-between gap-3 mb-3">
                                 {/* Izquierda: Usuario y fecha */}
                                 <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm flex-shrink-0">
                                       <img
                                          src={getUserAvatar(item.userBasicDataDto, 28)}
                                          alt={`${item.userBasicDataDto.firstName} ${item.userBasicDataDto.lastName}`}
                                          className="w-full h-full object-cover"
                                       />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className="text-sm font-semibold text-gray-900 truncate">
                                          {item.userBasicDataDto.firstName} {item.userBasicDataDto.lastName}
                                       </p>
                                       <p className="text-xs text-gray-600">{formatDate(item.timestamp)}</p>
                                    </div>
                                 </div>

                                 {/* Derecha: Acción */}
                                 <div className="flex items-center gap-2 flex-shrink-0">
                                    {getActionIcon(item.action)}
                                    <span className={`font-medium text-xs ${getActionColor(item.action)} uppercase`}>
                                       DELETE
                                    </span>
                                 </div>
                              </div>

                              {/* Info de la issue eliminada */}
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                 <div className="text-xs font-semibold text-red-700 mb-2">Tarea eliminada</div>
                                 <div className="space-y-2">
                                    <div className="flex items-center text-sm">
                                       <span className="text-gray-700">Se eliminó la tarea:&nbsp;<b className="text-red-700">{item.beforeChange.title}</b></span>
                                    </div>
                                    {/* <div className="text-xs text-gray-600 bg-white rounded p-2 border border-red-100">
                                       {item.description}
                                    </div> */}
                                 </div>
                              </div>
                           </div>
                        ) : isSprintRemoveAction ? (
                           /* Renderizado especial para SPRINT_REMOVE */
                           <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                              {/* Header */}
                              <div className="flex items-center justify-between gap-3 mb-3">
                                 {/* Izquierda: Usuario y fecha */}
                                 <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm flex-shrink-0">
                                       <img
                                          src={getUserAvatar(item.userBasicDataDto, 28)}
                                          alt={`${item.userBasicDataDto.firstName} ${item.userBasicDataDto.lastName}`}
                                          className="w-full h-full object-cover"
                                       />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className="text-sm font-semibold text-gray-900 truncate">
                                          {item.userBasicDataDto.firstName} {item.userBasicDataDto.lastName}
                                       </p>
                                       <p className="text-xs text-gray-600">{formatDate(item.timestamp)}</p>
                                    </div>
                                 </div>

                                 {/* Derecha: Acción */}
                                 <div className="flex items-center gap-2 flex-shrink-0">
                                    {getActionIcon(item.action)}
                                    <span className={`font-medium text-xs ${getActionColor(item.action)} uppercase`}>
                                       Sprint Remove
                                    </span>
                                 </div>
                              </div>

                              {/* Info del cambio de sprint */}
                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                 <div className="text-xs font-semibold text-orange-700 mb-2">Tarea movida al Backlog</div>
                                 <div className="flex items-center text-sm">
                                    La tarea <b className="mx-1">{item.issueTitle}</b> fue removida del sprint y enviada al Backlog
                                 </div>
                              </div>
                           </div>
                        ) : isSprintAssignAction ? (
                           /* Renderizado especial para SPRINT_ASSIGN */
                           <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                              {/* Header */}
                              <div className="flex items-center justify-between gap-3 mb-3">
                                 {/* Izquierda: Usuario y fecha */}
                                 <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm flex-shrink-0">
                                       <img
                                          src={getUserAvatar(item.userBasicDataDto, 28)}
                                          alt={`${item.userBasicDataDto.firstName} ${item.userBasicDataDto.lastName}`}
                                          className="w-full h-full object-cover"
                                       />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className="text-sm font-semibold text-gray-900 truncate">
                                          {item.userBasicDataDto.firstName} {item.userBasicDataDto.lastName}
                                       </p>
                                       <p className="text-xs text-gray-600">{formatDate(item.timestamp)}</p>
                                    </div>
                                 </div>

                                 {/* Derecha: Acción */}
                                 <div className="flex items-center gap-2 flex-shrink-0">
                                    {getActionIcon(item.action)}
                                    <span className={`font-medium text-xs ${getActionColor(item.action)} uppercase`}>
                                       Sprint Assign
                                    </span>
                                 </div>
                              </div>

                              {/* Info del cambio de sprint */}
                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                 <div className="text-xs font-semibold text-orange-700 mb-2">Tarea asignada a Sprint</div>
                                 <div className="flex items-center text-sm">
                                    La tarea <b className="mx-1">{item.issueTitle}</b> fue asignada a un sprint
                                 </div>
                              </div>
                           </div>
                        ) : isAssignAction && assignedChange ? (
                           /* Renderizado especial para ASSIGN */
                           <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                              {/* Header */}
                              <div className="flex items-center justify-between gap-3 mb-3">
                                 {/* Izquierda: Usuario y fecha */}
                                 <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm flex-shrink-0">
                                       <img
                                          src={getUserAvatar(item.userBasicDataDto, 28)}
                                          alt={`${item.userBasicDataDto.firstName} ${item.userBasicDataDto.lastName}`}
                                          className="w-full h-full object-cover"
                                       />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className="text-sm font-semibold text-gray-900 truncate">
                                          {item.userBasicDataDto.firstName} {item.userBasicDataDto.lastName}
                                       </p>
                                       <p className="text-xs text-gray-600">{formatDate(item.timestamp)}</p>
                                    </div>
                                 </div>

                                 {/* Derecha: Acción */}
                                 <div className="flex items-center gap-2 flex-shrink-0">
                                    {getActionIcon(item.action)}
                                    <span className={`font-medium text-xs ${getActionColor(item.action)} uppercase`}>
                                       ASSIGN
                                    </span>
                                 </div>
                              </div>

                              {/* Título de la issue */}
                              {/* {item.issueTitle && (
                                 <div className="text-sm font-medium text-gray-900 mb-3">
                                    {item.issueTitle}
                                 </div>
                              )} */}

                              {/* Descripción */}
                              {/* <p className="text-sm text-gray-700 mb-3">{item.description}</p> */}

                              {/* Cambio de persona asignada */}
                              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                 <div className="text-xs font-semibold text-purple-700 mb-2">Cambio de persona asignada</div>
                                 {/* <div className="flex items-center gap-2 text-sm">
                                 <span className="text-gray-600">De:</span>
                                 <span className="font-medium text-gray-800">{assignedChange.before || 'Sin asignar'}</span>
                                 <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                 </svg>
                                 <span className="text-gray-600">A:</span>
                                 <span className="font-medium text-purple-700">{assignedChange.after || 'Sin asignar'}</span>
                              </div> */}
                                 <div className="flex items-center text-sm">
                                    Se detectó un cambio en la persona asignada en la tarea:&nbsp;<b>{item.issueTitle}</b>
                                 </div>
                              </div>
                           </div>
                        ) : hasDetailedInfo ? (
                           /* Renderizado con acordeón para acciones con información detallada */
                           <ActionAccordion item={item} isExpanded={isExpanded} />
                        ) : (
                           /* Renderizado simple para otras acciones */
                           <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                              {/* Header con usuario, fecha y acción */}
                              <div className="flex items-center justify-between mb-4">
                                 {/* Izquierda: Usuario y fecha */}
                                 <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm flex-shrink-0">
                                       <img
                                          src={getUserAvatar(item.userBasicDataDto, 32)}
                                          alt={`${item.userBasicDataDto.firstName} ${item.userBasicDataDto.lastName}`}
                                          className="w-full h-full object-cover"
                                       />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className="text-sm font-semibold text-gray-900 truncate">
                                          {item.userBasicDataDto.firstName} {item.userBasicDataDto.lastName}
                                       </p>
                                       <p className="text-xs text-gray-600">{formatDate(item.timestamp)}</p>
                                    </div>
                                 </div>

                                 {/* Derecha: Acción */}
                                 <div className="flex items-center gap-2 flex-shrink-0">
                                    {getActionIcon(item.action)}
                                    <span className={`font-medium text-sm ${getActionColor(item.action)} uppercase`}>
                                       {item.action.toUpperCase()}
                                    </span>
                                 </div>
                              </div>

                              {/* Título de la issue */}
                              {item.issueTitle && (
                                 <div className="text-sm font-medium text-gray-900 mb-4">
                                    {item.issueTitle}
                                 </div>
                              )}

                              {/* Descripción */}
                              <p className="text-gray-700 text-sm mb-4">
                                 {item.description}
                              </p>

                              {/* Issue (si existe) */}
                              {item.issue && (
                                 <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3 border border-green-200">
                                    <div className="w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center flex-shrink-0">
                                       <span className="text-green-600 text-xs font-bold">Issue</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-sm font-medium text-green-900 truncate" title={item.issue.title}>
                                          {item.issue.title}
                                       </p>
                                       <p className="text-xs text-green-600">Tarea</p>
                                    </div>
                                 </div>
                              )}
                           </div>
                        )}
                     </div>
                  )
               })}

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
