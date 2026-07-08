'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AuditHistoryProps, AuditPagination, TaskProps } from '@/lib/types/types'
import { useAuthStore } from '@/lib/store/AuthStore'
import { useBoardStore } from '@/lib/store/BoardStore'
import { useIssueStore } from '@/lib/store/IssueStore'
import { Clock, AlertCircle, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react'
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

      // Cargar issues del proyecto (solo si es historial de proyecto Y NO hay issueId específico)
      let loadedIssues: TaskProps[] = []
      if (projectId && !issueId) {
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
         // Priorizar issueId sobre projectId: si hay issueId, usar historial de issue específica
         let data: AuditPagination
         if (issueId) {
            data = await getIssueHistory(token, issueId, page, 10)
         } else if (projectId) {
            data = await getProjectHistory(token, projectId, page, 10)
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
            return <div className="w-2 h-2 rounded-full" style={{ background: "var(--green-700)" }} />
         case 'update':
         case 'updated':
            return <div className="w-2 h-2 rounded-full" style={{ background: "var(--blue-700)" }} />
         case 'delete':
         case 'deleted':
            return <div className="w-2 h-2 rounded-full" style={{ background: "var(--red-700)" }} />
         case 'assign':
         case 'assigned':
            return <div className="w-2 h-2 rounded-full" style={{ background: "var(--purple-700)" }} />
         case 'sprint':
         case 'sprint_assign':
         case 'sprint_remove':
            return <div className="w-2 h-2 rounded-full" style={{ background: "var(--amber-700)" }} />
         default:
            return <div className="w-2 h-2 rounded-full" style={{ background: "var(--gray-700)" }} />
      }
   }

   const getActionColor = (action: string) => {
      switch (action.toLowerCase()) {
         case 'create':
         case 'created':
            return 'var(--green-900)'
         case 'update':
         case 'updated':
            return 'var(--blue-900)'
         case 'delete':
         case 'deleted':
            return 'var(--red-900)'
         case 'assign':
         case 'assigned':
            return 'var(--purple-900)'
         case 'sprint':
         case 'sprint_assign':
         case 'sprint_remove':
            return 'var(--amber-900)'
         default:
            return 'var(--ds-text-secondary)'
      }
   }

   // Función para renderizar valores de cambios
   const renderValue = (value: any, field: string, isCompact: boolean = false) => {
      if (value === null || value === undefined) return <span className="italic" style={{ color: "var(--ds-text-muted)" }}>Sin definir</span>

      if (field === 'descriptions') {
         const descriptions = Array.isArray(value) ? value : []
         if (descriptions.length === 0) return <span className="italic" style={{ color: "var(--ds-text-muted)" }}>Sin descripciones</span>

         if (isCompact) {
            return <span className="font-medium">{descriptions.length} descripción(es)</span>
         }

         return (
            <div className="space-y-2">
               {descriptions.map((desc: any, idx: number) => (
                  <div key={idx} className="text-xs p-3 rounded-md" style={{ background: "var(--ds-card)", border: "1px solid var(--ds-border)" }}>
                     <div className="font-medium mb-1" style={{ color: "var(--ds-text)" }}>{desc.title}</div>
                     <div style={{ color: "var(--ds-text-secondary)" }} dangerouslySetInnerHTML={{ __html: desc.text }}></div>
                  </div>
               ))}
            </div>
         )
      }

      if (field === 'assignedId') {
         return <span className="font-medium break-all" style={{ color: "var(--ds-text-secondary)" }}>{value || 'Sin asignar'}</span>
      }

      if (field === 'startDate' || field === 'endDate' || field === 'realDate') {
         return <span className="text-sm" style={{ fontFamily: "var(--font-mono)" }}>{value || 'Sin definir'}</span>
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
            case 'CREATE': return 'bg-[var(--green-100)]'
            case 'UPDATE': return 'bg-[var(--blue-100)]'
            case 'DELETE': return 'bg-[var(--red-100)]'
            case 'ASSIGN': return 'bg-[var(--purple-100)]'
            default: return 'bg-[var(--gray-alpha-100)]'
         }
      }

      const getActionBorderColor = () => {
         switch (action) {
            case 'CREATE': return 'border-[var(--green-400)]'
            case 'UPDATE': return 'border-[var(--blue-400)]'
            case 'DELETE': return 'border-[var(--red-400)]'
            case 'ASSIGN': return 'border-[var(--purple-400)]'
            default: return 'border-[var(--ds-border)]'
         }
      }

      return (
         <div className="relative">
            <div className="space-y-0">
               {/* Vista compacta - Siempre visible */}
               <div
                  className={`p-4 border cursor-pointer transition-colors duration-150 ${isExpanded
                        ? 'bg-[var(--gray-alpha-100)] border-[var(--ds-border-strong)] rounded-t-md border-b-0'
                        : 'bg-[var(--ds-card)] border-[var(--ds-border)] rounded-md hover:bg-[var(--gray-alpha-100)]'
                     }`}
                  onClick={() => toggleExpand(item.id)}
               >
                  <div className="flex items-start justify-between gap-4">
                     <div className="flex-1 space-y-3">
                        {/* Header con usuario, fecha y acción */}
                        <div className="flex items-center justify-between gap-3">
                           {/* Izquierda: Usuario y fecha */}
                           <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0" style={{ border: "1px solid var(--ds-border)" }}>
                                 <img
                                    src={getUserAvatar(item.userBasicDataDto, 28)}
                                    alt={`${item.userBasicDataDto.firstName} ${item.userBasicDataDto.lastName}`}
                                    className="w-full h-full object-cover"
                                 />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-sm font-medium truncate" style={{ color: "var(--ds-text)" }}>
                                    {item.userBasicDataDto.firstName} {item.userBasicDataDto.lastName}
                                 </p>
                                 <p className="text-xs" style={{ color: "var(--ds-text-muted)" }}>{formatDate(item.timestamp)}</p>
                              </div>
                           </div>

                           {/* Derecha: Acción y chevron */}
                           <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="flex items-center gap-2">
                                 {getActionIcon(item.action)}
                                 <span className="font-medium text-xs uppercase" style={{ color: getActionColor(item.action) }}>
                                    {action}
                                 </span>
                              </div>
                              <div style={{ color: "var(--ds-text-muted)" }}>
                                 {isExpanded ? (
                                    <ChevronUp size={20} strokeWidth={2} />
                                 ) : (
                                    <ChevronDown size={20} strokeWidth={2} />
                                 )}
                              </div>
                           </div>
                        </div>

                        {/* Título de la issue */}
                        {(item.issueTitle && !isCreate) && (
                           <div className="text-sm font-medium truncate" style={{ color: "var(--ds-text)" }}>
                              {item.issueTitle}
                           </div>
                        )}

                        {/* Cambio principal en formato compacto - Solo para UPDATE */}
                        {!isCreate && mainChange && (
                           <div className="flex items-center gap-3 text-sm">
                              <div className="flex items-center gap-2 flex-1 rounded-md px-3 py-2" style={{ background: "var(--red-100)", border: "1px solid var(--red-400)" }}>
                                 <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--red-700)" }}></div>
                                 <span className="truncate" style={{ color: "var(--red-900)" }}>{renderValue(mainChange.before, mainChange.field, true)}</span>
                              </div>
                              <ArrowRight size={20} strokeWidth={2} className="flex-shrink-0" style={{ color: "var(--ds-text-muted)" }} />
                              <div className="flex items-center gap-2 flex-1 rounded-md px-3 py-2" style={{ background: "var(--green-100)", border: "1px solid var(--green-400)" }}>
                                 <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--green-700)" }}></div>
                                 <span className="truncate" style={{ color: "var(--green-900)" }}>{renderValue(mainChange.after, mainChange.field, true)}</span>
                              </div>
                           </div>
                        )}

                        {/* Descripción compacta para CREATE */}
                        {isCreate && (
                           <div className="rounded-md p-3" style={{ background: "var(--green-100)", border: "1px solid var(--green-400)", color: "var(--green-900)" }}>
                                 <div className="text-xs font-medium mb-2">Nueva tarea creada</div>
                                 {/* <div className="flex items-center gap-2 text-sm">
                                 <span className="text-[var(--ds-text-secondary)]">De:</span>
                                 <span className="font-medium text-[var(--ds-text)]">{assignedChange.before || 'Sin asignar'}</span>
                                 <svg className="w-4 h-4 text-[var(--ds-text-muted)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                 </svg>
                                 <span className="text-[var(--ds-text-secondary)]">A:</span>
                                 <span className="font-medium text-[var(--purple-700)]">{assignedChange.after || 'Sin asignar'}</span>
                              </div> */}
                                 <div className="flex items-center text-sm">
                                    Se ha creado una nueva tarea con el título:&nbsp;<b>{item.issueTitle}</b>
                                 </div>
                              </div>
                        )}

                        {/* Indicador de más cambios - Solo para UPDATE */}
                        {!isCreate && changes.length > 1 && (
                           <div className="text-xs font-medium" style={{ color: "var(--ds-text-secondary)" }}>
                              + {changes.length - 1} cambio(s) más
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Vista expandida - Descripción y Detalles */}
               {isExpanded && (
                  <div className="rounded-b-md overflow-hidden animate-in slide-in-from-top-2 duration-200" style={{ border: "1px solid var(--ds-border-strong)", background: "var(--gray-alpha-100)" }}>
                     {/* Descripción del Cambio - PRIMERO */}
                     <div className="p-4" style={{ borderBottom: "1px solid var(--ds-border)" }}>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--ds-text-secondary)" }}>Descripción</span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--ds-text)" }}>{item.description}</p>
                     </div>

                     {/* Detalles - Para CREATE mostrar información de la nueva issue */}
                     {isCreate && item.beforeChange && (
                        <div className="p-4 space-y-4">
                           <div className="flex items-center gap-2 mb-3">
                              <div className="h-px flex-1" style={{ background: "var(--ds-border)" }}></div>
                              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--ds-text-secondary)" }}>Información de la Issue Creada</span>
                              <div className="h-px flex-1" style={{ background: "var(--ds-border)" }}></div>
                           </div>

                           <div className="rounded-md p-4 space-y-3" style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                              {/* Título */}
                              <div>
                                 <span className="text-xs font-medium uppercase" style={{ color: "var(--ds-text-muted)" }}>Título</span>
                                 <p className="text-sm font-medium mt-1" style={{ color: "var(--ds-text)" }}>{item.beforeChange.title}</p>
                              </div>

                              {/* Grid de información */}
                              <div className="grid grid-cols-2 gap-3 pt-2" style={{ borderTop: "1px solid var(--ds-border)" }}>
                                 <div>
                                    <span className="text-xs font-medium uppercase" style={{ color: "var(--ds-text-muted)" }}>Prioridad</span>
                                    <p className="text-sm mt-1" style={{ color: "var(--ds-text)" }}>{item.beforeChange.priority}</p>
                                 </div>
                                 <div>
                                    <span className="text-xs font-medium uppercase" style={{ color: "var(--ds-text-muted)" }}>Estado</span>
                                    <p className="text-sm mt-1" style={{ color: "var(--ds-text)" }}>{item.beforeChange.status}</p>
                                 </div>
                                 <div>
                                    <span className="text-xs font-medium uppercase" style={{ color: "var(--ds-text-muted)" }}>Tipo</span>
                                    <p className="text-sm mt-1" style={{ color: "var(--ds-text)" }}>{item.beforeChange.type}</p>
                                 </div>
                                 <div>
                                    <span className="text-xs font-medium uppercase" style={{ color: "var(--ds-text-muted)" }}>Tiempo Estimado</span>
                                    <p className="text-sm mt-1" style={{ color: "var(--ds-text)" }}>{item.beforeChange.estimatedTime}h</p>
                                 </div>
                              </div>

                              {/* Descripciones */}
                              {item.beforeChange.descriptions && item.beforeChange.descriptions.length > 0 && (
                                 <div className="pt-2" style={{ borderTop: "1px solid var(--ds-border)" }}>
                                    <span className="text-xs font-medium uppercase" style={{ color: "var(--ds-text-muted)" }}>Descripciones</span>
                                    <div className="space-y-2 mt-2">
                                       {item.beforeChange.descriptions.map((desc: any, idx: number) => (
                                          <div key={idx} className="p-3 rounded-md" style={{ background: "var(--gray-alpha-100)", border: "1px solid var(--ds-border)" }}>
                                             <div className="font-medium text-xs mb-1" style={{ color: "var(--ds-text)" }}>{desc.title}</div>
                                             <div className="text-xs" style={{ color: "var(--ds-text-secondary)" }} dangerouslySetInnerHTML={{ __html: desc.text }}></div>
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
                        <div className="p-4 space-y-4">
                           <div className="flex items-center gap-2 mb-3">
                              <div className="h-px flex-1" style={{ background: "var(--ds-border)" }}></div>
                              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--ds-text-secondary)" }}>Detalles Completos</span>
                              <div className="h-px flex-1" style={{ background: "var(--ds-border)" }}></div>
                           </div>

                           {changes.map((change, idx) => (
                              <div key={idx} className="rounded-md p-4" style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                                 <div className="text-xs font-medium mb-3 uppercase tracking-wide flex items-center gap-2" style={{ color: "var(--ds-text-secondary)" }}>
                                    <div className="w-1 h-4 rounded-full" style={{ background: "var(--blue-700)" }}></div>
                                    {change.label}
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Antes */}
                                    <div className="space-y-2">
                                       <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full" style={{ background: "var(--red-700)" }}></div>
                                          <span className="text-xs font-medium uppercase" style={{ color: "var(--red-900)" }}>Antes</span>
                                       </div>
                                       <div className="rounded-md p-3 text-sm" style={{ background: "var(--red-100)", border: "1px solid var(--red-400)", color: "var(--red-900)" }}>
                                          {renderValue(change.before, change.field, false)}
                                       </div>
                                    </div>

                                    {/* Después */}
                                    <div className="space-y-2">
                                       <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full" style={{ background: "var(--green-700)" }}></div>
                                          <span className="text-xs font-medium uppercase" style={{ color: "var(--green-900)" }}>Después</span>
                                       </div>
                                       <div className="rounded-md p-3 text-sm" style={{ background: "var(--green-100)", border: "1px solid var(--green-400)", color: "var(--green-900)" }}>
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
         <div className="rounded-md" style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
            {/* Content */}
            <div className="p-6">
               <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4" style={{ color: "var(--ds-error)" }}>
                     <AlertCircle size={48} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-medium mb-2" style={{ color: "var(--ds-text)" }}>Error al cargar el historial</h3>
                  <p className="text-[13px] mb-4" style={{ color: "var(--ds-text-secondary)" }}>{error}</p>
                  <button
                     onClick={loadHistory}
                     className="h-9 px-4 rounded-md text-sm font-medium transition-colors bg-[var(--primary-700)] hover:bg-[var(--primary-800)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                     style={{ color: "var(--primary-contrast-fg)" }}
                  >
                     Intentar nuevamente
                  </button>
               </div>
            </div>
         </div>
      )
   } return (
      <div style={{ color: "var(--ds-text)" }}>
         {/* Content */}
         <div className="py-4">
            {historyData && (
               <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm" style={{ color: "var(--ds-text-secondary)" }}>
                     Mostrando {allHistoryItems.length} de {historyData.totalElements} entradas
                  </div>
                  {historyData.totalElements > 0 && (
                     <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: "var(--gray-alpha-200)" }}>
                           <div
                              className="h-full transition-all duration-300"
                              style={{
                                 background: "var(--blue-700)",
                                 width: `${Math.min(100, (allHistoryItems.length / historyData.totalElements) * 100)}%`
                              }}
                           />
                        </div>
                        <span className="text-xs" style={{ color: "var(--ds-text-muted)" }}>
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
                           <div className="rounded-md p-4 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-md)] transition-shadow duration-150" style={{ background: "var(--ds-card)" }}>
                              {/* Header */}
                              <div className="flex items-center justify-between gap-3 mb-3">
                                 {/* Izquierda: Usuario y fecha */}
                                 <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0" style={{ border: "1px solid var(--ds-border)" }}>
                                       <img
                                          src={getUserAvatar(item.userBasicDataDto, 28)}
                                          alt={`${item.userBasicDataDto.firstName} ${item.userBasicDataDto.lastName}`}
                                          className="w-full h-full object-cover"
                                       />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className="text-sm font-medium truncate" style={{ color: "var(--ds-text)" }}>
                                          {item.userBasicDataDto.firstName} {item.userBasicDataDto.lastName}
                                       </p>
                                       <p className="text-xs" style={{ color: "var(--ds-text-muted)" }}>{formatDate(item.timestamp)}</p>
                                    </div>
                                 </div>

                                 {/* Derecha: Acción */}
                                 <div className="flex items-center gap-2 flex-shrink-0">
                                    {getActionIcon(item.action)}
                                    <span className="font-medium text-xs uppercase" style={{ color: getActionColor(item.action) }}>
                                       DELETE
                                    </span>
                                 </div>
                              </div>

                              {/* Info de la issue eliminada */}
                              <div className="rounded-md p-3" style={{ background: "var(--red-100)", border: "1px solid var(--red-400)" }}>
                                 <div className="text-xs font-medium mb-2" style={{ color: "var(--red-900)" }}>Tarea eliminada</div>
                                 <div className="space-y-2">
                                    <div className="flex items-center text-sm">
                                       <span style={{ color: "var(--red-900)" }}>Se eliminó la tarea:&nbsp;<b>{item.beforeChange.title}</b></span>
                                    </div>
                                    {/* <div className="text-xs text-[var(--ds-text-secondary)] bg-[var(--ds-card)] rounded p-2 border border-[var(--red-100)]">
                                       {item.description}
                                    </div> */}
                                 </div>
                              </div>
                           </div>
                        ) : isSprintRemoveAction ? (
                           /* Renderizado especial para SPRINT_REMOVE */
                           <div className="rounded-md p-4 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-md)] transition-shadow duration-150" style={{ background: "var(--ds-card)" }}>
                              {/* Header */}
                              <div className="flex items-center justify-between gap-3 mb-3">
                                 {/* Izquierda: Usuario y fecha */}
                                 <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0" style={{ border: "1px solid var(--ds-border)" }}>
                                       <img
                                          src={getUserAvatar(item.userBasicDataDto, 28)}
                                          alt={`${item.userBasicDataDto.firstName} ${item.userBasicDataDto.lastName}`}
                                          className="w-full h-full object-cover"
                                       />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className="text-sm font-medium truncate" style={{ color: "var(--ds-text)" }}>
                                          {item.userBasicDataDto.firstName} {item.userBasicDataDto.lastName}
                                       </p>
                                       <p className="text-xs" style={{ color: "var(--ds-text-muted)" }}>{formatDate(item.timestamp)}</p>
                                    </div>
                                 </div>

                                 {/* Derecha: Acción */}
                                 <div className="flex items-center gap-2 flex-shrink-0">
                                    {getActionIcon(item.action)}
                                    <span className="font-medium text-xs uppercase" style={{ color: getActionColor(item.action) }}>
                                       Sprint Remove
                                    </span>
                                 </div>
                              </div>

                              {/* Info del cambio de sprint */}
                              <div className="rounded-md p-3" style={{ background: "var(--amber-100)", border: "1px solid var(--amber-400)", color: "var(--amber-900)" }}>
                                 <div className="text-xs font-medium mb-2">Tarea movida al Backlog</div>
                                 <div className="flex items-center text-sm">
                                    La tarea <b className="mx-1">{item.issueTitle}</b> fue removida del sprint y enviada al Backlog
                                 </div>
                              </div>
                           </div>
                        ) : isSprintAssignAction ? (
                           /* Renderizado especial para SPRINT_ASSIGN */
                           <div className="rounded-md p-4 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-md)] transition-shadow duration-150" style={{ background: "var(--ds-card)" }}>
                              {/* Header */}
                              <div className="flex items-center justify-between gap-3 mb-3">
                                 {/* Izquierda: Usuario y fecha */}
                                 <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0" style={{ border: "1px solid var(--ds-border)" }}>
                                       <img
                                          src={getUserAvatar(item.userBasicDataDto, 28)}
                                          alt={`${item.userBasicDataDto.firstName} ${item.userBasicDataDto.lastName}`}
                                          className="w-full h-full object-cover"
                                       />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className="text-sm font-medium truncate" style={{ color: "var(--ds-text)" }}>
                                          {item.userBasicDataDto.firstName} {item.userBasicDataDto.lastName}
                                       </p>
                                       <p className="text-xs" style={{ color: "var(--ds-text-muted)" }}>{formatDate(item.timestamp)}</p>
                                    </div>
                                 </div>

                                 {/* Derecha: Acción */}
                                 <div className="flex items-center gap-2 flex-shrink-0">
                                    {getActionIcon(item.action)}
                                    <span className="font-medium text-xs uppercase" style={{ color: getActionColor(item.action) }}>
                                       Sprint Assign
                                    </span>
                                 </div>
                              </div>

                              {/* Info del cambio de sprint */}
                              <div className="rounded-md p-3" style={{ background: "var(--amber-100)", border: "1px solid var(--amber-400)", color: "var(--amber-900)" }}>
                                 <div className="text-xs font-medium mb-2">Tarea asignada a Sprint</div>
                                 <div className="flex items-center text-sm">
                                    La tarea <b className="mx-1">{item.issueTitle}</b> fue asignada a un sprint
                                 </div>
                              </div>
                           </div>
                        ) : isAssignAction && assignedChange ? (
                           /* Renderizado especial para ASSIGN */
                           <div className="rounded-md p-4 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-md)] transition-shadow duration-150" style={{ background: "var(--ds-card)" }}>
                              {/* Header */}
                              <div className="flex items-center justify-between gap-3 mb-3">
                                 {/* Izquierda: Usuario y fecha */}
                                 <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0" style={{ border: "1px solid var(--ds-border)" }}>
                                       <img
                                          src={getUserAvatar(item.userBasicDataDto, 28)}
                                          alt={`${item.userBasicDataDto.firstName} ${item.userBasicDataDto.lastName}`}
                                          className="w-full h-full object-cover"
                                       />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className="text-sm font-medium truncate" style={{ color: "var(--ds-text)" }}>
                                          {item.userBasicDataDto.firstName} {item.userBasicDataDto.lastName}
                                       </p>
                                       <p className="text-xs" style={{ color: "var(--ds-text-muted)" }}>{formatDate(item.timestamp)}</p>
                                    </div>
                                 </div>

                                 {/* Derecha: Acción */}
                                 <div className="flex items-center gap-2 flex-shrink-0">
                                    {getActionIcon(item.action)}
                                    <span className="font-medium text-xs uppercase" style={{ color: getActionColor(item.action) }}>
                                       ASSIGN
                                    </span>
                                 </div>
                              </div>

                              {/* Título de la issue */}
                              {/* {item.issueTitle && (
                                 <div className="text-sm font-medium text-[var(--ds-text)] mb-3">
                                    {item.issueTitle}
                                 </div>
                              )} */}

                              {/* Descripción */}
                              {/* <p className="text-sm text-[var(--ds-text-secondary)] mb-3">{item.description}</p> */}

                              {/* Cambio de persona asignada */}
                              <div className="rounded-md p-3" style={{ background: "var(--purple-100)", border: "1px solid var(--purple-400)", color: "var(--purple-900)" }}>
                                 <div className="text-xs font-medium mb-2">Cambio de persona asignada</div>
                                 {/* <div className="flex items-center gap-2 text-sm">
                                 <span className="text-[var(--ds-text-secondary)]">De:</span>
                                 <span className="font-medium text-[var(--ds-text)]">{assignedChange.before || 'Sin asignar'}</span>
                                 <svg className="w-4 h-4 text-[var(--ds-text-muted)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                 </svg>
                                 <span className="text-[var(--ds-text-secondary)]">A:</span>
                                 <span className="font-medium text-[var(--purple-700)]">{assignedChange.after || 'Sin asignar'}</span>
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
                           <div className="rounded-md p-6 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-md)] transition-shadow duration-150" style={{ background: "var(--ds-card)" }}>
                              {/* Header con usuario, fecha y acción */}
                              <div className="flex items-center justify-between mb-4">
                                 {/* Izquierda: Usuario y fecha */}
                                 <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ border: "1px solid var(--ds-border)" }}>
                                       <img
                                          src={getUserAvatar(item.userBasicDataDto, 32)}
                                          alt={`${item.userBasicDataDto.firstName} ${item.userBasicDataDto.lastName}`}
                                          className="w-full h-full object-cover"
                                       />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className="text-sm font-medium truncate" style={{ color: "var(--ds-text)" }}>
                                          {item.userBasicDataDto.firstName} {item.userBasicDataDto.lastName}
                                       </p>
                                       <p className="text-xs" style={{ color: "var(--ds-text-muted)" }}>{formatDate(item.timestamp)}</p>
                                    </div>
                                 </div>

                                 {/* Derecha: Acción */}
                                 <div className="flex items-center gap-2 flex-shrink-0">
                                    {getActionIcon(item.action)}
                                    <span className="font-medium text-sm uppercase" style={{ color: getActionColor(item.action) }}>
                                       {item.action.toUpperCase()}
                                    </span>
                                 </div>
                              </div>

                              {/* Título de la issue */}
                              {item.issueTitle && (
                                 <div className="text-sm font-medium mb-4" style={{ color: "var(--ds-text)" }}>
                                    {item.issueTitle}
                                 </div>
                              )}

                              {/* Descripción */}
                              <p className="text-sm mb-4" style={{ color: "var(--ds-text-secondary)" }}>
                                 {item.description}
                              </p>

                              {/* Issue (si existe) */}
                              {item.issue && (
                                 <div className="flex items-center gap-3 rounded-md p-3" style={{ background: "var(--green-100)", border: "1px solid var(--green-400)" }}>
                                    <div className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "var(--green-200)" }}>
                                       <span className="text-xs font-medium" style={{ color: "var(--green-900)" }}>Issue</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-sm font-medium truncate" style={{ color: "var(--green-900)" }} title={item.issue.title}>
                                          {item.issue.title}
                                       </p>
                                       <p className="text-xs" style={{ color: "var(--green-900)" }}>Tarea</p>
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
                     <div className="flex items-center justify-center gap-3" style={{ color: "var(--blue-700)" }}>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--blue-700)]"></div>
                        <span className="text-sm">Cargando más entradas...</span>
                     </div>
                  </div>
               )}

               {/* Indicador de carga inicial */}
               {isLoading && (
                  <div className="space-y-6">
                     {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-md p-6 animate-pulse" style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 rounded-full" style={{ background: "var(--gray-alpha-300)" }}></div>
                                 <div className="h-4 rounded w-16" style={{ background: "var(--gray-alpha-200)" }}></div>
                              </div>
                              <div className="h-3 rounded w-20" style={{ background: "var(--gray-alpha-200)" }}></div>
                           </div>
                           <div className="h-4 rounded w-3/4 mb-4" style={{ background: "var(--gray-alpha-200)" }}></div>
                           <div className="flex items-center justify-between gap-4">
                              <div className="rounded-md p-3 w-48 h-16" style={{ background: "var(--gray-alpha-100)" }}></div>
                              <div className="w-6 h-6 rounded" style={{ background: "var(--gray-alpha-200)" }}></div>
                              <div className="rounded-md p-3 w-48 h-16" style={{ background: "var(--gray-alpha-100)" }}></div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}

               {/* Mensaje cuando no hay más elementos */}
               {!hasMore && allHistoryItems.length > 0 && (
                  <div className="text-center py-4 text-sm" style={{ color: "var(--ds-text-muted)", borderTop: "1px solid var(--ds-border)" }}>
                     <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: "var(--gray-alpha-300)" }}></div>
                        <span>No hay más entradas para mostrar</span>
                        <div className="w-2 h-2 rounded-full" style={{ background: "var(--gray-alpha-300)" }}></div>
                     </div>
                  </div>
               )}

               {/* Estado vacío */}
               {allHistoryItems.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center text-center py-8">
                     <div className="mx-auto mb-4" style={{ color: "var(--ds-text-muted)" }}>
                        <Clock size={48} strokeWidth={1.5} />
                     </div>
                     <h3 className="text-sm font-medium mb-2" style={{ color: "var(--ds-text-secondary)" }}>
                        No hay historial disponible
                     </h3>
                     <p className="text-[13px]" style={{ color: "var(--ds-text-muted)" }}>
                        Aún no se han registrado cambios para este elemento.
                     </p>
                  </div>
               )}
            </div>
         </div>
      </div>
   )
}
