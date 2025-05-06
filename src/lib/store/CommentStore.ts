import { CommentProps, GlobalPagination, ResponseProps } from '../types/types'
import { create } from 'zustand'

interface CommentState {
   comments: GlobalPagination
   responses: ResponseProps[]
   getResponses: (token: string, commentId: string) => Promise<ResponseProps[]>
   getComments: (token: string, issueId: string) => Promise<void>
   addComment: (token: string, issueId: string, text: string, files?: File[]) => Promise<void>
   addResponse: (token: string, text: string, commentId: string, issueId: string) => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_COMMENTS

export const useCommentStore = create<CommentState>(set => ({
   comments: {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10,
   },
   responses: [],
   getResponses: async (token, commentId) => {
      try {
         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_COMMENTS_RESPONSES}/${commentId}`
         const response = await fetch(url, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
         })

         if (!response.ok) throw new Error(response.statusText)

         const rawResponses: ResponseProps[] = await response.json()
         set({ responses: rawResponses })

         // Devolvemos las respuestas para que el componente pueda usarlas localmente
         return rawResponses
      } catch (error) {
         console.error(error)
         return []
      }
   },
   getComments: async (token, issueId) => {
      try {
         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_COMMENTS}/${issueId}`
         const response = await fetch(url, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
         })

         if (!response.ok) throw new Error(response.statusText)

         const rawComments: GlobalPagination = await response.json()

         set({
            comments: {
               content: rawComments.content as CommentProps[],
               totalElements: rawComments.totalElements,
               totalPages: rawComments.totalPages,
               number: rawComments.number,
               size: rawComments.size
            }
         })
      } catch (error) {
         console.error(error)
      }
   },
   addComment: async (token, issueId, text, files) => {
      try {
         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_COMMENTS}`
         const formData = new FormData()
         formData.append('issueId', issueId)
         formData.append('text', text)
         if (files && files.length > 0) {
            for (const file of files) {
               formData.append('files', file)
            }
         }

         const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
         })

         if (!response.ok) throw new Error(response.statusText)
      } catch (error) {
         console.error(error)
      } finally {
         useCommentStore.getState().getComments(token, issueId)
      }
   },
   addResponse: async (token, text, commentId, issueId) => {
      try {
         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_COMMENTS_RESPONSES}`
         const response = await fetch(url, {
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

         if (!response.ok) throw new Error(response.statusText)
      } catch (error) {
         console.error(error)
      } finally {
         // Actualizar los comentarios para reflejar el nuevo conteo de respuestas
         useCommentStore.getState().getComments(token, issueId)
      }
   }
}))