import { GlobalPagination, SprintProps, TaskProps } from '../types/types'
import { API_ROUTES } from '@/lib/routes/sprint.routes'
import { API_ROUTES as ISSUE_ROUTES } from '@/lib/routes/issues.routes'
import { authFetch } from '@/lib/http/authFetch'
import { create } from 'zustand'
import toast from 'react-hot-toast'

// Función auxiliar para obtener issues por sprint sin dependencia circular
const getIssuesBySprintId = async (token: string, sprintId: string, projectId: string, size = 10, filter?: { assignedIds: string, type: number | null, status: number | null, priority: number | null }): Promise<GlobalPagination> => {
   try {
      const params = new URLSearchParams()
      params.append('projectId', projectId)
      params.append('size', size.toString())
      if (filter?.assignedIds) params.append('assignedIds', filter.assignedIds)
      if (filter?.type) params.append('type', filter.type.toString())
      if (filter?.status) params.append('status', filter.status.toString())
      if (filter?.priority) params.append('priority', filter.priority.toString())
      params.append('isParent', "true")

      // Para el backlog (sprintId === 'null'), buscar issues con sprintId null
      // Para sprints específicos, buscar issues con ese sprintId específico
      if (sprintId === 'null') {
         // Para backlog: buscar issues donde sprintId es null
         params.append('sprintId', 'null')  // Enviar vacío para obtener issues sin sprint
      } else {
         // Para sprints: buscar issues con el sprintId específico
         params.append('sprintId', sprintId)
      }

      const response = await authFetch(`${ISSUE_ROUTES.GET_ISSUES_BY_PROJECT}?${params.toString()}`, token, {
         method: 'GET',
         headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error(response.statusText)

      const data: GlobalPagination = await response.json()
      return data
   } catch (error) {
      console.error(`Error al obtener issues para el sprint ${sprintId}`, error)
      return {
         content: [],
         totalPages: 0,
         totalElements: 0,
         size: 0,
         number: 0,
      }
   }
}

interface SprintState {
   sprints: SprintProps[]
   activeSprint: SprintProps | null
   isLoading: boolean
   isLoadingMore: boolean
   // Todas las issues de sprints no-activos + backlog terminaron de llegar en
   // segundo plano (ver `loadRemainingSprintIssues`). Solo lo consume la vista
   // de Lista para no mostrar un "no hay tareas" falso mientras tanto.
   isLoadingSprintDetails: boolean
   // Se incrementa en cada `getSprints`/`clearSprints`. `loadRemainingSprintIssues`
   // lo captura al arrancar y lo revisa antes de aplicar su resultado: si ya cambió,
   // una llamada más nueva (otro tablero, u otra acción que refresca sprints) superó
   // a esta, así que su resultado ya está obsoleto y se descarta.
   sprintsGeneration: number
   error: string | null
   filters: { [sprintId: string]: { key: string; value: string } }
   setFilter: (sprintId: string, filter: { key: string; value: string }) => void
   getSprints: (token: string, projectId: string) => Promise<void>
   getActiveSprint: (token: string, projectId: string) => Promise<void>
   getIssuesBySprint: (token: string, sprintId: string, projectId: string, filter?: { assignedIds: string, type: number | null, status: number | null, priority: number | null }, size?: number) => Promise<GlobalPagination>
   loadMoreIssuesBySprint: (token: string, sprintId: string, projectId: string, page: number, filter?: { assignedIds: string, type: number | null, status: number | null, priority: number | null }) => Promise<void>
   loadRemainingSprintIssues: (token: string, projectId: string, rawSprints: SprintProps[], activeSprintId: string | undefined, generation: number) => Promise<void>
   createSprint: (token: string, sprintData: SprintProps) => Promise<void>
   updateSprint: (token: string, sprintData: SprintProps, projectId: string) => Promise<void>
   deleteSprint: (token: string, sprintId: string, projectId: string) => Promise<void>
   removeIssueFromSprint: (token: string, taskIds: string[], projectId: string) => Promise<void>
   clearIssuesFromSprint: (sprintId: string) => Promise<void>
   clearSprints: () => void
}

export const useSprintStore = create<SprintState>((set, get) => ({
   sprints: [],
   activeSprint: null,
   isLoading: false,
   isLoadingMore: false,
   isLoadingSprintDetails: false,
   sprintsGeneration: 0,
   error: null,
   filters: {},
   setFilter: (sprintId, filter) => set(state => ({ filters: { ...state.filters, [sprintId]: filter } })),

   getIssuesBySprint: async (token, sprintId, projectId, filter, size) => {
      return await getIssuesBySprintId(token, sprintId, projectId, size, filter)
   },

   getActiveSprint: async (token, projectId) => {
      try {
         set({ error: null })

         const response = await authFetch(`${API_ROUTES.ACTIVE_SPRINT}/${projectId}`, token, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
         })

         if (response.ok) {
            const activeSprint: SprintProps = await response.json()
            set({ activeSprint })
         } else {
            // No hay sprint activo o error
            set({ activeSprint: null })
         }
      } catch (error) {
         console.error('Error al obtener el sprint activo', error)
         set({ activeSprint: null, error: 'Error al obtener el sprint activo' })
      }
   },

   getSprints: async (token, projectId) => {
      const generation = get().sprintsGeneration + 1
      set({ isLoading: true, error: null, sprintsGeneration: generation })
      try {
         const emptyTasks = { content: [] as TaskProps[], totalPages: 0, totalElements: 0, size: 0, number: 0 }

         // La lista de sprints y el sprint activo son independientes entre sí — se piden
         // en paralelo en vez de uno tras otro.
         const [response] = await Promise.all([
            authFetch(`${API_ROUTES.GET_SPRINTS_BY_PROJECT}/${projectId}`, token, {
               method: 'GET',
               headers: { 'Content-Type': 'application/json' },
            }),
            get().getActiveSprint(token, projectId),
         ])
         if (!response.ok) throw new Error(response.statusText)
         const rawSprints: SprintProps[] = await response.json()
         const activeSprint = get().activeSprint

         // Otra llamada a getSprints (u otro cambio de tablero) ya empezó mientras
         // esto cargaba: descartar, ya no es la respuesta vigente.
         if (get().sprintsGeneration !== generation) return

         // Fast path: la vista de Tablero (Kanban) solo necesita el sprint activo, así
         // que es lo único que se trae completo ahora mismo. El resto de sprints y el
         // backlog —que solo usa la vista de Lista— se completan después en segundo
         // plano (`loadRemainingSprintIssues`) para no bloquear el Kanban detrás de N
         // peticiones que no le sirven para nada.
         const activeIssuesRaw = activeSprint
            ? await get().getIssuesBySprint(token, activeSprint.id!, projectId, { assignedIds: '', type: null, status: null, priority: null }, 999)
            : emptyTasks
         const activeIssues = { ...activeIssuesRaw, content: activeIssuesRaw.content as TaskProps[] }

         if (get().sprintsGeneration !== generation) return

         const backlogPlaceholder: SprintProps = {
            id: 'null', projectId, title: 'Backlog', goal: '', startDate: '', endDate: '', active: false,
            tasks: emptyTasks,
         }
         const sprintsWithPlaceholders = rawSprints.map(sprint =>
            activeSprint && sprint.id === activeSprint.id ? { ...sprint, tasks: activeIssues } : { ...sprint, tasks: emptyTasks }
         )

         set({ sprints: [backlogPlaceholder, ...sprintsWithPlaceholders], isLoading: false })

         // No se espera esta promesa: sigue en segundo plano sin bloquear el Kanban.
         get().loadRemainingSprintIssues(token, projectId, rawSprints, activeSprint?.id, generation)
      } catch (error) {
         console.error('Error al obtener los sprints (incluyendo backlog)', error)
         if (get().sprintsGeneration === generation) set({ error: 'Error al obtener los sprints', isLoading: false })
         toast.error('Error al obtener los sprints')
      }
   },

   // Completa en segundo plano las issues del backlog y de los sprints no-activos
   // (10 por sprint) — datos que solo consume la vista de Lista. Se dispara desde
   // `getSprints` sin ser esperada, así que la vista de Tablero nunca queda detrás
   // de estas peticiones.
   loadRemainingSprintIssues: async (token, projectId, rawSprints, activeSprintId, generation) => {
      try {
         set({ isLoadingSprintDetails: true })
         const pending = rawSprints.filter(sprint => sprint.id !== activeSprintId)

         const [backlogTasks, ...restIssues] = await Promise.all([
            get().getIssuesBySprint(token, 'null', projectId),
            ...pending.map(sprint => get().getIssuesBySprint(token, sprint.id!, projectId, { assignedIds: '', type: null, status: null, priority: null }, 10)),
         ])

         if (get().sprintsGeneration !== generation) return // superada por una llamada más nueva

         set(state => {
            const updatedSprints = state.sprints.map(sprint => {
               // El sprint activo ya llegó completo por el fast path de getSprints.
               if (sprint.id === activeSprintId) return sprint
               // Si el usuario ya aplicó un filtro propio en la vista de Lista para este
               // sprint, esa data ya es más fresca que la de este relleno — no pisarla.
               if (state.filters[sprint.id as string]?.key) return sprint
               if (sprint.id === 'null') return { ...sprint, tasks: { ...backlogTasks, content: backlogTasks.content as TaskProps[] } }
               const idx = pending.findIndex(p => p.id === sprint.id)
               return idx === -1 ? sprint : { ...sprint, tasks: { ...restIssues[idx], content: restIssues[idx].content as TaskProps[] } }
            })
            return { sprints: updatedSprints, isLoadingSprintDetails: false }
         })
      } catch (error) {
         console.error('Error al completar issues de sprints en segundo plano', error)
         if (get().sprintsGeneration === generation) set({ isLoadingSprintDetails: false })
      }
   },

   createSprint: async (token, sprintData) => {
      try {
         set({ isLoading: true, error: null })
         const response = await authFetch(API_ROUTES.CRUD_SPRINTS, token, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sprintData)
         })

         if (!response.ok) throw new Error(response.statusText)
         const data: SprintProps = await response.json()

         // Inicializar con tasks vacías
         const newSprint = { ...data, tasks: { content: [], totalPages: 0, totalElements: 0, size: 0, number: 0 } }
         set(state => ({ sprints: [...state.sprints, newSprint], isLoading: false }))
         toast.success('Sprint creado exitosamente')
      } catch (error) {
         console.error("Error en createSprint", error)
         set({ error: 'Error al crear el sprint', isLoading: false })
         toast.error('Error al crear el sprint')
      }
   },

   updateSprint: async (token, sprintData, projectId) => {
      try {
         set({ isLoading: true, error: null })
         const response = await authFetch(`${API_ROUTES.CRUD_SPRINTS}/${sprintData.id}`, token, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sprintData)
         })

         if (!response.ok) throw new Error(response.statusText)

         // Refresh sprints after update
         await get().getSprints(token, projectId)

         // Show appropriate message based on whether sprint was activated
         if (sprintData.active) {
            toast.success('Sprint activado exitosamente')
         } else {
            toast.success('Sprint actualizado exitosamente')
         }
      } catch (error) {
         console.error("Error en updateSprint", error)
         set({ error: 'Error al actualizar el sprint', isLoading: false })
         toast.error('Error al actualizar el sprint')
      }
   },

   deleteSprint: async (token, sprintId, projectId) => {
      try {
         set({ isLoading: true, error: null })
         const response = await authFetch(`${API_ROUTES.CRUD_SPRINTS}/${sprintId}`, token, {
            method: 'DELETE',
            headers: { "Content-Type": "application/json" }
         })

         if (!response.ok) throw new Error(response.statusText)

         // Refresh sprints after deletion
         await get().getSprints(token, projectId)
         toast.success('Sprint eliminado exitosamente')
      } catch (error) {
         console.error("Error en deleteSprint", error)
         set({ error: 'Error al eliminar el sprint', isLoading: false })
         toast.error('Error al eliminar el sprint')
      }
   },

   removeIssueFromSprint: async (token, taskIds, projectId) => {
      try {
         set({ isLoading: true, error: null })
         const response = await authFetch(API_ROUTES.REMOVE_ISSUES_FROM_SPRINT, token, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskIds)
         })

         if (!response.ok) throw new Error(response.statusText)

         // Refresh sprints after removing issues
         await get().getSprints(token, projectId)
         toast.success('Issues removidos del sprint exitosamente')
      } catch (error) {
         console.error("Error en removeIssueFromSprint", error)
         set({ error: 'Error al remover issues del sprint', isLoading: false })
         toast.error('Error al remover issues del sprint')
      }
   },

   loadMoreIssuesBySprint: async (token, sprintId, projectId, page, filter) => {
      try {
         set({ isLoadingMore: true, error: null })
         const params = new URLSearchParams()
         params.append('projectId', projectId)
         params.append('size', '10')
         params.append('isParent', "true")
         if (filter?.assignedIds) params.append('assignedIds', filter.assignedIds)
         if (filter?.type) params.append('type', filter.type.toString())
         if (filter?.status) params.append('status', filter.status.toString())
         if (filter?.priority) params.append('priority', filter.priority.toString())

         // Para el backlog (sprintId === 'null'), buscar issues con sprintId null
         if (sprintId === 'null') {
            params.append('sprintId', 'null')  // Enviar 'null' para obtener issues sin sprint
         } else {
            params.append('sprintId', sprintId)
         }

         params.append('page', String(page))

         const response = await authFetch(`${ISSUE_ROUTES.GET_ISSUES_BY_PROJECT}?${params.toString()}`, token, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
         })

         if (!response.ok) throw new Error(response.statusText)

         const data: GlobalPagination = await response.json()

         set(state => {
            // Encontrar el sprint correspondiente
            // Para el backlog, buscar el sprint con id 'null'
            const sprintIndex = state.sprints.findIndex(sprint => sprint.id === sprintId)
            if (sprintIndex === -1) return { isLoadingMore: false } // Sprint no encontrado

            const existingTasks = state.sprints[sprintIndex].tasks?.content as TaskProps[] || []
            const newTasks = data.content as TaskProps[]

            // Agregar las nuevas tareas al sprint encontrado
            const updatedSprint: SprintProps = {
               ...state.sprints[sprintIndex],
               tasks: {
                  content: [...existingTasks, ...newTasks],
                  totalPages: data.totalPages,
                  totalElements: data.totalElements,
                  size: data.size,
                  number: data.number,
               },
            }

            // Reemplazar el sprint antiguo con el sprint actualizado
            const updatedSprints = [...state.sprints]
            updatedSprints[sprintIndex] = updatedSprint

            return { sprints: updatedSprints, isLoadingMore: false }
         })
      } catch (error) {
         console.error("Error al cargar más issues del sprint", error)
         set({ error: 'Error al cargar más issues del sprint', isLoadingMore: false })
         toast.error('Error al cargar más issues del sprint')
      }
   },

   clearIssuesFromSprint: async (sprintId: string) => {
      set(state => {
         const sprintIndex = state.sprints.findIndex(sprint => sprint.id === sprintId)
         if (sprintIndex === -1) return state // Sprint no encontrado

         // Limpiar las tareas del sprint
         const updatedSprint: SprintProps = {
            ...state.sprints[sprintIndex],
            tasks: { content: [], totalPages: 0, totalElements: 0, size: 0, number: 0 },
         }

         // Reemplazar el sprint antiguo con el sprint actualizado
         const updatedSprints = [...state.sprints]
         updatedSprints[sprintIndex] = updatedSprint

         return { sprints: updatedSprints }
      })
   },

   clearSprints: () => {
      // Bump de generación: invalida cualquier `getSprints`/`loadRemainingSprintIssues`
      // que siga en vuelo del tablero anterior, para que no pise este reset al resolver.
      set(state => ({ sprints: [], activeSprint: null, sprintsGeneration: state.sprintsGeneration + 1 }))
   },
}))

// Función auxiliar para refrescar sprints (evita dependencia circular)
export const refreshSprints = async (token: string, projectId: string) => {
   const sprintStore = useSprintStore.getState()
   await sprintStore.getSprints(token, projectId)
}
