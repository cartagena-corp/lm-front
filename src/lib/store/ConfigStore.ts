import { ConfigProjectStatusProps, ProjectConfigProps, UserProps } from '../types/types'
import { getUserIdFromToken } from '@/lib/utils/token.utils'
import { API_ROUTES } from '@/lib/routes/config.routes'
import { API_ROUTES as BOARD_ROUTES } from '@/lib/routes/boards.routes'
import toast from 'react-hot-toast'
import { create } from 'zustand'

interface ConfigProjectState {
   // State
   projectStatus: ConfigProjectStatusProps[]
   sprintStatuses: ConfigProjectStatusProps[]
   issueDescriptions: ConfigProjectStatusProps[]
   projectParticipants: UserProps[]
   projectConfig: ProjectConfigProps | null
   isLoading: boolean
   error: string | null

   // Actions
   setConfig: (token: string) => Promise<void>
   setProjectConfig: (id: string, token: string) => Promise<void>

   // Project Status Actions
   addProjectStatus: (token: string, newProjectStatus: { name: string, color: string }) => Promise<void>
   editProjectStatus: (token: string, projectStatus: { id: string, name: string, color: string }) => Promise<void>
   deleteProjectStatus: (token: string, projectStatusId: string) => Promise<void>

   // Sprint Status Actions
   getSprintStatuses: (token: string, projectId: string) => Promise<void>
   addSprintStatus: (token: string, projectId: string, newSprintStatus: { name: string, color: string }) => Promise<void>
   editSprintStatus: (token: string, projectId: string, sprintStatus: { id: string, name: string, color: string }) => Promise<void>
   deleteSprintStatus: (token: string, projectId: string, sprintStatusId: string) => Promise<void>

   // Issue Status Actions
   addIssueStatus: (token: string, projectId: string, newProjectStatus: { name: string, color: string }) => Promise<void>
   editIssueStatus: (token: string, projectId: string, projectStatus: { id: string, name: string, color: string, orderIndex?: number }) => Promise<void>
   updateIssueStatusesOrder: (token: string, projectId: string, statuses: { id: number, name: string, color: string, orderIndex: number }[]) => Promise<void>
   updateProjectConfigStatuses: (statuses: ConfigProjectStatusProps[]) => void
   deleteIssueStatus: (token: string, projectId: string, projectStatusId: string) => Promise<void>

   // Issue Priorities Actions
   addIssuePriorities: (token: string, projectId: string, newProjectStatus: { name: string, color: string }) => Promise<void>
   editIssuePriorities: (token: string, projectId: string, projectStatus: { id: string, name: string, color: string }) => Promise<void>
   deleteIssuePriorities: (token: string, projectId: string, projectStatusId: string) => Promise<void>

   // Issue Types Actions
   addIssueTypes: (token: string, projectId: string, newProjectStatus: { name: string, color: string }) => Promise<void>
   editIssueTypes: (token: string, projectId: string, projectStatus: { id: string, name: string, color: string }) => Promise<void>
   deleteIssueTypes: (token: string, projectId: string, projectStatusId: string) => Promise<void>

   // Issue Descriptions Actions
   getIssueDescriptions: (token: string, projectId: string) => Promise<void>
   addIssueDescription: (token: string, projectId: string, newDescription: { name: string }) => Promise<void>
   editIssueDescription: (token: string, projectId: string, descriptionId: string, description: { name: string }) => Promise<void>
   deleteIssueDescription: (token: string, projectId: string, descriptionId: string) => Promise<void>

   // Project Participants Actions
   getProjectParticipants: (token: string, projectId: string) => Promise<void>
   addParticipantsToProject: (token: string, projectId: string, userIds: string[]) => Promise<void>
   removeParticipantsFromProject: (token: string, projectId: string, userIds: string[]) => Promise<void>

   // Utility actions
   clearError: () => void
   setLoading: (loading: boolean) => void
}

// Helper function to handle API errors consistently
const handleApiError = (error: unknown, context: string): string => {
   const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
   console.error(`Error en ${context}:`, error)
   return errorMessage
}

