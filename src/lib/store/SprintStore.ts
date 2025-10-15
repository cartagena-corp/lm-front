import { GlobalPagination, SprintProps, TaskProps } from '../types/types'
import { API_ROUTES } from '@/lib/routes/sprint.routes'
import { API_ROUTES as ISSUE_ROUTES } from '@/lib/routes/issues.routes'
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

      const response = await fetch(`${ISSUE_ROUTES.GET_ISSUES_BY_PROJECT}?${params.toString()}`, {
         method: 'GET',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
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
   error: string | null
   filters: { [sprintId: string]: { key: string; value: string } }
   setFilter: (sprintId: string, filter: { key: string; value: string }) => void
   getSprints: (token: string, projectId: string) => Promise<void>
   getActiveSprint: (token: string, projectId: string) => Promise<void>
   getIssuesBySprint: (token: string, sprintId: string, projectId: string, filter?: { assignedIds: string, type: number | null, status: number | null, priority: number | null }, size?: number) => Promise<GlobalPagination>
   loadMoreIssuesBySprint: (token: string, sprintId: string, projectId: string, page: number, filter?: { key: string; value: string }) => Promise<void>
   createSprint: (token: string, sprintData: SprintProps) => Promise<void>
   updateSprint: (token: string, sprintData: SprintProps, projectId: string) => Promise<void>
   deleteSprint: (token: string, sprintId: string, projectId: string) => Promise<void>
   removeIssueFromSprint: (token: string, taskIds: string[], projectId: string) => Promise<void>
   clearIssuesFromSprint: (sprintId: string) => Promise<void>
}

export const useSprintStore = create<SprintState>((set, get) => ({
   sprints: [],
   activeSprint: null,
   isLoading: false,
   isLoadingMore: false,
   error: null,
   filters: {},
   setFilter: (sprintId, filter) => set(state => ({ filters: { ...state.filters, [sprintId]: filter } })),

   getIssuesBySprint: async (token, sprintId, projectId, filter, size) => {
      return await getIssuesBySprintId(token, sprintId, projectId, size, filter)
   },

   getActiveSprint: async (token, projectId) => {
      try {
         set({ error: null })

         const response = await fetch(`${API_ROUTES.ACTIVE_SPRINT}/${projectId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
      try {
         set({ isLoading: true, error: null })

         // Fetch sprints
         const url = `${API_ROUTES.GET_SPRINTS_BY_PROJECT}/${projectId}`
         const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         })
         if (!response.ok) throw new Error(response.statusText)
         const rawSprints: SprintProps[] = await response.json()

         // Obtener sprint activo
         await get().getActiveSprint(token, projectId)
         const activeSprint = get().activeSprint

         // Por cada sprint, obtener sus issues y agregar al objeto
         const enriched = await Promise.all(rawSprints.map(async sprint => {
            // Si es el sprint activo, obtener todas las issues
            const size = (activeSprint && sprint.id === activeSprint.id) ? 999 : 10
            const issues = await get().getIssuesBySprint(token, sprint.id!, projectId, { assignedIds: '', type: null, status: null, priority: null }, size)
            return { ...sprint, tasks: issues }
         })) as SprintProps[]

         // Obtener backlog issues (issues sin sprint asignado)
         const backlogTasks = await get().getIssuesBySprint(token, 'null', projectId)
         const backlogSprint: SprintProps = {
            id: 'null',
            projectId,
            title: 'Backlog',
            goal: '',
            startDate: '',
            endDate: '',
            active: false,
            tasks: {
               content: backlogTasks.content as TaskProps[],
               totalPages: backlogTasks.totalPages,
               totalElements: backlogTasks.totalElements,
               size: backlogTasks.size,
               number: backlogTasks.number,
            },
         }

         set({ sprints: [backlogSprint, ...enriched], isLoading: false })
      } catch (error) {
         console.error('Error al obtener los sprints (incluyendo backlog)', error)
         set({ error: 'Error al obtener los sprints', isLoading: false })
         toast.error('Error al obtener los sprints')
      }
   },

   createSprint: async (token, sprintData) => {
      try {
         set({ isLoading: true, error: null })
         const response = await fetch(API_ROUTES.CRUD_SPRINTS, {
            method: 'POST',
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
         const response = await fetch(`${API_ROUTES.CRUD_SPRINTS}/${sprintData.id}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
         const response = await fetch(`${API_ROUTES.CRUD_SPRINTS}/${sprintId}`, {
            method: 'DELETE',
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
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
         const response = await fetch(API_ROUTES.REMOVE_ISSUES_FROM_SPRINT, {
            method: 'POST',
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
         if (filter) params.append(filter.key, filter.value)


         // Para el backlog (sprintId === 'null'), buscar issues con sprintId null
         if (sprintId === 'null') {
            params.append('sprintId', 'null')  // Enviar 'null' para obtener issues sin sprint
         } else {
            params.append('sprintId', sprintId)
         }

         params.append('page', String(page))

         const response = await fetch(`${ISSUE_ROUTES.GET_ISSUES_BY_PROJECT}?${params.toString()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
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
}))

// Función auxiliar para refrescar sprints (evita dependencia circular)
export const refreshSprints = async (token: string, projectId: string) => {
   const sprintStore = useSprintStore.getState()
   await sprintStore.getSprints(token, projectId)
}
