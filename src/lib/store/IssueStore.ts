//?  

import { FilterTaskProps, TaskProps } from '../types/types'
import { create } from 'zustand'

interface IssuesProps {
   content: TaskProps[] | []
   totalElements: number
   totalPages: number
   number: number
   size: number
}

interface IssueState {
   issues: IssuesProps | null
   selectedIssue: TaskProps | null
   setIssues: (token: string, projectId: string, filters?: FilterTaskProps) => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_ISSUES

export const useIssueStore = create<IssueState>((set) => ({
   issues: null,
   selectedIssue: null,
   setIssues: async (token, projectId, filters) => {
      try {
         // Build query string with filters
         const params = new URLSearchParams()
         if (filters) {
            // if (filters.name) params.append('name', filters.name)
            // if (filters.status !== undefined && filters.status !== 0) params.append('status', filters.status.toString())
            // if (filters.createdBy) params.append('createdBy', filters.createdBy)
            // params.append('page', (filters.page ?? 0).toString())
            // params.append('size', (filters.size ?? 10).toString())

            // if (filters.sortBy) params.append('sortBy', filters.sortBy.id), params.append('direction', filters.direction)
         }

         const url = `${API_URL}${process.env.NEXT_PUBLIC_GET_ISSUES_BY_PROJECT}?projectId=${projectId}`

         const response = await fetch(url, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`,
            },
         })

         if (!response.ok) {
            console.error('Error al obtener las issues del tablero', response.statusText)
            return
         }

         const data: IssuesProps = await response.json()
         console.log("data: ", data)

         set({
            issues: {
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
}))
