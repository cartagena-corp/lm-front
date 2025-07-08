import { CommentProps, GlobalPagination, ResponseProps } from '../types/types'
import { API_ROUTES } from '../routes/comments.routes'
import toast from 'react-hot-toast'
import { create } from 'zustand'

interface CommentState {
   // State
   comments: GlobalPagination
   responses: ResponseProps[]
   isLoading: boolean
   isLoadingMore: boolean
   error: string | null
   hasMoreComments: boolean

   // Actions
   getResponses: (token: string, commentId: string) => Promise<ResponseProps[]>
   getComments: (token: string, issueId: string, page?: number, size?: number) => Promise<void>
   loadMoreComments: (token: string, issueId: string) => Promise<void>
   addComment: (token: string, issueId: string, text: string, files?: File[]) => Promise<void>
   addResponse: (token: string, text: string, commentId: string, issueId: string) => Promise<void>
   deleteComment: (token: string, commentId: string, issueId: string) => Promise<void>
   deleteResponse: (token: string, responseId: string, commentId: string) => Promise<void>
   
   // Utility actions
   clearError: () => void
   setLoading: (loading: boolean) => void
   resetComments: () => void
}

// Helper function to handle API errors consistently
const handleApiError = (error: unknown, context: string): string => {
   const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
   console.error(`Error en ${context}:`, error)
   return errorMessage
}

