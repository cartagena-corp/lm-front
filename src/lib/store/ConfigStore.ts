import { create } from 'zustand'
import { ConfigProjectStatusProps } from '../types/types'

interface ConfigProjectState {
   projectStatus: ConfigProjectStatusProps[] | null

   setConfig: () => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_CONFIG

export const useConfigStore = create<ConfigProjectState>((set) => ({
   projectStatus: null,
   setConfig: async () => {
      try {
         const response = await fetch(`${API_URL}${process.env.NEXT_PUBLIC_GET_CONFIG_PROJECT_STATE}`, {
            method: 'GET',
            headers: {
               "Content-Type": "application/json",
               "credentials": "include"
            }
         })

         if (!response.ok) return console.error("Error al obtener las configuraciones de los estados globales de los proyectos", response.statusText)

         const data: ConfigProjectStatusProps[] = await response.json()

         set({
            projectStatus: data,
         })
      }
      catch (error) {
         console.error("Error en la solicitud", error)
      }
   }
}))
