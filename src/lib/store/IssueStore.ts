import { FilterTaskProps, GlobalPagination, TaskProps, AuditPagination } from '../types/types'
import { refreshSprints } from './SprintStore'
import { API_ROUTES } from "@/lib/routes/issues.routes"
import { API_ROUTES as AUDIT_ROUTES } from "@/lib/routes/audit.routes"
import { create } from 'zustand'

interface IssueUpdated {
   descriptions: { id?: string, title: string, text: string }[],
   estimatedTime: number,
   priority: number,
   status: number,
   title: string,
   type: number
   id?: string
   projectId?: string
}

interface IssueFilters {
   keyword?: string
   sprintId?: string
   priority?: number
   type?: number
   status?: number
   assignedId?: string
   sortBy?: 'createdAt' | 'updatedAt'
   direction?: 'asc' | 'desc'
   page?: number
   size?: number
}

interface IssueFromIA {
   title: string;
   descriptionsDTO: {
      title: string;
      text: string;
   }[];
   projectId: string;
   assignedId: string;
}

interface IssueState {
   issues: GlobalPagination
   selectedIssue: TaskProps | null
   isLoading: boolean
   isLoadingMore: boolean
   error: string | null

   // Actions
   getIssues: (token: string, projectId: string, filters?: IssueFilters) => Promise<void>
   loadMoreIssues: (token: string, projectId: string, filters?: IssueFilters) => Promise<void>
   createIssue: (token: string, issueData: TaskProps) => Promise<void>
   updateIssue: (token: string, issueUpdated: IssueUpdated) => Promise<void>
   deleteIssue: (token: string, issueId: string, projectId: string) => Promise<void>
   assignIssueToSprint: (token: string, issueIds: string[], sprintId: string, projectId: string) => Promise<void>
   removeIssueFromSprint: (token: string, issueIds: string[], projectId: string) => Promise<void>
   assignIssue: (token: string, issueId: string, userId: string, projectId: string) => Promise<void>
   reopenIssue: (token: string, issueId: string, projectId: string) => Promise<void>

   // Audit actions
   getIssueHistory: (token: string, issueId: string, page?: number, size?: number) => Promise<AuditPagination>

   detectIssuesFromText: (token: string, projectId: string, text: string) => Promise<any>

   // Utility actions
   setSelectedIssue: (issue: TaskProps | null) => void
   clearError: () => void
   setLoading: (loading: boolean) => void
   createIssuesFromIA: (token: string, issues: IssueFromIA[]) => Promise<void>;
}