export const useConfigStore = create<ConfigProjectState>((set, get) => ({
   // Initial state
   projectStatus: [],
   sprintStatuses: [],
   issueDescriptions: [],
   projectParticipants: [],
   projectConfig: null,
   isLoading: false,
   error: null,

   // Get global project status configuration
   setConfig: async (token) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_BOARDS}`, {
            method: 'GET',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            }
         })

         if (!response.ok) {
            throw new Error(`Error al obtener las configuraciones: ${response.statusText}`)
         }

         const data: ConfigProjectStatusProps[] = await response.json()
         set({ projectStatus: data, isLoading: false })

      } catch (error) {
         const errorMessage = handleApiError(error, 'setConfig')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al cargar la configuración')
      }
   },

   // Get project-specific configuration
   setProjectConfig: async (id, token) => {
      set({ isLoading: true, error: null })

      try {
         // Cargar configuración principal del proyecto
         const response = await fetch(`${API_ROUTES.GET_CONFIG_BOARD}/${id}`, {
            method: 'POST',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            }
         })

         if (!response.ok) {
            throw new Error(`Error al obtener la configuración del proyecto: ${response.statusText}`)
         }

         const projectConfigData = await response.json()

         // Cargar descripciones de issues
         const descriptionsResponse = await fetch(`${API_ROUTES.CRUD_CONFIG_ISSUES_DESCRIPTIONS}/${id}`, {
            method: 'GET',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            }
         })

         let issueDescriptions = []
         if (descriptionsResponse.ok) {
            issueDescriptions = await descriptionsResponse.json()
         }

         // Cargar estados de sprints
         const sprintStatusesResponse = await fetch(`${API_ROUTES.CRUD_CONFIG_SPRINTS}/${id}`, {
            method: 'GET',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            }
         })

         let sprintStatuses = []
         if (sprintStatusesResponse.ok) {
            sprintStatuses = await sprintStatusesResponse.json()
         }

         // Cargar participantes del proyecto
         const participantsResponse = await fetch(`${BOARD_ROUTES.CRUD_BOARDS}/${id}/participants`, {
            method: 'GET',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            }
         })

         let projectParticipants = []
         if (participantsResponse.ok) {
            projectParticipants = await participantsResponse.json()
         }

         // Combinar todos los datos
         const completeProjectConfig: ProjectConfigProps = {
            ...projectConfigData,
            issueDescriptions,
            sprintStatuses
         }

         set({ 
            projectConfig: completeProjectConfig,
            issueDescriptions,
            sprintStatuses,
            projectParticipants,
            isLoading: false 
         })

      } catch (error) {
         const errorMessage = handleApiError(error, 'setProjectConfig')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al cargar la configuración del proyecto')
      }
   },

   // Project Status CRUD operations
   addProjectStatus: async (token, newProjectStatus) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.CRUD_CONFIG_BOARDS, {
            method: 'POST',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newProjectStatus)
         })

         if (!response.ok) {
            throw new Error(`Error al agregar estado de proyecto: ${response.statusText}`)
         }

         toast.success('Estado de proyecto agregado exitosamente')
         await get().setConfig(token)

      } catch (error) {
         const errorMessage = handleApiError(error, 'addProjectStatus')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al agregar estado de proyecto')
      }
   },

   editProjectStatus: async (token, projectStatus) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_BOARDS}/${projectStatus.id}`, {
            method: 'PUT',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
               name: projectStatus.name,
               color: projectStatus.color
            })
         })

         if (!response.ok) {
            throw new Error(`Error al editar estado de proyecto: ${response.statusText}`)
         }

         toast.success('Estado de proyecto editado exitosamente')
         await get().setConfig(token)

      } catch (error) {
         const errorMessage = handleApiError(error, 'editProjectStatus')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al editar estado de proyecto')
      }
   },

   deleteProjectStatus: async (token, projectStatusId) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_BOARDS}/${projectStatusId}`, {
            method: 'DELETE',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            }
         })

         if (!response.ok) {
            throw new Error(`Error al eliminar estado de proyecto: ${response.statusText}`)
         }

         toast.success('Estado de proyecto eliminado exitosamente')
         await get().setConfig(token)

      } catch (error) {
         const errorMessage = handleApiError(error, 'deleteProjectStatus')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al eliminar estado de proyecto')
      }
   },

   // Issue Status CRUD operations
   addIssueStatus: async (token, projectId, newProjectStatus) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_ISSUES_STATUS}/${projectId}`, {
            method: 'POST',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newProjectStatus)
         })

         if (!response.ok) {
            throw new Error(`Error al agregar estado de issue: ${response.statusText}`)
         }

         // Para crear, necesitamos recargar para obtener el ID del nuevo estado
         await get().setProjectConfig(projectId, token)
         
         toast.success('Estado de issue agregado exitosamente')

      } catch (error) {
         const errorMessage = handleApiError(error, 'addIssueStatus')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al agregar estado de issue')
      }
   },

   editIssueStatus: async (token, projectId, projectStatus) => {
      set({ isLoading: true, error: null })

      try {
         // Obtener el estado actual del proyecto
         const currentConfig = get().projectConfig
         if (!currentConfig?.issueStatuses) {
            throw new Error('No se puede editar: configuración no disponible')
         }

         // Actualizar el estado específico en el array completo
         const updatedStatuses = currentConfig.issueStatuses.map(status => 
            status.id === parseInt(projectStatus.id)
               ? {
                  ...status,
                  name: projectStatus.name,
                  color: projectStatus.color,
                  ...(projectStatus.orderIndex !== undefined && { orderIndex: projectStatus.orderIndex })
               }
               : status
         )

         // Preparar el payload con todos los estados
         const statusesPayload = updatedStatuses.map(status => ({
            id: status.id,
            name: status.name,
            color: status.color,
            orderIndex: status.orderIndex ?? 999999
         }))

         // Enviar todos los estados al backend
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_ISSUES_STATUS}/${projectId}`, {
            method: 'PUT',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(statusesPayload)
         })

         if (!response.ok) {
            throw new Error(`Error al editar estado de issue: ${response.statusText}`)
         }

         // Actualizar el estado local sin hacer petición GET
         get().updateProjectConfigStatuses(updatedStatuses)
         set({ isLoading: false })

         toast.success('Estado de issue editado exitosamente')

      } catch (error) {
         const errorMessage = handleApiError(error, 'editIssueStatus')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al editar estado de issue')
      }
   },

   updateIssueStatusesOrder: async (token, projectId, statuses) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_ISSUES_STATUS}/${projectId}`, {
            method: 'PUT',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(statuses)
         })

         if (!response.ok) {
            throw new Error(`Error al actualizar orden de estados: ${response.statusText}`)
         }

         // Solo actualizar el estado de carga sin recargar toda la configuración
         set({ isLoading: false })

      } catch (error) {
         const errorMessage = handleApiError(error, 'updateIssueStatusesOrder')
         set({
            error: errorMessage,
            isLoading: false
         })
         throw error // Re-throw para que el componente pueda manejar el error
      }
   },

   updateProjectConfigStatuses: (statuses) => {
      const currentConfig = get().projectConfig
      if (currentConfig) {
         set({
            projectConfig: {
               ...currentConfig,
               issueStatuses: statuses
            }
         })
      }
   },

   deleteIssueStatus: async (token, projectId, projectStatusId) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_ISSUES_STATUS}/${projectStatusId}`, {
            method: 'DELETE',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            }
         })

         if (!response.ok) {
            throw new Error(`Error al eliminar estado de issue: ${response.statusText}`)
         }

         // Actualizar localmente eliminando el estado
         const currentConfig = get().projectConfig
         if (currentConfig?.issueStatuses) {
            const updatedStatuses = currentConfig.issueStatuses.filter(
               status => status.id !== parseInt(projectStatusId)
            )
            get().updateProjectConfigStatuses(updatedStatuses)
         }

         set({ isLoading: false })
         toast.success('Estado de issue eliminado exitosamente')

      } catch (error) {
         const errorMessage = handleApiError(error, 'deleteIssueStatus')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al eliminar estado de issue')
      }
   },

   // Issue Priorities CRUD operations
   addIssuePriorities: async (token, projectId, newProjectStatus) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_ISSUES_PRIORITIES}/${projectId}`, {
            method: 'POST',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newProjectStatus)
         })

         if (!response.ok) {
            throw new Error(`Error al agregar prioridad de issue: ${response.statusText}`)
         }

         toast.success('Prioridad de issue agregada exitosamente')
         await get().setProjectConfig(projectId, token)

      } catch (error) {
         const errorMessage = handleApiError(error, 'addIssuePriorities')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al agregar prioridad de issue')
      }
   },

   editIssuePriorities: async (token, projectId, projectStatus) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_ISSUES_PRIORITIES}/${projectStatus.id}`, {
            method: 'PUT',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
               name: projectStatus.name,
               color: projectStatus.color
            })
         })

         if (!response.ok) {
            throw new Error(`Error al editar prioridad de issue: ${response.statusText}`)
         }

         toast.success('Prioridad de issue editada exitosamente')
         await get().setProjectConfig(projectId, token)

      } catch (error) {
         const errorMessage = handleApiError(error, 'editIssuePriorities')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al editar prioridad de issue')
      }
   },

   deleteIssuePriorities: async (token, projectId, projectStatusId) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_ISSUES_PRIORITIES}/${projectStatusId}`, {
            method: 'DELETE',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            }
         })

         if (!response.ok) {
            throw new Error(`Error al eliminar prioridad de issue: ${response.statusText}`)
         }

         toast.success('Prioridad de issue eliminada exitosamente')
         await get().setProjectConfig(projectId, token)

      } catch (error) {
         const errorMessage = handleApiError(error, 'deleteIssuePriorities')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al eliminar prioridad de issue')
      }
   },

   // Issue Types CRUD operations
   addIssueTypes: async (token, projectId, newProjectStatus) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_ISSUES_TYPES}/${projectId}`, {
            method: 'POST',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newProjectStatus)
         })

         if (!response.ok) {
            throw new Error(`Error al agregar tipo de issue: ${response.statusText}`)
         }

         toast.success('Tipo de issue agregado exitosamente')
         await get().setProjectConfig(projectId, token)

      } catch (error) {
         const errorMessage = handleApiError(error, 'addIssueTypes')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al agregar tipo de issue')
      }
   },

   editIssueTypes: async (token, projectId, projectStatus) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_ISSUES_TYPES}/${projectStatus.id}`, {
            method: 'PUT',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
               name: projectStatus.name,
               color: projectStatus.color
            })
         })

         if (!response.ok) {
            throw new Error(`Error al editar tipo de issue: ${response.statusText}`)
         }

         toast.success('Tipo de issue editado exitosamente')
         await get().setProjectConfig(projectId, token)

      } catch (error) {
         const errorMessage = handleApiError(error, 'editIssueTypes')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al editar tipo de issue')
      }
   },

   deleteIssueTypes: async (token, projectId, projectStatusId) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_ISSUES_TYPES}/${projectStatusId}`, {
            method: 'DELETE',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            }
         })

         if (!response.ok) {
            throw new Error(`Error al eliminar tipo de issue: ${response.statusText}`)
         }

         toast.success('Tipo de issue eliminado exitosamente')
         await get().setProjectConfig(projectId, token)

      } catch (error) {
         const errorMessage = handleApiError(error, 'deleteIssueTypes')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al eliminar tipo de issue')
      }
   },

   // Sprint Status CRUD operations
   getSprintStatuses: async (token, projectId) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_SPRINTS}/${projectId}`, {
            method: 'GET',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            }
         })

         if (!response.ok) {
            throw new Error(`Error al obtener estados de sprints: ${response.statusText}`)
         }

         const data = await response.json()
         set({
            sprintStatuses: data,
            isLoading: false,
            error: null
         })

      } catch (error) {
         const errorMessage = handleApiError(error, 'getSprintStatuses')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al obtener estados de sprints')
      }
   },

   addSprintStatus: async (token, projectId, newSprintStatus) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_SPRINTS}/${projectId}`, {
            method: 'POST',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newSprintStatus)
         })

         if (!response.ok) {
            throw new Error(`Error al agregar estado de sprint: ${response.statusText}`)
         }

         toast.success('Estado de sprint agregado exitosamente')
         await get().setProjectConfig(projectId, token)

      } catch (error) {
         const errorMessage = handleApiError(error, 'addSprintStatus')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al agregar estado de sprint')
      }
   },

   editSprintStatus: async (token, projectId, sprintStatus) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_SPRINTS}/${sprintStatus.id}`, {
            method: 'PUT',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
               name: sprintStatus.name,
               color: sprintStatus.color
            })
         })

         if (!response.ok) {
            throw new Error(`Error al editar estado de sprint: ${response.statusText}`)
         }

         toast.success('Estado de sprint editado exitosamente')
         await get().setProjectConfig(projectId, token)

      } catch (error) {
         const errorMessage = handleApiError(error, 'editSprintStatus')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al editar estado de sprint')
      }
   },

   deleteSprintStatus: async (token, projectId, sprintStatusId) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_SPRINTS}/${sprintStatusId}`, {
            method: 'DELETE',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            }
         })

         if (!response.ok) {
            throw new Error(`Error al eliminar estado de sprint: ${response.statusText}`)
         }

         toast.success('Estado de sprint eliminado exitosamente')
         await get().setProjectConfig(projectId, token)

      } catch (error) {
         const errorMessage = handleApiError(error, 'deleteSprintStatus')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al eliminar estado de sprint')
      }
   },

   // Issue Descriptions CRUD operations
   getIssueDescriptions: async (token, projectId) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_ISSUES_DESCRIPTIONS}/${projectId}`, {
            method: 'GET',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            }
         })

         if (!response.ok) {
            throw new Error(`Error al obtener descripciones de issues: ${response.statusText}`)
         }

         const data = await response.json()
         set({
            issueDescriptions: data,
            isLoading: false,
            error: null
         })

      } catch (error) {
         const errorMessage = handleApiError(error, 'getIssueDescriptions')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al obtener descripciones de issues')
      }
   },

   addIssueDescription: async (token, projectId, newDescription) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_ISSUES_DESCRIPTIONS}/${projectId}`, {
            method: 'POST',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newDescription)
         })

         if (!response.ok) {
            throw new Error(`Error al agregar descripción de issue: ${response.statusText}`)
         }

         toast.success('Descripción de issue agregada exitosamente')
         await get().setProjectConfig(projectId, token)

      } catch (error) {
         const errorMessage = handleApiError(error, 'addIssueDescription')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al agregar descripción de issue')
      }
   },

   editIssueDescription: async (token, projectId, descriptionId, description) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_ISSUES_DESCRIPTIONS}/${descriptionId}`, {
            method: 'PUT',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(description)
         })

         if (!response.ok) {
            throw new Error(`Error al editar descripción de issue: ${response.statusText}`)
         }

         toast.success('Descripción de issue editada exitosamente')
         await get().setProjectConfig(projectId, token)

      } catch (error) {
         const errorMessage = handleApiError(error, 'editIssueDescription')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al editar descripción de issue')
      }
   },

   deleteIssueDescription: async (token, projectId, descriptionId) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_CONFIG_ISSUES_DESCRIPTIONS}/${descriptionId}`, {
            method: 'DELETE',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            }
         })

         if (!response.ok) {
            throw new Error(`Error al eliminar descripción de issue: ${response.statusText}`)
         }

         toast.success('Descripción de issue eliminada exitosamente')
         await get().setProjectConfig(projectId, token)

      } catch (error) {
         const errorMessage = handleApiError(error, 'deleteIssueDescription')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al eliminar descripción de issue')
      }
   },

   // Project Participants CRUD operations
   getProjectParticipants: async (token, projectId) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${BOARD_ROUTES.CRUD_BOARDS}/${projectId}/participants`, {
            method: 'GET',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            }
         })

         if (!response.ok) {
            throw new Error(`Error al obtener participantes del proyecto: ${response.statusText}`)
         }

         const participants = await response.json()
         set({
            projectParticipants: participants,
            isLoading: false,
            error: null
         })

      } catch (error) {
         const errorMessage = handleApiError(error, 'getProjectParticipants')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al obtener participantes del proyecto')
      }
   },

   addParticipantsToProject: async (token, projectId, userIds) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${BOARD_ROUTES.CRUD_BOARDS}/${projectId}/participants`, {
            method: 'POST',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ userIds })
         })

         if (!response.ok) {
            throw new Error(`Error al agregar participantes al proyecto: ${response.statusText}`)
         }

         toast.success('Participantes agregados exitosamente')
         await get().setProjectConfig(projectId, token)

      } catch (error) {
         const errorMessage = handleApiError(error, 'addParticipantsToProject')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al agregar participantes al proyecto')
      }
   },

   removeParticipantsFromProject: async (token, projectId, userIds) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${BOARD_ROUTES.CRUD_BOARDS}/${projectId}/participants`, {
            method: 'DELETE',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ userIds })
         })

         if (!response.ok) {
            throw new Error(`Error al eliminar participantes del proyecto: ${response.statusText}`)
         }

         toast.success('Participantes eliminados exitosamente')
         await get().setProjectConfig(projectId, token)

      } catch (error) {
         const errorMessage = handleApiError(error, 'removeParticipantsFromProject')
         set({
            error: errorMessage,
            isLoading: false
         })
         toast.error('Error al eliminar participantes del proyecto')
      }
   },

   // Utility actions
   clearError: () => set({ error: null }),
   setLoading: (loading: boolean) => set({ isLoading: loading })
}))
