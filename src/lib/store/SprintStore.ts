import { ConfigProjectStatusProps, SprintProps } from '../types/types'
import { create } from 'zustand'

interface SprintState {
   sprints: SprintProps[] | []
   sprintStatuses: ConfigProjectStatusProps[] | []
   getSprints: (token: string, projectId: string) => Promise<void>
   getStatus: (token: string) => Promise<void>
   createSprint: (token: string, sprintData: SprintProps) => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_SPRINTS
const API_CONFIG_URL = process.env.NEXT_PUBLIC_CONFIG

export const useSprintStore = create<SprintState>((set) => ({
   sprints: [],
   sprintStatuses: [],
   getStatus: async (token) => {
      try {
         const url = `${API_CONFIG_URL}${process.env.NEXT_PUBLIC_GET_CONFIG_SPRINT_STATE}`

         const response = await fetch(url, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`,
            },
         })

         if (!response.ok) {
            console.error('Error al obtener los estados de los sprints', response.statusText)
            return
         }


         const data: ConfigProjectStatusProps[] = await response.json()

         set({
            sprintStatuses: data
         })
      } catch (error) {
         console.error('Error en la solicitud', error)
      }
   },
   getSprints: async (token, projectId) => {
      try {
         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_SPRINTS_BY_PROJECT}/${projectId}`

         const response = await fetch(url, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`,
            },
         })

         if (!response.ok) {
            console.error('Error al obtener los sprints del tablero', response.statusText)
            return
         }

         await useSprintStore.getState().getStatus(token)

         const data: SprintProps[] = await response.json()

         const updatedSprints = data.map(sprint => {
            const statusObject = useSprintStore.getState().sprintStatuses.find(status => status.id === sprint.status)
            return { ...sprint, statusObject: statusObject }
         })

         set({
            sprints: updatedSprints
         })
      } catch (error) {
         console.error('Error en la solicitud', error)
      }
   },
   createSprint: async (token: string, taskData: SprintProps) => {
      try {
         const response = await fetch(`${API_URL}${process.env.NEXT_PUBLIC_CREATE_SPRINT}`, {
            method: 'POST',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(taskData)
         })

         if (!response.ok) {
            console.error("Error al crear el sprint", response.statusText)
            return
         }

         await useSprintStore.getState().getStatus(token)
         const data: SprintProps = await response.json()

         const statusObject = useSprintStore.getState().sprintStatuses.find(status => status.id === data.status)
         const newSprint = { ...data, statusObject }

         set((state) => ({
            sprints: state.sprints.length > 0 ? [...state.sprints, newSprint] : [newSprint]
         }))
      } catch (error) {
         console.error("Error en createSprint", error)
      }
   },
}))
