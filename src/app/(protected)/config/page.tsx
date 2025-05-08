"use client"

import ProjectConfig from "@/components/partials/config/ProjectConfig"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useEffect, useState } from "react"

const listView = [
   {
      id: 1,
      name: "Configuración de Proyectos"
   },
   {
      id: 2,
      name: "Configuración de Sprints"
   },
   {
      id: 3,
      name: "Configuración de Tareas"
   },
]

export default function Config() {
   const { setConfig } = useConfigStore()
   const [view, setView] = useState(listView[0])
   const { getValidAccessToken } = useAuthStore()

   useEffect(() => { getConfig() }, [])

   const getConfig = async () => {
      const token = await getValidAccessToken()
      if (token) await setConfig()
   }

   return (
      <main className="bg-gray-100 min-h-screen flex flex-col p-10 ml-64 space-y-8">
         <h1 className="text-gray-900 text-2xl font-bold">Panel de Configuración</h1>

         <section className="bg-black/10 flex justify-between text-sm rounded-md gap-2 p-1.5">
            {
               listView.map(lv =>
                  <button key={lv.id} className={`${view.id === lv.id && "bg-white font-semibold"} duration-150 select-none text-center rounded-md w-full py-1.5`}
                     onClick={() => setView(lv)}>
                     {lv.name}
                  </button>
               )
            }
         </section>
         {
            view.id === listView[0].id ? <ProjectConfig /> :
               view.id === listView[1].id ? <ProjectConfig /> :
                  view.id === listView[2].id && <div>asd</div>
         }

      </main>
   )
}