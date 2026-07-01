import { create } from 'zustand'
import { API_ROUTES } from '../routes/issues.routes'

export interface GeminiModel {
  id: string
  name: string
  displayName: string
  desc?: string
  enabled: boolean
  methods: {
    generateContent: boolean
    embedContent: boolean
  }
}

export interface GeminiConfig {
  id?: string
  key: string
  url: string
  organizationName?: string
  models?: GeminiModel[]
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
  organizationName?: string
  models: GeminiModel[]
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
  setModels: (models: GeminiModel[]) => void
  addModel: (model: { name: string, displayName: string, desc?: string }) => boolean
  removeModel: (modelId: string) => void
  updateModelField: (modelId: string, field: 'name' | 'displayName' | 'desc', value: string) => void
  updateModelEnabled: (modelId: string, enabled: boolean) => void
  updateModelMethod: (modelId: string, method: 'generateContent' | 'embedContent', enabled: boolean) => void
  getEnabledModelsUrls: () => { model: GeminiModel, urls: { generateContent?: string, embedContent?: string } }[]
  updateConfig: (token: string) => Promise<void>
  getConfig: (token: string) => Promise<void>
  getHistory: (token: string, params: GeminiHistoryParams, reset?: boolean) => Promise<void>
  getHistoryFilters: (token: string) => Promise<void>
  resetHistory: () => void
  chatWithGemini: (token: string, messages: { role: string, content: string }[], files?: File[]) => Promise<any>
}

export const useGeminiStore = create<GeminiState>()((set, get) => ({
  apiKey: '',
  apiUrl: '',
  id: undefined,
  organizationName: undefined,
  models: [
    {
      id: 'gemini-3.1-pro-preview',
      name: 'gemini-3.1-pro-preview',
      displayName: 'Gemini 3.1 Pro',
      desc: "Modelo más potente de la familia, con el razonamiento más avanzado. Ideal para análisis complejos de documentos legales y extracción de datos precisa. Actualmente en preview.",
      enabled: true,
      methods: {
        generateContent: true,
        embedContent: false
      }
    },
    {
      id: 'gemini-3.5-flash',
      name: 'gemini-3.5-flash',
      displayName: 'Gemini 3.5 Flash',
      desc: "Modelo estable con el mejor equilibrio entre inteligencia, velocidad y costo. Buen rendimiento sostenido en tareas agénticas y de razonamiento.",
      enabled: false,
      methods: {
        generateContent: true,
        embedContent: false
      }
    },
    {
      id: 'gemini-3.1-flash-lite',
      name: 'gemini-3.1-flash-lite',
      displayName: 'Gemini 3.1 Flash Lite',
      desc: "El modelo más rápido y económico de la familia, pensado para casos de alto volumen y baja latencia.",
      enabled: false,
      methods: {
        generateContent: true,
        embedContent: false
      }
    }
  ],
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
  setModels: (models) => set({ models }),
  addModel: (model) => {
    const name = model.name.trim()
    if (!name) return false

    const { models } = get()
    if (models.some(m => m.name === name)) return false

    const newModel: GeminiModel = {
      id: `model-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      displayName: model.displayName.trim() || name,
      desc: model.desc?.trim() || undefined,
      enabled: false,
      methods: {
        generateContent: true,
        embedContent: false
      }
    }

    set({ models: [...models, newModel] })
    return true
  },
  removeModel: (modelId) => set((state) => ({
    models: state.models.filter(model => model.id !== modelId)
  })),
  updateModelField: (modelId, field, value) => set((state) => ({
    models: state.models.map(model =>
      model.id === modelId ? { ...model, [field]: value } : model
    )
  })),
  updateModelEnabled: (modelId, enabled) => set((state) => {
    // Si se quiere deshabilitar un modelo, verificar que no sea el único activo
    if (!enabled) {
      const enabledModels = state.models.filter(model => model.enabled)
      // Si solo hay un modelo activo y es el que se quiere deshabilitar, no permitirlo
      if (enabledModels.length === 1 && enabledModels[0].id === modelId) {
        return state // No hacer cambios
      }
    }

    return {
      models: state.models.map(model =>
        model.id === modelId
          ? { ...model, enabled }
          : { ...model, enabled: enabled ? false : model.enabled } // Si se habilita uno, deshabilitar los otros
      )
    }
  }),
  updateModelMethod: (modelId, method, enabled) => set((state) => {
    return {
      models: state.models.map(model =>
        model.id === modelId
          ? {
            ...model,
            methods: enabled
              ? { generateContent: method === 'generateContent', embedContent: method === 'embedContent' }
              : { ...model.methods, [method]: enabled }
          }
          : model
      )
    }
  }),
  getEnabledModelsUrls: () => {
    const { models } = get()
    return models
      .filter(model => model.enabled)
      .map(model => {
        const urls: { generateContent?: string, embedContent?: string } = {}
        if (model.methods.generateContent) {
          urls.generateContent = `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:generateContent`
        }
        if (model.methods.embedContent) {
          urls.embedContent = `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:embedContent`
        }
        return { model, urls }
      })
  },
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
      const currentState = get()
      let modelsToUse = data.models || currentState.models

      // Si hay una URL, parsearla para obtener el modelo y método seleccionados
      if (data.url && data.url.includes('generativelanguage.googleapis.com')) {
        // Extraer el modelo y método de la URL
        const urlMatch = data.url.match(/models\/([^:]+)(:(.+))?/)
        if (urlMatch) {
          const modelFromUrl = urlMatch[1] // El nombre del modelo
          const methodFromUrl = urlMatch[3] // El método (generateContent, embedContent)

          // Actualizar los modelos basándose en la URL
          modelsToUse = modelsToUse.map(model => {
            if (model.name === modelFromUrl) {
              return {
                ...model,
                enabled: true,
                methods: {
                  generateContent: methodFromUrl === 'generateContent',
                  embedContent: methodFromUrl === 'embedContent'
                }
              }
            } else {
              return {
                ...model,
                enabled: false
              }
            }
          })
        }
      } else {
        // Si no hay URL válida, usar configuración por defecto
        // Asegurar que al menos un modelo esté habilitado (Gemini 3.1 Pro por defecto)
        const enabledModels = modelsToUse.filter(model => model.enabled)
        if (enabledModels.length === 0 && modelsToUse.length > 0) {
          modelsToUse = modelsToUse.map(model => {
            if (model.name === 'gemini-3.1-pro-preview') {
              return {
                ...model,
                enabled: true,
                methods: {
                  generateContent: true,
                  embedContent: false
                }
              }
            } else {
              return {
                ...model,
                enabled: false
              }
            }
          })
        }
      }

      set({
        apiKey: data.key,
        apiUrl: data.url,
        id: data.id,
        organizationName: data.organizationName,
        models: modelsToUse
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
      const { apiKey, models } = get()
      const enabledModelsUrls = get().getEnabledModelsUrls()
      const apiUrl = enabledModelsUrls.length > 0
        ? enabledModelsUrls[0].urls.generateContent || enabledModelsUrls[0].urls.embedContent || ''
        : ''

      const response = await fetch(API_ROUTES.GEMINI_CONFIG, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          key: apiKey,
          url: apiUrl,
          models: models
        })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar la configuración de Gemini')
      }

      const data: GeminiConfig = await response.json()
      set({
        apiKey: data.key,
        apiUrl: data.url,
        id: data.id,
        models: data.models || models
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
}))