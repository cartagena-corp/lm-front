"use client"

import SprintGrid from "../partials/sprints/SprintGrid"
import SprintList from "../partials/sprints/SprintList"
import DiagramaGantt from "./DiagramaGantt"

interface valueProps {
   id: number,
   name: string,
   view: () => JSX.Element
}

interface TabSwitchProps {
   value: valueProps
   onChange: (value: valueProps) => void
   className?: string
}

export function CustomSwitch({ value, onChange, className = "" }: TabSwitchProps) {
   const views = [
      {
         id: 1,
         name: "Lista",
         view: SprintList
      },
      {
         id: 2,
         name: "Tablero",
         view: SprintGrid
      },
      {
         id: 3,
         name: "Diagrama de Gantt",
         view: DiagramaGantt
      },
   ]

   return (
      <div className={`border-gray-200 relative ${className} mb-4`}>
         <div className="flex space-x-4">
            {
               views.map(tab =>
                  <button className={`cursor-pointer duration-300 relative py-2.5 px-1 text-sm font-medium ${value.id === tab.id ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                     key={tab.id} onClick={() => onChange(tab)}>
                     {tab.name}
                     <div className={`duration-300 absolute bottom-0 left-0 right-0 h-0.5 ${value.id === tab.id ? "bg-blue-600" : "bg-transparent"}`} />
                  </button>
               )
            }
         </div>
      </div>
   )
}
