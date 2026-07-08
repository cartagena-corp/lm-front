'use client'

import BoardCard, { BoardCardSkeleton } from '@/components/partials/boards/BoardCard'
import FilterProjectForm from '@/components/partials/boards/FilterProjectForm'
import { FilterProjectProps, ProjectProps } from '@/lib/types/types'
import CreateBoardForm from '@/components/partials/boards/CreateBoardForm'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { useBoardStore } from '@/lib/store/BoardStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import EmptyState from '@/components/ui/EmptyState'
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll'
import { LayoutDashboard, Filter, Plus } from 'lucide-react'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useModalStore } from '@/lib/hooks/ModalStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { Live3_PieChartLabels } from '@/components/partials/audit/PieChart'

function TablerosContent() {
   const { boards, getBoards, createBoard, importFromJira, isLoading, isLoadingMore, hasMoreBoards, error } = useBoardStore()
   const [currentFilters, setCurrentFilters] = useState<FilterProjectProps | null>(null)
   const { getValidAccessToken, isAuthenticated } = useAuthStore((state) => state)
   const { setConfig } = useConfigStore()
   const router = useRouter()
   const searchParams = useSearchParams()

   // Función para obtener filtros desde search params
   const getFiltersFromSearchParams = (): FilterProjectProps | null => {
      const name = searchParams.get('name') || ''
      const status = searchParams.get('status') ? parseInt(searchParams.get('status')!) : 0
      const createdBy = searchParams.get('createdBy') || ''
      const sortById = searchParams.get('sortBy') || 'createdAt'
      const sortByName = searchParams.get('sortByName') || 'Fecha de creación'
      const direction = searchParams.get('direction') || 'asc'

      // Si no hay ningún parámetro en la URL, retornar null
      if (!searchParams.toString()) {
         return null
      }

      return {
         name,
         status,
         createdBy,
         page: 0, // Siempre empezar en página 0
         size: 10, // Tamaño por defecto
         sortBy: { id: sortById, sort: sortByName },
         direction
      }
   }

   // Función para actualizar la URL con los filtros (sin page y size)
   const updateSearchParams = (filters: FilterProjectProps) => {
      const params = new URLSearchParams()

      if (filters.name) params.set('name', filters.name)
      if (filters.status) params.set('status', filters.status.toString())
      if (filters.createdBy) params.set('createdBy', filters.createdBy)
      // No incluir page y size en la URL
      if (filters.sortBy?.id) params.set('sortBy', filters.sortBy.id)
      if (filters.sortBy?.sort) params.set('sortByName', filters.sortBy.sort)
      if (filters.direction) params.set('direction', filters.direction)

      router.push(`?${params.toString()}`, { scroll: false })
   }

   // Función para crear un nuevo tablero utilizando un token validado
   const handleCreateBoard = async (newBoard: ProjectProps, jiraImport: File | null) => {
      try {
         const token = await getValidAccessToken()
         if (!token) {
            console.error('No se pudo obtener un token válido')
            return
         }

         const statusId = typeof newBoard.status === 'object' ? newBoard.status.id : newBoard.status

         // Only send necessary fields for board creation
         const boardData = {
            name: newBoard.name,
            description: newBoard.description,
            startDate: newBoard.startDate,
            endDate: newBoard.endDate,
            status: statusId
         }

         if (jiraImport) {
            await importFromJira(token, boardData, jiraImport)
         } else {
            await createBoard(token, boardData)
         }
      } catch (error) {
         console.error('Error creando tablero:', error)
      } finally {
         closeModal()
      }
   }

   // Cargar configuración inicial y tableros
   useEffect(() => {
      const initializeData = async () => {
         if (!isAuthenticated) return

         try {
            const token = await getValidAccessToken()
            if (!token) return

            // Obtener filtros desde la URL
            const filtersFromUrl = getFiltersFromSearchParams()

            if (filtersFromUrl) {
               setCurrentFilters(filtersFromUrl)

               // Transform FilterProjectProps to BoardFilters
               const boardFilters = {
                  name: filtersFromUrl.name || undefined,
                  status: filtersFromUrl.status || undefined,
                  createdBy: filtersFromUrl.createdBy || undefined,
                  page: filtersFromUrl.page || undefined,
                  size: filtersFromUrl.size || undefined,
                  sortBy: filtersFromUrl.sortBy?.id === 'createdAt' || filtersFromUrl.sortBy?.id === 'updatedAt'
                     ? filtersFromUrl.sortBy.id as 'createdAt' | 'updatedAt'
                     : 'createdAt' as 'createdAt' | 'updatedAt',
                  direction: filtersFromUrl.direction === 'asc' || filtersFromUrl.direction === 'desc'
                     ? filtersFromUrl.direction as 'asc' | 'desc'
                     : 'asc' as 'asc' | 'desc'
               }

               // Ejecutar configuración inicial y carga de tableros con filtros en paralelo
               await Promise.all([
                  getBoards(token, boardFilters),
                  setConfig(token)
               ])
            } else {
               // Ejecutar configuración inicial y carga de tableros sin filtros en paralelo
               // (por defecto se ordena de forma ascendente)
               setCurrentFilters(null)
               await Promise.all([
                  getBoards(token, { direction: 'asc' }),
                  setConfig(token)
               ])
            }
         } catch (error) {
            console.error('Error inicializando datos:', error)
         }
      }

      initializeData()
      // Re-ejecuta cuando cambia la URL (p. ej. búsqueda desde la barra superior: /tableros?name=...)
   }, [isAuthenticated, getBoards, getValidAccessToken, setConfig, searchParams])

   const handleFilter = async (filters: FilterProjectProps) => {
      try {
         setCurrentFilters(filters)

         const token = await getValidAccessToken()
         if (!token) {
            console.error('No se pudo obtener un token válido')
            return
         }

         // Transform FilterProjectProps to BoardFilters
         const boardFilters = {
            name: filters.name || undefined,
            status: filters.status || undefined,
            createdBy: filters.createdBy || undefined,
            page: filters.page || undefined,
            size: filters.size || undefined,
            sortBy: filters.sortBy?.id === 'createdAt' || filters.sortBy?.id === 'updatedAt'
               ? filters.sortBy.id as 'createdAt' | 'updatedAt'
               : 'createdAt' as 'createdAt' | 'updatedAt',
            direction: filters.direction === 'asc' || filters.direction === 'desc'
               ? filters.direction as 'asc' | 'desc'
               : 'asc' as 'asc' | 'desc'
         }

         // Actualizar la URL con los filtros
         updateSearchParams(filters)

         await getBoards(token, boardFilters)
         closeModal()
      } catch (error) {
         console.error('Error aplicando filtros:', error)
      }
   }

   // Infinite scroll: carga la siguiente página y la concatena a boards.content
   // en lugar de reemplazarla (ver getBoards(token, filters, append=true) en BoardStore)
   const handleLoadMore = useCallback(async () => {
      try {
         const token = await getValidAccessToken()
         if (!token) {
            console.error('No se pudo obtener un token válido')
            return
         }

         const nextPage = boards.number + 1
         const updatedFilters = currentFilters ? {
            ...currentFilters,
            page: nextPage
         } : {
            name: "",
            status: 0,
            createdBy: "",
            page: nextPage,
            size: 10,
            sortBy: { id: "createdAt", sort: "Fecha de creación" },
            direction: "asc"
         }

         const boardFilters = {
            name: updatedFilters.name || undefined,
            status: updatedFilters.status || undefined,
            createdBy: updatedFilters.createdBy || undefined,
            page: updatedFilters.page || undefined,
            size: updatedFilters.size || 12,
            sortBy: updatedFilters.sortBy?.id === 'createdAt' || updatedFilters.sortBy?.id === 'updatedAt'
               ? updatedFilters.sortBy.id as 'createdAt' | 'updatedAt'
               : 'createdAt' as 'createdAt' | 'updatedAt',
            direction: updatedFilters.direction === 'asc' || updatedFilters.direction === 'desc'
               ? updatedFilters.direction as 'asc' | 'desc'
               : 'asc' as 'asc' | 'desc'
         }

         await getBoards(token, boardFilters, true)
      } catch (error) {
         console.error('Error cargando más tableros:', error)
      }
   }, [boards.number, currentFilters, getValidAccessToken, getBoards])

   useInfiniteScroll({
      loading: isLoading || isLoadingMore,
      hasMore: hasMoreBoards,
      onLoadMore: handleLoadMore,
      threshold: 200
   })

   const { openModal, closeModal } = useModalStore()

   const handleCreateBoardModal = () => {
      openModal({
         size: "lg",
         title: "Crear Nuevo Tablero",
         desc: "Completa los detalles del nuevo tablero",
         Icon: <Plus size={20} strokeWidth={1.75} />,
         children: <CreateBoardForm onSubmit={handleCreateBoard} onCancel={() => closeModal()} />,
         closeOnBackdrop: false,
         closeOnEscape: false,

      })
   }

   const handleFilterBoardModal = () => {
      openModal({
         size: "md",
         title: "Filtrar tableros",
         desc: "Encuentra tableros específicos usando los filtros",
         Icon: <Filter size={20} strokeWidth={1.75} />,
         children: <FilterProjectForm onSubmit={handleFilter} onCancel={() => closeModal()} initialFilters={getFiltersFromSearchParams()} />,
         closeOnBackdrop: false,
         closeOnEscape: false,

         mode: "UPDATE"
      })
   }

   // const [mensajePrueba, setMensajePrueba] = useState("")
   // const [archivosPrueba, setArchivosPrueba] = useState<File[]>([])
   // const handleRemoveFile = (index: number) => {
   //    setArchivosPrueba(prev => prev.filter((_, i) => i !== index))
   // }

   return (
      <>
         {/* 
         <TextArea
            title="Mensaje de prueba (no relacionado con tableros)"
            placeholder="Escribe un mensaje..."
            value={mensajePrueba}
            onChange={(value) => setMensajePrueba(value)}
            files={archivosPrueba}
            onFilesChange={setArchivosPrueba}
            onRemoveFile={handleRemoveFile}
         />

         {JSON.stringify(mensajePrueba)} 
         */}
         <div>
         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-4">
            <div>
               <h1 className="font-semibold" style={{ fontSize: 28, letterSpacing: "-1.1px", color: "var(--ds-text)", margin: "0 0 4px" }}>Tableros</h1>
               <p style={{ fontSize: 14, color: "var(--ds-text-secondary)", margin: 0 }}>
                  {boards.totalElements ?? boards.content?.length ?? 0} proyectos · organiza tu trabajo en sprints
               </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
               {currentFilters && (
                  <button
                     onClick={async () => {
                        setCurrentFilters(null)
                        router.push('/tableros', { scroll: false })
                        const token = await getValidAccessToken()
                        if (token) {
                           await getBoards(token)
                        }
                     }}
                     className="flex items-center justify-center gap-2 transition-colors text-sm font-medium hover:bg-[var(--red-100)] hover:text-[var(--red-900)]"
                     style={{ height: 36, padding: "0 12px", color: "var(--red-700)", background: "var(--ds-background)", border: "1px solid var(--red-400)", borderRadius: "var(--radius-md)" }}
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                     </svg>
                     <span className="hidden sm:inline">Limpiar filtros</span>
                     <span className="sm:hidden">Limpiar</span>
                  </button>
               )}
               <button
                  onClick={() => handleFilterBoardModal()}
                  className="flex items-center justify-center gap-[7px] transition-colors text-sm font-medium hover:bg-[var(--gray-alpha-100)]"
                  style={{ height: 36, padding: "0 12px", color: "var(--ds-text)", background: "var(--ds-background)", border: "1px solid var(--ds-border-strong)", borderRadius: "var(--radius-md)" }}
               >
                  <Filter size={15} strokeWidth={2} />
                  <span className="hidden sm:inline">Filtrar</span>
                  <span className="sm:hidden">Filtrar</span>
               </button>
               <button
                  onClick={() => handleCreateBoardModal()}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-[7px] transition-colors text-sm font-medium hover:bg-[var(--primary-800)] disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--primary-700)]"
                  style={{ height: 36, padding: "0 14px", color: "var(--primary-contrast-fg)", border: "1px solid var(--primary-700)", borderRadius: "var(--radius-md)" }}
               >
                  <Plus size={15} strokeWidth={2.5} />
                  <span className="hidden sm:inline">{isLoading ? 'Creando tablero...' : 'Crear tablero'}</span>
                  <span className="sm:hidden">{isLoading ? 'Creando...' : 'Crear'}</span>
               </button>
            </div>
         </div>

         {/* Información de paginación */}
         {boards.content && boards.content.length > 0 && (
            <div className="mb-4 text-sm" style={{ color: "var(--ds-text-muted)" }}>
               Mostrando {boards.content.length} de {boards.totalElements} tableros
            </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 ">
            {
               isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => <BoardCardSkeleton key={i} />)
               ) : boards.content && boards.content.length > 0 ? (
                  boards.content.map((board, i) => <BoardCard key={i} board={board as ProjectProps} />)
               ) : (
                  <div className="col-span-full flex items-center justify-center">
                     <EmptyState
                        icon={<LayoutDashboard size={48} strokeWidth={1.5} />}
                        title={currentFilters ? "No se encontraron tableros" : "No hay tableros disponibles"}
                        description={currentFilters ? "No hay tableros que coincidan con los filtros aplicados. Intenta ajustar los criterios de búsqueda." : "Aún no has creado ningún tablero. Comienza creando tu primer tablero para organizar tus proyectos."}
                        action={{
                           label: currentFilters ? "Limpiar filtros" : "Crear mi primer tablero",
                           onClick: currentFilters ? async () => {
                              setCurrentFilters(null)
                              router.push('/tableros', { scroll: false })
                              const token = await getValidAccessToken()
                              if (token) {
                                 await getBoards(token)
                              }
                           } : () => handleCreateBoardModal()
                        }}
                     />
                  </div>
               )
            }
         </div>

         {/* Infinite scroll: indicador de carga y fin de lista */}
         {boards.content && boards.content.length > 0 && (
            <>
               {isLoadingMore && (
                  <div className="flex items-center justify-center gap-2 py-6 text-sm" style={{ color: "var(--ds-text-muted)" }}>
                     <div className="w-4 h-4 rounded-full animate-spin" style={{ border: "2px solid var(--ds-border)", borderTopColor: "var(--blue-700)" }}></div>
                     Cargando más tableros...
                  </div>
               )}
               {!hasMoreBoards && !isLoadingMore && (
                  <div className="text-center py-6 text-sm" style={{ color: "var(--ds-text-muted)" }}>
                     No hay más tableros para mostrar
                  </div>
               )}
            </>
         )}
         </div>
      </>
   )
}

export default function TablerosPage() {
   return (
      <Suspense fallback={
         <div>
            <div className="mb-6">
               <h1 className="font-semibold" style={{ fontSize: 28, letterSpacing: "-1.1px", color: "var(--ds-text)" }}>Tableros</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 min-h-[60vh]">
               {Array.from({ length: 8 }).map((_, i) => <BoardCardSkeleton key={i} />)}
            </div>
         </div>
      }>
         <TablerosContent />
      </Suspense>
   )
}