export const useCommentStore = create<CommentState>((set, get) => ({
   // Initial state
   comments: {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10,
   },
   responses: [],
   isLoading: false,
   isLoadingMore: false,
   error: null,
   hasMoreComments: true,

   // Get responses for a specific comment
   getResponses: async (token, commentId) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_RESPONSES}/${commentId}`, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
         })

         if (!response.ok) {
            throw new Error(`Error al obtener respuestas: ${response.statusText}`)
         }

         const rawResponses: ResponseProps[] = await response.json()
         set({ responses: rawResponses, isLoading: false })

         return rawResponses
      } catch (error) {
         const errorMessage = handleApiError(error, 'getResponses')
         set({ 
            error: errorMessage, 
            isLoading: false 
         })
         toast.error('Error al cargar las respuestas')
         return []
      }
   },

   // Get comments for a specific issue
   getComments: async (token, issueId, page = 0, size = 10) => {
      set({ isLoading: true, error: null })

      try {
         const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
         })

         const response = await fetch(`${API_ROUTES.CRUD_COMMENTS}/${issueId}?${params}`, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
         })

         if (!response.ok) {
            throw new Error(`Error al obtener comentarios: ${response.statusText}`)
         }

         const rawComments: GlobalPagination = await response.json()

         set({
            comments: {
               content: rawComments.content as CommentProps[],
               totalElements: rawComments.totalElements,
               totalPages: rawComments.totalPages,
               number: rawComments.number,
               size: rawComments.size
            },
            hasMoreComments: rawComments.number < rawComments.totalPages - 1,
            isLoading: false
         })

      } catch (error) {
         const errorMessage = handleApiError(error, 'getComments')
         set({ 
            error: errorMessage, 
            isLoading: false 
         })
         toast.error('Error al cargar los comentarios')
      }
   },

   // Load more comments (infinite scroll)
   loadMoreComments: async (token, issueId) => {
      const { comments, hasMoreComments, isLoadingMore } = get()
      
      if (!hasMoreComments || isLoadingMore) return

      set({ isLoadingMore: true, error: null })

      try {
         const nextPage = comments.number + 1
         const params = new URLSearchParams({
            page: nextPage.toString(),
            size: comments.size.toString()
         })

         const response = await fetch(`${API_ROUTES.CRUD_COMMENTS}/${issueId}?${params}`, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
         })

         if (!response.ok) {
            throw new Error(`Error al cargar más comentarios: ${response.statusText}`)
         }

         const rawComments: GlobalPagination = await response.json()

         set({
            comments: {
               content: [...comments.content, ...rawComments.content] as CommentProps[],
               totalElements: rawComments.totalElements,
               totalPages: rawComments.totalPages,
               number: rawComments.number,
               size: rawComments.size
            },
            hasMoreComments: rawComments.number < rawComments.totalPages - 1,
            isLoadingMore: false
         })

      } catch (error) {
         const errorMessage = handleApiError(error, 'loadMoreComments')
         set({ 
            error: errorMessage, 
            isLoadingMore: false 
         })
         toast.error('Error al cargar más comentarios')
      }
   },

   // Add a new comment to an issue
   addComment: async (token, issueId, text, files) => {
      set({ isLoading: true, error: null })

      try {
         // Validate input parameters
         if (!text.trim() && (!files || files.length === 0)) {
            throw new Error('Debe proporcionar texto o archivos para el comentario')
         }

         const formData = new FormData()
         formData.append('issueId', issueId)
         formData.append('text', text)
         
         // Add files to FormData
         if (files && files.length > 0) {
            files.forEach((file) => {
               // Validate file
               if (file.size === 0) {
                  throw new Error(`El archivo "${file.name}" está vacío`)
               }
               
               if (file.size > 10 * 1024 * 1024) { // 10MB limit
                  throw new Error(`El archivo "${file.name}" es demasiado grande (máximo 10MB)`)
               }
               
               formData.append('files', file, file.name)
            })
         }

         const response = await fetch(API_ROUTES.CRUD_COMMENTS, {
            method: 'POST',
            headers: { 
               'Authorization': `Bearer ${token}`
            },
            body: formData
         })

         if (!response.ok) {
            const errorData = await response.text()
            throw new Error(`Error al agregar comentario: ${response.status} ${response.statusText}${errorData ? ` - ${errorData}` : ''}`)
         }

         toast.success('Comentario agregado exitosamente')
         
         // Refresh comments from the beginning after adding
         await get().getComments(token, issueId, 0, 10)

      } catch (error) {
         const errorMessage = handleApiError(error, 'addComment')
         set({ 
            error: errorMessage, 
            isLoading: false 
         })
         toast.error(error instanceof Error ? error.message : 'Error al agregar el comentario')
      }
   },

   // Add a response to a comment
   addResponse: async (token, text, commentId, issueId) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(API_ROUTES.CRUD_RESPONSES, {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               commentId: commentId,
               text: text
            })
         })

         if (!response.ok) {
            throw new Error(`Error al agregar respuesta: ${response.statusText}`)
         }

         toast.success('Respuesta agregada exitosamente')
         
         // Refresh comments from the beginning to update response count
         await get().getComments(token, issueId, 0, 10)

      } catch (error) {
         const errorMessage = handleApiError(error, 'addResponse')
         set({ 
            error: errorMessage, 
            isLoading: false 
         })
         toast.error('Error al agregar la respuesta')
      }
   },

   // Delete a comment
   deleteComment: async (token, commentId, issueId) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_COMMENTS}/${commentId}`, { 
            method: 'DELETE', 
            headers: { 
               'Authorization': `Bearer ${token}` 
            } 
         })

         if (!response.ok) {
            throw new Error(`Error al eliminar comentario: ${response.statusText}`)
         }

         toast.success('Comentario eliminado exitosamente')
         
         // Refresh comments from the beginning after deletion
         await get().getComments(token, issueId, 0, 10)

      } catch (error) {
         const errorMessage = handleApiError(error, 'deleteComment')
         set({ 
            error: errorMessage, 
            isLoading: false 
         })
         toast.error('Error al eliminar el comentario')
      }
   },

   // Delete a response
   deleteResponse: async (token, responseId, commentId) => {
      set({ isLoading: true, error: null })

      try {
         const response = await fetch(`${API_ROUTES.CRUD_RESPONSES}/${responseId}`, { 
            method: 'DELETE', 
            headers: { 
               'Authorization': `Bearer ${token}` 
            } 
         })

         if (!response.ok) {
            throw new Error(`Error al eliminar respuesta: ${response.statusText}`)
         }

         toast.success('Respuesta eliminada exitosamente')
         
         // Refresh responses after deletion
         await get().getResponses(token, commentId)

      } catch (error) {
         const errorMessage = handleApiError(error, 'deleteResponse')
         set({ 
            error: errorMessage, 
            isLoading: false 
         })
         toast.error('Error al eliminar la respuesta')
      }
   },

   // Utility actions
   clearError: () => set({ error: null }),
   
   setLoading: (loading: boolean) => set({ isLoading: loading }),

   resetComments: () => set({
      comments: {
         content: [],
         totalElements: 0,
         totalPages: 0,
         number: 0,
         size: 10,
      },
      hasMoreComments: true,
      isLoading: false,
      isLoadingMore: false,
      error: null
   })
}))