'use client'

import BoardCard, { BoardCardSkeleton } from '@/components/partials/boards/BoardCard'
import FilterProjectForm from '@/components/partials/boards/FilterProjectForm'
import { useEffect, useState, Suspense, useRef, useCallback } from 'react'
import CreateBoardForm from '@/components/partials/boards/CreateBoardForm'
import { BoardIcon, FilterIcon, PlusIcon, XIcon } from '@/assets/Icon'
import { FilterProjectProps, ProjectProps } from '@/lib/types/types'
import { useRouter, useSearchParams } from 'next/navigation'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { useModalStore } from '@/lib/hooks/ModalStore'
import { useBoardStore } from '@/lib/store/BoardStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import EmptyState from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/FormUI'

const DEFAULT_PAGE_SIZE = 15
const SCROLL_THRESHOLD = 0.7
const DEFAULT_FILTER: FilterProjectProps = { sortBy: { id: 1, name: 'Fecha de creación', color: '#d1d5dc' }, size: DEFAULT_PAGE_SIZE, direction: 'desc', createdBy: '', status: 0, name: '', page: 0 }

function TablerosContent() {
   const { boards, getBoards, createBoard, importFromJira, isLoading } = useBoardStore()
   const { getValidAccessToken, isAuthenticated } = useAuthStore()
   const { openModal, closeModal } = useModalStore()
   const { setConfig } = useConfigStore()
   const searchParams = useSearchParams()
   const router = useRouter()

   const [currentFilters, setCurrentFilters] = useState<FilterProjectProps>(DEFAULT_FILTER)
   const [allBoards, setAllBoards] = useState<ProjectProps[]>([])
   const [isLoadingMore, setIsLoadingMore] = useState(false)
   const [isInitialLoad, setIsInitialLoad] = useState(true)
   const [totalElements, setTotalElements] = useState(0)
   const [currentPage, setCurrentPage] = useState(0)
   const [hasMore, setHasMore] = useState(true)

   const scrollContainerRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      const boardsContent = boards.content?.filter((item): item is ProjectProps => item && typeof item === 'object' && 'name' in item) || []
      if (!isInitialLoad && boardsContent.length !== allBoards.length && !isLoadingMore) {
         setAllBoards(boardsContent)
         setTotalElements(boards.totalElements || 0)
      }
   }, [boards.content, boards.totalElements])

   const mapSortByIdToApi = (id: number): 'createdAt' | 'updatedAt' => { return id === 3 || id === 4 ? 'updatedAt' : 'createdAt' }
   const getDirectionFromId = (id: number): 'asc' | 'desc' => { return id === 2 || id === 4 ? 'asc' : 'desc' }

   const parseFiltersFromUrl = useCallback((): FilterProjectProps => {
      if (!searchParams.toString()) return DEFAULT_FILTER
      const sortById = searchParams.get('sortBy') ? parseInt(searchParams.get('sortBy')!) : 1
      const status = searchParams.get('status') ? parseInt(searchParams.get('status')!) : 0
      const sortByName = searchParams.get('sortByName') || 'Fecha de creación'
      const createdBy = searchParams.get('createdBy') || ''
      const name = searchParams.get('name') || ''

      return { sortBy: { id: sortById, name: sortByName, color: '#d1d5dc' }, direction: getDirectionFromId(sortById), size: DEFAULT_PAGE_SIZE, createdBy, page: 0, status, name }
   }, [searchParams])

   const updateUrlParams = (filters: FilterProjectProps) => {
      const params = new URLSearchParams()
      if (filters.sortBy?.id) params.set('sortBy', filters.sortBy.id.toString())
      if (filters.sortBy?.name) params.set('sortByName', filters.sortBy.name)
      if (filters.status) params.set('status', filters.status.toString())
      if (filters.createdBy) params.set('createdBy', filters.createdBy)
      if (filters.name) params.set('name', filters.name)

      const queryString = params.toString()
      router.push(queryString ? `?${queryString}` : '/tableros', { scroll: false })
   }

   const buildBoardFilters = (filters: FilterProjectProps) => ({
      direction: getDirectionFromId(filters.sortBy.id), sortBy: mapSortByIdToApi(filters.sortBy.id), createdBy: filters.createdBy || undefined,
      size: filters.size || DEFAULT_PAGE_SIZE, status: filters.status || undefined, page: filters.page || undefined, name: filters.name || undefined,
   })

   const loadBoards = async (page: number = 0, append: boolean = false, useCurrentFilters: boolean = true) => {
      if (!hasMore && append) return

      const token = await getValidAccessToken()
      if (!token) return
      if (append) setIsLoadingMore(true)

      try {
         const filters = useCurrentFilters ? { ...currentFilters, page } : { ...DEFAULT_FILTER, page }
         const boardFilters = buildBoardFilters(filters)
         await getBoards(token, boardFilters)

         const boardsStore = useBoardStore.getState().boards
         const newBoards = boardsStore.content?.filter((item): item is ProjectProps => item && typeof item === 'object' && 'name' in item) || []

         if (append) setAllBoards(prev => [...prev, ...newBoards])
         else setAllBoards(newBoards)

         const totalPages = boardsStore.totalPages || 0
         setHasMore(page < totalPages - 1)
         setTotalElements(boardsStore.totalElements || 0)
         setCurrentPage(page)
      } catch (error) {
         console.error('Error cargando tableros:', error)
      } finally {
         setIsLoadingMore(false)
         setIsInitialLoad(false)
      }
   }

   const handleScroll = useCallback(() => {
      const container = scrollContainerRef.current
      if (!container || isLoadingMore || !hasMore || isInitialLoad) return

      const { scrollTop, scrollHeight, clientHeight } = container
      const scrolledPercentage = (scrollTop + clientHeight) / scrollHeight

      if (scrolledPercentage >= SCROLL_THRESHOLD) loadBoards(currentPage + 1, true)
   }, [isLoadingMore, hasMore, isInitialLoad, currentPage, currentFilters])

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

   useEffect(() => {
      const initializeData = async () => {
         if (!isAuthenticated) return

         const token = await getValidAccessToken()
         if (!token) return

         const filtersFromUrl = parseFiltersFromUrl()
         setCurrentFilters(filtersFromUrl)

         try {
            const boardFilters = buildBoardFilters(filtersFromUrl)
            await Promise.all([getBoards(token, boardFilters), setConfig(token)])
            const boardsStore = useBoardStore.getState().boards
            const newBoards = boardsStore.content?.filter((item): item is ProjectProps => item && typeof item === 'object' && 'name' in item) || []

            const totalPages = boardsStore.totalPages || 0
            setHasMore(0 < totalPages - 1)
            setTotalElements(boardsStore.totalElements || 0)
            setAllBoards(newBoards)
            setIsInitialLoad(false)
         } catch (error) {
            console.error('Error inicializando datos:', error)
            setIsInitialLoad(false)
         }
      }

      initializeData()
   }, [isAuthenticated])

   const applyFilters = async (filters: FilterProjectProps) => {
      const newFilters = { ...filters, page: 0 }
      setCurrentFilters(newFilters)
      updateUrlParams(newFilters)
      setIsInitialLoad(true)
      setCurrentPage(0)
      setAllBoards([])
      setHasMore(true)

      const token = await getValidAccessToken()
      if (!token) return

      try {
         const boardFilters = buildBoardFilters(newFilters)
         await getBoards(token, boardFilters)

         const boardsStore = useBoardStore.getState().boards
         const newBoards = boardsStore.content?.filter((item): item is ProjectProps => item && typeof item === 'object' && 'name' in item) || []

         const totalPages = boardsStore.totalPages || 0
         setHasMore(0 < totalPages - 1)
         setTotalElements(boardsStore.totalElements || 0)
         setIsInitialLoad(false)
         setAllBoards(newBoards)
         setCurrentPage(0)
      } catch (error) {
         console.error('Error aplicando filtros:', error)
         setIsInitialLoad(false)
      } finally {
         closeModal()
      }
   }

   const clearFilters = async () => {
      setCurrentFilters(DEFAULT_FILTER)
      setIsInitialLoad(true)
      setCurrentPage(0)
      setAllBoards([])
      setHasMore(true)
      router.push('/tableros', { scroll: false })

      const token = await getValidAccessToken()
      if (!token) return

      try {
         const boardFilters = buildBoardFilters(DEFAULT_FILTER)
         await getBoards(token, boardFilters)

         const boardsStore = useBoardStore.getState().boards
         const newBoards = boardsStore.content?.filter((item): item is ProjectProps => item && typeof item === 'object' && 'name' in item) || []

         const totalPages = boardsStore.totalPages || 0
         setHasMore(0 < totalPages - 1)
         setTotalElements(boardsStore.totalElements || 0)
         setIsInitialLoad(false)
         setAllBoards(newBoards)
         setCurrentPage(0)
      } catch (error) {
         console.error('Error limpiando filtros:', error)
         setIsInitialLoad(false)
      }
   }

   const handleCreateBoard = async (newBoard: ProjectProps, jiraImport: File | null) => {
      try {
         const token = await getValidAccessToken()
         if (!token) return

         const statusId = typeof newBoard.status === 'object' ? newBoard.status.id : newBoard.status
         const boardData = { description: newBoard.description, startDate: newBoard.startDate, endDate: newBoard.endDate, name: newBoard.name, status: statusId }
         if (jiraImport) await importFromJira(token, boardData, jiraImport)
         else await createBoard(token, boardData)
         setCurrentPage(0)
         setAllBoards([])
         setHasMore(true)

         await loadBoards(0, false)
      } catch (error) {
         console.error('Error creando tablero:', error)
      } finally {
         closeModal()
      }
   }

   const openCreateBoardModal = () => {
      openModal({
         children: <CreateBoardForm onSubmit={handleCreateBoard} onCancel={closeModal} />,
         desc: 'Completa los detalles del nuevo tablero',
         Icon: <PlusIcon size={20} stroke={2} />,
         title: 'Crear Nuevo Tablero',
         closeOnBackdrop: false,
         closeOnEscape: false,
         size: 'md',
      })
   }

   const openFilterBoardModal = () => {
      openModal({
         children: <FilterProjectForm onSubmit={applyFilters} onCancel={closeModal} initialFilters={currentFilters} />,
         desc: 'Encuentra tableros específicos usando los filtros',
         Icon: <FilterIcon size={20} stroke={1.75} />,
         title: 'Filtrar Tableros',
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: 'UPDATE',
         size: 'md',
      })
   }

   const hasActiveFilters = currentFilters.name || currentFilters.status || currentFilters.createdBy || currentFilters.sortBy.id !== 1
   const showEmptyState = !isInitialLoad && !isLoading && allBoards.length === 0

   return (
      <div className="flex flex-col h-full gap-4">
         <div className="flex justify-between items-center gap-4">
            <h1 className="text-gray-900 font-bold text-2xl">Tableros</h1>
            <hgroup className="flex items-center gap-2">
               {hasActiveFilters &&
                  <Button size='sm' variant='red_outline' disabled={isLoading} onClick={clearFilters}>
                     <XIcon size={16} stroke={2} /> Limpiar filtros
                  </Button>
               }
               <Button size='sm' variant='gray_outline' onClick={openFilterBoardModal} disabled={isLoading}>
                  <FilterIcon size={16} stroke={2} /> Filtrar tableros
               </Button>
               <Button size='sm' variant='blue' onClick={openCreateBoardModal} disabled={isLoading}>
                  <PlusIcon size={16} stroke={2} /> Crear tablero
               </Button>
            </hgroup>
         </div>

         {totalElements > 0 && (
            <hgroup className="flex items-center justify-between">
               <p className="text-sm text-gray-600">
                  Mostrando {allBoards.length} de {totalElements} tableros
               </p>
               {totalElements > 0 && (
                  <div className="flex items-center gap-2">
                     <div className="bg-gray-300 overflow-hidden rounded-full w-20 h-2">
                        <div className="bg-blue-600 transition-all duration-300 h-full" style={{ width: `${Math.min(100, (allBoards.length / totalElements) * 100)}%` }} />
                     </div>
                     <span className="text-xs">
                        {Math.round((allBoards.length / totalElements) * 100)}%
                     </span>
                  </div>
               )}
            </hgroup>
         )}

         <div ref={scrollContainerRef} className="overflow-y-auto flex-1">
            <main className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
               {isInitialLoad ? Array.from({ length: DEFAULT_PAGE_SIZE }).map((_, i) => <BoardCardSkeleton key={i} />) : showEmptyState ? (
                  <div className="col-span-full flex items-center justify-center">
                     <EmptyState title={hasActiveFilters ? 'No se encontraron tableros' : 'No hay tableros disponibles'}
                        icon={<BoardIcon size={48} stroke={1.5} />}
                        description={hasActiveFilters ? 'No hay tableros que coincidan con los filtros aplicados. Intenta ajustar los criterios de búsqueda.'
                           : 'Aún no has creado ningún tablero. Comienza creando tu primer tablero para organizar tus proyectos.'}
                        action={{ label: hasActiveFilters ? 'Limpiar filtros' : 'Crear mi primer tablero', onClick: hasActiveFilters ? clearFilters : openCreateBoardModal }}
                     />
                  </div>
               ) : allBoards.map((board, i) => <BoardCard key={board.id || i} board={board} />)}
            </main>

            {!hasMore && allBoards.length > 0 &&
               <div className="flex items-center justify-center text-center py-6 text-sm mt-6 gap-2">
                  <span className="bg-black/25 rounded-full w-2 h-2" />
                  <p>No hay más tableros para mostrar</p>
                  <span className="bg-black/25 rounded-full w-2 h-2" />
               </div>
            }
         </div>
      </div>
   )
}

function TablerosLoadingSkeleton() {
   return (
      <div>
         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 md:mb-8 gap-4">
            <h1 className="text-gray-900 text-2xl font-bold">Tableros</h1>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 md:gap-6 min-h-[60vh]">
            {Array.from({ length: DEFAULT_PAGE_SIZE }).map((_, i) => <BoardCardSkeleton key={i} />)}
         </div>
      </div>
   )
}

export default function TablerosPage() {
   return (
      <Suspense fallback={<TablerosLoadingSkeleton />}>
         <TablerosContent />
      </Suspense>
   )
}
