import { ConfigProps } from '../types/types'
import { create } from 'zustand'

interface ConfigState {
   projectStatuses: ConfigProps[] | null
   issueStatuses: ConfigProps[] | null
   priorities: ConfigProps[] | null

   setConfig: () => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_CONFIG

export const useConfigStore = create<ConfigState>((set) => ({
   projectStatuses: null,
   issueStatuses: null,
   priorities: null,
   setConfig: async () => {
      try {
         const response = await fetch(`${API_URL}${process.env.NEXT_PUBLIC_GET_CONFIG}`, {
            method: 'GET',
            headers: {
               "Content-Type": "application/json",
               "credentials": "include"
            }
         })

         if (!response.ok) return console.error("Error al obtener las configuraciones", response.statusText)

         const data: ConfigState = await response.json()

         set({
            projectStatuses: data.projectStatuses,
            issueStatuses: data.issueStatuses,
            priorities: data.priorities,
         })
      }
      catch (error) {
         console.error("Error en la solicitud", error)
      }
   }
}))
