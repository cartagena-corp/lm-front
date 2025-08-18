import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { API_ROUTES } from '../routes/issues.routes'

export interface GeminiConfig {
  id?: string
  key: string
  url: string
}

export interface GeminiProjectFilter {
  id: string
  name: string
}

export interface GeminiHistoryFilters {
  features: string[]
  projectIds: GeminiProjectFilter[]
  emails: string[]
}

export interface GeminiHistoryItem {
  id: number
  feature: string
  projectId: string | null
  userId: string
  userEmail: string
  timestamp: string
  responseTimeMs: number
  status: string
}

export interface GeminiHistoryResponse {
  content: GeminiHistoryItem[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}

export interface GeminiHistoryParams {
  feature?: string
  projectId?: string
  userEmail?: string
  page: number
  size: number
}

interface GeminiState {
  apiKey: string
  apiUrl: string
  id?: string
  // History state
  historyFilters: GeminiHistoryFilters | null
  historyItems: GeminiHistoryItem[]
  historyTotalPages: number
  historyTotalElements: number
  historyCurrentPage: number
  historySize: number
  historyLoading: boolean
  historyHasMore: boolean
  // Actions
  setApiKey: (key: string) => void
  setApiUrl: (url: string) => void
  updateConfig: (token: string) => Promise<void>
  getConfig: (token: string) => Promise<void>
  getHistory: (token: string, params: GeminiHistoryParams, reset?: boolean) => Promise<void>
  getHistoryFilters: (token: string) => Promise<void>
  resetHistory: () => void
  chatWithGemini: (token: string, messages: { role: string, content: string }[], files?: File[]) => Promise<any>
}

export const useGeminiStore = create<GeminiState>()(
  persist(
    (set, get) => ({
      apiKey: '',
      apiUrl: '',
      id: undefined,
      // History state
      historyFilters: null,
      historyItems: [],
      historyTotalPages: 0,
      historyTotalElements: 0,
      historyCurrentPage: 0,
      historySize: 10,
      historyLoading: false,
      historyHasMore: true,
      // Actions
      setApiKey: (key) => set({ apiKey: key }),
      setApiUrl: (url) => set({ apiUrl: url }),
      resetHistory: () => set({
        historyItems: [],
        historyTotalPages: 0,
        historyTotalElements: 0,
        historyCurrentPage: 0,
        historyHasMore: true
      }),
      getConfig: async (token: string) => {
        try {
          const response = await fetch(API_ROUTES.GEMINI_CONFIG, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error('Error al obtener la configuración de Gemini')
          }

          const data: GeminiConfig = await response.json()
          set({
            apiKey: data.key,
            apiUrl: data.url,
            id: data.id
          })
        } catch (error) {
          console.error('Error:', error)
          throw error
        }
      },

      getHistory: async (token: string, params: GeminiHistoryParams, reset = false) => {
        try {
          set({ historyLoading: true })
          
          // Construir query params
          const queryParams = new URLSearchParams()
          if (params.feature) queryParams.append('feature', params.feature)
          if (params.projectId) queryParams.append('projectId', params.projectId)
          if (params.userEmail) queryParams.append('userEmail', params.userEmail)
          queryParams.append('page', params.page.toString())
          queryParams.append('size', params.size.toString())

          const response = await fetch(`${API_ROUTES.GEMINI_HISTORY}?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error('Error al obtener el historial de Gemini')
          }

          const data: GeminiHistoryResponse = await response.json()
          
          const currentState = get()
          const newItems = reset ? data.content : [...currentState.historyItems, ...data.content]
          
          set({
            historyItems: newItems,
            historyTotalPages: data.totalPages,
            historyTotalElements: data.totalElements,
            historyCurrentPage: data.number,
            historySize: data.size,
            historyHasMore: data.number < data.totalPages - 1,
            historyLoading: false
          })
        } catch (error) {
          console.error('Error:', error)
          set({ historyLoading: false })
          throw error
        }
      },

      getHistoryFilters: async (token: string) => {
        try {
          const response = await fetch(API_ROUTES.GEMINI_HISTORY_FILTERS, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error('Error al obtener los filtros del historial de Gemini')
          }

          const data = await response.json();
          // Normalizar projectIds si vienen como array de objetos
          const filters: GeminiHistoryFilters = {
            features: data.features,
            projectIds: Array.isArray(data.projectIds) && typeof data.projectIds[0] === 'object'
              ? data.projectIds
              : (data.projectIds || []).map((id: string) => ({ id, name: id })),
            emails: data.emails
          };
          set({
            historyFilters: filters
          })
        } catch (error) {
          console.error('Error:', error)
          throw error
        }
      },

      updateConfig: async (token: string) => {
        try {
          const { apiKey, apiUrl } = get()
          const response = await fetch(API_ROUTES.GEMINI_CONFIG, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              key: apiKey,
              url: apiUrl
            })
          })

          if (!response.ok) {
            throw new Error('Error al actualizar la configuración de Gemini')
          }

          const data: GeminiConfig = await response.json()
          set({
            apiKey: data.key,
            apiUrl: data.url,
            id: data.id
          })
        } catch (error) {
          console.error('Error:', error)
          throw error
        }
      },
      // Chat with AI
      chatWithGemini: async (token: string, messages: { role: string, content: string }[], files?: File[]) => {
        try {
          const formData = new FormData();
          formData.append('texto', JSON.stringify(messages));
          if (files && files.length > 0) {
            files.forEach((file, idx) => {
              formData.append('archivos', file, file.name);
            });
          }

          const response = await fetch(API_ROUTES.GEMINI_CHAT, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              // No incluir 'Content-Type', fetch lo gestiona con FormData
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }

          const data = await response.text();
          return data;
        } catch (error) {
          console.error('Error en chatWithGemini:', error);
          throw error;
        }
      },
    }),
    {
      name: 'gemini-storage',
    }
  )
)