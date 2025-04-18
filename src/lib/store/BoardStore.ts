import { ProjectProps } from '../types/types'
import { create } from 'zustand'

interface BoardProps {
   content: ProjectProps[] | null
   totalElements: number
   totalPages: number
   number: number
   size: number
}

interface BoardState {
   boards: BoardProps
   setBoards: (token: string) => Promise<void>
   createBoard: (
      token: string,
      boardData: { name: string, description: string, startDate: string, endDate: string, status: number }
   ) => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_PROJECTS

export const useBoardStore = create<BoardState>((set) => ({
   boards: {
      content: null,
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10
   },
   setBoards: async (token: string) => {
      try {
         const response = await fetch(`${API_URL}${process.env.NEXT_PUBLIC_GET_PROJECTS}`, {
            method: 'GET',
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            }
         })
         if (!response.ok) {
            console.error("Error al obtener los tableros", response.statusText)
            return
         }

         const data: BoardProps = await response.json()

         set({
            boards: {
               content: data.content,
               totalElements: data.totalElements,
               totalPages: data.totalPages,
               number: data.number,
               size: data.size
            }
         })
      }
      catch (error) {
         console.error("Error en la solicitud", error)
      }
   },
   createBoard: async (token: string, boardData: { name: string, description: string, startDate: string, endDate: string, status: number }) => {
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
               content: state.boards.content ? [newBoard, ...state.boards.content] : [newBoard],
               totalElements: state.boards.totalElements + 1
            }
         }))
      } catch (error) {
         console.error("Error en la creación del tablero", error)
      }
   }
}))
