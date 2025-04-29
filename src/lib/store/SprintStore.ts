import { ConfigProjectStatusProps, GlobalPagination, SprintProps, TaskProps } from '../types/types'
import { create } from 'zustand'

interface SprintState {
   sprints: SprintProps[]
   sprintStatuses: ConfigProjectStatusProps[]
   getSprints: (token: string, projectId: string) => Promise<void>
   getStatus: (token: string) => Promise<void>
   getIssuesBySprint: (token: string, sprintId: string, projectId: string) => Promise<GlobalPagination>
   createSprint: (token: string, sprintData: SprintProps) => Promise<void>
   removeIssueFromSprint: (token: string, taskIds: string[], projectId: string) => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_SPRINTS
const API_CONFIG_URL = process.env.NEXT_PUBLIC_CONFIG
const API_ISSUES_URL = process.env.NEXT_PUBLIC_ISSUES
const API_ISSUES_GET = process.env.NEXT_PUBLIC_GET_ISSUES_BY_PROJECT

export const useSprintStore = create<SprintState>((set) => ({
   sprints: [],
   sprintStatuses: [],
   getIssuesBySprint: async (token, sprintId, projectId) => {
      try {
         const url = `${API_ISSUES_URL}${API_ISSUES_GET}?sprintId=${sprintId}&projectId=${projectId}`
         const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
   },
   getStatus: async (token) => {
      try {
         const url = `${API_CONFIG_URL}${process.env.NEXT_PUBLIC_GET_CONFIG_SPRINT_STATE}`
         const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, },
         })
         if (!response.ok) throw new Error(response.statusText)
         const data: ConfigProjectStatusProps[] = await response.json()
         set({ sprintStatuses: data })
      } catch (error) {
         console.error('Error en la solicitud', error)
      }
   },
   getSprints: async (token, projectId) => {
      try {
         // Obtener estados primero
         await useSprintStore.getState().getStatus(token)

         // Fetch sprints
         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_SPRINTS_BY_PROJECT}/${projectId}`
         const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         })
         if (!response.ok) throw new Error(response.statusText)
         const rawSprints: SprintProps[] = await response.json()

         // Por cada sprint, obtener sus issues y agregar al objeto
         const enriched = await Promise.all(rawSprints.map(async sprint => {
            const statusObject = useSprintStore.getState().sprintStatuses.find(s => s.id === sprint.status)
            const issues = await useSprintStore.getState().getIssuesBySprint(token, sprint.id!, projectId)
            return { ...sprint, statusObject, tasks: issues }
         })) as SprintProps[]

         // 4) Obtener backlog issues (sprintId = null)
         const backlogTasks = await useSprintStore.getState().getIssuesBySprint(token, 'null', projectId)
         const backlogSprint: SprintProps = {
            id: 'null',
            projectId,
            title: 'Backlog',
            goal: '',
            startDate: '',
            endDate: '',
            tasks: {
               content: backlogTasks.content as TaskProps[],
               totalPages: backlogTasks.totalPages,
               totalElements: backlogTasks.totalElements,
               size: backlogTasks.size,
               number: backlogTasks.number,
            },
         }

         set({ sprints: [backlogSprint, ...enriched] })
      } catch (error) {
         console.error('Error al obtener los sprints (incluyendo backlog)', error)
      }
   },
   createSprint: async (token, sprintData) => {
      try {
         const response = await fetch(`${API_URL}${process.env.NEXT_PUBLIC_CREATE_SPRINT}`, {
            method: 'POST',
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(sprintData)
         })

         if (!response.ok) throw new Error(response.statusText)
         const data: SprintProps = await response.json()
         const statusObject = useSprintStore.getState().sprintStatuses.find(s => s.id === data.status)

         // Inicializar con tasks vacías
         const newSprint = { ...data, statusObject, tasks: { content: [], totalPages: 0, totalElements: 0, size: 0, number: 0 } }
         set(state => ({ sprints: [...state.sprints, newSprint] }))
      } catch (error) {
         console.error("Error en createSprint", error)
      }
   },
   removeIssueFromSprint: async (token, taskIds, projectId) => {
      try {
         const response = await fetch(`${API_URL}${process.env.NEXT_PUBLIC_REMOVE_ISSUE_FROM_SPRINT}`, {
            method: 'POST',
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(taskIds)
         })

         if (!response.ok) throw new Error(response.statusText)
      } catch (error) {
         console.error("Error en createSprint", error)
      } finally {
         await useSprintStore.getState().getSprints(token, projectId)
      }
   },
}))
