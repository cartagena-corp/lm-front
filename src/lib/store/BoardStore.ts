import { GlobalPagination, ProjectProps, AuditPagination, UserProps } from '../types/types'
import { API_ROUTES } from "@/lib/routes/boards.routes"
import { API_ROUTES as ORG_API_ROUTES } from "@/lib/routes/organization.route"
import { API_ROUTES as AUDIT_ROUTES } from "@/lib/routes/audit.routes"
import { authFetch } from '@/lib/http/authFetch'
import { create } from 'zustand'
import toast from 'react-hot-toast'

interface BoardFilters {
   name?: string
   status?: number
   createdBy?: string
   page?: number
   size?: number
   sortBy?: 'createdAt' | 'updatedAt'
   direction?: 'asc' | 'desc'
}

interface CreateBoardData {
   name: string
   description: string
   startDate: string
   endDate: string
   status: number
}

interface BoardState {
   // State
   boards: GlobalPagination
   selectedBoard: ProjectProps | null
   projectParticipants: UserProps[]
   isLoading: boolean
   isLoadingMore: boolean
   hasMoreBoards: boolean
   error: string | null

   // Actions
   getBoards: (token: string, filters?: BoardFilters, append?: boolean) => Promise<void>
   getBoardsByOrganization: (token: string, organizationId: string, filters?: BoardFilters) => Promise<void>
   createBoard: (token: string, boardData: CreateBoardData) => Promise<void>
   getBoard: (token: string, projectId: string) => Promise<void>
   updateBoard: (token: string, boardData: { name: string, description?: string, startDate?: string, endDate?: string, status: number }, projectId: string) => Promise<void>
   deleteBoard: (token: string, projectId: string) => Promise<void>
   importFromJira: (token: string, boardData: CreateBoardData, jiraImport: File | null) => Promise<void>
   validateBoard: (token: string, boardData: any) => Promise<boolean>
   
   // Project participants actions
   getProjectParticipants: (token: string, projectId: string) => Promise<void>
   addParticipantsToProject: (token: string, projectId: string, userIds: string[]) => Promise<void>
   removeParticipantsFromProject: (token: string, projectId: string, userIds: string[]) => Promise<void>
   
   // Audit actions
   getProjectHistory: (token: string, projectId: string, page?: number, size?: number) => Promise<AuditPagination>

   // Utility actions
   setSelectedBoard: (board: ProjectProps | null) => void
   clearError: () => void
   setLoading: (loading: boolean) => void
}

