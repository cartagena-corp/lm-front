import { FilterTaskProps, GlobalPagination, TaskProps } from '../types/types'
import { create } from 'zustand'
import { useSprintStore } from './SprintStore'

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


interface IssueState {
   issues: GlobalPagination
   selectedIssue: TaskProps | null
   setIssues: (token: string, projectId: string, filters?: FilterTaskProps) => Promise<void>
   createTask: (token: string, taskData: TaskProps) => Promise<void>
   asignTaskToSprint: (token: string, taskIds: string[], sprintId: string, projectId: string) => Promise<void>
   updateIssue: (token: string, issueUpdated: IssueUpdated) => Promise<void>
   deleteIssue: (token: string, issueId: string, projectId: string) => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_ISSUES

export const useIssueStore = create<IssueState>((set) => ({
   issues: {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10
   },
   selectedIssue: null,
   setIssues: async (token, projectId, filters) => {
      try {
         const params = new URLSearchParams()
         if (filters) {
            // if (filters.name) params.append('name', filters.name)
            // if (filters.status !== undefined && filters.status !== 0) params.append('status', filters.status.toString())
            // if (filters.createdBy) params.append('createdBy', filters.createdBy)
            // params.append('page', (filters.page ?? 0).toString())
            // params.append('size', (filters.size ?? 10).toString())

            // if (filters.sortBy) params.append('sortBy', filters.sortBy.id), params.append('direction', filters.direction)
         }

         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_ISSUES_BY_PROJECT}?projectId=${projectId}`

         const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
         })

         if (!response.ok) return console.error('Error al obtener las issues del tablero', response.statusText)
         const data: GlobalPagination = await response.json()
         set({
            issues: {
               content: data.content,
               totalElements: data.totalElements,
               totalPages: data.totalPages,
               number: data.number,
               size: data.size,
            }
         })
      } catch (error) {
         console.error('Error en la solicitud', error)
      }
   },
   createTask: async (token, taskData) => {
      try {
         const response = await fetch(`${API_URL}${process.env.NEXT_PUBLIC_CREATE_ISSUE}`, {
            method: 'POST',
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(taskData)
         })

         if (!response.ok) return console.error("Error al crear la tarea", response.statusText)
         const newIssue: TaskProps = await response.json()

         set((state) => ({
            issues: {
               ...state.issues,
               content: state.issues.content ? [newIssue, ...state.issues.content as TaskProps[]] : [newIssue],
               totalElements: state.issues.totalElements + 1
            }
         }))
      } catch (error) {
         console.error("Error en createTask", error)
      } finally {
         await useSprintStore.getState().getSprints(token, taskData.projectId)
      }
   },
   asignTaskToSprint: async (token, taskIds, sprintId, projectId) => {
      try {
         if (sprintId !== "null") {
            const response = await fetch(`${API_URL}${process.env.NEXT_PUBLIC_ASIGN_ISSUE_TO_SPRINT}`, {
               method: 'POST',
               headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
               body: JSON.stringify({ issueIds: taskIds, sprintId: sprintId })
            })

            if (!response.ok) return console.error("Error al asignar las tareas al sprint", response.statusText)
         } else {
            await useSprintStore.getState().removeIssueFromSprint(token, taskIds, projectId)
         }
      } catch (error) {
         console.error("Error en asignTaskToSprint", error)
      } finally {
         await useSprintStore.getState().getSprints(token, projectId)
      }
   },
   updateIssue: async (token, issueUpdated) => {
      try {
         const response = await fetch(`${API_URL}${process.env.NEXT_PUBLIC_CREATE_ISSUE}/${issueUpdated.id}`,
            {
               method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(
                  {
                     title: issueUpdated.title,
                     descriptions: issueUpdated.descriptions,
                     estimatedTime: issueUpdated.estimatedTime,
                     priority: issueUpdated.priority,
                     status: issueUpdated.status,
                     type: issueUpdated.type,
                  }
               )
            })
         if (!response.ok) return console.error('Error al editar la issue', response.statusText)

         set((state) => ({
            issues: {
               ...state.issues,
               content: state.issues.content.map((issue) => issue.id === issueUpdated.id ? { ...issue, ...issueUpdated } : issue) as TaskProps[],
            }
         }))
      } catch (error) {
         console.error('Error en la solicitud', error)
      } finally {
         useIssueStore.getState().setIssues(token, issueUpdated.projectId as string)
         useSprintStore.getState().getSprints(token, issueUpdated.projectId as string)
      }
   },
   deleteIssue: async (token, issueId, projectId) => {
      try {
         const response = await fetch(`${API_URL}${process.env.NEXT_PUBLIC_CREATE_ISSUE}/${issueId}`,
            { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } })
         if (!response.ok) return console.error('Error al borrar la issue', response.statusText)

         set((state) => ({
            issues: {
               ...state.issues,
               content: state.issues.content.filter((issue) => issue.id !== issueId) as TaskProps[],
               totalElements: state.issues.totalElements - 1
            }
         }))
      } catch (error) {
         console.error('Error en la solicitud', error)
      } finally {
         useIssueStore.getState().setIssues(token, projectId)
         useSprintStore.getState().getSprints(token, projectId)
      }
   },
}))
