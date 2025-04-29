import { FilterProjectProps, GlobalPagination, ProjectProps } from '../types/types'
import { create } from 'zustand'

interface BoardState {
   boards: GlobalPagination
   selectedBoard: ProjectProps | null
   setBoards: (token: string, filters?: FilterProjectProps) => Promise<void>
   createBoard: (token: string, boardData: ProjectProps) => Promise<void>
   setBoard: (token: string, projectId: string) => Promise<void>
   updateBoard: (token: string, boardData: { name: string, description?: string, startDate?: string, endDate?: string, status: number }, projectId: string) => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_PROJECTS

export const useBoardStore = create<BoardState>((set) => ({
   selectedBoard: null,
   boards: {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10
   },
   setBoards: async (token, filters) => {
      try {
         // Build query string with filters
         const params = new URLSearchParams()
         if (filters) {
            if (filters.name) params.append('name', filters.name)
            if (filters.status !== undefined && filters.status !== 0) params.append('status', filters.status.toString())
            if (filters.createdBy) params.append('createdBy', filters.createdBy)
            params.append('page', (filters.page ?? 0).toString())
            params.append('size', (filters.size ?? 10).toString())

            if (filters.sortBy) params.append('sortBy', filters.sortBy.id), params.append('direction', filters.direction)
         }

         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_PROJECTS}?${params.toString()}`

         const response = await fetch(url, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`,
            },
         })

         if (!response.ok) {
            console.error('Error al obtener los tableros', response.statusText)
            return
         }

         const data: GlobalPagination = await response.json()

         set({
            boards: {
               content: data.content,
               totalElements: data.totalElements,
               totalPages: data.totalPages,
               number: data.number,
               size: data.size,
            },
         })
      } catch (error) {
         console.error('Error en la solicitud', error)
      }
   },
   createBoard: async (token: string, boardData: ProjectProps) => {
      try {
         const response = await fetch(`${API_URL}${process.env.NEXT_PUBLIC_GET_PROJECTS}`, {
            method: 'POST',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(boardData)
         })

         if (!response.ok) {
            console.error("Error al crear el tablero", response.statusText)
            return
         }

         const newBoard: ProjectProps = await response.json()

         set((state) => ({
            boards: {
               ...state.boards,
               content: state.boards.content ? [newBoard, ...state.boards.content as ProjectProps[]] : [newBoard],
               totalElements: state.boards.totalElements + 1
            }
         }))
      } catch (error) {
         console.error("Error en la creación del tablero", error)
      }
   },
   setBoard: async (token, projectId) => {
      try {
         const response = await fetch(`${API_URL}${process.env.NEXT_PUBLIC_GET_PROJECTS}/${projectId}`, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`,
            },
         })

         if (!response.ok) {
            console.error('Error al obtener los tableros', response.statusText)
            return
         }

         const data: ProjectProps = await response.json()
         set({
            selectedBoard: data
         })
      } catch (error) {
         console.error('Error en la solicitud', error)
      }
   },
   updateBoard: async (token, boardData, projectId) => {
      try {
         const response = await fetch(`${API_URL}${process.env.NEXT_PUBLIC_GET_PROJECTS}/${projectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, },
            body: JSON.stringify(boardData)
         })

         if (!response.ok) return console.error('Error al actualizar el tablero', response.statusText)

         const data: ProjectProps = await response.json()
         set({ selectedBoard: { ...data, createdBy: useBoardStore.getState().selectedBoard?.createdBy } })
      } catch (error) {
         console.error('Error en la solicitud', error)
      }
   },
}))