export const useBoardStore = create<BoardState>((set, get) => ({
   selectedBoard: null,
   boards: {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10
   },
   projectParticipants: [],
   isLoading: true,
   isLoadingMore: false,
   hasMoreBoards: true,
   error: null,

   // Get Boards with filters. Pass append=true (infinite scroll "load more") to
   // concatenate onto the existing content instead of replacing it.
   getBoards: async (token: string, filters?: BoardFilters, append: boolean = false) => {
      if (append) {
         set({ isLoadingMore: true, error: null })
      } else {
         set({ isLoading: true, error: null })
      }

      try {
         const params = new URLSearchParams()
         if (filters) {
            if (filters.name) params.append('name', filters.name)
            if (filters.status !== undefined && filters.status !== 0) params.append('status', filters.status.toString())
            if (filters.createdBy) params.append('createdBy', filters.createdBy)
            if (filters.sortBy) params.append('sortBy', filters.sortBy)
            if (filters.direction) params.append('direction', filters.direction)
            params.append('page', (filters.page ?? 0).toString())
            params.append('size', (filters.size ?? 10).toString())
         }

         const response = await authFetch(`${API_ROUTES.CRUD_BOARDS}?${params.toString()}`, token, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
            },
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         const data: GlobalPagination = await response.json()

         set((state) => ({
            boards: {
               content: append ? [...(state.boards.content as ProjectProps[] || []), ...data.content as ProjectProps[]] : data.content,
               totalElements: data.totalElements,
               totalPages: data.totalPages,
               number: data.number,
               size: data.size,
            },
            hasMoreBoards: data.number < data.totalPages - 1,
            isLoading: false,
            isLoadingMore: false
         }))
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al obtener los tableros'
         set({ error: errorMessage, isLoading: false, isLoadingMore: false })
         toast.error(errorMessage)
         console.error('Error en getBoards:', error)
      }
   },

   // New function to get boards by organization
   getBoardsByOrganization: async (token: string, organizationId: string, filters?: BoardFilters) => {
      set({ isLoading: true, error: null })
      
      try {
         const params = new URLSearchParams()
         if (filters) {
            if (filters.name) params.append('name', filters.name)
            if (filters.status !== undefined && filters.status !== 0) params.append('status', filters.status.toString())
            if (filters.createdBy) params.append('createdBy', filters.createdBy)
            if (filters.sortBy) params.append('sortBy', filters.sortBy)
            if (filters.direction) params.append('direction', filters.direction)
            params.append('page', (filters.page ?? 0).toString())
            params.append('size', (filters.size ?? 10).toString())
         }

         const response = await authFetch(`${ORG_API_ROUTES.GET_PROJECTS_BY_ORGANIZATION({ idOrg: organizationId })}?${params.toString()}`, token, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
            },
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         const data: GlobalPagination = await response.json()

         set({
            boards: {
               content: data.content,
               totalElements: data.totalElements,
               totalPages: data.totalPages,
               number: data.number,
               size: data.size,
            },
            isLoading: false
         })
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al obtener los tableros de la organización'
         set({ error: errorMessage, isLoading: false })
         toast.error(errorMessage)
         console.error('Error en getBoardsByOrganization:', error)
      }
   },

   // Create Board
   createBoard: async (token: string, boardData: CreateBoardData) => {
      set({ isLoading: true, error: null })
      
      try {
         const response = await authFetch(API_ROUTES.CRUD_BOARDS, token, {
            method: 'POST',
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(boardData)
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         const newBoard: ProjectProps = await response.json()

         set((state) => ({
            boards: {
               ...state.boards,
               content: state.boards.content ? [newBoard, ...state.boards.content as ProjectProps[]] : [newBoard],
               totalElements: state.boards.totalElements + 1
            },
            isLoading: false
         }))

         toast.success('Tablero creado exitosamente')
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al crear el tablero'
         set({ error: errorMessage, isLoading: false })
         toast.error(errorMessage)
         console.error("Error en createBoard:", error)
      }
   },

   // Get Single Board
   getBoard: async (token: string, projectId: string) => {
      set({ isLoading: true, error: null })
      
      try {
         const response = await authFetch(`${API_ROUTES.CRUD_BOARDS}/${projectId}`, token, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
            },
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         const data: ProjectProps = await response.json()
         set({
            selectedBoard: data,
            isLoading: false
         })
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al obtener el tablero'
         set({ error: errorMessage, isLoading: false })
         toast.error(errorMessage)
         console.error('Error en getBoard:', error)
      }
   },

   // Update Board
   updateBoard: async (token: string, boardData: { name: string, description?: string, startDate?: string, endDate?: string, status: number }, projectId: string) => {
      set({ isLoading: true, error: null })
      
      try {
         const response = await authFetch(`${API_ROUTES.CRUD_BOARDS}/${projectId}`, token, {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(boardData)
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         const data: ProjectProps = await response.json()
         set({ 
            selectedBoard: { ...data, createdBy: get().selectedBoard?.createdBy },
            isLoading: false
         })

         toast.success('Tablero actualizado exitosamente')
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el tablero'
         set({ error: errorMessage, isLoading: false })
         toast.error(errorMessage)
         console.error('Error en updateBoard:', error)
      }
   },

   // Delete Board
   deleteBoard: async (token: string, projectId: string) => {
      set({ isLoading: true, error: null })
      
      try {
         const response = await authFetch(`${API_ROUTES.CRUD_BOARDS}/${projectId}`, token, {
            method: 'DELETE',
            headers: {
               'Content-Type': 'application/json',
            }
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         set({ isLoading: false })
         toast.success('Tablero eliminado exitosamente')
         
         // Refresh boards list
         await get().getBoards(token)
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el tablero'
         set({ error: errorMessage, isLoading: false })
         toast.error(errorMessage)
         console.error('Error en deleteBoard:', error)
      }
   },

   // Import from Jira
   importFromJira: async (token: string, boardData: CreateBoardData, jiraImport: File | null) => {
      set({ isLoading: true, error: null })
      
      try {
         const formData = new FormData()
         formData.append('project', JSON.stringify(boardData))
         if (jiraImport) formData.append('file', jiraImport)

         const response = await authFetch(API_ROUTES.IMPORT_BOARD_FROM_JIRA, token, {
            method: 'POST',
            body: formData
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         set({ isLoading: false })
         toast.success('Tablero importado desde Jira exitosamente')
         
         // Refresh boards list
         await get().getBoards(token)
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al importar el tablero desde Jira'
         set({ error: errorMessage, isLoading: false })
         toast.error(errorMessage)
         console.error("Error en importFromJira:", error)
      }
   },

   // Validate Board
   validateBoard: async (token: string, boardData: any) => {
      set({ isLoading: true, error: null })
      
      try {
         const response = await authFetch(API_ROUTES.VALIDATE_BOARD, token, {
            method: 'POST',
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(boardData)
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         const data = await response.json()
         set({ isLoading: false })
         return data.valid || true
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al validar el tablero'
         set({ error: errorMessage, isLoading: false })
         toast.error(errorMessage)
         console.error('Error en validateBoard:', error)
         return false
      }
   },

   // Audit actions
   getProjectHistory: async (token: string, projectId: string, page = 0, size = 5) => {
      try {
         const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
         })

         const response = await authFetch(`${AUDIT_ROUTES.GET_PROJECT_HISTORY}/${projectId}?${params.toString()}`, token, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
            },
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         const data: AuditPagination = await response.json()
         return data
      } catch (error) {
         console.error('Error en getProjectHistory:', error)
         throw error
      }
   },

   // Project participants actions
   getProjectParticipants: async (token: string, projectId: string) => {
      set({ isLoading: true, error: null })

      try {
         const response = await authFetch(`${API_ROUTES.CRUD_BOARDS}/${projectId}/participants`, token, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
            },
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         const participants: UserProps[] = await response.json()
         set({ projectParticipants: participants, isLoading: false })
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al obtener participantes del proyecto'
         set({ error: errorMessage, isLoading: false })
         console.error('Error en getProjectParticipants:', error)
      }
   },

   addParticipantsToProject: async (token: string, projectId: string, userIds: string[]) => {
      set({ isLoading: true, error: null })

      try {
         const response = await authFetch(`${API_ROUTES.CRUD_BOARDS}/${projectId}/participants`, token, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userIds })
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         // Refrescar la lista de participantes después de agregar
         await get().getProjectParticipants(token, projectId)
         toast.success('Participantes agregados exitosamente')
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al agregar participantes al proyecto'
         set({ error: errorMessage, isLoading: false })
         console.error('Error en addParticipantsToProject:', error)
         toast.error(errorMessage)
      }
   },

   removeParticipantsFromProject: async (token: string, projectId: string, userIds: string[]) => {
      set({ isLoading: true, error: null })

      try {
         const response = await authFetch(`${API_ROUTES.CRUD_BOARDS}/${projectId}/participants`, token, {
            method: 'DELETE',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userIds })
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         // Refrescar la lista de participantes después de eliminar
         await get().getProjectParticipants(token, projectId)
         toast.success('Participantes eliminados exitosamente')
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al eliminar participantes del proyecto'
         set({ error: errorMessage, isLoading: false })
         console.error('Error en removeParticipantsFromProject:', error)
         toast.error(errorMessage)
      }
   },

   // Utility actions
   setSelectedBoard: (board: ProjectProps | null) => {
      set({ selectedBoard: board })
   },

   clearError: () => {
      set({ error: null })
   },

   setLoading: (loading: boolean) => {
      set({ isLoading: loading })
   },
}))