export const useIssueStore = create<IssueState>((set, get) => ({
   issues: {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10
   },
   selectedIssue: null,
   isLoading: false,
   isLoadingMore: false,
   error: null,

   // Get Issues with filters
   getIssues: async (token: string, projectId: string, filters?: IssueFilters) => {
      set({ isLoading: true, error: null })

      try {
         const params = new URLSearchParams()
         params.append('projectId', projectId)

         // Solo agregar parámetros que tengan valores válidos
         if (filters?.keyword) params.append('keyword', filters.keyword)

         // Manejar sprintId de manera especial:
         // - Si sprintId existe en filters (incluso si es ''), agregarlo
         // - Si no existe en filters, no agregar el parámetro
         if (filters && 'sprintId' in filters) {
            params.append('sprintId', filters.sprintId || '')
         }

         if (filters?.priority) params.append('priority', filters.priority.toString())
         if (filters?.type) params.append('type', filters.type.toString())
         if (filters?.status) params.append('status', filters.status.toString())
         if (filters?.assignedId) params.append('assignedId', filters.assignedId)
         if (filters?.sortBy) params.append('sortBy', filters.sortBy)
         if (filters?.direction) params.append('direction', filters.direction)
         if (filters?.page) params.append('page', filters.page.toString())
         if (filters?.size) params.append('size', filters.size.toString())

         const response = await fetch(`${API_ROUTES.GET_ISSUES_BY_PROJECT}?${params.toString()}`, {
            method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
         })

         if (!response.ok) { throw new Error(`Error ${response.status}: ${response.statusText}`) }

         const data: GlobalPagination = await response.json()

         set({
            issues: {
               content: data.content,
               totalElements: data.totalElements,
               totalPages: data.totalPages,
               number: data.number,
               size: data.size,
            },
            isLoading: false
         })
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al obtener las issues'
         set({ error: errorMessage, isLoading: false })
         console.error('Error en getIssues:', error)
      }
   },

   // Load More Issues (infinite scroll)
   loadMoreIssues: async (token: string, projectId: string, filters?: IssueFilters) => {
      set({ isLoadingMore: true, error: null })

      try {
         const params = new URLSearchParams()
         params.append('projectId', projectId)

         // Solo agregar parámetros que tengan valores válidos
         if (filters?.keyword) params.append('keyword', filters.keyword)

         // Manejar sprintId de manera especial:
         // - Si sprintId existe en filters (incluso si es ''), agregarlo
         // - Si no existe en filters, no agregar el parámetro
         if (filters && 'sprintId' in filters) {
            params.append('sprintId', filters.sprintId || '')
         }

         if (filters?.priority) params.append('priority', filters.priority.toString())
         if (filters?.type) params.append('type', filters.type.toString())
         if (filters?.status) params.append('status', filters.status.toString())
         if (filters?.assignedId) params.append('assignedId', filters.assignedId)
         if (filters?.sortBy) params.append('sortBy', filters.sortBy)
         if (filters?.direction) params.append('direction', filters.direction)
         if (filters?.page) params.append('page', filters.page.toString())
         if (filters?.size) params.append('size', filters.size.toString())

         const response = await fetch(`${API_ROUTES.GET_ISSUES_BY_PROJECT}?${params.toString()}`, {
            method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
         })

         if (!response.ok) { throw new Error(`Error ${response.status}: ${response.statusText}`) }

         const data: GlobalPagination = await response.json()

         set((state) => ({
            issues: {
               content: [...(state.issues.content as TaskProps[]), ...(data.content as TaskProps[])],
               totalElements: data.totalElements,
               totalPages: data.totalPages,
               number: data.number,
               size: data.size,
            },
            isLoadingMore: false
         }))
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al cargar más issues'
         set({ error: errorMessage, isLoadingMore: false })
         console.error('Error en loadMoreIssues:', error)
      }
   },

   // Create Issue
   createIssue: async (token: string, issueData: TaskProps) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.CRUD_ISSUES, {
            method: 'POST', headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(issueData)
         })

         if (!response.ok) { throw new Error(`Error ${response.status}: ${response.statusText}`) }

         const newIssue: TaskProps = await response.json()

         set((state) => ({
            issues: {
               ...state.issues,
               content: state.issues.content ? [newIssue, ...state.issues.content as TaskProps[]] : [newIssue],
               totalElements: state.issues.totalElements + 1
            },
            isLoading: false
         }))

         // Refresh sprints
         await refreshSprints(token, issueData.projectId)
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al crear la issue'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en createIssue:", error)
      }
   },

   // Update Issue
   updateIssue: async (token: string, issueUpdated: IssueUpdated) => {
      set({ isLoading: true, error: null })

      try {
         const requestBody = {
            title: issueUpdated.title,
            descriptions: issueUpdated.descriptions,
            estimatedTime: issueUpdated.estimatedTime,
            priority: issueUpdated.priority,
            status: issueUpdated.status,
            type: issueUpdated.type,
         }

         const response = await fetch(`${API_ROUTES.CRUD_ISSUES}/${issueUpdated.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(requestBody)
         })

         if (!response.ok) { throw new Error(`Error ${response.status}: ${response.statusText}`) }

         set((state) => ({
            issues: {
               ...state.issues,
               content: state.issues.content.map((issue) =>
                  issue.id === issueUpdated.id ? { ...issue, ...issueUpdated } : issue
               ) as TaskProps[],
            },
            isLoading: false
         }))

         // Refresh data - including backlog issues
         await Promise.all([
            get().getIssues(token, issueUpdated.projectId as string, { sprintId: '' }),
            refreshSprints(token, issueUpdated.projectId as string)
         ])
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la issue'
         set({ error: errorMessage, isLoading: false })
         console.error('Error en updateIssue:', error)
      }
   },

   // Delete Issue
   deleteIssue: async (token: string, issueId: string, projectId: string) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_ISSUES}/${issueId}`, {
            method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
         })

         if (!response.ok) { throw new Error(`Error ${response.status}: ${response.statusText}`) }

         set((state) => ({
            issues: {
               ...state.issues,
               content: state.issues.content.filter((issue) => issue.id !== issueId) as TaskProps[],
               totalElements: state.issues.totalElements - 1
            },
            isLoading: false
         }))

         // Refresh data
         await Promise.all([
            get().getIssues(token, projectId, { sprintId: '' }),
            refreshSprints(token, projectId)
         ])
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la issue'
         set({ error: errorMessage, isLoading: false })
         console.error('Error en deleteIssue:', error)
      }
   },

   // Assign Issue to Sprint
   assignIssueToSprint: async (token: string, issueIds: string[], sprintId: string, projectId: string) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.ASIGN_ISSUE_TO_SPRINT, {
            method: 'POST', headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ issueIds, sprintId })
         })

         if (!response.ok) { throw new Error(`Error ${response.status}: ${response.statusText}`) }

         set({ isLoading: false })

         // Refresh data
         await Promise.all([
            get().getIssues(token, projectId, { sprintId: '' }),
            refreshSprints(token, projectId)
         ])
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al asignar issues al sprint'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en assignIssueToSprint:", error)
      }
   },

   // Remove Issue from Sprint
   removeIssueFromSprint: async (token: string, issueIds: string[], projectId: string) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.REMOVE_ISSUE_FROM_SPRINT, {
            method: 'POST', headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ issueIds })
         })

         if (!response.ok) { throw new Error(`Error ${response.status}: ${response.statusText}`) }

         set({ isLoading: false })

         // Refresh data
         await Promise.all([
            get().getIssues(token, projectId, { sprintId: '' }),
            refreshSprints(token, projectId)
         ])
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al remover issues del sprint'
         set({ error: errorMessage, isLoading: false })
         console.error("Error en removeIssueFromSprint:", error)
      }
   },

   // Assign Issue to User
   assignIssue: async (token: string, issueId: string, userId: string, projectId: string) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.ASIGN_USER}/${issueId}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(userId)
         })

         if (!response.ok) { throw new Error(`Error ${response.status}: ${response.statusText}`) }

         set({ isLoading: false })

         // Refresh data
         await Promise.all([
            get().getIssues(token, projectId, { sprintId: '' }),
            refreshSprints(token, projectId)
         ])
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al asignar la issue al usuario'
         set({ error: errorMessage, isLoading: false })
         console.error('Error en assignIssue:', error)
      }
   },

   // Reopen Issue
   reopenIssue: async (token: string, issueId: string, projectId: string) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.REOPEN_ISSUE}/${issueId}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
         })

         if (!response.ok) { throw new Error(`Error ${response.status}: ${response.statusText}`) }

         set({ isLoading: false })

         // Refresh data
         await Promise.all([
            get().getIssues(token, projectId, { sprintId: '' }),
            refreshSprints(token, projectId)
         ])
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Error al reabrir la issue'
         set({ error: errorMessage, isLoading: false })
         console.error('Error en reopenIssue:', error)
      }
   },

   // Audit actions
   getIssueHistory: async (token: string, issueId: string, page = 0, size = 5) => {
      try {
         const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
         })

         const response = await fetch(`${AUDIT_ROUTES.GET_ISSUE_HISTORY}${issueId}?${params.toString()}`, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`,
            },
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         const data: AuditPagination = await response.json()
         return data
      } catch (error) {
         console.error('Error en getIssueHistory:', error)
         throw error
      }
   },

   // Detect Issues from Text
   detectIssuesFromText: async (token: string, projectId: string, text: string) => {
      try {
         const response = await fetch(`${API_ROUTES.DETECT_ISSUES_FROM_TEXT}/${projectId}`, {
            method: 'POST',
            headers: {
               'Content-Type': 'text/plain',
               'Authorization': `Bearer ${token}`,
            },
            body: text
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         const data = await response.json()
         return data
      } catch (error) {
         console.error('Error en detectIssuesFromText:', error)
         throw error
      }
   },
   // Create Issues from IA
   createIssuesFromIA: async (token: string, issues: IssueFromIA[]) => {
      try {
         const response = await fetch(API_ROUTES.CREATE_ISSUES_FROM_IA, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(issues)
         })

         if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
         }

         const data = await response.json()
         return data
      } catch (error) {
         console.error('Error en createIssuesFromIA:', error)
         throw error
      }
   },

   // Utility actions
   setSelectedIssue: (issue: TaskProps | null) => {
      set({ selectedIssue: issue })
   },

   clearError: () => {
      set({ error: null })
   },

   setLoading: (loading: boolean) => {
      set({ isLoading: loading })
   },
}))
