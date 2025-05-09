import { create } from 'zustand'
import { ConfigProjectStatusProps, ProjectConfigProps } from '../types/types'

interface ConfigProjectState {
   projectStatus: ConfigProjectStatusProps[]
   projectConfig: ProjectConfigProps | null

   setConfig: () => Promise<void>
   setProjectConfig: (id: string, token: string) => Promise<void>
   addProjectStatus: (token: string, newProjectStatus: { name: string, color: string }) => Promise<void>
   editProjectStatus: (token: string, projectStatus: { id: string, name: string, color: string }) => Promise<void>
   deleteProjectStatus: (token: string, projectStatusId: string) => Promise<void>
   addIssueStatus: (token: string, projectId: string, newProjectStatus: { name: string, color: string }) => Promise<void>
   editIssueStatus: (token: string, projectId: string, projectStatus: { id: string, name: string, color: string }) => Promise<void>
   deleteIssueStatus: (token: string, projectId: string, projectStatusId: string) => Promise<void>
   addIssuePriorities: (token: string, projectId: string, newProjectStatus: { name: string, color: string }) => Promise<void>
   editIssuePriorities: (token: string, projectId: string, projectStatus: { id: string, name: string, color: string }) => Promise<void>
   deleteIssuePriorities: (token: string, projectId: string, projectStatusId: string) => Promise<void>
   addIssueTypes: (token: string, projectId: string, newProjectStatus: { name: string, color: string }) => Promise<void>
   editIssueTypes: (token: string, projectId: string, projectStatus: { id: string, name: string, color: string }) => Promise<void>
   deleteIssueTypes: (token: string, projectId: string, projectStatusId: string) => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_CONFIG

export const useConfigStore = create<ConfigProjectState>((set) => ({
   projectStatus: [],
   projectConfig: null,
   setConfig: async () => {
      try {
         const response = await fetch(`${API_URL}${process.env.NEXT_PUBLIC_GET_CONFIG_PROJECT_STATE}`, {
            method: 'GET',
            headers: { "Content-Type": "application/json", "credentials": "include" }
         })

         if (!response.ok) return console.error("Error al obtener las configuraciones de los estados globales de los proyectos", response.statusText)
         const data: ConfigProjectStatusProps[] = await response.json()
         set({ projectStatus: data })
      }
      catch (error) {
         console.error("Error en la solicitud", error)
      }
   },
   setProjectConfig: async (id, token) => {
      try {
         const response = await fetch(`${API_URL}${process.env.NEXT_PUBLIC_GET_CONFIG_GLOBAL_PROJECT}/${id}`, {
            method: 'POST',
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
         })

         if (!response.ok) return console.error("Error al obtener las configuraciones de los estados globales de los proyectos", response.statusText)
         const data: ProjectConfigProps = await response.json()
         set({ projectConfig: data, })
      }
      catch (error) {
         console.error("Error en la solicitud", error)
      }
   },
   addProjectStatus: async (token, newProjectStatus) => {
      try {
         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_CONFIG_PROJECT_STATE}`
         const response = await fetch(url, {
            method: 'POST', headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(newProjectStatus)
         })

         if (!response.ok) throw new Error("Error al agregar un nuevo estado de proyecto.")

      } catch (error) {
         console.error(error)
      } finally {
         useConfigStore.getState().setConfig()
      }
   },
   editProjectStatus: async (token, projectStatus) => {
      try {
         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_CONFIG_PROJECT_STATE}/${projectStatus.id}`
         const response = await fetch(url, {
            method: 'PUT', headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ name: projectStatus.name, color: projectStatus.color })
         })
         if (!response.ok) throw new Error("Error al editar un estado de proyecto.")
      } catch (error) {
         console.error(error)
      } finally {
         useConfigStore.getState().setConfig()
      }
   },
   deleteProjectStatus: async (token, projectStatusId) => {
      try {
         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_CONFIG_PROJECT_STATE}/${projectStatusId}`
         const response = await fetch(url, { method: 'DELETE', headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` } })
         if (!response.ok) throw new Error("Error al eliminar un estado de proyecto.")
      } catch (error) {
         console.error(error)
      } finally {
         useConfigStore.getState().setConfig()
      }
   },
   addIssueStatus: async (token, projectId, newProjectStatus) => {
      try {
         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_CONFIG_ISSUE_STATE}/${projectId}`
         const response = await fetch(url, {
            method: 'POST', headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(newProjectStatus)
         })

         if (!response.ok) throw new Error("Error al agregar un nuevo estado de issue.")

      } catch (error) {
         console.error(error)
      } finally {
         useConfigStore.getState().setProjectConfig(projectId, token)
      }
   },
   editIssueStatus: async (token, projectId, projectStatus) => {
      try {
         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_CONFIG_ISSUE_STATE}/${projectStatus.id}`
         const response = await fetch(url, {
            method: 'PUT', headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ name: projectStatus.name, color: projectStatus.color })
         })
         if (!response.ok) throw new Error("Error al editar un estado de issue.")
      } catch (error) {
         console.error(error)
      } finally {
         useConfigStore.getState().setProjectConfig(projectId, token)
      }
   },
   deleteIssueStatus: async (token, projectId, projectStatusId) => {
      try {
         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_CONFIG_ISSUE_STATE}/${projectStatusId}`
         const response = await fetch(url, { method: 'DELETE', headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` } })
         if (!response.ok) throw new Error("Error al eliminar un estado de issue.")
      } catch (error) {
         console.error(error)
      } finally {
         useConfigStore.getState().setProjectConfig(projectId, token)
      }
   },
   addIssuePriorities: async (token, projectId, newProjectStatus) => {
      try {
         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_CONFIG_ISSUE_PRIORITY}/${projectId}`
         const response = await fetch(url, {
            method: 'POST', headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(newProjectStatus)
         })

         if (!response.ok) throw new Error("Error al agregar una nueva prioridad de issue.")

      } catch (error) {
         console.error(error)
      } finally {
         useConfigStore.getState().setProjectConfig(projectId, token)
      }
   },
   editIssuePriorities: async (token, projectId, projectStatus) => {
      try {
         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_CONFIG_ISSUE_PRIORITY}/${projectStatus.id}`
         const response = await fetch(url, {
            method: 'PUT', headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ name: projectStatus.name, color: projectStatus.color })
         })
         if (!response.ok) throw new Error("Error al editar una prioridad de issue.")
      } catch (error) {
         console.error(error)
      } finally {
         useConfigStore.getState().setProjectConfig(projectId, token)
      }
   },
   deleteIssuePriorities: async (token, projectId, projectStatusId) => {
      try {
         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_CONFIG_ISSUE_PRIORITY}/${projectStatusId}`
         const response = await fetch(url, { method: 'DELETE', headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` } })
         if (!response.ok) throw new Error("Error al eliminar una prioridad de issue.")
      } catch (error) {
         console.error(error)
      } finally {
         useConfigStore.getState().setProjectConfig(projectId, token)
      }
   },
   addIssueTypes: async (token, projectId, newProjectStatus) => {
      try {
         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_CONFIG_ISSUE_TYPE}/${projectId}`
         const response = await fetch(url, {
            method: 'POST', headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(newProjectStatus)
         })

         if (!response.ok) throw new Error("Error al agregar un nuevo tipo de issue.")

      } catch (error) {
         console.error(error)
      } finally {
         useConfigStore.getState().setProjectConfig(projectId, token)
      }
   },
   editIssueTypes: async (token, projectId, projectStatus) => {
      try {
         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_CONFIG_ISSUE_TYPE}/${projectStatus.id}`
         const response = await fetch(url, {
            method: 'PUT', headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ name: projectStatus.name, color: projectStatus.color })
         })
         if (!response.ok) throw new Error("Error al editar un tipo de issue.")
      } catch (error) {
         console.error(error)
      } finally {
         useConfigStore.getState().setProjectConfig(projectId, token)
      }
   },
   deleteIssueTypes: async (token, projectId, projectStatusId) => {
      try {
         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_CONFIG_ISSUE_TYPE}/${projectStatusId}`
         const response = await fetch(url, { method: 'DELETE', headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` } })
         if (!response.ok) throw new Error("Error al eliminar un tipo de issue.")
      } catch (error) {
         console.error(error)
      } finally {
         useConfigStore.getState().setProjectConfig(projectId, token)
      }
   },
}))
