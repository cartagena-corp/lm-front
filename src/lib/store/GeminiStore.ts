import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { API_ROUTES } from '../routes/issues.routes'

interface GeminiConfig {
  id?: string
  key: string
  url: string
}

interface GeminiState {
  apiKey: string
  apiUrl: string
  id?: string
  setApiKey: (key: string) => void
  setApiUrl: (url: string) => void
  updateConfig: (token: string) => Promise<void>
  getConfig: (token: string) => Promise<void>
  chatWithGemini: (token: string, text: string) => Promise<any>
}

export const useGeminiStore = create<GeminiState>()(
  persist(
    (set, get) => ({
      apiKey: '',
      apiUrl: '',
      id: undefined,
      setApiKey: (key) => set({ apiKey: key }),
      setApiUrl: (url) => set({ apiUrl: url }),
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
      chatWithGemini: async (token: string, text: string) => {
        try {
          const response = await fetch(API_ROUTES.GEMINI_CHAT, {
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

          const data = await response.text()
          return data
        } catch (error) {
          console.error('Error en chatWithGemini:', error)
          throw error
        }
      },
    }),
    {
      name: 'gemini-storage',
    }
  )
)